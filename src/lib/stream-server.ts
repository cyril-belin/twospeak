import { verifyToken } from "@clerk/backend";

import { getLanguage, getLesson } from "@/data";
import type {
    StreamAudioLessonSessionRequest,
    StreamAudioLessonSessionResponse,
    StreamTokenRequest,
    StreamVideoUserSession,
} from "@/lib/stream-api";
import { createAudioLessonCallId } from "@/lib/stream-audio";
import type { Language, Lesson, SupportedLanguageCode } from "@/types/learning";

const streamApiBaseUrl = "https://video.stream-io-api.com";
const streamTokenValidityInSeconds = 60 * 60 * 4;

type ClerkSession = {
  clerkUserId: string;
};

type StreamUser = {
  id: string;
  image?: string;
  name: string;
};

type StreamCallSession = {
  callId: string;
  callType: string;
};

export class StreamApiRouteError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function createStreamTokenSession(
  request: Request,
): Promise<StreamVideoUserSession> {
  const clerkSession = await verifyClerkSession(request);
  const body = await readJsonBody<StreamTokenRequest>(request);
  const streamUser = createStreamUser(clerkSession, body);

  await upsertStreamUser(streamUser);

  return {
    apiKey: getStreamApiKey(),
    token: await createStreamUserToken(streamUser.id),
    user: streamUser,
  };
}

export async function createAudioLessonStreamSession(
  request: Request,
): Promise<StreamAudioLessonSessionResponse> {
  const clerkSession = await verifyClerkSession(request);
  const body = await readJsonBody<StreamAudioLessonSessionRequest>(request);
  const { language, lesson } = getValidatedAudioLesson(body);
  const streamUser = createStreamUser(clerkSession, body);

  await upsertStreamUser(streamUser);

  const callSession = await getOrCreateAudioLessonCall({
    language,
    lesson,
    streamUser,
  });

  return {
    apiKey: getStreamApiKey(),
    call: {
      id: callSession.callId,
      type: callSession.callType,
    },
    lesson: {
      id: lesson.id,
      languageCode: lesson.languageCode,
      title: lesson.title,
    },
    token: await createStreamUserToken(streamUser.id),
    user: streamUser,
  };
}

export function streamRouteErrorResponse(error: unknown) {
  const status =
    error instanceof StreamApiRouteError ? error.status : 500;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const message =
    error instanceof Error && (status < 500 || isDevelopment)
      ? error.message
      : "Unable to prepare the Stream audio session.";

  if (status >= 500) {
    console.error("Stream API route error:", error);
  }

  return Response.json({ error: message }, { status });
}

async function verifyClerkSession(request: Request): Promise<ClerkSession> {
  const token = getBearerToken(request);
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    throw new StreamApiRouteError("Missing Clerk server configuration.", 500);
  }

  try {
    const payload = await verifyToken(token, { secretKey });

    if (!payload.sub) {
      throw new StreamApiRouteError("Invalid Clerk session.", 401);
    }

    return { clerkUserId: payload.sub };
  } catch (error) {
    if (error instanceof StreamApiRouteError) {
      throw error;
    }

    throw new StreamApiRouteError("Unauthorized.", 401);
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    throw new StreamApiRouteError("Missing authorization token.", 401);
  }

  return token;
}

async function readJsonBody<TBody>(request: Request): Promise<TBody> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new StreamApiRouteError("Expected a JSON request body.", 400);
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new StreamApiRouteError("Expected a JSON object as the request body.", 400);
  }

  return body as TBody;
}

function createStreamUser(
  { clerkUserId }: ClerkSession,
  body: StreamTokenRequest,
): StreamUser {
  const displayName = getOptionalString(body.displayName);
  const userImage = getOptionalString(body.userImage);

  return {
    id: toStreamUserId(clerkUserId),
    image: userImage,
    name: displayName ?? "Twospeak learner",
  };
}

function getValidatedAudioLesson(body: StreamAudioLessonSessionRequest): {
  language: Language;
  lesson: Lesson;
} {
  const lessonId = getRequiredString(body.lessonId, "lessonId");
  const languageCode = getRequiredString(
    body.languageCode,
    "languageCode",
  ) as SupportedLanguageCode;
  const lesson = getLesson(lessonId);
  const language = getLanguage(languageCode);

  if (!lesson || !language) {
    throw new StreamApiRouteError("Lesson or language not found.", 404);
  }

  if (lesson.languageCode !== language.code) {
    throw new StreamApiRouteError(
      "The selected lesson does not belong to the selected language.",
      400,
    );
  }

  return { language, lesson };
}

async function upsertStreamUser(user: StreamUser) {
  await streamApiFetch("/api/v2/users", {
    users: {
      [user.id]: {
        id: user.id,
        image: user.image,
        name: user.name,
        role: "user",
      },
    },
  });
}

async function getOrCreateAudioLessonCall({
  language,
  lesson,
  streamUser,
}: {
  language: Language;
  lesson: Lesson;
  streamUser: StreamUser;
}): Promise<StreamCallSession> {
  const callType = process.env.STREAM_AUDIO_CALL_TYPE ?? "default";
  const callId = createAudioLessonCallId({
    languageCode: language.code,
    lessonId: lesson.id,
    userId: streamUser.id,
  });
  const encodedCallId = encodeURIComponent(callId);
  const encodedCallType = encodeURIComponent(callType);

  await streamApiFetch(`/video/call/${encodedCallType}/${encodedCallId}`, {
    data: {
      created_by_id: streamUser.id,
      custom: {
        language_code: language.code,
        language_name: language.name,
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        twospeak_session_kind: "audio_lesson",
      },
      members: [{ role: "admin", user_id: streamUser.id }],
      settings_override: {
        audio: {
          default_device: "speaker",
          mic_default_on: true,
        },
      },
      video: false,
    },
  });

  return { callId, callType };
}

async function streamApiFetch(path: string, body: Record<string, unknown>) {
  const apiKey = getStreamApiKey();
  const token = await createStreamServerToken();
  const url = createStreamApiUrl(path, apiKey);

  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "stream-auth-type": "jwt",
    },
    method: "POST",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Stream REST API error:", response.status, text);
    throw new StreamApiRouteError("Stream rejected the audio session.", 502);
  }
}

export function createStreamApiUrl(path: string, apiKey: string) {
  const url = new URL(path, streamApiBaseUrl);

  url.searchParams.set("api_key", apiKey);

  return url.toString();
}

async function createStreamServerToken() {
  return createStreamJwt({ server: true });
}

async function createStreamUserToken(userId: string) {
  const issuedAt = Math.floor((Date.now() - 1000) / 1000);

  return createStreamJwt({
    exp: issuedAt + streamTokenValidityInSeconds,
    iat: issuedAt,
    user_id: userId,
  });
}

async function createStreamJwt(payload: Record<string, unknown>) {
  const secret = process.env.STREAM_API_SECRET;

  if (!secret) {
    throw new StreamApiRouteError("Missing Stream server configuration.", 500);
  }

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { hash: "SHA-256", name: "HMAC" },
      false,
      ["sign"],
    ),
    new TextEncoder().encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function base64UrlEncode(value: string | Uint8Array) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function getStreamApiKey() {
  const apiKey = process.env.STREAM_API_KEY;

  if (!apiKey) {
    throw new StreamApiRouteError("Missing Stream server configuration.", 500);
  }

  return apiKey;
}

function toStreamUserId(clerkUserId: string) {
  return clerkUserId.replaceAll(/[^a-zA-Z0-9@_.-]/g, "_");
}

function getRequiredString(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new StreamApiRouteError(`Missing ${name}.`, 400);
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}
