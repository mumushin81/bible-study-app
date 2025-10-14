import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  points: number;
  level: number;
  exp: number;
  studiedVerses: string[];
  darkMode: boolean;

  addPoints: (points: number) => void;
  addExp: (exp: number) => void;
  markVerseStudied: (verseId: string) => void;
  toggleDarkMode: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      points: 0,
      level: 1,
      exp: 0,
      studiedVerses: [],
      darkMode: false,

      addPoints: (points: number) =>
        set((state) => ({
          points: state.points + points,
        })),

      addExp: (exp: number) =>
        set((state) => {
          const newExp = state.exp + exp;
          const newLevel = Math.floor(newExp / 100) + 1;

          return {
            exp: newExp,
            level: newLevel,
          };
        }),

      markVerseStudied: (verseId: string) =>
        set((state) => {
          if (state.studiedVerses.includes(verseId)) {
            return state;
          }
          return {
            studiedVerses: [...state.studiedVerses, verseId],
          };
        }),

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),
    }),
    {
      name: 'eden-bible-study-storage',
    }
  )
);
