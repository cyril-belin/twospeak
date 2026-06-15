import type { SupportedLanguageCode } from "@/types/learning";

export type StreamAudioCallStatus =
  | "ended"
  | "ending"
  | "error"
  | "idle"
  | "joined"
  | "joining"
  | "muted"
  | "ready"
  | "starting";

type AudioLessonCallIdInput = {
  languageCode: SupportedLanguageCode;
  lessonId: string;
  userId: string;
};

export function createAudioLessonCallId({
  languageCode,
  lessonId,
  userId,
}: AudioLessonCallIdInput) {
  const userHash = createStableHash(userId);
  const readableSlug = [
    "audio",
    sanitizeCallIdPart(languageCode),
    sanitizeCallIdPart(lessonId),
  ].join("-");
  const userSuffix = `-u-${userHash}`;
  const readableLimit = 64 - userSuffix.length;

  return `${truncateCallIdPart(readableSlug, readableLimit)}${userSuffix}`;
}

export function getStreamAudioCallStatusLabel(status: StreamAudioCallStatus) {
  if (status === "starting") {
    return "Starting call...";
  }

  if (status === "ready") {
    return "Ready to join";
  }

  if (status === "joining") {
    return "Joining audio...";
  }

  if (status === "joined") {
    return "Joined";
  }

  if (status === "muted") {
    return "Muted";
  }

  if (status === "ending") {
    return "Ending call...";
  }

  if (status === "ended") {
    return "Call ended";
  }

  if (status === "error") {
    return "Call needs attention";
  }

  return "Ready to start";
}

function sanitizeCallIdPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function truncateCallIdPart(value: string, maxLength: number) {
  return value.slice(0, maxLength).replaceAll(/-+$/g, "");
}

function createStableHash(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36).padStart(7, "0");
}
