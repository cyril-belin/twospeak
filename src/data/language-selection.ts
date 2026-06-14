import { languages } from "@/data/languages";
import type { SupportedLanguageCode } from "@/types/learning";

const learnerCountLabels = {
  es: "28.4M learners",
  fr: "19.4M learners",
  ja: "12.7M learners",
  ko: "9.3M learners",
  de: "8.1M learners",
  zh: "7.4M learners",
} as const satisfies Record<SupportedLanguageCode, string>;

export const defaultLanguageSelectionCode: SupportedLanguageCode = "es";

export function getLanguageSelectionItems() {
  return languages.map((language) => ({
    ...language,
    learnerCountLabel: learnerCountLabels[language.code],
  }));
}
