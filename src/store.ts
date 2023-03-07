import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderByType } from "./types/frontend";

type OrderCommentStore = {
  order: OrderByType;
  changeOrder: (order: OrderByType) => void;
};

type OrderPostStore = OrderCommentStore;

export const useOrderCommentStore = create<OrderCommentStore>()(
  persist(
    (set) => ({
      order: "best",
      changeOrder: (order) => set({ order }),
    }),
    { name: "commentOrder" }
  )
);

export const useOrderPostStore = create<OrderPostStore>()(
  persist(
    (set) => ({
      order: "best",
      changeOrder: (order) => set({ order }),
    }),
    { name: "postOrder" }
  )
);
