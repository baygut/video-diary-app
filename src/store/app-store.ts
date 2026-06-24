import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  colorSchemePreference: 'system' | 'light' | 'dark';
  diaryListSortOrder: 'newest' | 'oldest';
  hasCompletedOnboarding: boolean;
};

type AppActions = {
  setColorSchemePreference: (pref: AppState['colorSchemePreference']) => void;
  setDiaryListSortOrder: (order: AppState['diaryListSortOrder']) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

const INITIAL_STATE: AppState = {
  colorSchemePreference: 'system',
  diaryListSortOrder: 'newest',
  hasCompletedOnboarding: false,
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setColorSchemePreference: (colorSchemePreference) => set({ colorSchemePreference }),
      setDiaryListSortOrder: (diaryListSortOrder) => set({ diaryListSortOrder }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => Storage),
    }
  )
);
