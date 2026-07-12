"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useIdeStore } from "./store";
import { X, Maximize2, Trash2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function TerminalPanel() {
  const { isTerminalOpen, setTerminalOpen } = useIdeStore();
  const [terminalHeight, setTerminalHeight] = useState(220);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    if (!terminalRef.current || !isTerminalOpen) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
      theme: {
        background: '#050505',
        foreground: '#00f2ff',
        cursor: '#00f2ff',
        selectionBackground: 'rgba(255, 255, 255, 0.1)',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\x1b[1;36m▲ Exismic Studio Engine [v1.0.0]\x1b[0m');
    term.writeln('\x1b[90mAgent initialized. Ready for commands.\x1b[0m');
    term.write('\r\n\x1b[32m➜\x1b[0m \x1b[36mproject\x1b[0m ');

    xtermRef.current = term;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      term.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [isTerminalOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 100 && newHeight < 600) {
      setTerminalHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  if (!isTerminalOpen) return null;

  return (
    <div 
      className="bg-[#050505] border-t border-white/5 flex flex-col relative z-20"
      style={{ height: terminalHeight }}
    >
      {/* Resize Handle */}
      <div 
        className="absolute -top-1 left-0 right-0 h-1 cursor-ns-resize hover:bg-accent-blue/50 transition-colors z-30"
        onMouseDown={handleMouseDown}
      />

      {/* Terminal Header */}
      <div className="h-9 flex items-center justify-between px-4 bg-[#0a0a0a] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Terminal</span>
          </div>
          <div className="flex gap-4">
            <button className="text-[9px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest border-b border-accent-blue py-2.5">bash</button>
            <button className="text-[9px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest py-2.5">node</button>
            <button className="text-[9px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest py-2.5">agent-logs</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-white/5 rounded text-zinc-600 hover:text-white transition-colors">
            <Play size={12} />
          </button>
          <button className="p-1 hover:bg-white/5 rounded text-zinc-600 hover:text-white transition-colors">
            <Trash2 size={12} />
          </button>
          <button 
            onClick={() => setTerminalOpen(false)}
            className="p-1 hover:bg-white/5 rounded text-zinc-600 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-2 overflow-hidden bg-[#050505]">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  );
}
