import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCompact: boolean;
  isFocusMode: boolean;
  toggleCompact: () => void;
  setCompact: (compact: boolean) => void;
  toggleFocusMode: () => void;
  setFocusMode: (focus: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCompact: false,
      isFocusMode: false,
      toggleCompact: () => set((state) => ({ isCompact: !state.isCompact })),
      setCompact: (compact) => set({ isCompact: compact }),
      toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
      setFocusMode: (focus) => set({ isFocusMode: focus }),
    }),
    {
      name: 'sidebar-compact-storage',
      partialize: (state) => ({ isCompact: state.isCompact }), // Do not persist focus mode across sessions
    }
  )
);
