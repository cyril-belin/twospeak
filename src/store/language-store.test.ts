import { useLanguageStore } from "@/store/language-store";
import type { SupportedLanguageCode } from "@/types/learning";

const selectedLanguageCode: SupportedLanguageCode | null =
  useLanguageStore.getState().selectedLanguageCode;

if (selectedLanguageCode !== null) {
  throw new Error("Language state should start empty before hydration.");
}

useLanguageStore.getState().setSelectedLanguageCode("fr");

if (useLanguageStore.getState().selectedLanguageCode !== "fr") {
  throw new Error("Language state should store the selected language code.");
}

useLanguageStore.getState().clearSelectedLanguage();

if (useLanguageStore.getState().selectedLanguageCode !== null) {
  throw new Error("Language state should clear the selected language code.");
}

export const languageStoreTypeCheck = selectedLanguageCode;
