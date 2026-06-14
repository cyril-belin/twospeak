import {
  isProgressFresh,
  useProgressStore,
} from "@/store/progress-store";

const initialState = useProgressStore.getState();

if (initialState.completedLessonIds.length !== 0) {
  throw new Error("Progress should start with no completed lessons.");
}

if (initialState.streakDays !== 0) {
  throw new Error("Progress should start with a zero streak.");
}

if (Object.keys(initialState.xpByLanguage).length !== 0) {
  throw new Error("Progress should start with no XP per language.");
}

if (
  !isProgressFresh({
    completedLessonIds: initialState.completedLessonIds,
    streakDays: initialState.streakDays,
    xpByLanguage: initialState.xpByLanguage,
  })
) {
  throw new Error("isProgressFresh should be true for the empty default state.");
}

useProgressStore.getState().completeLesson("es-greetings", "es", 10);

const afterFirstCompletion = useProgressStore.getState();

if (
  afterFirstCompletion.completedLessonIds.length !== 1 ||
  afterFirstCompletion.completedLessonIds[0] !== "es-greetings"
) {
  throw new Error("Completing a lesson should append it to completedLessonIds.");
}

if (afterFirstCompletion.xpByLanguage.es !== 10) {
  throw new Error("Completing a lesson should accumulate XP for the language.");
}

useProgressStore.getState().completeLesson("es-greetings", "es", 10);

if (useProgressStore.getState().xpByLanguage.es !== 10) {
  throw new Error("Completing the same lesson twice should be a no-op for XP.");
}

if (
  isProgressFresh({
    completedLessonIds: useProgressStore.getState().completedLessonIds,
    streakDays: useProgressStore.getState().streakDays,
    xpByLanguage: useProgressStore.getState().xpByLanguage,
  })
) {
  throw new Error(
    "isProgressFresh should be false after the user completes a lesson.",
  );
}

useProgressStore.getState().setStreakDays(7);

if (useProgressStore.getState().streakDays !== 7) {
  throw new Error("setStreakDays should update the streak.");
}

useProgressStore.getState().resetProgress();

const afterReset = useProgressStore.getState();

if (
  afterReset.completedLessonIds.length !== 0 ||
  afterReset.streakDays !== 0 ||
  Object.keys(afterReset.xpByLanguage).length !== 0
) {
  throw new Error("resetProgress should clear all progress fields.");
}

export const progressStoreTypeCheck = afterReset;
