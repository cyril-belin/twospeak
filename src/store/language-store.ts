import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SupportedLanguageCode } from "@/types/learning";

type LanguageState = {
  hasHydrated: boolean;
  selectedLanguageCode: SupportedLanguageCode | null;
  clearSelectedLanguage: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setSelectedLanguageCode: (languageCode: SupportedLanguageCode) => void;
};

export const languageStoreStorageKey = "twospeak-language-store";

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      selectedLanguageCode: null,
      clearSelectedLanguage: () => set({ selectedLanguageCode: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setSelectedLanguageCode: (languageCode) =>
        set({ selectedLanguageCode: languageCode }),
    }),
    {
      name: languageStoreStorageKey,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        selectedLanguageCode: state.selectedLanguageCode,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
