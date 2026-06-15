import type { SupportedLanguageCode } from "@/types/learning";

export const streamTokenEndpoint = "/api/stream/token";
export const streamAudioLessonSessionEndpoint =
  "/api/stream/audio-lesson-session";

export type StreamTokenRequest = {
  displayName?: string;
  userImage?: string;
};

export type StreamAudioLessonSessionRequest = StreamTokenRequest & {
  languageCode: SupportedLanguageCode;
  lessonId: string;
};

export type StreamVideoUserSession = {
  apiKey: string;
  token: string;
  user: {
    id: string;
    image?: string;
    name: string;
  };
};

export type StreamAudioLessonSessionResponse = StreamVideoUserSession & {
  call: {
    id: string;
    type: string;
  };
  lesson: {
    id: string;
    languageCode: SupportedLanguageCode;
    title: string;
  };
};

export type StreamApiErrorResponse = {
  error: string;
};
