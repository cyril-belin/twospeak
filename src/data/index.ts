import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import type {
    Language,
    Lesson,
    SupportedLanguageCode,
    Unit,
} from "@/types/learning";

export { languages, supportedLanguageCodes } from "@/data/languages";
export { lessons } from "@/data/lessons";
export { units } from "@/data/units";

export function getLanguage(
  code: SupportedLanguageCode
): Language | undefined {
  return languages.find((language) => language.code === code);
}

export function getUnitsByLanguage(
  code: SupportedLanguageCode
): readonly Unit[] {
  return units
    .filter((unit) => unit.languageCode === code)
    .sort((a, b) => a.order - b.order);
}

export function getUnit(unitId: string): Unit | undefined {
  return units.find((unit) => unit.id === unitId);
}

export function getLesson(lessonId: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === lessonId);
}

export function getLessonsByLanguage(
  code: SupportedLanguageCode
): readonly Lesson[] {
  return lessons
    .filter((lesson) => lesson.languageCode === code)
    .sort((a, b) => a.order - b.order);
}

export function getLessonsForUnit(unitId: string): readonly Lesson[] {
  const unit = getUnit(unitId);
  if (!unit) return [];

  return unit.lessonIds
    .map((lessonId) => getLesson(lessonId))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

export function validateLearningContent(): string[] {
  const errors: string[] = [];

  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const unitIds = new Set(units.map((unit) => unit.id));

  for (const unit of units) {
    for (const lessonId of unit.lessonIds) {
      if (!lessonIds.has(lessonId)) {
        errors.push(
          `Unit "${unit.id}" references missing lesson "${lessonId}".`
        );
      }
    }
  }

  for (const lesson of lessons) {
    if (!unitIds.has(lesson.unitId)) {
      errors.push(
        `Lesson "${lesson.id}" references missing unit "${lesson.unitId}".`
      );
    }

    const vocabularyIds = new Set(lesson.vocabulary.map((item) => item.id));
    const phraseIds = new Set(lesson.phrases.map((phrase) => phrase.id));

    for (const activity of lesson.activities) {
      if (
        activity.kind === "flashcard" &&
        !vocabularyIds.has(activity.vocabularyId)
      ) {
        errors.push(
          `Activity "${activity.id}" references missing vocabulary "${activity.vocabularyId}" in lesson "${lesson.id}".`
        );
      }

      if (
        (activity.kind === "phrase-builder" ||
          activity.kind === "listen-repeat") &&
        !phraseIds.has(activity.phraseId)
      ) {
        errors.push(
          `Activity "${activity.id}" references missing phrase "${activity.phraseId}" in lesson "${lesson.id}".`
        );
      }
    }
  }

  return errors;
}
