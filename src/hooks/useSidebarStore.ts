import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCompact: boolean;
  toggleCompact: () => void;
  setCompact: (compact: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCompact: false,
      toggleCompact: () => set((state) => ({ isCompact: !state.isCompact })),
      setCompact: (compact) => set({ isCompact: compact }),
    }),
    {
      name: 'sidebar-compact-storage',
    }
  )
);
