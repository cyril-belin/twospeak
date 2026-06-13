import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import type { Language, Lesson, Unit } from "@/types/learning";
import { validateLearningContent } from "./index";

const typedLanguages: readonly Language[] = languages;
const typedUnits: readonly Unit[] = units;
const typedLessons: readonly Lesson[] = lessons;

const contentErrors = validateLearningContent();

if (contentErrors.length > 0) {
  throw new Error(
    `Invalid learning content:\n${contentErrors.join("\n")}`
  );
}

export const learningContentTypeCheck = {
  languages: typedLanguages,
  units: typedUnits,
  lessons: typedLessons,
  errors: contentErrors,
};
