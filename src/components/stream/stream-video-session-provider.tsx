import { useAuth, useUser } from "@clerk/expo";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  DeepPartial,
  StreamVideoClient,
  Theme,
  User,
} from "@stream-io/video-react-native-sdk";

import {
  streamAudioLessonSessionEndpoint,
  streamTokenEndpoint,
  type StreamApiErrorResponse,
  type StreamAudioLessonSessionRequest,
  type StreamAudioLessonSessionResponse,
  type StreamTokenRequest,
  type StreamVideoUserSession,
} from "@/lib/stream-api";
import {
  getStreamNativeModuleUnavailableMessage,
  loadGuardedStreamNativeModule,
} from "@/lib/stream-native-module";

type StreamVideoModule = typeof import("@stream-io/video-react-native-sdk");

declare const require:
  | ((moduleName: "@stream-io/video-react-native-sdk") => StreamVideoModule)
  | undefined;

type StartAudioLessonSessionResult = {
  client: StreamVideoClient;
  session: StreamAudioLessonSessionResponse;
};

type StreamVideoSessionContextValue = {
  activeAudioLessonSession: StreamAudioLessonSessionResponse | null;
  client: StreamVideoClient | null;
  errorMessage: string | null;
  ensureStreamClient: () => Promise<StreamVideoClient>;
  startAudioLessonSession: (
    request: StreamAudioLessonSessionRequest,
  ) => Promise<StartAudioLessonSessionResult>;
  StreamCallComponent: StreamVideoModule["StreamCall"] | null;
  userSession: StreamVideoUserSession | null;
};

const StreamVideoSessionContext =
  createContext<StreamVideoSessionContextValue | null>(null);

