import {
  getAudioLessonScreenData,
  getInitialAudioLessonSessionState,
  updateAudioLessonSessionState,
} from "@/data/audio-lesson-screen";

const cafeLesson = getAudioLessonScreenData("es-cafe-order");

if (!cafeLesson) {
  throw new Error("Audio lesson screen should resolve the selected lesson id.");
}

if (cafeLesson.language.name !== "Spanish") {
  throw new Error("Audio lesson screen should include the selected lesson language.");
}

if (cafeLesson.lesson.title !== "At the Café") {
  throw new Error("Audio lesson screen should include the selected lesson title.");
}

if (cafeLesson.primaryGoal !== "Say please in Spanish") {
  throw new Error("Audio lesson screen should include the selected lesson goal.");
}

if (cafeLesson.phrases[0]?.text !== "Un café, por favor.") {
  throw new Error("Audio lesson screen should include the selected lesson phrases.");
}

if (
  cafeLesson.teacherContext.lessonContext !==
  "The learner is ready for their first practical ordering role-play."
) {
  throw new Error(
    "Audio lesson screen should include the selected lesson AI teacher context.",
  );
}

const missingLesson = getAudioLessonScreenData("missing-lesson");

if (missingLesson !== null) {
  throw new Error("Audio lesson screen should return null for missing lessons.");
}

const initialSession = getInitialAudioLessonSessionState(cafeLesson);

if (
  !initialSession.isMicOn ||
  !initialSession.isPreviewOn ||
  initialSession.areSubtitlesOn ||
  initialSession.hasEnded
) {
  throw new Error("Audio lesson session should start live with mic and preview on.");
}

const mutedSession = updateAudioLessonSessionState(
  initialSession,
  "toggle-mic",
  cafeLesson,
);

if (mutedSession.isMicOn || mutedSession.status !== "Muted") {
  throw new Error("Mic control should toggle microphone state and session status.");
}

const subtitledSession = updateAudioLessonSessionState(
  initialSession,
  "toggle-subtitles",
  cafeLesson,
);

if (!subtitledSession.areSubtitlesOn || !subtitledSession.subtitle) {
  throw new Error("Subtitles control should reveal the active lesson subtitle.");
}

const previewOffSession = updateAudioLessonSessionState(
  initialSession,
  "toggle-preview",
  cafeLesson,
);

if (previewOffSession.isPreviewOn || previewOffSession.status !== "Audio only") {
  throw new Error("Camera control should toggle the visual teacher preview only.");
}

const endedSession = updateAudioLessonSessionState(
  initialSession,
  "end-session",
  cafeLesson,
);

if (!endedSession.hasEnded || endedSession.status !== "Session complete") {
  throw new Error("End Call control should end the audio lesson session.");
}

export const audioLessonScreenTypeCheck = {
  cafeLesson,
  endedSession,
  mutedSession,
  missingLesson,
  previewOffSession,
  subtitledSession,
};
