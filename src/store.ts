import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CommentOrderByFieldType,
  PostOrderByFieldType,
} from "./types/frontend";

type OrderCommentStore = {
  order: CommentOrderByFieldType;
  changeOrder: (order: CommentOrderByFieldType) => void;
};

type OrderPostStore = {
  order: PostOrderByFieldType;
  changeOrder: (order: PostOrderByFieldType) => void;
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

export const useOrderPostStore = create<OrderPostStore>()(
  persist(
    (set) => ({
      order: "best",
      changeOrder: (order) => set({ order }),
    }),
    { name: "postOrder" }
  )
);

export const useOrderSearchPostsStore = create<OrderPostStore>()((set) => ({
  order: "best",
  changeOrder: (order) => set({ order }),
}));
