import type { Language, SupportedLanguageCode } from "@/types/learning";

export const supportedLanguageCodes = [
  "es",
  "fr",
  "ja",
  "ko",
  "de",
  "zh",
] as const satisfies readonly SupportedLanguageCode[];

export const languages = [
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flagEmoji: "🇪🇸",
    accentColor: "#FF6B35",
    description: "Start with friendly greetings and simple cafe phrases.",
    beginnerGreeting: "Hola!",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flagEmoji: "🇫🇷",
    accentColor: "#4F7CFF",
    description: "Practice polite introductions and everyday expressions.",
    beginnerGreeting: "Bonjour!",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flagEmoji: "🇯🇵",
    accentColor: "#FF5C8A",
    description: "Learn warm greetings and useful travel basics.",
    beginnerGreeting: "こんにちは!",
  },
  /* {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flagEmoji: "🇰🇷",
    accentColor: "#3D7BFF",
    description: "Practice friendly greetings and simple everyday phrases.",
    beginnerGreeting: "안녕하세요!",
  }, */
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flagEmoji: "🇩🇪",
    accentColor: "#FFB000",
    description: "Build confidence with greetings and clear travel basics.",
    beginnerGreeting: "Hallo!",
  },
  /* {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flagEmoji: "🇨🇳",
    accentColor: "#FF3B30",
    description: "Start with useful greetings and simple polite phrases.",
    beginnerGreeting: "你好!",
  }, */
] as const satisfies readonly Language[];

export function getLanguageByCode(languageCode: SupportedLanguageCode) {
  return languages.find((language) => language.code === languageCode);
}
