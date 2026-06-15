import { getHomeDashboardData } from "@/data/home";
import type { ProgressInput } from "@/store/progress-store";

const emptyProgress: ProgressInput = {
  completedLessonIds: [],
  streakDays: 0,
  xpByLanguage: {},
};

const spanishHome = getHomeDashboardData("es", emptyProgress);

if (spanishHome?.language.name !== "Spanish") {
  throw new Error("Home data should include the selected language.");
}

if (spanishHome.currentLesson?.title !== "Daily Life") {
  throw new Error(
    "Home data should fall back to the design's current lesson when progress is empty.",
  );
}

if (spanishHome.streakDays !== 12) {
  throw new Error(
    "Home data should fall back to the design streak when progress is empty.",
  );
}

if (spanishHome.dailyGoal.earnedXp !== 15) {
  throw new Error("Home data should derive daily progress from the lesson XP.");
}

if (spanishHome.dailyGoal.progress !== 0.75) {
  throw new Error("Home daily progress should be clamped to the daily goal.");
}

const newWordsPlan = spanishHome.todayPlan.find(
  (item) => item.kind === "new-words",
);

if (newWordsPlan?.subtitle !== "2 words") {
  throw new Error("Home plan should derive new-word counts from lesson data.");
}

const progressedSpanish = getHomeDashboardData("es", {
  completedLessonIds: ["es-greetings"],
  streakDays: 5,
  xpByLanguage: { es: 10 },
});

if (progressedSpanish?.streakDays !== 5) {
  throw new Error("Home data should reflect the persisted streak once progress exists.");
}

if (progressedSpanish.dailyGoal.earnedXp !== 10) {
  throw new Error(
    "Home data should reflect persisted XP once progress exists.",
  );
}

if (progressedSpanish.currentLesson?.id !== "es-daily-life") {
  throw new Error(
    "Home data should advance the current lesson based on completions.",
  );
}

const lessonPlan = progressedSpanish.todayPlan.find(
  (item) => item.kind === "lesson",
);

if (lessonPlan?.completed !== false) {
  throw new Error(
    "Home plan should mark the lesson row as not completed once progress is real.",
  );
}

if (lessonPlan.href !== "/lesson/es-daily-life") {
  throw new Error("Home lesson plan rows should link to the current lesson.");
}

const aiConversationPlan = progressedSpanish.todayPlan.find(
  (item) => item.kind === "ai-conversation",
);

if (aiConversationPlan?.href !== "/lesson/es-daily-life") {
  throw new Error("Home AI conversation rows should open the current audio lesson.");
}

const germanHome = getHomeDashboardData("de", emptyProgress);

if (germanHome?.language.name !== "German") {
  throw new Error("Home data should still show selected languages without lessons.");
}

if (germanHome.currentLesson !== null) {
  throw new Error("Languages without lesson data should not invent lessons.");
}

if (germanHome.todayPlan.length !== 0) {
  throw new Error("Languages without lessons should have an empty plan.");
}

export const homeDashboardTypeCheck = {
  germanHome,
  progressedSpanish,
  spanishHome,
};
