"use client";

import { useEffect, useState } from "react";
import { 
  Panel, 
  Group as PanelGroup, 
  Separator as PanelResizeHandle 
} from "react-resizable-panels";
import { TopBar } from "./TopBar";
import { SidebarExplorer } from "./SidebarExplorer";
import EditorComponent from "./EditorComponent";
import { AIAgentPanel } from "./AIAgentPanel";
import TerminalComponent from "./TerminalComponent";
import { useLumoraStore } from "./useLumoraStore";
import { useContextSync } from "./useContextSync";
import { cn } from "@/lib/utils";
import { Search, Command, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LumoraStudio() {
  const { 
    isLeftSidebarOpen, 
    isRightSidebarOpen,
    isTerminalOpen,
  } = useLumoraStore();

  useContextSync();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#050505] text-zinc-300 font-sans selection:bg-accent-blue/30 overflow-hidden relative">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .monaco-editor, .monaco-editor .margin, .monaco-editor-background { background-color: transparent !important; }
      `}</style>

      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Sidebar (Explorer) */}
          {isLeftSidebarOpen && (
            <>
              <Panel defaultSize={18} minSize={12} maxSize={25}>
                <SidebarExplorer />
              </Panel>
              <PanelResizeHandle className="w-[1px] bg-white/5 hover:bg-accent-blue/50 transition-colors" />
            </>
          )}

          {/* Main Content (Editor + Terminal) */}
          <Panel defaultSize={52} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={75} minSize={20}>
                <EditorComponent />
              </Panel>
              {isTerminalOpen && (
                <>
                  <PanelResizeHandle className="h-[1px] bg-white/5 hover:bg-accent-blue/50 transition-colors" />
                  <Panel defaultSize={25} minSize={10}>
                    <TerminalComponent />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {/* Right Sidebar (AI Agent) */}
          {isRightSidebarOpen && (
            <>
              <PanelResizeHandle className="w-[1px] bg-white/5 hover:bg-accent-blue/50 transition-colors" />
              <Panel defaultSize={30} minSize={20} maxSize={40}>
                <AIAgentPanel />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-3 text-[9px] font-black uppercase tracking-widest text-zinc-600 shrink-0 select-none">
        <div className="flex gap-5">
           <div className="flex items-center gap-1.5 hover:text-zinc-400 cursor-pointer transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> 
              main*
           </div>
           <div className="hover:text-zinc-400 cursor-pointer transition-colors">Ln 1, Col 1</div>
           <div className="hover:text-zinc-400 cursor-pointer transition-colors">Spaces: 2</div>
        </div>
        <div className="flex gap-6 items-center">
           <div className="flex items-center gap-1.5 text-accent-blue/70 italic">
              <Sparkles size={10} /> 
              Antigravity Mode
           </div>
           <div className="hover:text-zinc-400 cursor-pointer transition-colors">UTF-8</div>
           <div className="text-accent-blue">Typescript</div>
        </div>
      </div>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCommandPaletteOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-4xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/[0.02]">
                   <Search size={18} className="text-zinc-500" />
                   <input autoFocus placeholder="Search commands..." className="flex-1 bg-transparent border-none text-white outline-none placeholder:text-zinc-600 text-sm font-medium" />
                   <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black text-zinc-500 flex items-center gap-1">
                      <Command size={10} /> K
                   </div>
                </div>
                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                   {[
                     { icon: "✨", label: "Agent: Create a new project", shortcut: "Ctrl+N" },
                     { icon: "📁", label: "File: Open folder...", shortcut: "Ctrl+O" },
                     { icon: "🔨", label: "Studio: Toggle terminal", shortcut: "Ctrl+`" },
                     { icon: "🎨", label: "View: Switch theme", shortcut: "Ctrl+T" },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
                        <div className="flex items-center gap-3">
                           <span className="text-sm">{item.icon}</span>
                           <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{item.label}</span>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-700 group-hover:text-zinc-500">{item.shortcut}</div>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
