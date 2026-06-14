import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SupportedLanguageCode } from "@/types/learning";

export type ProgressInput = {
  completedLessonIds: readonly string[];
  streakDays: number;
  xpByLanguage: Partial<Record<SupportedLanguageCode, number>>;
};

type ProgressState = ProgressInput & {
  hasHydrated: boolean;
  completedLessonIds: string[];
  setHasHydrated: (hasHydrated: boolean) => void;
  completeLesson: (
    lessonId: string,
    languageCode: SupportedLanguageCode,
    xpReward: number,
  ) => void;
  setStreakDays: (streakDays: number) => void;
  resetProgress: () => void;
};

export const progressStoreStorageKey = "twospeak-progress-store";

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      completedLessonIds: [],
      streakDays: 0,
      xpByLanguage: {},
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      completeLesson: (lessonId, languageCode, xpReward) => {
        const { completedLessonIds, xpByLanguage } = get();

        if (completedLessonIds.includes(lessonId)) {
          return;
        }

        set({
          completedLessonIds: [...completedLessonIds, lessonId],
          xpByLanguage: {
            ...xpByLanguage,
            [languageCode]: (xpByLanguage[languageCode] ?? 0) + xpReward,
          },
        });
      },
      setStreakDays: (streakDays) => set({ streakDays }),
      resetProgress: () =>
        set({
          completedLessonIds: [],
          streakDays: 0,
          xpByLanguage: {},
        }),
    }),
    {
      name: progressStoreStorageKey,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        completedLessonIds: state.completedLessonIds,
        streakDays: state.streakDays,
        xpByLanguage: state.xpByLanguage,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function isProgressFresh(progress: ProgressInput): boolean {
  if (progress.completedLessonIds.length > 0) {
    return false;
  }

  if (progress.streakDays > 0) {
    return false;
  }

  for (const value of Object.values(progress.xpByLanguage)) {
    if (typeof value === "number" && value > 0) {
      return false;
    }
  }

  return true;
}
