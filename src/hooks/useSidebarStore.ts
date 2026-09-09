import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCompact: boolean;
  isFocusMode: boolean;
  isMobileOpen: boolean;
  toggleCompact: () => void;
  setCompact: (compact: boolean) => void;
  toggleFocusMode: () => void;
  setFocusMode: (focus: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCompact: false,
      isFocusMode: false,
      isMobileOpen: false,
      toggleCompact: () => set((state) => ({ isCompact: !state.isCompact })),
      setCompact: (compact) => set({ isCompact: compact }),
      toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
      setFocusMode: (focus) => set({ isFocusMode: focus }),
      toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setMobileOpen: (open: boolean) => set({ isMobileOpen: open }),
    }),
    {
      name: 'sidebar-compact-storage',
      partialize: (state) => ({ isCompact: state.isCompact }), // Do not persist focus mode or mobile open across sessions
    }
  )
);
