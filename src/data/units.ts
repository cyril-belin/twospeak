import type { Unit } from "@/types/learning";

export const units = [
  {
    id: "es-basics-1",
    languageCode: "es",
    order: 1,
    title: "Spanish Basics",
    description: "Meet someone, say hello, and order a simple drink.",
    level: "beginner",
    goals: [
      "Use three common greetings",
      "Introduce yourself with a short sentence",
      "Order coffee politely",
    ],
    lessonIds: ["es-greetings", "es-cafe-order"],
  },
  {
    id: "fr-basics-1",
    languageCode: "fr",
    order: 1,
    title: "French Basics",
    description: "Practice polite greetings and simple introductions.",
    level: "beginner",
    goals: [
      "Choose a greeting for morning or evening",
      "Say your name",
      "Ask for tea politely",
    ],
    lessonIds: ["fr-greetings", "fr-cafe-order"],
  },
  {
    id: "ja-basics-1",
    languageCode: "ja",
    order: 1,
    title: "Japanese Basics",
    description: "Start conversations with friendly, travel-ready phrases.",
    level: "beginner",
    goals: [
      "Use everyday greetings",
      "Thank someone politely",
      "Ask for water in a cafe",
    ],
    lessonIds: ["ja-greetings", "ja-cafe-order"],
  },
] as const satisfies readonly Unit[];
