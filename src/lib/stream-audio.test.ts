import {
  createAudioLessonCallId,
  getStreamAudioCallStatusLabel,
  type StreamAudioCallStatus,
} from "./stream-audio";

const callId = createAudioLessonCallId({
  languageCode: "es",
  lessonId: "es-cafe-order",
  userId: "user_2abcDEF",
});

if (!callId.startsWith("audio-es-es-cafe-order-u-")) {
  throw new Error(
    `Audio lesson call id should include language, lesson, and a user suffix. Received ${callId}.`,
  );
}

if (callId.length > 64) {
  throw new Error(`Audio lesson call id must fit Stream's 64 character limit. Got ${callId}.`);
}

const repeatedCallId = createAudioLessonCallId({
  languageCode: "es",
  lessonId: "es-cafe-order",
  userId: "user_2abcDEF",
});

if (repeatedCallId !== callId) {
  throw new Error("Audio lesson call id should be stable for the same lesson and user.");
}

const longCallId = createAudioLessonCallId({
  languageCode: "es",
  lessonId: "es-this-is-a-very-long-teaching-lesson-identifier-for-stream",
  userId: "user_with_a_very_long_clerk_identifier_that_should_be_hashed",
});

if (longCallId.length > 64) {
  throw new Error(
    `Long audio lesson call ids must be truncated to Stream's limit. Got ${longCallId}.`,
  );
}

const expectedLabels: Record<StreamAudioCallStatus, string> = {
  ended: "Call ended",
  ending: "Ending call...",
  error: "Call needs attention",
  idle: "Ready to start",
  joined: "Joined",
  joining: "Joining audio...",
  muted: "Muted",
  ready: "Ready to join",
  starting: "Starting call...",
};

for (const [status, expectedLabel] of Object.entries(expectedLabels)) {
  const actualLabel = getStreamAudioCallStatusLabel(
    status as StreamAudioCallStatus,
  );

  if (actualLabel !== expectedLabel) {
    throw new Error(
      `Audio call status "${status}" should render "${expectedLabel}", received "${actualLabel}".`,
    );
  }
}
