import { create } from "zustand";
import { inferQueryInput } from "./utils/trpc";
import { persist } from "zustand/middleware";

type OrderByType = Pick<
  inferQueryInput<"comment.getCommentsByPostId">,
  "orderBy"
>["orderBy"];

type ScrollState = {
  scrollPosition: number;
  updateScrollPosition: (value: number) => void;
  reset: () => void;
};

type OrderCommentStore = {
  order: OrderByType;
  changeOrder: (order: OrderByType) => void;
};

export const useScrollState = create<ScrollState>()((set) => ({
  scrollPosition: 0,
  updateScrollPosition: (value) => set({ scrollPosition: value }),
  reset: () => set({ scrollPosition: 0 }),
}));

export const useOrderCommentStore = create<OrderCommentStore>()(
  persist(
    (set) => ({
      order: "best",
      changeOrder: (order) => set({ order }),
    }),
    { name: "commentOrder" }
  )
);
