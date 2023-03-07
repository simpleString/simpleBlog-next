import { create } from "zustand";
import { inferQueryInput } from "./utils/trpc";
import { persist } from "zustand/middleware";

type OrderByType = Pick<
  inferQueryInput<"comment.getCommentsByPostId">,
  "orderBy"
>["orderBy"];

type OrderCommentStore = {
  order: OrderByType;
  changeOrder: (order: OrderByType) => void;
};

export const useOrderCommentStore = create<OrderCommentStore>()(
  persist(
    (set) => ({
      order: "best",
      changeOrder: (order) => set({ order }),
    }),
    { name: "commentOrder" }
  )
);
