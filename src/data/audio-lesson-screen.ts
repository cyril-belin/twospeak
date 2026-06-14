import { getLanguage, getLesson } from "@/data";
import type {
  AiTeacherPrompt,
  Language,
  Lesson,
  Phrase,
} from "@/types/learning";

export type AudioLessonScreenData = {
  feedback: {
    grammar: string;
    pronunciation: string;
    speaking: string;
  };
  language: Language;
  lesson: Lesson;
  phrases: readonly Phrase[];
  primaryGoal: string;
  sessionStatus: string;
  teacherContext: AiTeacherPrompt;
  teacherMessage: {
    encouragement: string;
    phrase: string;
    translation: string;
  };
};

export function getAudioLessonScreenData(
  lessonId: string | undefined,
): AudioLessonScreenData | null {
  if (!lessonId) {
    return null;
  }

  const lesson = getLesson(lessonId);

  if (!lesson) {
    return null;
  }

  const language = getLanguage(lesson.languageCode);

  if (!language) {
    return null;
  }

  const teacherContext = lesson.aiTeacherPrompt ?? getActivityTeacherPrompt(lesson);

  if (!teacherContext) {
    return null;
  }

  const primaryPhrase = lesson.phrases[0] ?? null;

  return {
    feedback: {
      grammar: "Good",
      pronunciation: "Great",
      speaking: "Excellent",
    },
    language,
    lesson,
    phrases: lesson.phrases,
    primaryGoal: lesson.goals[0] ?? teacherContext.learnerGoal,
    sessionStatus: "Online",
    teacherContext,
    teacherMessage: {
      encouragement: getEncouragement(language.code),
      phrase: primaryPhrase?.text ?? lesson.title,
      translation: primaryPhrase?.translation ?? teacherContext.learnerGoal,
    },
  };
}

function getActivityTeacherPrompt(lesson: Lesson): AiTeacherPrompt | null {
  const activity = lesson.activities.find(
    (lessonActivity) => lessonActivity.kind === "ai-teacher",
  );

  return activity?.kind === "ai-teacher" ? activity.aiTeacherPrompt : null;
}

function getEncouragement(languageCode: Language["code"]) {
  if (languageCode === "es") {
    return "¡Muy bien!";
  }

  if (languageCode === "fr") {
    return "Très bien!";
  }

  if (languageCode === "de") {
    return "Sehr gut!";
  }

  if (languageCode === "ja") {
    return "いいですね!";
  }

  return "Great work!";
}
