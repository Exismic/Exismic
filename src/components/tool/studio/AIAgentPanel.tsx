"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  Check, 
  Plus,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLumoraStore } from "./useLumoraStore";
import axios from "axios";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIAgentPanel() {
  const { files, activeFileId, fileContents, addFile, updateFileContent, setDiffCode, setActiveTab, openFile } = useLumoraStore();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "I'm the Lumora Studio Agent. I can write code, refactor files, and help you build entire features. How can I help?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isGenerating]);

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const activeFile = files.find(f => f.id === activeFileId);
      const context = activeFile ? `\n\n[CONTEXT: ACTIVE_FILE=${activeFile.name}]\n${fileContents[activeFileId!] || ""}\n[END_CONTEXT]` : "";

      const response = await axios.post("/api/tools/ai/chat", {
        messages: [
          { role: 'system', content: "You are the Lumora Studio AI Agent. You help users build web applications. You can suggest creating new files or editing existing ones. Always wrap code in triple backticks with the language specified. When suggesting a full file implementation, try to be concise and correct." },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: input + context }
        ]
      });

      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.data.message 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Error connecting to Groq. Please check your API key." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToActive = (code: string) => {
    if (!activeFileId) return;
    const currentContent = fileContents[activeFileId] || "";
    setDiffCode({ original: currentContent, modified: code });
    setActiveTab('diff');
  };

  const handleCreateNewFile = async (code: string) => {
    const name = prompt("Enter file name:", "Component.tsx");
    if (name) {
      const id = await addFile(name, code);
      await openFile(id);
    }
  };

  const renderMessageContent = (content: string) => {
    const codeBlockRegex = /```([\w+]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<p key={`text-${match.index}`} className="whitespace-pre-wrap">{content.substring(lastIndex, match.index)}</p>);
      }

      const lang = match[1];
      const code = match[2].trim();

      parts.push(
        <div key={`code-${match.index}`} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 group/code">
          <div className="bg-white/5 px-3 py-1.5 flex items-center justify-between border-b border-white/5">
             <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{lang || 'code'}</span>
             <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleApplyToActive(code)}
                  disabled={!activeFileId}
                  className="p-1 rounded hover:bg-accent-blue/20 text-zinc-500 hover:text-accent-blue transition-all disabled:opacity-0"
                  title="Apply to current file"
                >
                  <Zap size={12} fill="currentColor" />
                </button>
                <button 
                  onClick={() => handleCreateNewFile(code)}
                  className="p-1 rounded hover:bg-accent-purple/20 text-zinc-500 hover:text-accent-purple transition-all"
                  title="Create as new file"
                >
                  <Plus size={12} />
                </button>
             </div>
          </div>
          <pre className="p-3 text-[11px] font-mono overflow-x-auto text-zinc-300 bg-[#050505]">
            <code>{code}</code>
          </pre>
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(<p key={`text-end`} className="whitespace-pre-wrap">{content.substring(lastIndex)}</p>);
    }

    return parts;
  };

  return (
    <div className="flex flex-col bg-[#0a0a0a] border-l border-white/5 h-full relative select-none">
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", isGenerating ? "bg-accent-blue animate-pulse" : "bg-zinc-700")} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Agent Console</span>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-zinc-300"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
            <div className="flex items-center gap-2 mb-1 px-1">
              {msg.role === 'assistant' ? (
                <>
                  <div className="w-5 h-5 rounded bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
                    <Bot size={12} />
                  </div>
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Studio Agent</span>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Developer</span>
                  <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-zinc-500 border border-white/10">
                    <User size={12} />
                  </div>
                </>
              )}
            </div>
            
            {msg.role === 'user' ? (
              <div className="relative p-[1.5px] bg-gradient-to-r from-accent-blue/15 to-purple-500/15 group-hover:from-accent-blue/35 group-hover:to-purple-500/35 rounded-2xl rounded-tr-sm transition-all duration-500 max-w-[95%] shadow-md">
                <div className="relative px-4 py-3 bg-[#0c0c0e]/95 text-[13px] leading-relaxed rounded-[calc(1rem-1px)] rounded-tr-[calc(0.25rem-1px)] text-white pl-6 pr-4">
                  {/* Accent bar */}
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-r-full bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.5)] z-20" />
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ) : (
              <div className={cn(
                "max-w-[95%] px-4 py-3 rounded-2xl rounded-tl-sm text-[13px] leading-relaxed shadow-sm",
                "bg-white/[0.03] border border-white/5 text-zinc-300"
              )}>
                {renderMessageContent(msg.content)}
              </div>
            )}
          </div>
        ))}
        {isGenerating && (
          <div className="flex flex-col gap-2 items-start animate-pulse">
             <div className="w-5 h-5 rounded bg-accent-blue/10 border border-accent-blue/20" />
             <div className="w-3/4 h-8 bg-white/5 rounded-2xl" />
          </div>
        )}
      </div>

      <div className="p-4 bg-[#0a0a0a] border-t border-white/5 shrink-0">
        <div className="relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask agent to code..."
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-accent-blue/50 transition-all resize-none min-h-[80px]"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isGenerating}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-accent-blue/20 text-accent-blue flex items-center justify-center disabled:opacity-50 transition-all hover:bg-accent-blue hover:text-white"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
