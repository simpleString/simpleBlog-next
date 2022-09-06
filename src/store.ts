import create from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { persist } from "zustand/middleware";

type ScrollState = {
  scrollPosition: number;
  updateScrollPosition: (value: number) => void;
  reset: () => void;
};

type SidebarState = {
  sidebarOpen: boolean;
  toggle: () => void;
};

export const useSidebarState = create<SidebarState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      toggle: () =>
        set(() => {
          console.log("value from store: ", !get().sidebarOpen);

          return { sidebarOpen: !get().sidebarOpen };
        }),
    }),
    {
      name: "sidebar-store",
    }
  )
);

// export const useSidebarState = create<SidebarState>((set) => ({
//   sidebarOpen: () =>  {
//     const status = localStorage.getItem('sidebarState')
//     if (status) return !!status;
//     localStorage.setItem('sidebarState', false);
//     return false
//   }, //TODO: needs get data from localstore!!!
//   toggle: () =>
//     set((state) => ({
//       sidebarOpen: !state.sidebarOpen,
//     })),
// }));

export const useScrollState = create<ScrollState>()((set) => ({
  scrollPosition: 0,
  updateScrollPosition: (value) => set({ scrollPosition: value }),
  reset: () => set({ scrollPosition: 0 }),
}));

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("SidebarStore", useSidebarState);
  // mountStoreDevtool("")
}
