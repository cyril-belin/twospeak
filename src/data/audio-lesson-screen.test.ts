import { getAudioLessonScreenData } from "@/data/audio-lesson-screen";

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

export const audioLessonScreenTypeCheck = {
  cafeLesson,
  missingLesson,
};
