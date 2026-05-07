import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get, set as idbSet, del } from 'idb-keyval';

export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  language: string;
};

interface LumoraState {
  files: FileNode[];
  activeFileId: string | null;
  openFileIds: string[];
  fileContents: Record<string, string>; // Memory cache
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isTerminalOpen: boolean;
  activeTab: 'code' | 'preview' | 'diff';
  diffCode: { original: string; modified: string } | null;

  // Actions
  addFile: (name: string, content?: string, parentId?: string | null) => Promise<string>;
  updateFileContent: (id: string, content: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  openFile: (id: string) => Promise<void>;
  closeFile: (id: string) => void;
  setActiveFileId: (id: string | null) => void;
  setFiles: (files: FileNode[]) => void;
  
  // UI Actions
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setTerminalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'code' | 'preview' | 'diff') => void;
  setDiffCode: (diff: { original: string; modified: string } | null) => void;
}

export const useLumoraStore = create<LumoraState>()(
  persist(
    (set, getStore) => ({
      files: [],
      activeFileId: null,
      openFileIds: [],
      fileContents: {},
      isLeftSidebarOpen: true,
      isRightSidebarOpen: true,
      isTerminalOpen: true,
      activeTab: 'code',
      diffCode: null,

      addFile: async (name, content = "", parentId = null) => {
        const id = Math.random().toString(36).substring(2, 11);
        const ext = name.split('.').pop() || 'txt';
        const newNode: FileNode = { id, name, type: 'file', parentId, language: ext };
        
        await idbSet(`content_${id}`, content);
        
        set((state) => ({
          files: [...state.files, newNode],
          fileContents: { ...state.fileContents, [id]: content }
        }));
        
        return id;
      },

      updateFileContent: async (id, content) => {
        await idbSet(`content_${id}`, content);
        set((state) => ({
          fileContents: { ...state.fileContents, [id]: content }
        }));
      },

      deleteFile: async (id) => {
        await del(`content_${id}`);
        set((state) => ({
          files: state.files.filter(f => f.id !== id),
          openFileIds: state.openFileIds.filter(fid => fid !== id),
          activeFileId: state.activeFileId === id ? null : state.activeFileId,
        }));
      },

      openFile: async (id) => {
        const state = getStore();
        if (!state.fileContents[id]) {
          const content = await get(`content_${id}`) || "";
          set((state) => ({
            fileContents: { ...state.fileContents, [id]: content }
          }));
        }
        
        set((state) => ({
          openFileIds: Array.from(new Set([...state.openFileIds, id])),
          activeFileId: id,
          activeTab: 'code'
        }));
      },

      closeFile: (id) => set((state) => {
        const newOpen = state.openFileIds.filter(fid => fid !== id);
        let newActive = state.activeFileId;
        if (state.activeFileId === id) {
          newActive = newOpen[newOpen.length - 1] || null;
        }
        return { openFileIds: newOpen, activeFileId: newActive };
      }),

      setActiveFileId: (id) => set({ activeFileId: id }),
      setFiles: (files) => set({ files }),
      setLeftSidebarOpen: (open) => set({ isLeftSidebarOpen: open }),
      setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
      setTerminalOpen: (open) => set({ isTerminalOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setDiffCode: (diff) => set({ diffCode: diff }),
    }),
    {
      name: 'lumora-studio-v3',
      partialize: (state) => ({
        files: state.files,
        openFileIds: state.openFileIds,
        activeFileId: state.activeFileId,
        isLeftSidebarOpen: state.isLeftSidebarOpen,
        isRightSidebarOpen: state.isRightSidebarOpen,
        isTerminalOpen: state.isTerminalOpen,
      }),
    }
  )
);
