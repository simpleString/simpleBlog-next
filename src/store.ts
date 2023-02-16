import { create } from "zustand";

type ScrollState = {
  scrollPosition: number;
  updateScrollPosition: (value: number) => void;
  reset: () => void;
};

export const useScrollState = create<ScrollState>()((set) => ({
  scrollPosition: 0,
  updateScrollPosition: (value) => set({ scrollPosition: value }),
  reset: () => set({ scrollPosition: 0 }),
}));
