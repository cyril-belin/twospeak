import {
  getLanguage,
  getLessonsByLanguage,
  getLessonsForUnit,
  getUnitsByLanguage,
} from "@/data";
import { isProgressFresh, type ProgressInput } from "@/store/progress-store";
import type {
  Language,
  Lesson,
  SupportedLanguageCode,
  Unit,
} from "@/types/learning";

export type HomePlanItemKind = "lesson" | "ai-conversation" | "new-words";

export type HomePlanItem = {
  id: string;
  kind: HomePlanItemKind;
  title: string;
  subtitle: string;
  completed: boolean;
};

export type HomeDashboardData = {
  language: Language;
  currentUnit: Unit | null;
  currentLesson: Lesson | null;
  unitLabel: string;
  streakDays: number;
  dailyGoal: {
    earnedXp: number;
    targetXp: number;
    progress: number;
  };
  todayPlan: HomePlanItem[];
};

const dailyGoalTargetXp = 20;
const designFallbackStreakDays = 12;
const designFallbackCurrentLessonIndex = 1;

export function getHomeDashboardData(
  selectedLanguageCode: SupportedLanguageCode,
  progress: ProgressInput,
): HomeDashboardData | null {
  const language = getLanguage(selectedLanguageCode);

  if (!language) {
    return null;
  }

  const languageUnits = getUnitsByLanguage(selectedLanguageCode);
  const currentUnit = languageUnits[0] ?? null;
  const lessonList = currentUnit
    ? getLessonsForUnit(currentUnit.id)
    : getLessonsByLanguage(selectedLanguageCode);

  const isFresh = isProgressFresh(progress);
  const completedLessonIds = new Set(progress.completedLessonIds);
  const currentLesson = resolveCurrentLesson(
    lessonList,
    completedLessonIds,
    isFresh,
  );

  const earnedXp = isFresh
    ? currentLesson?.xpReward ?? 0
    : progress.xpByLanguage[selectedLanguageCode] ?? 0;

  const streakDays = isFresh ? designFallbackStreakDays : progress.streakDays;

  return {
    currentLesson,
    currentUnit,
    dailyGoal: {
      earnedXp,
      progress: clampProgress(earnedXp / dailyGoalTargetXp),
      targetXp: dailyGoalTargetXp,
    },
    language,
    streakDays,
    todayPlan: currentLesson
      ? getTodayPlan(currentLesson, { isFresh, completedLessonIds })
      : [],
    unitLabel: currentUnit
      ? `A1 \u2022 Unit ${currentUnit.order}`
      : "A1 \u2022 Unit 1",
  };
}

function resolveCurrentLesson(
  lessonList: readonly Lesson[],
  completedLessonIds: ReadonlySet<string>,
  isFresh: boolean,
): Lesson | null {
  if (lessonList.length === 0) {
    return null;
  }

  if (isFresh) {
    return (
      lessonList[designFallbackCurrentLessonIndex] ?? lessonList[0] ?? null
    );
  }

  const firstUncompleted = lessonList.find(
    (lesson) => !completedLessonIds.has(lesson.id),
  );

  return firstUncompleted ?? lessonList[lessonList.length - 1] ?? null;
}

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(Math.max(progress, 0), 1);
}

function getTodayPlan(
  lesson: Lesson,
  context: { isFresh: boolean; completedLessonIds: ReadonlySet<string> },
): HomePlanItem[] {
  const lessonCompleted =
    context.isFresh || context.completedLessonIds.has(lesson.id);

  return [
    {
      completed: lessonCompleted,
      id: `${lesson.id}-lesson`,
      kind: "lesson",
      subtitle: getLessonSubtitle(lesson),
      title: "Lesson",
    },
    {
      completed: false,
      id: `${lesson.id}-ai-conversation`,
      kind: "ai-conversation",
      subtitle: lesson.aiTeacherPrompt
        ? "Practice with your teacher"
        : "Listen and repeat",
      title: "AI Conversation",
    },
    {
      completed: false,
      id: `${lesson.id}-new-words`,
      kind: "new-words",
      subtitle: `${lesson.vocabulary.length} ${
        lesson.vocabulary.length === 1 ? "word" : "words"
      }`,
      title: "New words",
    },
  ];
}

function getLessonSubtitle(lesson: Lesson) {
  const situation = lesson.phrases[0]?.situation;

  if (!situation) {
    return lesson.description;
  }

  if (situation.toLowerCase().includes("cafe")) {
    return "At the cafe";
  }

  return situation;
}
