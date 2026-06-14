import { useMemo } from "react";

import { LessonsScreen } from "@/components/lessons/lessons-screen";
import { getLessonScreenData } from "@/data/lesson-screen";
import { useLanguageStore } from "@/store/language-store";
import { useProgressStore } from "@/store/progress-store";

export default function LearnTabScreen() {
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const completedLessonIds = useProgressStore(
    (state) => state.completedLessonIds,
  );
  const streakDays = useProgressStore((state) => state.streakDays);
  const xpByLanguage = useProgressStore((state) => state.xpByLanguage);

  const screenData = useMemo(
    () =>
      selectedLanguageCode
        ? getLessonScreenData(selectedLanguageCode, {
            completedLessonIds,
            streakDays,
            xpByLanguage,
          })
        : null,
    [completedLessonIds, selectedLanguageCode, streakDays, xpByLanguage],
  );

  if (!screenData) {
    return null;
  }

  return <LessonsScreen screenData={screenData} />;
}
