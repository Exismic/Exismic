import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get, set as idbSet, del } from 'idb-keyval';

export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  language?: string;
};

interface IdeState {
  files: FileNode[];
  activeFileId: string | null;
  openFileIds: string[];
  fileContents: Record<string, string>; // Memory cache of contents
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isTerminalOpen: boolean;
  activeTab: 'code' | 'preview' | 'diff';
  diffCode: { original: string; modified: string } | null;
  
  // Actions
  setFiles: (files: FileNode[]) => void;
  addFile: (file: Omit<FileNode, 'id'>, content?: string) => Promise<string>;
  updateFile: (id: string, updates: Partial<FileNode>) => void;
  updateFileContent: (id: string, content: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  setActiveFileId: (id: string | null) => void;
  toggleOpenFile: (id: string, forceOpen?: boolean) => Promise<void>;
  closeFile: (id: string) => void;
  loadFileContent: (id: string) => Promise<string>;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setTerminalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'code' | 'preview' | 'diff') => void;
  setDiffCode: (diff: { original: string; modified: string } | null) => void;
}

export const useIdeStore = create<IdeState>()(
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

      setFiles: (files) => set({ files }),
      
      addFile: async (file, content = "") => {
        const id = Math.random().toString(36).substring(2, 11);
        const newNode: FileNode = { ...file, id };
        
        await idbSet(`file_${id}`, content);
        
        set((state) => ({
          files: [...state.files, newNode],
          fileContents: { ...state.fileContents, [id]: content }
        }));
        
        return id;
      },

      updateFile: (id, updates) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, ...updates } : f)
      })),

      updateFileContent: async (id, content) => {
        await idbSet(`file_${id}`, content);
        set((state) => ({
          fileContents: { ...state.fileContents, [id]: content }
        }));
      },

      deleteFile: async (id) => {
        await del(`file_${id}`);
        set((state) => ({
          files: state.files.filter(f => f.id !== id),
          openFileIds: state.openFileIds.filter(fid => fid !== id),
          activeFileId: state.activeFileId === id ? null : state.activeFileId,
          fileContents: Object.fromEntries(Object.entries(state.fileContents).filter(([k]) => k !== id))
        }));
      },

      setActiveFileId: (id) => set({ activeFileId: id }),

      toggleOpenFile: async (id, forceOpen) => {
        const state = getStore();
        const isOpen = state.openFileIds.includes(id);
        
        if (!state.fileContents[id]) {
          await state.loadFileContent(id);
        }

        if (isOpen && !forceOpen) {
          set({ activeFileId: id });
          return;
        }
        
        const newOpenFileIds = isOpen ? state.openFileIds : [...state.openFileIds, id];
        set({
          openFileIds: newOpenFileIds,
          activeFileId: id
        });
      },

      closeFile: (id) => set((state) => {
        const newOpenFileIds = state.openFileIds.filter(fid => fid !== id);
        let newActiveFileId = state.activeFileId;
        if (state.activeFileId === id) {
          newActiveFileId = newOpenFileIds[newOpenFileIds.length - 1] || null;
        }
        return {
          openFileIds: newOpenFileIds,
          activeFileId: newActiveFileId
        };
      }),

      loadFileContent: async (id) => {
        const content = await get(`file_${id}`) || "";
        set((state) => ({
          fileContents: { ...state.fileContents, [id]: content }
        }));
        return content;
      },

      setLeftSidebarOpen: (open) => set({ isLeftSidebarOpen: open }),
      setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
      setTerminalOpen: (open) => set({ isTerminalOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setDiffCode: (diff) => set({ diffCode: diff }),
    }),
    {
      name: 'lumora-studio-v2',
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
