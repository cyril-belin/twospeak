export type SupportedLanguageCode = "es" | "fr" | "ja" | "ko" | "de" | "zh";

export type LessonLevel = "beginner";

export type LessonKind =
  | "vocabulary"
  | "phrases"
  | "listening"
  | "ai-teacher";

export type ActivityKind =
  | "flashcard"
  | "multiple-choice"
  | "phrase-builder"
  | "listen-repeat"
  | "ai-teacher";

export type Language = {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flagEmoji: string;
  accentColor: string;
  description: string;
  beginnerGreeting: string;
};

export type Unit = {
  id: string;
  languageCode: SupportedLanguageCode;
  order: number;
  title: string;
  description: string;
  level: LessonLevel;
  goals: string[];
  lessonIds: string[];
};

export type VocabularyItem = {
  id: string;
  term: string;
  translation: string;
  pronunciation: string;
  example: string;
};

export type Phrase = {
  id: string;
  text: string;
  translation: string;
  pronunciation: string;
  situation: string;
};

export type AiTeacherPrompt = {
  persona: string;
  lessonContext: string;
  learnerGoal: string;
  speakingStyle: string;
  correctionStyle: string;
};

export type FlashcardActivity = {
  id: string;
  kind: "flashcard";
  prompt: string;
  vocabularyId: string;
};

export type MultipleChoiceActivity = {
  id: string;
  kind: "multiple-choice";
  prompt: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type PhraseBuilderActivity = {
  id: string;
  kind: "phrase-builder";
  prompt: string;
  phraseId: string;
  wordBank: string[];
  correctAnswer: string;
};

export type ListenRepeatActivity = {
  id: string;
  kind: "listen-repeat";
  prompt: string;
  phraseId: string;
  transcript: string;
};

export type AiTeacherActivity = {
  id: string;
  kind: "ai-teacher";
  prompt: string;
  aiTeacherPrompt: AiTeacherPrompt;
};

export type LessonActivity =
  | FlashcardActivity
  | MultipleChoiceActivity
  | PhraseBuilderActivity
  | ListenRepeatActivity
  | AiTeacherActivity;

export type Lesson = {
  id: string;
  unitId: string;
  languageCode: SupportedLanguageCode;
  order: number;
  title: string;
  description: string;
  kind: LessonKind;
  level: LessonLevel;
  xpReward: number;
  estimatedMinutes: number;
  goals: string[];
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  activities: LessonActivity[];
  aiTeacherPrompt?: AiTeacherPrompt;
};
