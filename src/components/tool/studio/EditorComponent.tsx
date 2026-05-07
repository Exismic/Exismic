"use client";

import { useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useLumoraStore } from "./useLumoraStore";
import { X, Check, RotateCcw, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import for Monaco Editor
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then(mod => mod.default), { ssr: false });
const MonacoDiffEditor = dynamic(() => import("@monaco-editor/react").then(mod => mod.DiffEditor), { ssr: false });

export function EditorTabs() {
  const { files, openFileIds, activeFileId, openFile, closeFile } = useLumoraStore();
  const openFiles = useMemo(() => files.filter(f => openFileIds.includes(f.id)), [files, openFileIds]);

  return (
    <div className="h-9 flex bg-[#0a0a0a] border-b border-white/5 overflow-x-auto no-scrollbar">
      {openFiles.map(file => (
        <div 
          key={file.id}
          onClick={() => openFile(file.id)}
          className={cn(
            "flex-shrink-0 flex items-center px-4 gap-2 text-[11px] transition-all cursor-pointer border-r border-white/5 relative h-full group",
            activeFileId === file.id ? "bg-[#050505] text-white" : "text-zinc-500 hover:text-zinc-300 bg-[#0a0a0a]"
          )}
        >
          {activeFileId === file.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-accent-blue shadow-[0_0_5px_cyan]" />
          )}
          <span className="truncate max-w-[150px] font-medium tracking-tight">{file.name}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
            className="p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function EditorComponent() {
  const { 
    files, 
    activeFileId, 
    fileContents, 
    updateFileContent, 
    activeTab, 
    setActiveTab,
    diffCode, 
    setDiffCode 
  } = useLumoraStore();

  const activeFile = useMemo(() => files.find(f => f.id === activeFileId), [files, activeFileId]);
  const content = activeFile ? fileContents[activeFile.id] || "" : "";

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId) updateFileContent(activeFileId, value || "");
  };

  const handleApplyDiff = async () => {
    if (diffCode && activeFileId) {
      await updateFileContent(activeFileId, diffCode.modified);
      setDiffCode(null);
      setActiveTab('code');
    }
  };

  if (activeTab === 'diff' && diffCode) {
    return (
      <div className="flex-1 flex flex-col bg-[#050505]">
        <div className="h-9 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 justify-between">
           <span className="text-[10px] font-black text-accent-blue uppercase tracking-widest italic">Review AI Patch</span>
           <div className="flex items-center gap-2">
              <button onClick={() => { setDiffCode(null); setActiveTab('code'); }} className="px-3 py-1 rounded text-[10px] font-bold text-zinc-500 hover:text-white"><RotateCcw size={10} className="inline mr-1" /> Discard</button>
              <button onClick={handleApplyDiff} className="px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-[10px] font-bold hover:bg-accent-blue hover:text-white"><Check size={10} className="inline mr-1" /> Apply Patch</button>
           </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <MonacoDiffEditor
            original={diffCode.original}
            modified={diffCode.modified}
            language={activeFile?.language || "typescript"}
            theme="vs-dark"
            options={{
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              automaticLayout: true,
              minimap: { enabled: false },
              padding: { top: 16 }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
      <EditorTabs />
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeFile ? (
            <motion.div key={activeFile.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <MonacoEditor
                height="100%"
                language={activeFile.language || "typescript"}
                value={content}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 16 },
                  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  wordWrap: "on"
                }}
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-[#050505]">
               <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-700 mb-6 border border-white/5 shadow-2xl">
                  <FileCode size={32} />
               </div>
               <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-3">No Active File</h2>
               <p className="text-zinc-600 text-sm max-w-xs font-medium">Select a file from the explorer to begin development or use the Agent to generate code.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
