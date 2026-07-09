"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  FolderOpen, 
  Plus, 
  Search,
  Trash2,
  FileJson,
  BookOpen
} from "lucide-react";
import { useExismicStore } from "./useExismicStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function SidebarExplorer() {
  const { files, activeFileId, openFile, deleteFile, addFile } = useExismicStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getFileIcon = (name: string) => {
    if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-500/80" />;
    if (name.endsWith('.md')) return <BookOpen size={14} className="text-blue-400/80" />;
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={14} className="text-blue-500/80" />;
    if (name.endsWith('.js')) return <FileCode size={14} className="text-yellow-400/80" />;
    if (name.endsWith('.py')) return <FileCode size={14} className="text-green-500/80" />;
    return <FileCode size={14} className="text-zinc-500" />;
  };

  const handleCreateFile = async () => {
    const name = prompt("Enter file name:");
    if (name) {
      const id = await addFile(name, `// ${name}\n\nexport default function ${name.split('.')[0]}() {\n  return <div></div>\n}`);
      await openFile(id);
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col bg-[#0a0a0a] border-r border-white/5 h-full select-none w-full">
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Explorer</span>
        <button 
          onClick={handleCreateFile}
          className="p-1 hover:bg-white/5 rounded-md text-zinc-500 hover:text-white transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-white/5 border border-white/5 rounded-lg px-7 py-1.5 text-[10px] text-zinc-400 outline-none focus:border-accent-blue/30 transition-all placeholder:text-zinc-700"
          />
          <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <div 
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer transition-colors group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={12} className="text-zinc-600" /> : <ChevronRight size={12} className="text-zinc-600" />}
          <FolderOpen size={14} className="text-accent-blue/80" />
          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">WORKSPACE</span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              {filteredFiles.map(file => (
                <div 
                  key={file.id} 
                  onClick={() => openFile(file.id)}
                  className={cn(
                    "flex items-center justify-between px-8 py-1.5 cursor-pointer group transition-all border-l-2",
                    activeFileId === file.id 
                      ? "bg-accent-blue/10 border-accent-blue text-white font-medium" 
                      : "border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getFileIcon(file.name)}
                    <span className="text-xs truncate">{file.name}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md text-zinc-600 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/5 bg-[#0a0a0a]/50 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Local Persistence</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_5px_rgba(0,242,255,0.5)]" />
        </div>
      </div>
    </div>
  );
}
