import { useUser } from "@clerk/expo";
import { useMemo } from "react";

import { HomeScreen } from "@/components/home/home-screen";
import { getHomeDashboardData } from "@/data/home";
import { useLanguageStore } from "@/store/language-store";
import { useProgressStore } from "@/store/progress-store";

export default function HomeTabScreen() {
  const { user } = useUser();
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const completedLessonIds = useProgressStore(
    (state) => state.completedLessonIds,
  );
  const streakDays = useProgressStore((state) => state.streakDays);
  const xpByLanguage = useProgressStore((state) => state.xpByLanguage);

  const dashboardData = useMemo(
    () =>
      selectedLanguageCode
        ? getHomeDashboardData(selectedLanguageCode, {
            completedLessonIds,
            streakDays,
            xpByLanguage,
          })
        : null,
    [completedLessonIds, selectedLanguageCode, streakDays, xpByLanguage],
  );

  const userName =
    user?.firstName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
    "Learner";

  if (!dashboardData) {
    return null;
  }

  return <HomeScreen dashboardData={dashboardData} userName={userName} />;
}
