"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace',
      theme: {
        background: '#050505',
        foreground: '#00f2ff',
        cursor: '#00f2ff',
        selectionBackground: 'rgba(0, 242, 255, 0.3)',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln("\x1b[1;36mWelcome to Lumora Studio Terminal\x1b[0m");
    term.writeln("\x1b[2mType 'help' for available commands\x1b[0m");
    term.write("\r\n\x1b[1;35m$\x1b[0m ");

    let curr_line = "";
    term.onData(e => {
      switch (e) {
        case '\r': // Enter
          term.write('\r\n');
          if (curr_line.trim() === 'help') {
            term.writeln("Available commands: help, clear, git, npm, agent-status");
          } else if (curr_line.trim() === 'clear') {
            term.clear();
          } else if (curr_line.trim()) {
            term.writeln(`Command not found: ${curr_line}`);
          }
          term.write("\x1b[1;35m$\x1b[0m ");
          curr_line = "";
          break;
        case '\u007F': // Backspace
          if (curr_line.length > 0) {
            curr_line = curr_line.slice(0, -1);
            term.write('\b \b');
          }
          break;
        default:
          curr_line += e;
          term.write(e);
      }
    });

    xtermRef.current = term;

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#050505] p-2 overflow-hidden border-t border-white/5">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
}
