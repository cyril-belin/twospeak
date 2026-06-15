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

export type LessonScreenLessonStatus =
  | "completed"
  | "in-progress"
  | "not-started";

export type LessonScreenLesson = {
  href: `/lesson/${string}`;
  lesson: Lesson;
  lessonNumber: number;
  progressLabel: string | null;
  status: LessonScreenLessonStatus;
};

export type LessonScreenData = {
  currentLesson: Lesson | null;
  language: Language;
  lessons: LessonScreenLesson[];
  progressLabel: string;
  title: string;
  unit: Unit | null;
};

const designFallbackCurrentLessonIndex = 2;

export function getLessonScreenData(
  selectedLanguageCode: SupportedLanguageCode,
  progress: ProgressInput,
): LessonScreenData | null {
  const language = getLanguage(selectedLanguageCode);

  if (!language) {
    return null;
  }

  const unit = getUnitsByLanguage(selectedLanguageCode)[0] ?? null;
  const lessonList = unit
    ? getLessonsForUnit(unit.id)
    : getLessonsByLanguage(selectedLanguageCode);

  const isFresh = isProgressFresh(progress);
  const completedLessonIds = new Set(progress.completedLessonIds);
  const currentLessonIndex = resolveCurrentLessonIndex(
    lessonList,
    completedLessonIds,
    isFresh,
  );
  const currentLesson =
    currentLessonIndex >= 0 ? lessonList[currentLessonIndex] ?? null : null;
  const completedCount = resolveCompletedCount(
    lessonList,
    completedLessonIds,
    currentLessonIndex,
    isFresh,
  );

  return {
    currentLesson,
    language,
    lessons: lessonList.map((lesson, index) => {
      const status = getLessonStatus(
        lesson,
        index,
        currentLessonIndex,
        completedLessonIds,
      );

      return {
        href: `/lesson/${lesson.id}`,
        lesson,
        lessonNumber: index + 1,
        progressLabel: getLessonProgressLabel(status, lesson.activities.length),
        status,
      };
    }),
    progressLabel: unit
      ? `Unit ${unit.order} • ${completedCount} / ${lessonList.length} lessons`
      : `${completedCount} / ${lessonList.length} lessons`,
    title: unit?.title ?? language.name,
    unit,
  };
}

function resolveCurrentLessonIndex(
  lessonList: readonly Lesson[],
  completedLessonIds: ReadonlySet<string>,
  isFresh: boolean,
): number {
  if (lessonList.length === 0) {
    return -1;
  }

  if (isFresh) {
    return Math.min(designFallbackCurrentLessonIndex, lessonList.length - 1);
  }

  return lessonList.findIndex((lesson) => !completedLessonIds.has(lesson.id));
}

function resolveCompletedCount(
  lessonList: readonly Lesson[],
  completedLessonIds: ReadonlySet<string>,
  currentLessonIndex: number,
  isFresh: boolean,
): number {
  if (lessonList.length === 0) {
    return 0;
  }

  if (isFresh) {
    return currentLessonIndex >= 0 ? currentLessonIndex + 1 : 0;
  }

  const completedOnly = lessonList.filter((lesson) =>
    completedLessonIds.has(lesson.id),
  ).length;

  return completedOnly;
}

function getLessonStatus(
  lesson: Lesson,
  lessonIndex: number,
  currentLessonIndex: number,
  completedLessonIds: ReadonlySet<string>,
): LessonScreenLessonStatus {
  if (completedLessonIds.has(lesson.id)) {
    return "completed";
  }

  if (lessonIndex === currentLessonIndex) {
    return "in-progress";
  }

  if (currentLessonIndex >= 0 && lessonIndex < currentLessonIndex) {
    return "completed";
  }

  return "not-started";
}

function getLessonProgressLabel(
  status: LessonScreenLessonStatus,
  activityCount: number,
) {
  if (status === "in-progress") {
    return "In progress";
  }

  if (status === "not-started") {
    return `0 / ${activityCount} lessons`;
  }

  return null;
}
