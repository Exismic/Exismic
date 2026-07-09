import { useEffect } from 'react';
import { useExismicStore } from './useExismicStore';
import axios from 'axios';

export function useContextSync() {
  const { files, activeFileId } = useExismicStore();

  useEffect(() => {
    if (files.length === 0) return;

    const syncContext = async () => {
      try {
        const fileNames = files.map(f => f.name).slice(0, 15);
        const activeFile = files.find(f => f.id === activeFileId)?.name || 'None';
        
        await axios.post('/api/user/context', {
          recentFiles: JSON.stringify(fileNames),
          memories: `Currently working on ${fileNames.length} files. Active file: ${activeFile}.`
        });
      } catch (e) {
        console.error("Failed to sync context", e);
      }
    };

    const timer = setTimeout(syncContext, 10000); // Debounce sync (10s)
    return () => clearTimeout(timer);
  }, [files, activeFileId]);
}
