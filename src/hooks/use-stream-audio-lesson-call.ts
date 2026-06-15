import type {
    Call,
    StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useStreamVideoSession } from "@/components/stream/stream-video-session-provider";
import type {
    StreamAudioLessonSessionRequest,
    StreamAudioLessonSessionResponse,
} from "@/lib/stream-api";
import {
    getStreamAudioCallStatusLabel,
    type StreamAudioCallStatus,
} from "@/lib/stream-audio";

type UseStreamAudioLessonCallInput = StreamAudioLessonSessionRequest;
type StreamCallingState = Call["state"]["callingState"];

const busyStatuses: StreamAudioCallStatus[] = ["ending", "joining", "starting"];
const streamCallingState = {
  JOINED: "joined" as StreamCallingState,
  JOINING: "joining" as StreamCallingState,
  LEFT: "left" as StreamCallingState,
  MIGRATING: "migrating" as StreamCallingState,
  OFFLINE: "offline" as StreamCallingState,
  RECONNECTING: "reconnecting" as StreamCallingState,
  RECONNECTING_FAILED: "reconnecting-failed" as StreamCallingState,
};

export function useStreamAudioLessonCall(input: UseStreamAudioLessonCallInput) {
  const sessionRequest = useMemo(
    () => ({
      displayName: input.displayName,
      languageCode: input.languageCode,
      lessonId: input.lessonId,
      userImage: input.userImage,
    }),
    [input.displayName, input.languageCode, input.lessonId, input.userImage],
  );
  const {
    activeAudioLessonSession,
    client,
    ensureStreamClient,
    errorMessage: providerErrorMessage,
    startAudioLessonSession,
    StreamCallComponent,
    userSession,
  } = useStreamVideoSession();
  const callRef = useRef<Call | null>(null);
  const clientRef = useRef<StreamVideoClient | null>(client);
  const [call, setCall] = useState<Call | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [session, setSession] =
    useState<StreamAudioLessonSessionResponse | null>(null);
  const [status, setStatus] = useState<StreamAudioCallStatus>("idle");
  const activeLessonSession =
    activeAudioLessonSession?.lesson.id === sessionRequest.lessonId &&
    activeAudioLessonSession.lesson.languageCode === sessionRequest.languageCode
      ? activeAudioLessonSession
      : null;
  const currentSession = session ?? activeLessonSession;
  const displayedStatus =
    status === "idle" && currentSession ? "ready" : status;

  useEffect(() => {
    clientRef.current = client;
  }, [client]);

  useEffect(() => {
    if (!call) {
      return;
    }

    const subscription = call.state.callingState$.subscribe((nextCallingState) => {
      if (nextCallingState === streamCallingState.JOINING) {
        setStatus("joining");
        return;
      }

      if (nextCallingState === streamCallingState.JOINED) {
        setStatus(call.microphone.enabled ? "joined" : "muted");
        setIsMuted(!call.microphone.enabled);
        return;
      }

      if (
        nextCallingState === streamCallingState.RECONNECTING ||
        nextCallingState === streamCallingState.MIGRATING ||
        nextCallingState === streamCallingState.OFFLINE
      ) {
        setStatus("joining");
        return;
      }

      if (nextCallingState === streamCallingState.RECONNECTING_FAILED) {
        setStatus("error");
        setErrorMessage("The audio call lost connection. Try joining again.");
        return;
      }

      if (nextCallingState === streamCallingState.LEFT) {
        setStatus("ended");
      }
    });

    return () => subscription.unsubscribe();
  }, [call]);

  useEffect(
    () => () => {
      const currentCall = callRef.current;

      if (
        !currentCall ||
        currentCall.state.callingState === streamCallingState.LEFT
      ) {
        return;
      }

      currentCall
        .leave()
        .catch((error) => console.error("Stream leave failed", error));
    },
    [],
  );

  const startCallSession = useCallback(async () => {
    if (status === "starting") {
      return currentSession;
    }

    if (currentSession) {
      setStatus((currentStatus) =>
        currentStatus === "idle" ? "ready" : currentStatus,
      );
      return currentSession;
    }

    setErrorMessage(null);
    setStatus("starting");

    try {
      const result = await startAudioLessonSession(sessionRequest);

      clientRef.current = result.client;
      setSession(result.session);
      setStatus("ready");

      return result.session;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start the Stream audio lesson.",
      );
      setStatus("error");
      return null;
    }
  }, [currentSession, sessionRequest, startAudioLessonSession, status]);

  const joinCall = useCallback(async () => {
    if (status === "joined" || status === "muted" || status === "joining") {
      return true;
    }

    const activeSession = currentSession ?? (await startCallSession());

    if (!activeSession) {
      return false;
    }

    setErrorMessage(null);
    setStatus("joining");

    try {
      const streamClient = clientRef.current ?? (await ensureStreamClient());
      const nextCall = streamClient.call(
        activeSession.call.type,
        activeSession.call.id,
        { reuseInstance: true },
      );

      callRef.current = nextCall;
      setCall(nextCall);
      nextCall.setDisconnectionTimeout(120);
      await nextCall.camera.disable();
      await nextCall.join({ maxJoinRetries: 1 });
      // Disable camera again after join — the SDK may re-enable it during join.
      await nextCall.camera.disable();
      await nextCall.microphone.enable();
      setIsMuted(false);
      setStatus("joined");

      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to join the Stream audio call.",
      );
      setStatus("error");
      return false;
    }
  }, [currentSession, ensureStreamClient, startCallSession, status]);

  const toggleMute = useCallback(async () => {
    const currentCall = callRef.current;

    if (!currentCall || status === "idle" || status === "ready") {
      return joinCall();
    }

    if (status !== "joined" && status !== "muted") {
      return false;
    }

    try {
      await currentCall.microphone.toggle();
      const nextIsMuted = !currentCall.microphone.enabled;

      setIsMuted(nextIsMuted);
      setStatus(nextIsMuted ? "muted" : "joined");

      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update microphone state.",
      );
      setStatus("error");
      return false;
    }
  }, [joinCall, status]);

  const endCall = useCallback(async () => {
    const currentCall = callRef.current;

    if (status === "ended" || status === "ending") {
      return true;
    }

    setStatus("ending");

    try {
      if (currentCall?.state.callingState !== streamCallingState.LEFT) {
        await currentCall?.leave();
      }

      setIsMuted(true);
      setStatus("ended");

      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to end the Stream audio call.",
      );
      setStatus("error");
      return false;
    }
  }, [status]);

  const statusLabel = useMemo(
    () => getStreamAudioCallStatusLabel(displayedStatus),
    [displayedStatus],
  );
  const isBusy = busyStatuses.includes(displayedStatus);
  const canJoin =
    displayedStatus === "ready" ||
    displayedStatus === "idle" ||
    displayedStatus === "error";
  const displayedErrorMessage = errorMessage ?? providerErrorMessage;

  return {
    call,
    callId: currentSession?.call.id,
    canJoin,
    endCall,
    errorMessage: displayedErrorMessage,
    isBusy,
    isMuted,
    joinCall,
    startCallSession,
    status: displayedStatus,
    statusLabel,
    StreamCallComponent,
    toggleMute,
    userName: currentSession?.user.name ?? userSession?.user.name,
  };
}
