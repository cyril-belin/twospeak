import { getLessonScreenData } from "@/data/lesson-screen";
import type { ProgressInput } from "@/store/progress-store";

const emptyProgress: ProgressInput = {
  completedLessonIds: [],
  streakDays: 0,
  xpByLanguage: {},
};

const spanishLessonsScreen = getLessonScreenData("es", emptyProgress);

if (spanishLessonsScreen?.title !== "At the Café") {
  throw new Error("Lessons screen should show the current Spanish unit title.");
}

if (spanishLessonsScreen.progressLabel !== "Unit 3 • 3 / 6 lessons") {
  throw new Error("Lessons screen should show unit order and lesson progress.");
}

if (spanishLessonsScreen.lessons.length !== 6) {
  throw new Error("Lessons screen should render six lessons for the unit.");
}

if (spanishLessonsScreen.lessons[2]?.status !== "in-progress") {
  throw new Error("The third lesson should be marked in progress.");
}

if (spanishLessonsScreen.lessons.some((lesson) => !lesson.href)) {
  throw new Error("Every lesson row should be openable.");
}

const progressedSpanish = getLessonScreenData("es", {
  completedLessonIds: ["es-greetings", "es-daily-life", "es-cafe-order"],
  streakDays: 4,
  xpByLanguage: { es: 45 },
});

if (progressedSpanish?.lessons[0]?.status !== "completed") {
  throw new Error(
    "Lessons screen should mark previously completed lessons as completed.",
  );
}

if (progressedSpanish.lessons[3]?.status !== "in-progress") {
  throw new Error(
    "Lessons screen should advance the in-progress lesson once earlier ones are done.",
  );
}

if (progressedSpanish.progressLabel !== "Unit 3 • 4 / 6 lessons") {
  throw new Error(
    "Lessons screen progress label should reflect real completions.",
  );
}

const germanLessonsScreen = getLessonScreenData("de", emptyProgress);

if (!germanLessonsScreen || germanLessonsScreen.lessons.length < 5) {
  throw new Error("Selectable languages without lesson data need new lessons.");
}

export const lessonScreenTypeCheck = {
  germanLessonsScreen,
  progressedSpanish,
  spanishLessonsScreen,
};
