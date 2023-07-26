import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CommentOrderByFieldType,
  PostOrderByFieldSearchType,
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

type OrderSearchPostStore = {
  order: PostOrderByFieldSearchType;
  changeOrder: (order: PostOrderByFieldSearchType) => void;
};

type ThemeType = "bumblebee" | "dark";
type ThemeStore = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

type SearchQueryStore = {
  query: string;
  setQuery: (value: string) => void;
  restoreQuery: () => void;
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

export const useOrderSearchPostsStore = create<OrderSearchPostStore>()(
  (set) => ({
    order: "best",
    changeOrder: (order) => set({ order }),
  })
);

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "bumblebee",
      setTheme(theme) {
        set({ theme });
      },
    }),
    { name: "theme" }
  )
);

export const useSearchQueryStore = create<SearchQueryStore>()((set) => ({
  query: "",
  setQuery: (value) => set({ query: value }),
  restoreQuery: () => set({ query: "" }),
}));
