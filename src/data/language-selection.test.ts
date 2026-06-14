import {
  defaultLanguageSelectionCode,
  getLanguageSelectionItems,
} from "@/data/language-selection";
import { languages } from "@/data/languages";
import type { SupportedLanguageCode } from "@/types/learning";

const selectionItems = getLanguageSelectionItems();

const expectedCodes: SupportedLanguageCode[] = languages.map(
  (language) => language.code,
);

const actualCodes: SupportedLanguageCode[] = selectionItems.map(
  (language) => language.code,
);

if (actualCodes.join(",") !== expectedCodes.join(",")) {
  throw new Error("Language selection items must follow data/languages.ts.");
}

if (defaultLanguageSelectionCode !== "es") {
  throw new Error("Spanish should be selected by default.");
}

const spanish = selectionItems.find((language) => language.code === "es");

if (spanish?.learnerCountLabel !== "28.4M learners") {
  throw new Error("Spanish learner count should match the language design.");
}

export const languageSelectionTypeCheck = {
  defaultLanguageSelectionCode,
  selectionItems,
};
