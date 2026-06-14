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

export type AudioLessonSessionAction =
  | "end-session"
  | "play-teacher"
  | "toggle-mic"
  | "toggle-preview"
  | "toggle-subtitles";

export type AudioLessonSessionState = {
  areSubtitlesOn: boolean;
  feedback: AudioLessonScreenData["feedback"];
  hasEnded: boolean;
  isMicOn: boolean;
  isPreviewOn: boolean;
  status: string;
  subtitle: string | null;
  teacherMessage: AudioLessonScreenData["teacherMessage"];
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

export function getInitialAudioLessonSessionState(
  screenData: AudioLessonScreenData,
): AudioLessonSessionState {
  return {
    areSubtitlesOn: false,
    feedback: screenData.feedback,
    hasEnded: false,
    isMicOn: true,
    isPreviewOn: true,
    status: screenData.sessionStatus,
    subtitle: null,
    teacherMessage: screenData.teacherMessage,
  };
}

export function updateAudioLessonSessionState(
  state: AudioLessonSessionState,
  action: AudioLessonSessionAction,
  screenData: AudioLessonScreenData,
): AudioLessonSessionState {
  if (state.hasEnded && action !== "end-session") {
    return state;
  }

  if (action === "toggle-mic") {
    const isMicOn = !state.isMicOn;

    return {
      ...state,
      feedback: {
        ...state.feedback,
        speaking: isMicOn ? screenData.feedback.speaking : "Muted",
      },
      isMicOn,
      status: isMicOn ? "Listening" : "Muted",
      teacherMessage: isMicOn
        ? {
            encouragement: "I'm listening.",
            phrase: screenData.teacherMessage.phrase,
            translation: "Try saying it out loud now.",
          }
        : {
            encouragement: "Mic muted.",
            phrase: "Tap Mic when you are ready to practice.",
            translation: "The audio lesson is still active.",
          },
    };
  }

  if (action === "toggle-subtitles") {
    const areSubtitlesOn = !state.areSubtitlesOn;

    return {
      ...state,
      areSubtitlesOn,
      status: areSubtitlesOn ? "Subtitles on" : "Listening",
      subtitle: areSubtitlesOn ? getLessonSubtitle(screenData) : null,
      teacherMessage: {
        encouragement: areSubtitlesOn ? "Subtitles on." : "Subtitles hidden.",
        phrase: screenData.teacherMessage.phrase,
        translation: screenData.teacherMessage.translation,
      },
    };
  }

  if (action === "toggle-preview") {
    const isPreviewOn = !state.isPreviewOn;

    return {
      ...state,
      isPreviewOn,
      status: isPreviewOn ? "Preview on" : "Audio only",
      teacherMessage: isPreviewOn
        ? screenData.teacherMessage
        : {
            encouragement: "Audio-only mode.",
            phrase: "Teacher preview hidden.",
            translation: "Your lesson continues with voice practice.",
          },
    };
  }

  if (action === "play-teacher") {
    return {
      ...state,
      status: "Teacher speaking",
      teacherMessage: {
        encouragement: screenData.teacherMessage.encouragement,
        phrase: screenData.teacherContext.speakingStyle,
        translation: screenData.teacherContext.correctionStyle,
      },
    };
  }

  return {
    ...state,
    feedback: screenData.feedback,
    hasEnded: true,
    isMicOn: false,
    status: "Session complete",
    subtitle: null,
    teacherMessage: {
      encouragement: "Lesson complete!",
      phrase: `Nice work practicing ${screenData.lesson.title}.`,
      translation: `+${screenData.lesson.xpReward} XP saved to ${screenData.language.name}.`,
    },
  };
}

function getActivityTeacherPrompt(lesson: Lesson): AiTeacherPrompt | null {
  const activity = lesson.activities.find(
    (lessonActivity) => lessonActivity.kind === "ai-teacher",
  );

  return activity?.kind === "ai-teacher" ? activity.aiTeacherPrompt : null;
}

function getLessonSubtitle(screenData: AudioLessonScreenData) {
  const primaryPhrase = screenData.phrases[0];

  if (!primaryPhrase) {
    return screenData.teacherContext.learnerGoal;
  }

  return `${primaryPhrase.text} • ${primaryPhrase.pronunciation} • ${primaryPhrase.translation}`;
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
