import { getLanguageByCode } from "@/data/languages";

const french = getLanguageByCode("fr");

if (french?.name !== "French") {
  throw new Error("French should resolve from its language code.");
}

const missingLanguage = getLanguageByCode("ko");

if (missingLanguage !== undefined) {
  throw new Error("Unavailable languages should not resolve.");
}

export const languagesTypeCheck = {
  french,
  missingLanguage,
};