export function StreamVideoSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clientRef = useRef<StreamVideoClient | null>(null);
  const streamVideoModuleRef = useRef<StreamVideoModule | null>(null);
  const [activeAudioLessonSession, setActiveAudioLessonSession] =
    useState<StreamAudioLessonSessionResponse | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [streamVideoModule, setStreamVideoModule] =
    useState<StreamVideoModule | null>(null);
  const [userSession, setUserSession] =
    useState<StreamVideoUserSession | null>(null);
  const nativeModuleError = getStreamNativeModuleUnavailableMessage();

  const getTokenRequestBody = useCallback((): StreamTokenRequest => {
    const displayName =
      user?.fullName ??
      user?.firstName ??
      user?.username ??
      user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
      "Twospeak learner";

    return {
      displayName,
      userImage: user?.imageUrl,
    };
  }, [
    user?.firstName,
    user?.fullName,
    user?.imageUrl,
    user?.primaryEmailAddress?.emailAddress,
    user?.username,
  ]);

  const fetchStreamSession = useCallback(
    async <TResponse, TBody extends StreamTokenRequest>(
      endpoint: string,
      body: TBody,
    ): Promise<TResponse> => {
      const clerkToken = await getToken();

      if (!clerkToken) {
        throw new Error("Sign in again to start the audio lesson.");
      }

      const response = await fetch(endpoint, {
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | StreamApiErrorResponse
          | null;

        throw new Error(errorBody?.error ?? "Unable to reach Stream.");
      }

      return (await response.json()) as TResponse;
    },
    [getToken],
  );

  const ensureStreamVideoModule = useCallback(async () => {
    const unavailableMessage = getStreamNativeModuleUnavailableMessage();

    if (unavailableMessage) {
      throw new Error(unavailableMessage);
    }

    if (streamVideoModuleRef.current) {
      return streamVideoModuleRef.current;
    }

    const nextModule = loadGuardedStreamNativeModule(() => {
      if (typeof require !== "function") {
        throw new Error("Unable to load the Stream Video SDK.");
      }

      return require("@stream-io/video-react-native-sdk");
    });

    streamVideoModuleRef.current = nextModule;
    setStreamVideoModule(nextModule);

    return nextModule;
  }, []);

  const createClient = useCallback(
    (session: StreamVideoUserSession, videoModule: StreamVideoModule) => {
      const streamUser: User = {
        id: session.user.id,
        image: session.user.image,
        name: session.user.name,
      };

      const tokenProvider = async () => {
        const freshSession = await fetchStreamSession<
          StreamVideoUserSession,
          StreamTokenRequest
        >(streamTokenEndpoint, getTokenRequestBody());

        setUserSession(freshSession);

        return freshSession.token;
      };

      return videoModule.StreamVideoClient.getOrCreateInstance({
        apiKey: session.apiKey,
        token: session.token,
        tokenProvider,
        user: streamUser,
      });
    },
    [fetchStreamSession, getTokenRequestBody],
  );

  const setClientSession = useCallback(
    async (session: StreamVideoUserSession) => {
      const existingClient = clientRef.current;

      if (existingClient) {
        setUserSession(session);
        return existingClient;
      }

      const videoModule = await ensureStreamVideoModule();
      const nextClient = createClient(session, videoModule);

      clientRef.current = nextClient;
      setClient(nextClient);
      setUserSession(session);

      return nextClient;
    },
    [createClient, ensureStreamVideoModule],
  );

  const ensureStreamClient = useCallback(async () => {
    if (clientRef.current) {
      return clientRef.current;
    }

    await ensureStreamVideoModule();

    const session = await fetchStreamSession<
      StreamVideoUserSession,
      StreamTokenRequest
    >(streamTokenEndpoint, getTokenRequestBody());

    return await setClientSession(session);
  }, [
    ensureStreamVideoModule,
    fetchStreamSession,
    getTokenRequestBody,
    setClientSession,
  ]);

  const disconnectClient = useCallback(() => {
    const currentClient = clientRef.current;

    clientRef.current = null;
    setActiveAudioLessonSession(null);
    setClient(null);
    setUserSession(null);

    if (currentClient) {
      currentClient
        .disconnectUser()
        .catch((error) => console.error("Stream disconnect failed", error));
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      const disconnectTimer = setTimeout(disconnectClient, 0);

      return () => clearTimeout(disconnectTimer);
    }

    if (!clientRef.current) {
      ensureStreamClient().catch((error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to connect Stream.",
        );
      });
    }
  }, [disconnectClient, ensureStreamClient, isLoaded, isSignedIn]);

  useEffect(() => disconnectClient, [disconnectClient]);

  const startAudioLessonSession = useCallback(
    async (request: StreamAudioLessonSessionRequest) => {
      setErrorMessage(null);
      await ensureStreamVideoModule();

      const session = await fetchStreamSession<
        StreamAudioLessonSessionResponse,
        StreamAudioLessonSessionRequest
      >(streamAudioLessonSessionEndpoint, request);
      const nextClient = await setClientSession(session);

      setActiveAudioLessonSession(session);

      return { client: nextClient, session };
    },
    [ensureStreamVideoModule, fetchStreamSession, setClientSession],
  );

  const value = useMemo(
    () => ({
      activeAudioLessonSession,
      client,
      ensureStreamClient,
      errorMessage: errorMessage ?? nativeModuleError,
      startAudioLessonSession,
      StreamCallComponent: streamVideoModule?.StreamCall ?? null,
      userSession,
    }),
    [
      activeAudioLessonSession,
      client,
      ensureStreamClient,
      errorMessage,
      nativeModuleError,
      startAudioLessonSession,
      streamVideoModule?.StreamCall,
      userSession,
    ],
  );

  const content = (
    <StreamVideoSessionContext.Provider value={value}>
      {children}
    </StreamVideoSessionContext.Provider>
  );

  if (!client || !streamVideoModule) {
    return content;
  }

  return (
    <StreamVideoWithInsets client={client} streamVideoModule={streamVideoModule}>
      {content}
    </StreamVideoWithInsets>
  );
}

export function useStreamVideoSession() {
  const value = useContext(StreamVideoSessionContext);

  if (!value) {
    throw new Error(
      "useStreamVideoSession must be used inside StreamVideoSessionProvider.",
    );
  }

  return value;
}

function StreamVideoWithInsets({
  children,
  client,
  streamVideoModule,
}: {
  children: ReactNode;
  client: StreamVideoClient;
  streamVideoModule: StreamVideoModule;
}) {
  const { bottom, left, right, top } = useSafeAreaInsets();
  const StreamVideoComponent = streamVideoModule.StreamVideo;
  const theme = useMemo<DeepPartial<Theme>>(
    () =>
      ({
        variants: {
          insets: { bottom, left, right, top },
        },
      }) as unknown as DeepPartial<Theme>,
    [bottom, left, right, top],
  );

  return (
    <StreamVideoComponent client={client} style={theme}>
      {children}
    </StreamVideoComponent>
  );
}
