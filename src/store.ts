import create from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

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

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Store", useScrollState);
}
