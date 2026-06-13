import type { Language, SupportedLanguageCode } from "@/types/learning";

export const supportedLanguageCodes = ["es", "fr", "ja"] as const satisfies readonly SupportedLanguageCode[];

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
] as const satisfies readonly Language[];
