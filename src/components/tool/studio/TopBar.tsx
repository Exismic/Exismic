"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowLeft, 
  MessageSquare, 
  Zap, 
  Terminal, 
  Layout, 
  Play, 
  Download,
  Settings,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useLumoraStore } from "./useLumoraStore";
import { cn } from "@/lib/utils";
import GradientText from "../../ui/GradientText";

export function TopBar() {
  const { 
    isTerminalOpen, 
    setTerminalOpen,
    isLeftSidebarOpen,
    setLeftSidebarOpen,
    isRightSidebarOpen,
    setRightSidebarOpen,
    activeTab,
    setActiveTab
  } = useLumoraStore();

  const menuItems = [
    { label: "File", items: ["New File", "Open Project", "Save All", "Export as ZIP"] },
    { label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste"] },
    { label: "View", items: ["Explorer", "Terminal", "Output", "Preview"] },
    { label: "Agent", items: ["Spawn Agent", "Plan Mode", "Fix Errors", "Explain Code"] },
    { label: "Help", items: ["Documentation", "Shortcuts", "Feedback"] },
  ];

  return (
    <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a]/80 backdrop-blur-xl z-50 flex-shrink-0 select-none">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-widest">Hub</span>
        </Link>
        
        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-3 mr-4">
           <div className="w-7 h-7 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue shadow-lg shadow-accent-blue/5">
              <Sparkles size={14} />
           </div>
           <h1 className="text-xs font-black text-white uppercase italic tracking-tighter">
              Lumora <span className="text-accent-blue">Studio</span>
           </h1>
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((menu) => (
            <div key={menu.label} className="relative group">
              <button className="px-3 py-1.5 rounded-md text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1">
                {menu.label}
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all p-1 z-[100]">
                {menu.items.map(item => (
                  <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Controls */}
        <div className="flex items-center bg-white/5 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
            className={cn("p-1.5 rounded-lg transition-all", isLeftSidebarOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            <Layout size={14} />
          </button>
          <button 
            onClick={() => setTerminalOpen(!isTerminalOpen)}
            className={cn("p-1.5 rounded-lg transition-all", isTerminalOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            <Terminal size={14} />
          </button>
          <button 
            onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
            className={cn("p-1.5 rounded-lg transition-all", isRightSidebarOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            <MessageSquare size={14} />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab(activeTab === 'code' ? 'preview' : 'code')}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'preview' ? "bg-accent-blue text-white" : "bg-white/5 text-zinc-400 hover:text-white"
            )}
          >
            <Play size={12} fill={activeTab === 'preview' ? "currentColor" : "none"} />
            {activeTab === 'preview' ? 'Coding' : 'Preview'}
          </button>

          <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-accent-purple/20 border border-accent-purple/30 text-[10px] font-black text-accent-purple uppercase tracking-widest hover:bg-accent-purple/30 transition-all shadow-lg shadow-accent-purple/5">
            <Zap size={12} fill="currentColor" />
            <GradientText>PRO Mode</GradientText>
          </button>
        </div>
      </div>
    </div>
  );
}
