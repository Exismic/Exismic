"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Folder, FolderOpen, File as FileIcon, FileCode, FileJson, 
  Plus, Save, Play, X, FolderPlus, FilePlus, RefreshCw, 
  Edit2, Trash2, Layout, Sparkles, MessageSquare, ArrowLeft,
  Bot, User, Send, Zap, ChevronDown, ChevronRight, PlayCircle,
  Eye, Laptop, Tablet, Smartphone, Terminal as TerminalIcon,
  CloudCheck, Check, Info, Lock, TerminalSquare, History as HistoryIcon
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { CATEGORY_ANIM_STYLES } from '@/lib/category-styles';

type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  language?: string;
  isOpen?: boolean; // for folders in UI
};

type Project = {
  id: string;
  name: string;
  files: string; // JSON string of FileNode[]
  createdAt: string;
  updatedAt: string;
};

type TerminalLine = {
  text: string;
  type: 'info' | 'error' | 'success' | 'input';
};

const DEFAULT_FILES: FileNode[] = [
  { id: 'root', name: 'src', type: 'folder', parentId: null, isOpen: true },
  { id: 'html1', name: 'index.html', type: 'file', parentId: 'root', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Live Preview</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6">\n  <div id="app" class="max-w-md w-full bg-slate-800/80 border border-slate-700/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center space-y-6">\n    <div class="inline-flex p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400 animate-bounce">\n      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>\n    </div>\n    <h1 class="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Hello Code Studio</h1>\n    <p class="text-slate-400 text-sm font-medium">Edit the HTML, CSS, or JS modules inside your workspace to watch this live compiled iframe update instantly.</p>\n    <button id="clickMe" class="px-6 py-3 w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 transition-all">Click Me!</button>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>' },
  { id: 'css1', name: 'styles.css', type: 'file', parentId: 'root', language: 'css', content: '/* Custom Animations */\n@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-5px); }\n}\n.animate-bounce {\n  animation: bounce 3s ease-in-out infinite;\n}' },
  { id: 'js1', name: 'script.js', type: 'file', parentId: 'root', language: 'javascript', content: '// Write Javascript interactive bindings here\ndocument.getElementById("clickMe").addEventListener("click", () => {\n  alert("Interactive Code Studio Sandbox Works!");\n});' }
];

const REACT_DASHBOARD_FILES: FileNode[] = [
  { id: 'root', name: 'src', type: 'folder', parentId: null, isOpen: true },
  { id: 'html_dash', name: 'index.html', type: 'file', parentId: 'root', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>React Premium Dashboard</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body class="bg-[#050508] text-zinc-100 min-h-screen">\n  <div id="root"></div>\n  <script type="text/babel" data-presets="react,typescript" src="App.tsx"></script>\n</body>\n</html>' },
  { id: 'css_dash', name: 'styles.css', type: 'file', parentId: 'root', language: 'css', content: '.glass-card {\n  background: rgba(13, 13, 20, 0.45);\n  backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.05);\n}\n.glow-hover:hover {\n  box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);\n  border-color: rgba(6, 182, 212, 0.3);\n}' },
  { id: 'js_dash', name: 'App.tsx', type: 'file', parentId: 'root', language: 'typescript', content: 'import React, { useState } from "react";\n\nconst DollarIcon = () => <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;\nconst UsersIcon = () => <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;\nconst SalesIcon = () => <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;\nconst TrendIcon = () => <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;\n\nfunction App() {\n  const [activeTab, setActiveTab] = useState("overview");\n  const [searchTerm, setSearchTerm] = useState("");\n  const invoices = [\n    { id: "INV-001", customer: "Sarah Jenkins", amount: "$1,250.00", status: "Paid" },\n    { id: "INV-002", customer: "David Miller", amount: "$320.50", status: "Pending" },\n    { id: "INV-003", customer: "Emma Watson", amount: "$2,450.00", status: "Paid" },\n    { id: "INV-004", customer: "James Cole", amount: "$150.00", status: "Failed" },\n    { id: "INV-005", customer: "Lucas Graham", amount: "$980.00", status: "Paid" }\n  ];\n\n  const filtered = invoices.filter(inv => inv.customer.toLowerCase().includes(searchTerm.toLowerCase()));\n\n  return (\n    <div className="flex h-screen overflow-hidden bg-[#07070c]">\n      <div className="w-64 bg-zinc-950/80 border-r border-white/5 p-6 flex flex-col gap-6">\n        <div>\n          <h2 className="text-lg font-black tracking-widest text-white uppercase italic">EXISMIC<span className="text-cyan-400">CORE</span></h2>\n          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Enterprise OS v1.0</p>\n        </div>\n        <nav className="flex-1 space-y-1">\n          {["overview", "analytics", "customers", "settings"].map(tab => (\n            <button\n              key={tab}\n              onClick={() => setActiveTab(tab)}\n              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 ${\n                activeTab === tab ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-l-2 border-cyan-400 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"\n              }`}\n            >\n              {tab}\n            </button>\n          ))}\n        </nav>\n      </div>\n      <div className="flex-1 flex flex-col overflow-y-auto p-8 space-y-8">\n        <div className="flex justify-between items-center">\n          <div>\n            <h1 className="text-2xl font-black text-white tracking-tight uppercase">System Dashboard</h1>\n            <p className="text-xs text-zinc-500 font-medium">Real-time enterprise metrics & compiler nodes.</p>\n          </div>\n        </div>\n        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">\n          {[{ label: "Total Revenue", val: "$48,259.50", change: "+12.4% MoM", icon: <DollarIcon /> },\n            { label: "Active Nodes", val: "1,249", change: "+3.2% hourly", icon: <UsersIcon /> },\n            { label: "Sales Count", val: "842", change: "+8.1% weekly", icon: <SalesIcon /> },\n            { label: "System Load", val: "2.4%", change: "Healthy status", icon: <TrendIcon /> }].map((stat, i) => (\n            <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 glow-hover transition-all space-y-3">\n              <div className="flex justify-between items-start">\n                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">{stat.label}</span>\n                {stat.icon}\n              </div>\n              <div>\n                <h3 className="text-xl font-black text-white tracking-tight">{stat.val}</h3>\n                <span className="text-[9px] font-bold text-emerald-400">{stat.change}</span>\n              </div>\n            </div>\n          ))}\n        </div>\n        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">\n          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">\n            <div>\n              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Transaction Registry</h3>\n              <p className="text-[10px] text-zinc-500">Overview of client-side reactive billing states.</p>\n            </div>\n            <input\n              type="text"\n              placeholder="Search registry..."\n              value={searchTerm}\n              onChange={(e) => setSearchTerm(e.target.value)}\n              className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-cyan-500/50 text-white w-48"\n            />\n          </div>\n          <table className="w-full text-left text-xs border-collapse">\n            <thead>\n              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-zinc-500 bg-white/[0.01]">\n                <th className="p-4">Invoice ID</th>\n                <th className="p-4">Customer</th>\n                <th className="p-4">Amount</th>\n                <th className="p-4">Status</th>\n              </tr>\n            </thead>\n            <tbody>\n              {filtered.map((inv, idx) => (\n                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">\n                  <td className="p-4 font-mono text-cyan-400">{inv.id}</td>\n                  <td className="p-4 font-bold text-white">{inv.customer}</td>\n                  <td className="p-4 font-medium text-zinc-300">{inv.amount}</td>\n                  <td className="p-4">\n                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${\n                      inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"\n                    }`}>{inv.status}</span>\n                  </td>\n                </tr>\n              ))}\n            </tbody>\n          </table>\n        </div>\n      </div>\n    </div>\n  );\n}\n\nconst root = ReactDOM.createRoot(document.getElementById(\"root\"));\nroot.render(<App />);' }
];

const SAAS_LANDING_FILES: FileNode[] = [
  { id: 'root', name: 'src', type: 'folder', parentId: null, isOpen: true },
  { id: 'html_saas', name: 'index.html', type: 'file', parentId: 'root', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Exismic Ai - SaaS Landing Page</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body class="bg-[#050509] text-zinc-100 min-h-screen">\n  <div id="root"></div>\n  <script type="text/babel" data-presets="react,typescript" src="App.tsx"></script>\n</body>\n</html>' },
  { id: 'css_saas', name: 'styles.css', type: 'file', parentId: 'root', language: 'css', content: 'body { font-family: sans-serif; }' },
  { id: 'js_saas', name: 'App.tsx', type: 'file', parentId: 'root', language: 'typescript', content: 'import React, { useState } from "react";\n\nfunction App() {\n  const [billing, setBilling] = useState("monthly");\n\n  return (\n    <div className="min-h-screen flex flex-col bg-[#050509] text-zinc-100">\n      <header className="sticky top-0 z-50 bg-[#050509]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">\n        <span className="text-xl font-black uppercase tracking-widest text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">EXISMIC.AI</span>\n        <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg transition-all">Start Free</button>\n      </header>\n      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6 flex-1 flex flex-col items-center justify-center">\n        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-tight">Supercharge workflows with <span className="text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text">AI Agent Autopilot</span></h1>\n        <p className="text-sm text-zinc-400 max-w-xl">Deploy premium sandboxes, build codebases in seconds, and synchronize Supabase databases without writing standard boilerplates.</p>\n        <div className="flex gap-4">\n          <button className="px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl">Get Started</button>\n        </div>\n      </section>\n      <section className="max-w-4xl mx-auto py-12 text-center space-y-6">\n        <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">Simple Transparent Pricing</h2>\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">\n          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 space-y-4">\n            <h4 className="text-xs font-black uppercase text-zinc-500">Developer Starter</h4>\n            <div className="text-3xl font-black text-white">$0</div>\n            <button className="w-full py-3 bg-white/5 border border-white/10 text-white font-black text-xs uppercase rounded-xl">Get Started</button>\n          </div>\n          <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/30 space-y-4">\n            <h4 className="text-xs font-black uppercase text-purple-400 font-black">Exismic Pro</h4>\n            <div className="text-3xl font-black text-white">{billing === "monthly" ? "$29" : "$23"}</div>\n            <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-xs uppercase rounded-xl">Upgrade Pro</button>\n          </div>\n        </div>\n      </section>\n    </div>\n  );\n}\n\nconst root = ReactDOM.createRoot(document.getElementById(\"root\"));\nroot.render(<App />);' }
];

const PORTFOLIO_FILES: FileNode[] = [
  { id: 'root', name: 'src', type: 'folder', parentId: null, isOpen: true },
  { id: 'html_port', name: 'index.html', type: 'file', parentId: 'root', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Developer Portfolio Sandbox</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n</head>\n<body class="bg-[#030303] text-zinc-200 min-h-screen">\n  <div id="root"></div>\n  <script type="text/babel" data-presets="react,typescript" src="App.tsx"></script>\n</body>\n</html>' },
  { id: 'js_port', name: 'App.tsx', type: 'file', parentId: 'root', language: 'typescript', content: 'import React, { useState } from "react";\n\nfunction App() {\n  const [filter, setFilter] = useState("all");\n  const projects = [\n    { title: "Exismic Agent IDE", category: "ai", desc: "Interactive sandbox compiler with LLM direct-writing.", tech: ["React", "Babel"] },\n    { title: "Flux Art Engine", category: "ai", desc: "Outbound self-healing Flux Schnell image generator.", tech: ["Next.js", "API"] },\n    { title: "Razorpay Checkout Portal", category: "web", desc: "Premium billing subscriptions integrated with Supabase.", tech: ["Postgres", "React"] }\n  ];\n\n  const filtered = filter === "all" ? projects : projects.filter(p => p.category === filter);\n\n  return (\n    <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">\n      <section className="space-y-4 py-8">\n        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">Hey, I\'m <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">Alex Rivera</span></h1>\n        <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">Full stack AI engineer specializing in building high-end interactive sandboxes, micro-compilers, and custom automation interfaces.</p>\n      </section>\n      <section className="space-y-6">\n        <div className="flex justify-between items-center border-b border-white/5 pb-4">\n          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Selected Work</h2>\n          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 text-[9px] font-black uppercase">\n            {["all", "ai", "web"].map(cat => (\n              <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-md transition-all ${filter === cat ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>{cat}</button>\n            ))}\n          </div>\n        </div>\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n          {filtered.map((proj, idx) => (\n            <div key={idx} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-cyan-500/25 transition-all space-y-4">\n              <h3 className="text-sm font-bold text-white uppercase">{proj.title}</h3>\n              <p className="text-xs text-zinc-500 font-medium">{proj.desc}</p>\n              <div className="flex gap-1.5">{proj.tech.map((t, i) => (<span key={i} className="px-2 py-0.5 bg-cyan-500/5 text-cyan-400 text-[8px] font-black uppercase rounded border border-cyan-500/10">{t}</span>))}</div>\n            </div>\n          ))}\n        </div>\n      </section>\n    </div>\n  );\n}\n\nconst root = ReactDOM.createRoot(document.getElementById(\"root\"));\nroot.render(<App />);' }
];

const TODO_BOARD_FILES: FileNode[] = [
  { id: 'root', name: 'src', type: 'folder', parentId: null, isOpen: true },
  { id: 'html_todo', name: 'index.html', type: 'file', parentId: 'root', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Todo Board Workspace</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n</head>\n<body class="bg-[#040407] text-zinc-200 min-h-screen">\n  <div id="root"></div>\n  <script type="text/babel" data-presets="react,typescript" src="App.tsx"></script>\n</body>\n</html>' },
  { id: 'js_todo', name: 'App.tsx', type: 'file', parentId: 'root', language: 'typescript', content: 'import React, { useState } from "react";\n\nfunction App() {\n  const [todos, setTodos] = useState([\n    { id: 1, text: "Build Exismic Code Studio templates", completed: true },\n    { id: 2, text: "Configure project chat history", completed: false }\n  ]);\n  const [inputVal, setInputVal] = useState("");\n\n  const handleAdd = (e) => {\n    e.preventDefault();\n    if (!inputVal.trim()) return;\n    setTodos([...todos, { id: Date.now(), text: inputVal.trim(), completed: false }]);\n    setInputVal("");\n  };\n\n  return (\n    <div className="max-w-md mx-auto px-6 py-12 space-y-6">\n      <h1 className="text-2xl font-black uppercase text-white italic">Todo Board</h1>\n      <form onSubmit={handleAdd} className="flex gap-2">\n        <input type="text" placeholder="Add new task..." value={inputVal} onChange={e => setInputVal(e.target.value)} className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500/50 text-white" />\n        <button type="submit" className="px-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-xs uppercase rounded-xl">Add</button>\n      </form>\n      <div className="space-y-2">\n        {todos.map(todo => (\n          <div key={todo.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">\n            <span className={`text-xs ${todo.completed ? "line-through text-zinc-650" : "text-zinc-250"}`}>{todo.text}</span>\n            <button onClick={() => setTodos(todos.filter(t => t.id !== todo.id))} className="text-zinc-500 hover:text-red-400 text-xs">Delete</button>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}\n\nconst root = ReactDOM.createRoot(document.getElementById(\"root\"));\nroot.render(<App />);' }
];

const NEXTJS_APP_FILES: FileNode[] = [
  { id: 'root', name: 'src', type: 'folder', parentId: null, isOpen: true },
  { id: 'html_next', name: 'index.html', type: 'file', parentId: 'root', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Next.js Simulation Environment</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n</head>\n<body class="bg-zinc-950 text-zinc-100 min-h-screen">\n  <div id="root"></div>\n  <script type="text/babel" data-presets="react,typescript" src="src/components/Navigation.tsx"></script>\n  <script type="text/babel" data-presets="react,typescript" src="src/app/page.tsx"></script>\n  <script type="text/babel" data-presets="react,typescript">\n    import React from "react";\n    import Page from "src/app/page.tsx";\n    import { Navigation } from "src/components/Navigation.tsx";\n    function AppSimulation() {\n      return (\n        <div className="flex h-screen overflow-hidden bg-black">\n          <div className="flex-1 flex flex-col min-w-0">\n            <div className="h-10 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-6">\n              <span className="text-[10px] font-black uppercase text-zinc-400">Next.js Dev Server (Active)</span>\n              <span className="text-[9px] font-mono text-zinc-650">localhost:3000/dashboard</span>\n            </div>\n            <div className="flex-1 flex overflow-hidden">\n              <Navigation />\n              <div className="flex-1 overflow-y-auto p-8 bg-zinc-950"><Page /></div>\n            </div>\n          </div>\n        </div>\n      );\n    }\n    const root = ReactDOM.createRoot(document.getElementById("root"));\n    root.render(<AppSimulation />);\n  </script>\n</body>\n</html>' },
  { id: 'next_page', name: 'src/app/page.tsx', type: 'file', parentId: 'root', language: 'typescript', content: 'import React from "react";\nexport default function Page() {\n  return (\n    <div className="space-y-6">\n      <h1 className="text-2xl font-black text-white uppercase">Next.js App Router</h1>\n      <p className="text-xs text-zinc-500">Rendered dynamically via NextJS App Router simulation environment.</p>\n      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n        <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">\n          <h2 className="text-xs font-black uppercase text-purple-400">src/app/layout.tsx</h2>\n          <p className="text-xs text-zinc-400">Root Layout houses global context providers.</p>\n        </div>\n        <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">\n          <h2 className="text-xs font-black uppercase text-cyan-400">src/app/page.tsx</h2>\n          <p className="text-xs text-zinc-400">Page component entry loaded in sandbox Compiler.</p>\n        </div>\n      </div>\n    </div>\n  );\n}' },
  { id: 'next_nav', name: 'src/components/Navigation.tsx', type: 'file', parentId: 'root', language: 'typescript', content: 'import React from "react";\nexport function Navigation() {\n  return (\n    <div className="w-56 bg-zinc-950 border-r border-white/5 p-4 flex flex-col gap-6 shrink-0">\n      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">App Router</span>\n      <div className="space-y-1">\n        <div className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-white">Dashboard</div>\n        <div className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-300">Settings</div>\n      </div>\n    </div>\n  );\n}' }
];

export default function FullyFunctionalCodeStudio() {
  const isGold = true;
  const animStyle = CATEGORY_ANIM_STYLES['ai'];

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 pt-24">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-[#0b0c12] p-10 sm:p-16 lg:p-24 flex flex-col items-center justify-center text-center shadow-2xl group max-w-4xl w-full">
        <div className={cn("absolute inset-0 blur-[100px] opacity-40 animate-pulse transition-all duration-1000", isGold ? "bg-amber-500/20" : animStyle.aura)} />
        <div className={cn("absolute inset-[-50%] animate-[spin_8s_linear_infinite] opacity-30", isGold ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.3)_25%,transparent_50%)]" : animStyle.spinIdle)} />
        <div className="absolute inset-0 bg-[#0b0c12]/80 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite]" />

        <div className="relative z-10 flex flex-col items-center max-w-2xl space-y-10">
          <div className="flex size-24 sm:size-32 items-center justify-center rounded-[2.5rem] bg-[#0b0c12] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
            <div className={cn("absolute inset-0 blur-xl animate-pulse", isGold ? "bg-amber-500/30" : animStyle.aura)} />
            <div className={cn("absolute inset-[-100%] animate-[spin_3s_linear_infinite]", isGold ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.6)_25%,transparent_50%)]" : animStyle.spinHover)} />
            <div className="absolute inset-[2px] rounded-[calc(2.5rem-2px)] bg-[#0b0c12] flex items-center justify-center z-10">
              <TerminalSquare size={56} className={cn("relative z-20 transition-all duration-500", isGold ? "text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" : animStyle.iconGlow)} />
            </div>
          </div>

          <div className="space-y-6 flex flex-col items-center">
            <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-opacity-10 backdrop-blur-md shadow-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]", isGold ? "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : animStyle.badge)}>
              <Sparkles size={14} className={isGold ? "text-amber-400" : "opacity-80"} />
              In Development
            </div>
            <h2 className={cn("text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]", isGold ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]" : animStyle.textGrad)}>
              Exismic Code Studio
            </h2>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-zinc-400 px-4">
              We are currently engineering the high-performance AI Sandbox for this tool. It will be available to you very soon.
            </p>
          </div>

          <div className="pt-6 w-full sm:w-auto">
            <Link href="/tools" className={cn("relative overflow-hidden flex min-h-14 items-center justify-center rounded-2xl px-12 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border", isGold ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] border-amber-300/50" : animStyle.buttonGrad)}>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
              <span className="relative z-10 flex items-center gap-3">Explore Live Tools <Play size={14} className="fill-current" /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  
  // Workspace UI States
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isTerminalOpen, setTerminalOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'agent'>('agent'); // Default to agent on blank slates
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Project Workspace States
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  
  // Modals & Loaders
  const [isProjectDashboardOpen, setIsProjectDashboardOpen] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  
  // Terminal Custom Log States
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { text: "▲ Exismic Studio Compiler [v1.2.0]", type: 'info' },
    { text: "IndexedDB Local File Cache Sync initialized.", type: 'success' },
    { text: "Ready for dev server command input (run, clear, ls, help, git status)", type: 'info' }
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // AI Coding Agent States
  type ProjectChatSession = {
    id: string;
    title: string;
    messages: any[];
    createdAt: string;
  };
  const [projectSessions, setProjectSessions] = useState<ProjectChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const agentScrollRef = useRef<HTMLDivElement>(null);
  
  // Global Toast Msg
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toast = {
    success: (text: string) => showToast(text, 'success'),
    error: (text: string) => showToast(text, 'error')
  };

  // Fullscreen override mounting hooks
  useEffect(() => {
    document.documentElement.classList.add("code-studio-active");
    return () => {
      document.documentElement.classList.remove("code-studio-active");
    };
  }, []);

  // Sync Auth Sessions
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load Projects from DB
  const fetchProjects = async () => {
    if (!session) return;
    setLoadingProjects(true);
    try {
      const res = await axios.get('/api/code-projects');
      setProjects(res.data);
    } catch (e) {
      console.error("Failed to fetch projects:", e);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  // Update Live Preview Sandbox when files edit
  useEffect(() => {
    if (files.length > 0) {
      compilePreview();
    } else {
      setPreviewSrc(`<div style="color: #666; background: #07070a; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; p: 20px;"><div><h3>Workspace is empty</h3><p style="font-size: 12px; color: #444;">Command the AI Coding Agent on the right panel to automatically build your file structure!</p></div></div>`);
    }
  }, [files]);

  // Terminal scroll handler
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // AI Agent message panel scroll handler
  useEffect(() => {
    if (agentScrollRef.current) {
      agentScrollRef.current.scrollTop = agentScrollRef.current.scrollHeight;
    }
  }, [messages, isAiGenerating]);

  // Debounced auto-save hook to Supabase Postgres (5 seconds)
  useEffect(() => {
    if (!currentProjectId || !session || files.length === 0) return;
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await axios.put(`/api/code-projects/${currentProjectId}`, {
          name: projectName,
          files: JSON.stringify(files)
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error("Auto-save sync failed:", err);
        setSaveStatus('error');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [files, projectName, currentProjectId, session]);

  // --- Virtual File Chat History Synchronization ---
  const saveChatSessionsToFilesInline = (updatedSessions: ProjectChatSession[], currentFiles: FileNode[]): FileNode[] => {
    let nextFiles = [...currentFiles];
    let folderNode = nextFiles.find(f => f.name === '.exismic' && f.type === 'folder');
    if (!folderNode) {
      folderNode = {
        id: 'hidden_exismic_folder',
        name: '.exismic',
        type: 'folder',
        parentId: null,
        isOpen: false
      };
      nextFiles.push(folderNode);
    }
    
    let historyFile = nextFiles.find(f => f.name === 'chat_history.json' && f.parentId === 'hidden_exismic_folder');
    const contentString = JSON.stringify(updatedSessions);
    
    if (historyFile) {
      historyFile.content = contentString;
    } else {
      historyFile = {
        id: 'hidden_chat_history_file',
        name: 'chat_history.json',
        type: 'file',
        parentId: 'hidden_exismic_folder',
        language: 'json',
        content: contentString
      };
      nextFiles.push(historyFile);
    }
    
    return nextFiles;
  };

  const saveChatSessionsToFiles = (updatedSessions: ProjectChatSession[], currentFiles: FileNode[]) => {
    const nextFiles = saveChatSessionsToFilesInline(updatedSessions, currentFiles);
    setFiles(nextFiles);
  };

  const loadChatSessions = (projectFiles: FileNode[]) => {
    const historyFile = projectFiles.find(f => f.name === 'chat_history.json' && f.parentId === 'hidden_exismic_folder');
    if (historyFile && historyFile.content) {
      try {
        const parsed = JSON.parse(historyFile.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjectSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
          return;
        }
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    }

    // Default starting session if none exists
    const defaultSessionId = Math.random().toString(36).substring(2, 11);
    const defaultSession: ProjectChatSession = {
      id: defaultSessionId,
      title: "New Chat",
      messages: [
        { role: 'assistant', content: "Hello! Welcome to Exismic Code Studio. I'm your AI Coding Agent. What would you like to build today? You can type your request in the chat box below (e.g., 'Build a coffee shop site' or 'Create a memory match game'), and I will automatically generate the exact files and folder structure in your workspace!" }
      ],
      createdAt: new Date().toISOString()
    };
    setProjectSessions([defaultSession]);
    setActiveSessionId(defaultSessionId);
    setMessages(defaultSession.messages);
  };

  // --- Session Navigation Methods ---
  const handleCreateNewChatSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 11);
    const newSession: ProjectChatSession = {
      id: newSessionId,
      title: "New Chat",
      messages: [
        { role: 'assistant', content: "Hello! Welcome to a new chat in Exismic Code Studio. I'm your AI Coding Agent. What would you like to build in this session?" }
      ],
      createdAt: new Date().toISOString()
    };
    const nextSessions = [newSession, ...projectSessions];
    setProjectSessions(nextSessions);
    setActiveSessionId(newSessionId);
    setMessages(newSession.messages);
    saveChatSessionsToFiles(nextSessions, files);
    toast.success("Started new chat session");
  };

  const handleDeleteChatSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projectSessions.length <= 1) {
      toast.error("You must keep at least one chat session.");
      return;
    }
    const nextSessions = projectSessions.filter(s => s.id !== sessionId);
    setProjectSessions(nextSessions);
    
    if (activeSessionId === sessionId) {
      const fallback = nextSessions[0];
      setActiveSessionId(fallback.id);
      setMessages(fallback.messages);
    }
    saveChatSessionsToFiles(nextSessions, files);
    toast.success("Chat session deleted");
  };

  const handleSwitchSession = (sessionId: string) => {
    const target = projectSessions.find(s => s.id === sessionId);
    if (target) {
      setActiveSessionId(sessionId);
      setMessages(target.messages);
      toast.success(`Switched to: ${target.title}`);
    }
  };

  // Trigger manual compile + inline bundler
  const compilePreview = () => {
    // 1. Detect index.html
    const htmlFile = files.find(f => f.name.toLowerCase() === 'index.html' && f.type === 'file');
    if (!htmlFile) {
      setPreviewSrc(`<div style="color: #fff; background: #000; min-height: 100vh; padding: 20px; font-family: monospace;"><h3>No index.html file detected in workspace root.</h3>Please create an index.html file to initialize the Live Preview framework.</div>`);
      return;
    }

    let compiledHtml = htmlFile.content || '';

    // 2. Inline Styles (.css files)
    const cssFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.css'));
    let cssBlock = '';
    cssFiles.forEach(f => {
      cssBlock += `\n/* --- CSS: ${f.name} --- */\n${f.content}\n`;
    });

    if (cssBlock) {
      compiledHtml = compiledHtml.replace(
        /<\/head>/i,
        `<style>${cssBlock}</style>\n</head>`
      );
    }

    // 3. Inline Script tags (.js or .tsx)
    const scriptFiles = files.filter(f => f.type === 'file' && (f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx') || f.name.endsWith('.jsx')));
    
    let scriptsToInject = '';
    scriptFiles.forEach(f => {
      const isBabel = f.name.endsWith('.jsx') || f.name.endsWith('.tsx') || f.name.endsWith('.ts');
      if (isBabel) {
        scriptsToInject += `\n<script type="text/babel" data-presets="react,typescript">\n// --- React: ${f.name} ---\n${f.content}\n</script>\n`;
      } else {
        scriptsToInject += `\n<script type="text/javascript">\n// --- Script: ${f.name} ---\n${f.content}\n</script>\n`;
      }
    });

    if (scriptsToInject) {
      compiledHtml = compiledHtml.replace(
        /<\/body>/i,
        `${scriptsToInject}\n</body>`
      );
    }

    setPreviewSrc(compiledHtml);
  };

  // Helper to dynamically build folder nodes recursively along a slash path and insert the file at the leaf.
  const resolvePathAndCreateFile = (filePath: string, content: string, currentFiles: FileNode[]): FileNode[] => {
    const parts = filePath.split("/").map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return currentFiles;

    let newFiles = [...currentFiles];
    let currentParentId: string | null = null;

    // Process all directories leading up to the file
    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i];
      // Find if this directory already exists under the currentParentId
      let dirNode = newFiles.find(f => f.name === dirName && f.type === 'folder' && f.parentId === currentParentId);
      if (!dirNode) {
        const newId = Math.random().toString(36).substring(2, 11);
        dirNode = {
          id: newId,
          name: dirName,
          type: 'folder',
          parentId: currentParentId,
          isOpen: true
        };
        newFiles.push(dirNode);
      }
      currentParentId = dirNode.id;
    }

    // Create or update the actual file
    const fileName = parts[parts.length - 1];
    const ext = fileName.split('.').pop() || 'txt';
    const lang = ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext === 'tsx' ? 'typescript' : ext === 'css' ? 'css' : ext === 'json' ? 'json' : 'html';

    let fileNode = newFiles.find(f => f.name === fileName && f.type === 'file' && f.parentId === currentParentId);
    if (fileNode) {
      fileNode.content = content;
    } else {
      const newId = Math.random().toString(36).substring(2, 11);
      fileNode = {
        id: newId,
        name: fileName,
        type: 'file',
        parentId: currentParentId,
        language: lang,
        content: content
      };
      newFiles.push(fileNode);
    }

    return newFiles;
  };

  // --- Workspace Seeding via AI ---
  const handleGenerateProjectWithAi = async (description: string, name: string) => {
    if (!description.trim()) return;
    setIsGeneratingProject(true);
    try {
      const systemPrompt = `You are a professional workspace bootstrapper.
The user wants to create a project named "${name}" with this description: "${description}".
Generate the starting file structure.
You MUST write the files using the following format:

[CREATE_FILE: path/filename.ext]
\`\`\`language
code contents here
\`\`\`

You can create multiple files. Ensure you create a complete project with at least:
- index.html (configured with Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>)
- styles.css (for any animations/styling)
- App.tsx or script.js (for interactivity or React rendering)

Ensure the code is complete, beautiful, modern, dark themed, and fully functional. Do not output conversational text outside of the file blocks.`;

      const response = await axios.post("/api/tools/ai/chat", {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Bootstrap a workspace named "${name}" for: ${description}` }
        ]
      });

      const responseText = response.data.message;
      let generatedFiles: FileNode[] = [];
      const fileRegex = /\[CREATE_FILE:\s*([^\s\]]+)\][\s\r\n]*```[\w]*[\r\n]+([\s\S]*?)```/g;
      let match;
      let count = 0;

      while ((match = fileRegex.exec(responseText)) !== null) {
        const filePath = match[1];
        const codeContent = match[2];
        generatedFiles = resolvePathAndCreateFile(filePath, codeContent, generatedFiles);
        count++;
      }

      if (count > 0) {
        setProjectName(name);
        
        // Initialize chat history with welcome message
        const defaultSessionId = Math.random().toString(36).substring(2, 11);
        const welcomeSession: ProjectChatSession = {
          id: defaultSessionId,
          title: "Initial Scaffold",
          messages: [
            { role: 'assistant', content: `Hello! I have generated a completely custom workspace for "${name}" based on your request: "${description}".\n\nI created ${count} files. What would you like to build next?` },
            { role: 'user', content: `Bootstrap a workspace for: ${description}` },
            { role: 'assistant', content: responseText }
          ],
          createdAt: new Date().toISOString()
        };

        const nextFiles = saveChatSessionsToFilesInline([welcomeSession], generatedFiles);
        setFiles(nextFiles);
        setProjectSessions([welcomeSession]);
        setActiveSessionId(defaultSessionId);
        setMessages(welcomeSession.messages);

        // If logged in, save to Supabase
        if (session) {
          setSaveStatus('saving');
          try {
            const res = await axios.post('/api/code-projects', {
              name: name,
              files: JSON.stringify(nextFiles)
            });
            setCurrentProjectId(res.data.id);
            setSaveStatus('saved');
            fetchProjects();
          } catch (err) {
            console.error(err);
            setSaveStatus('error');
          }
        } else {
          setCurrentProjectId(null);
          setSaveStatus('idle');
        }

        // Open first file in tabs
        const first = nextFiles.find(f => f.type === 'file' && !f.name.startsWith('.'))?.id || null;
        if (first) {
          setOpenFileIds([first]);
          setActiveFileId(first);
          setRightPanelTab('preview');
        } else {
          setOpenFileIds([]);
          setActiveFileId(null);
          setRightPanelTab('agent');
        }

        setIsProjectDashboardOpen(false);
        toast.success(`AI generated ${count} files directly in explorer!`);
      } else {
        toast.error("AI did not generate any files in the expected format. Please try again with a more detailed description.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate project using AI.");
    } finally {
      setIsGeneratingProject(false);
    }
  };

  // --- Project Management Actions ---
  const handleCreateNewProject = async (name: string, template: 'html' | 'react-dashboard' | 'saas-landing' | 'nextjs-app' | 'portfolio' | 'todo-board' | 'blank' = 'blank') => {
    let projectFiles: FileNode[] = [];
    if (template === 'html') projectFiles = DEFAULT_FILES;
    else if (template === 'react-dashboard') projectFiles = REACT_DASHBOARD_FILES;
    else if (template === 'saas-landing') projectFiles = SAAS_LANDING_FILES;
    else if (template === 'nextjs-app') projectFiles = NEXTJS_APP_FILES;
    else if (template === 'portfolio') projectFiles = PORTFOLIO_FILES;
    else if (template === 'todo-board') projectFiles = TODO_BOARD_FILES;

    setProjectName(name);

    // Initialize chat sessions
    const defaultSessionId = Math.random().toString(36).substring(2, 11);
    const welcomeSession: ProjectChatSession = {
      id: defaultSessionId,
      title: "New Chat",
      messages: [
        { 
          role: 'assistant', 
          content: template === 'blank' 
            ? `Hello! I have created a completely empty workspace for "${name}". What would you like to build? Just type what files or app you want to create in the chat box below, and I'll generate and sync them automatically!`
            : `Hello! Welcome to your new project: "${name}". I've seeded the workspace with the ${template} template. How can I help you customize or expand this project?` 
        }
      ],
      createdAt: new Date().toISOString()
    };

    const nextFiles = saveChatSessionsToFilesInline([welcomeSession], projectFiles);
    setFiles(nextFiles);
    setProjectSessions([welcomeSession]);
    setActiveSessionId(defaultSessionId);
    setMessages(welcomeSession.messages);

    // If logged in, create row in Supabase
    if (session) {
      setSaveStatus('saving');
      try {
        const res = await axios.post('/api/code-projects', {
          name: name,
          files: JSON.stringify(nextFiles)
        });
        setCurrentProjectId(res.data.id);
        setSaveStatus('saved');
        fetchProjects();
      } catch (err) {
        console.error("Failed to initialize remote project:", err);
        setSaveStatus('error');
      }
    } else {
      // Local caching mode
      setCurrentProjectId(null);
      setSaveStatus('idle');
    }

    // Open first file in tabs if available
    const defaultActive = nextFiles.find(f => f.type === 'file' && !f.name.startsWith('.'))?.id || null;
    if (defaultActive) {
      setOpenFileIds([defaultActive]);
      setActiveFileId(defaultActive);
      setRightPanelTab('preview');
    } else {
      setOpenFileIds([]);
      setActiveFileId(null);
      setRightPanelTab('agent');
    }

    setIsProjectDashboardOpen(false);
    toast.success(`${name} loaded successfully.`);
  };

  const handleOpenRemoteProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setProjectName(project.name);
    try {
      const parsed = JSON.parse(project.files) as FileNode[];
      setFiles(parsed);
      
      // Load chat sessions from files!
      loadChatSessions(parsed);
      
      const first = parsed.find(f => f.type === 'file' && !f.name.startsWith('.'))?.id || null;
      if (first) {
        setOpenFileIds([first]);
        setActiveFileId(first);
        setRightPanelTab('preview');
      } else {
        setOpenFileIds([]);
        setActiveFileId(null);
        setRightPanelTab('agent');
      }
      setIsProjectDashboardOpen(false);
      setSaveStatus('saved');
      toast.success(`Loaded project: ${project.name}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to parse project files.");
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this project?")) return;
    try {
      await axios.delete(`/api/code-projects/${id}`);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (e) {
      toast.error("Failed to delete project");
    }
  };

  const handleManualSave = async () => {
    if (!session) {
      toast.error("Sign in to save project variables into Supabase");
      return;
    }
    setSaveStatus('saving');
    try {
      if (currentProjectId) {
        await axios.put(`/api/code-projects/${currentProjectId}`, {
          name: projectName,
          files: JSON.stringify(files)
        });
        setSaveStatus('saved');
        toast.success("All file updates synchronized with Supabase!");
      } else {
        const res = await axios.post('/api/code-projects', {
          name: projectName,
          files: JSON.stringify(files)
        });
        setCurrentProjectId(res.data.id);
        setSaveStatus('saved');
        fetchProjects();
        toast.success("New project row created in Supabase database!");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      toast.error("Cloud saving failed.");
    }
  };

  // --- File Explorer Management Actions ---
  const handleAddFile = (parentId: string | null = null) => {
    const name = prompt("Enter file name (e.g. index.html, App.tsx):");
    if (!name) return;
    const ext = name.split('.').pop() || 'txt';
    const lang = ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext === 'tsx' ? 'typescript' : ext === 'css' ? 'css' : ext === 'json' ? 'json' : 'html';

    const newFile: FileNode = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      type: 'file',
      parentId,
      language: lang,
      content: `// Code Studio: ${name}\n`
    };

    setFiles(prev => [...prev, newFile]);
    openTab(newFile.id);
  };

  const handleAddFolder = (parentId: string | null = null) => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    const newFolder: FileNode = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      type: 'folder',
      parentId,
      isOpen: true
    };

    setFiles(prev => [...prev, newFolder]);
  };

  const handleRenameNode = (id: string) => {
    const node = files.find(f => f.id === id);
    if (!node) return;
    const newName = prompt(`Rename ${node.name} to:`, node.name);
    if (!newName || newName === node.name) return;

    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const ext = newName.split('.').pop() || 'txt';
        const lang = ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext === 'tsx' ? 'typescript' : ext === 'css' ? 'css' : ext === 'json' ? 'json' : 'html';
        return { ...f, name: newName, language: f.type === 'file' ? lang : undefined };
      }
      return f;
    }));
  };

  const handleDeleteNode = (id: string) => {
    if (!confirm("Delete node and all its child directories?")) return;

    const gatherIds = (nodeId: string, list: FileNode[]): string[] => {
      const ids = [nodeId];
      list.filter(f => f.parentId === nodeId).forEach(child => {
        ids.push(...gatherIds(child.id, list));
      });
      return ids;
    };

    const idsToRemove = gatherIds(id, files);
    setFiles(prev => prev.filter(f => !idsToRemove.includes(f.id)));
    
    // Close active tabs if removed
    const nextOpenFileIds = openFileIds.filter(fid => !idsToRemove.includes(fid));
    setOpenFileIds(nextOpenFileIds);
    if (activeFileId && idsToRemove.includes(activeFileId)) {
      setActiveFileId(nextOpenFileIds.length > 0 ? nextOpenFileIds[nextOpenFileIds.length - 1] : null);
    }
  };

  const toggleFolder = (folderId: string) => {
    setFiles(prev => prev.map(f => f.id === folderId ? { ...f, isOpen: !f.isOpen } : f));
  };

  const openTab = (id: string) => {
    setOpenFileIds(prev => Array.from(new Set([...prev, id])));
    setActiveFileId(id);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const nextOpen = openFileIds.filter(fid => fid !== id);
    setOpenFileIds(nextOpen);
    if (activeFileId === id) {
      setActiveFileId(nextOpen.length > 0 ? nextOpen[nextOpen.length - 1] : null);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-500/80 shrink-0" />;
    if (name.endsWith('.css')) return <FileCode size={14} className="text-blue-400/80 shrink-0" />;
    if (name.endsWith('.html')) return <FileCode size={14} className="text-orange-500/80 shrink-0" />;
    if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.js')) {
      return <FileCode size={14} className="text-cyan-400/80 shrink-0" />;
    }
    return <FileIcon size={14} className="text-zinc-500 shrink-0" />;
  };

  const getFileLanguage = (name: string) => {
    const ext = name.split('.').pop() || '';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'css') return 'css';
    if (ext === 'html') return 'html';
    if (ext === 'json') return 'json';
    return 'plaintext';
  };

  // Render Recursive File tree explorer
  const renderExplorerTree = (parentId: string | null = null, level = 0) => {
    const nodes = files.filter(f => f.parentId === parentId);
    
    // Sort Folders first, then files alphabetically
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const filteredNodes = nodes.filter(n => 
      !n.name.startsWith('.') && 
      n.id !== 'hidden_exismic_folder' && 
      n.id !== 'hidden_chat_history_file' &&
      n.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredNodes.map(node => {
      const isFolder = node.type === 'folder';
      const isOpen = node.isOpen;
      const isActive = activeFileId === node.id;

      return (
        <div key={node.id} className="select-none">
          <div 
            onClick={() => {
              if (isFolder) toggleFolder(node.id);
              else openTab(node.id);
            }}
            className={cn(
              "flex items-center justify-between group px-3 py-1.5 cursor-pointer border-l-2 transition-all text-xs",
              isActive 
                ? "bg-accent-blue/10 border-accent-blue text-white font-medium" 
                : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            )}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            <div className="flex items-center gap-2 truncate">
              {isFolder ? (
                isOpen ? <FolderOpen size={14} className="text-accent-blue/80 shrink-0" /> : <Folder size={14} className="text-accent-blue/80 shrink-0" />
              ) : (
                getFileIcon(node.name)
              )}
              <span className="truncate">{node.name}</span>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 shrink-0">
              {isFolder && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddFile(node.id); }} 
                    className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                    title="New File"
                  >
                    <FilePlus size={11} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddFolder(node.id); }} 
                    className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                    title="New Folder"
                  >
                    <FolderPlus size={11} />
                  </button>
                </>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); handleRenameNode(node.id); }} 
                className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                title="Rename"
              >
                <Edit2 size={11} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }} 
                className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
          {isFolder && isOpen && renderExplorerTree(node.id, level + 1)}
        </div>
      );
    });
  };

  const activeFile = files.find(f => f.id === activeFileId);
  const editorContent = activeFile?.content || '';

  const handleEditorChange = (val: string | undefined) => {
    if (activeFileId && val !== undefined) {
      setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: val } : f));
    }
  };

  // --- Terminal Command Runner ---
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const args = cmd.split(" ");
    const primary = args[0].toLowerCase();
    
    const lines: TerminalLine[] = [
      ...terminalHistory,
      { text: `➜ project ${cmd}`, type: 'input' }
    ];

    if (primary === 'help') {
      lines.push(
        { text: "Available commands:", type: 'info' },
        { text: "  run          Compile all workspace files and update Live Preview", type: 'info' },
        { text: "  ls           List all file nodes in project virtual root", type: 'info' },
        { text: "  cat [file]   Print content of a specific file inside console", type: 'info' },
        { text: "  clear        Reset terminal console log", type: 'info' },
        { text: "  git status   Check dynamic repo status", type: 'info' },
        { text: "  agent-status Check connection status of Groq AI engine", type: 'info' }
      );
    } else if (primary === 'clear') {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else if (primary === 'run') {
      compilePreview();
      lines.push({ text: "Compiling HTML modules... Inline script and style bundler run successfully.", type: 'success' });
    } else if (primary === 'ls') {
      files.forEach(f => {
        lines.push({ text: `  ${f.type === 'folder' ? '📁' : '📄'} ${f.name} (id: ${f.id})`, type: 'info' });
      });
    } else if (primary === 'cat') {
      const fName = args[1];
      const target = files.find(f => f.name.toLowerCase() === fName?.toLowerCase() && f.type === 'file');
      if (target) {
        lines.push({ text: target.content || "Empty file", type: 'info' });
      } else {
        lines.push({ text: `File not found: ${fName || ''}`, type: 'error' });
      }
    } else if (primary === 'git' && args[1] === 'status') {
      lines.push(
        { text: "On branch main", type: 'info' },
        { text: "Your branch is up to date with 'origin/main'.", type: 'info' },
        { text: "nothing to commit, working tree clean", type: 'success' }
      );
    } else if (primary === 'agent-status') {
      lines.push({ text: "Groq API Engine: ACTIVE. Models available: llama-3.3-70b-versatile, llama-3.2-11b-vision-preview.", type: 'success' });
    } else {
      lines.push({ text: `Command not found: ${primary}. Type 'help' for options.`, type: 'error' });
    }

    setTerminalHistory(lines);
    setTerminalInput("");
  };

  // --- AI Agent Chat Action handlers ---
  const handleSendAiMessage = async () => {
    if (!aiInput.trim() || isAiGenerating) return;

    const userMsg = { role: 'user', content: aiInput };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setAiInput("");
    setIsAiGenerating(true);

    const updatedSessions = projectSessions.map(s => {
      if (s.id === activeSessionId) {
        const cleanTitle = s.title === "New Chat" ? (userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? "..." : "")) : s.title;
        const strippedTitle = cleanTitle.replace(/[#*`]/g, '').trim();
        return { ...s, title: strippedTitle || "New Chat", messages: nextMessages };
      }
      return s;
    });
    setProjectSessions(updatedSessions);
    saveChatSessionsToFiles(updatedSessions, files);

    try {
      const fileSummary = files.filter(f => !f.name.startsWith('.')).map(f => `${f.type === 'folder' ? 'Dir' : 'File'}: ${f.name}`).join(', ');
      
      // Only append active file context if the prompt is not a simple greeting
      const isGreeting = /^(hi|hello|hey|yo|greetings|test|help)[.!?]*$/i.test(userMsg.content.trim());
      const activeFileContext = (activeFile && !isGreeting)
        ? `\n\n[CONTEXT: ACTIVE_FILE_NAME=${activeFile.name}]\n${activeFile.content || ''}\n[END_CONTEXT]`
        : '';

      const systemPrompt = `You are the Exismic Studio AI Coding Agent. You help developers build complete web applications.
You have full read-write access to the user's workspace files.
The current project workspace contains these files: [${fileSummary}].

The user's currently active file content is appended to their message under [CONTEXT: ACTIVE_FILE_NAME=...]. This is for your reference only to help answer questions or guide you.

CRITICAL INSTRUCTIONS:
1. If the user is greeting you (e.g., "hi", "hello", "hey"), asking a general question, or chatting without asking for code changes/creation, you MUST respond conversationally. Do NOT generate any file blocks ([CREATE_FILE: ...]) or modify the workspace.
2. Only output code files using the [CREATE_FILE: path/filename.ext] syntax when the user explicitly asks you to write code, create files, edit files, fix bugs, or build features.

To create or edit files when explicitly requested, you MUST write the code block using this special file tag block:

[CREATE_FILE: path/filename.ext]
\`\`\`language
code contents here
\`\`\`

You can create multiple files in a single response. For folders, the IDE will automatically parse the directories recursively based on the path you provide in the CREATE_FILE tag. 
Always write the exact files the user wants. Be professional, output clean and complete code. Never output dummy placeholders. Explain your changes, then output the file blocks.`;

      const response = await axios.post("/api/tools/ai/chat", {
        messages: [
          { role: 'system', content: systemPrompt },
          ...nextMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMsg.content + activeFileContext }
        ]
      });

      const responseText = response.data.message;

      // --- PARSE AND AUTO-SYNC GENERATED FILES DIRECTLY TO WORKSPACE ---
      let updatedFiles = [...files];
      const fileRegex = /\[CREATE_FILE:\s*([^\s\]]+)\][\s\r\n]*```[\w]*[\r\n]+([\s\S]*?)```/g;
      let match;
      let count = 0;
      let lastCreatedFileId: string | null = null;
      const logs: string[] = [];

      while ((match = fileRegex.exec(responseText)) !== null) {
        const filePath = match[1];
        const codeContent = match[2];
        
        updatedFiles = resolvePathAndCreateFile(filePath, codeContent, updatedFiles);
        count++;
        
        const parts = filePath.split("/");
        const fileName = parts[parts.length - 1];
        const finalFile = updatedFiles.find(f => f.name === fileName && f.type === 'file');
        if (finalFile) {
          lastCreatedFileId = finalFile.id;
        }
        logs.push(`Automatically synchronized: ${filePath}`);
      }

      const assistantMsg = { role: 'assistant', content: responseText };
      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);

      const finalSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: finalMessages };
        }
        return s;
      });
      setProjectSessions(finalSessions);

      if (count > 0) {
        const nextFiles = saveChatSessionsToFilesInline(finalSessions, updatedFiles);
        setFiles(nextFiles);
        if (lastCreatedFileId) {
          setOpenFileIds(prev => Array.from(new Set([...prev, lastCreatedFileId!])));
          setActiveFileId(lastCreatedFileId);
        }
        
        setTerminalHistory(prev => [
          ...prev,
          ...logs.map(log => ({ text: `[AI Agent] ${log}`, type: 'success' as const }))
        ]);
        
        compilePreview();
        toast.success(`AI Agent built & synced ${count} files directly to explorer!`);
      } else {
        saveChatSessionsToFiles(finalSessions, files);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an issue communicating with the AI coding model. Please make sure your system env keys are set up correctly." }]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyCodeToActive = (code: string) => {
    if (!activeFileId) {
      toast.error("Please select a file inside Monaco Editor to apply updates");
      return;
    }
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: code } : f));
    toast.success("Code block applied to editor successfully!");
  };

  const handleCreateFileFromCode = (code: string) => {
    const name = prompt("Name new file:", "Component.tsx");
    if (!name) return;
    const ext = name.split('.').pop() || 'txt';
    const lang = ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext === 'tsx' ? 'typescript' : ext === 'css' ? 'css' : ext === 'json' ? 'json' : 'html';

    const newFile: FileNode = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      type: 'file',
      parentId: null,
      language: lang,
      content: code
    };

    setFiles(prev => [...prev, newFile]);
    openTab(newFile.id);
    toast.success(`Created file: ${name}`);
  };

  const parseInlineStyles = (text: string) => {
    const boldCodeRegex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    const elements = [];
    let lastIdx = 0;
    let match;

    while ((match = boldCodeRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        elements.push(text.substring(lastIdx, match.index));
      }

      if (match[2]) {
        elements.push(<strong key={match.index} className="font-extrabold text-white">{match[2]}</strong>);
      } else if (match[3]) {
        elements.push(<code key={match.index} className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-400">{match[3]}</code>);
      }

      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < text.length) {
      elements.push(text.substring(lastIdx));
    }

    return elements.length > 0 ? elements : text;
  };

  const renderMessageContent = (content: string) => {
    const codeBlockRegex = /```([\w+]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'code',
        code: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) });
    }

    return parts.map((part, partIdx) => {
      if (part.type === 'code') {
        const lang = part.language || 'code';
        const code = part.code || '';
        return (
          <div key={partIdx} className="my-3 border border-white/10 rounded-xl overflow-hidden bg-black/50 select-text">
            <div className="bg-white/5 px-3 py-1 flex items-center justify-between border-b border-white/5 text-[9px] font-black uppercase text-zinc-500 tracking-wider">
              <span>{lang}</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleApplyCodeToActive(code)}
                  className="p-1 hover:bg-accent-blue/20 rounded text-accent-blue/80 hover:text-accent-blue"
                  title="Apply to current active file"
                >
                  <Zap size={10} fill="currentColor" />
                </button>
                <button 
                  onClick={() => handleCreateFileFromCode(code)}
                  className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                  title="Save as new file"
                >
                  <Plus size={10} />
                </button>
              </div>
            </div>
            <pre className="p-3 overflow-x-auto text-[11px] font-mono text-zinc-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        const contentStr = part.content || '';
        return (
          <div key={partIdx} className="space-y-1.5 select-text">
            {contentStr.split('\n').map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

              if (trimmed.startsWith('### ')) {
                return <h4 key={lineIdx} className="text-xs font-black text-white uppercase tracking-wider mt-3 mb-1">{parseInlineStyles(trimmed.slice(4))}</h4>;
              }
              if (trimmed.startsWith('## ')) {
                return <h3 key={lineIdx} className="text-sm font-black text-white uppercase tracking-wider mt-4 mb-2">{parseInlineStyles(trimmed.slice(3))}</h3>;
              }
              if (trimmed.startsWith('# ')) {
                return <h2 key={lineIdx} className="text-base font-black text-white uppercase tracking-widest mt-5 mb-3">{parseInlineStyles(trimmed.slice(2))}</h2>;
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-accent-blue mt-1 shrink-0">•</span>
                    <span className="flex-1">{parseInlineStyles(trimmed.slice(2))}</span>
                  </div>
                );
              }

              return <p key={lineIdx} className="leading-relaxed text-zinc-300">{parseInlineStyles(line)}</p>;
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#050507] text-zinc-300 font-sans selection:bg-accent-blue/30 overflow-hidden relative">
      
      {/* 1. Project Dashboard Overlays (Blank State) */}
      <AnimatePresence>
        {isProjectDashboardOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
          >
            <div className="w-full max-w-4xl bg-zinc-950 border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-4xl flex flex-col md:flex-row max-h-[calc(100dvh-1.5rem)]">
              
              {/* Left Side: Create / Templates */}
              <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-white/5">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                    Exismic <span className="bg-gradient-to-r from-accent-purple via-accent-cyan to-indigo-500 bg-clip-text text-transparent">Code Studio</span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">Create a custom workspace seeded with standard boilerplates, start empty, or generate your files using natural language prompt nodes.</p>
                </div>

                <div className="h-px bg-white/5" />

                {/* Templates Section */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Select Workspace Template</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { title: "Blank Canvas", desc: "Completely empty. AI-ready", template: 'blank' as const, icon: "🗑️", bg: "from-zinc-500/10 to-transparent border-zinc-500/25" },
                      { title: "HTML5 Sandbox", desc: "Vanilla HTML, CSS, JS", template: 'html' as const, icon: "🌐", bg: "from-orange-500/10 to-transparent border-orange-500/20" },
                      { title: "React Dashboard", desc: "Premium analytics panel", template: 'react-dashboard' as const, icon: "📊", bg: "from-cyan-500/10 to-transparent border-cyan-500/20" },
                      { title: "SaaS Landing", desc: "Product landing showcase", template: 'saas-landing' as const, icon: "🚀", bg: "from-pink-500/10 to-transparent border-pink-500/20" },
                      { title: "Next.js App", desc: "App Router Boilerplate", template: 'nextjs-app' as const, icon: "⚛️", bg: "from-purple-500/10 to-transparent border-purple-500/20" },
                      { title: "Portfolio Showcase", desc: "Developer profile grid", template: 'portfolio' as const, icon: "💼", bg: "from-emerald-500/10 to-transparent border-emerald-500/20" },
                      { title: "Todo Board", desc: "Task tracking dashboard", template: 'todo-board' as const, icon: "✅", bg: "from-yellow-500/10 to-transparent border-yellow-500/20" }
                    ].map(tmpl => (
                      <button 
                        key={tmpl.title}
                        onClick={() => handleCreateNewProject(tmpl.title === "Portfolio Showcase" ? "Portfolio" : tmpl.title === "Todo Board" ? "Todo Board" : tmpl.title, tmpl.template)}
                        className={cn(
                          "p-4 rounded-2xl border bg-zinc-900/50 hover:bg-zinc-900 text-left transition-all active:scale-[0.98] group flex flex-col gap-2",
                          tmpl.bg
                        )}
                      >
                        <span className="text-2xl">{tmpl.icon}</span>
                        <div className="space-y-0.5 mt-2">
                          <h4 className="text-[11px] font-black uppercase text-white tracking-wide leading-tight">{tmpl.title}</h4>
                          <p className="text-[9px] text-zinc-500 font-medium leading-tight">{tmpl.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Create Custom / Describe in natural language */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Describe Project (AI Generation)</h3>
                  
                  {isGeneratingProject ? (
                    <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4">
                      <RefreshCw className="animate-spin text-accent-blue" size={24} />
                      <div className="space-y-1 text-center">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">AI Coding Agent Bootstrapping...</p>
                        <p className="text-[10px] text-zinc-500 font-medium">Generating folder trees, HTML modules, and App logic components.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="customProjName"
                          placeholder="Project name (e.g. My Fresh App)"
                          className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-accent-blue/30 text-white placeholder:text-zinc-700"
                        />
                      </div>
                      <textarea
                        placeholder="Describe what you want to build in detail (e.g., 'A gorgeous dark-mode subscription SaaS landing page for an AI editor with modern layout, pricing plans, and contact section')."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="w-full h-24 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-accent-blue/30 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => {
                            const name = (document.getElementById("customProjName") as HTMLInputElement)?.value || "My Fresh App";
                            handleCreateNewProject(name, 'blank'); // Defaults to completely empty blank workspace
                          }}
                          className="px-5 py-2.5 bg-zinc-900 border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all"
                        >
                          Create Empty Blank
                        </button>
                        
                        <button 
                          onClick={() => {
                            const name = (document.getElementById("customProjName") as HTMLInputElement)?.value || "My Fresh App";
                            handleGenerateProjectWithAi(projectDescription, name);
                          }}
                          disabled={!projectDescription.trim()}
                          className="px-6 py-2.5 bg-gradient-to-r from-accent-purple to-accent-cyan text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Sparkles size={12} /> Generate with AI
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Saved Cloud Projects */}
              <div className="w-full md:w-[320px] bg-black/35 p-8 flex flex-col h-full overflow-hidden">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Saved Projects</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Remote rows synchronized via Supabase PostgreSQL per user.</p>
                </div>

                <div className="h-px bg-white/5 my-4" />

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {!session ? (
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center space-y-3">
                      <Lock size={20} className="mx-auto text-zinc-600" />
                      <p className="text-[10px] text-zinc-500 leading-normal">Authenticate to synchronize cloud developments across sessions.</p>
                      <Link href="/auth/login" className="block w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black tracking-widest text-white uppercase border border-white/5 transition-colors">
                        SIGN IN
                      </Link>
                    </div>
                  ) : loadingProjects ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="animate-spin text-accent-blue" size={20} />
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-12 text-zinc-600 text-[10px] font-medium">
                      No cloud projects found. Start a template to seed one!
                    </div>
                  ) : (
                    projects.map(proj => (
                      <div 
                        key={proj.id}
                        onClick={() => handleOpenRemoteProject(proj)}
                        className="p-3 bg-zinc-900/80 border border-white/5 rounded-2xl cursor-pointer hover:border-accent-blue/35 hover:bg-zinc-900 transition-all flex items-center justify-between group/proj"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Folder size={14} className="text-accent-blue" fill="currentColor" />
                          <span className="text-[11px] font-bold text-white tracking-tight truncate">{proj.name}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-1 hover:bg-white/10 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover/proj:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-auto pt-4 flex justify-end">
                  <button 
                    onClick={() => setIsProjectDashboardOpen(false)}
                    className="text-[10px] font-black tracking-widest uppercase text-zinc-500 hover:text-white"
                  >
                    Close Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Navigation Bar */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0c]/80 backdrop-blur-xl z-50 flex-shrink-0 select-none">
        {/* Left branding and project naming */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Hub</span>
          </Link>
          
          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
              <Sparkles size={12} />
            </div>
            <h1 className="text-xs font-black uppercase tracking-tighter text-white italic">
              Exismic <span className="text-accent-blue">Studio</span>
            </h1>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Project Title and Auto-save icon */}
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-wider text-white outline-none w-40 hover:bg-white/5 px-2 py-1 rounded transition-colors"
            />
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 italic">
                <RefreshCw size={10} className="animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                <CloudCheck size={12} /> Cloud Synced
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                Offline Cache
              </span>
            )}
          </div>
        </div>

        {/* Right side toggles and actions */}
        <div className="flex items-center gap-4">
          {/* Main workspace control selectors */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 gap-0.5">
            <button 
              onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
              className={cn("p-1.5 rounded-lg transition-all", isLeftSidebarOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
              title="Toggle File Explorer"
            >
              <Layout size={12} />
            </button>
            <button 
              onClick={() => setTerminalOpen(!isTerminalOpen)}
              className={cn("p-1.5 rounded-lg transition-all", isTerminalOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
              title="Toggle Terminal panel"
            >
              <TerminalIcon size={12} />
            </button>
            <button 
              onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
              className={cn("p-1.5 rounded-lg transition-all", isRightSidebarOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
              title="Toggle Preview / Chat"
            >
              <MessageSquare size={12} />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleManualSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#050505] border border-white/10 rounded-xl hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 transition-colors"
            >
              <Save size={12} /> Save
            </button>

            <button 
              onClick={() => {
                compilePreview();
                if (isRightSidebarOpen && rightPanelTab !== 'preview') {
                  setRightPanelTab('preview');
                } else if (!isRightSidebarOpen) {
                  setRightSidebarOpen(true);
                  setRightPanelTab('preview');
                }
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-accent-blue text-black rounded-xl hover:bg-accent-blue/90 text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
              <Play size={12} fill="currentColor" /> Run Code
            </button>

            <button 
              onClick={() => {
                fetchProjects();
                setIsProjectDashboardOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-colors border border-white/5"
            >
              Projects
            </button>
          </div>
        </div>
      </div>

      {/* 3. Core Split Editor workspace */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Left Side: File Explorer tree */}
        {isLeftSidebarOpen && (
          <div className="w-56 bg-[#09090c] border-r border-white/5 flex flex-col h-full shrink-0 select-none">
            <div className="h-10 flex items-center justify-between px-4 border-b border-white/5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Explorer</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleAddFile(null)}
                  className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-colors"
                  title="New File at Root"
                >
                  <FilePlus size={12} />
                </button>
                <button 
                  onClick={() => handleAddFolder(null)}
                  className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-colors"
                  title="New Folder at Root"
                >
                  <FolderPlus size={12} />
                </button>
              </div>
            </div>

            {/* Filter Search Input */}
            <div className="p-3 border-b border-white/5">
              <input 
                type="text" 
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050507] border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-zinc-300 outline-none focus:border-accent-blue/30 placeholder:text-zinc-700"
              />
            </div>

            {/* Tree listing */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
              {files.length === 0 ? (
                <div className="p-4 py-8 text-center text-[10px] font-medium text-zinc-600 leading-normal space-y-2">
                  <TerminalSquare size={20} className="mx-auto text-zinc-700 animate-pulse" />
                  <p>Workspace is empty.</p>
                  <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-wide">Ready for AI Direct writing</p>
                </div>
              ) : (
                renderExplorerTree(null, 0)
              )}
            </div>

            {/* Persistence warning tag */}
            <div className="p-3 border-t border-white/5 bg-black/20 shrink-0 text-center flex items-center justify-between px-4">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Sync Engines Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_5px_rgba(0,242,255,0.5)]" />
            </div>
          </div>
        )}

        {/* Center: Monaco Editor & Terminal */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-[#07070a]">
          {/* Tabs bar */}
          <div className="h-9 flex bg-[#09090c] border-b border-white/5 overflow-x-auto no-scrollbar select-none">
            {openFileIds.map(fid => {
              const file = files.find(f => f.id === fid);
              if (!file) return null;
              const isActive = activeFileId === fid;
              return (
                <div 
                  key={fid}
                  onClick={() => openTab(fid)}
                  className={cn(
                    "flex-shrink-0 flex items-center px-4 gap-2.5 text-[11px] cursor-pointer border-r border-white/5 relative h-full group transition-colors",
                    isActive ? "bg-[#07070a] text-white" : "text-zinc-500 bg-[#09090c] hover:bg-white/[0.02] hover:text-zinc-300"
                  )}
                >
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent-blue shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
                  )}
                  {getFileIcon(file.name)}
                  <span className="truncate max-w-[120px] font-medium tracking-tight">{file.name}</span>
                  <button 
                    onClick={(e) => closeTab(e, fid)}
                    className="p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Editor Sandbox */}
          <div className="flex-1 relative bg-[#07070a] min-h-0">
            {activeFile ? (
              <Editor
                height="100%"
                language={getFileLanguage(activeFile?.name || "")}
                value={editorContent}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on'
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#07070a]">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-700 mb-5 shadow-2xl">
                  <FileCode size={26} />
                </div>
                <h2 className="text-sm font-black uppercase text-white tracking-widest mb-2 italic">Studio Standby</h2>
                <p className="text-zinc-600 text-xs max-w-xs font-medium leading-relaxed">
                  {files.length === 0 
                    ? "Command the AI Agent on the right to build files directly inside your sidebar!"
                    : "Select a module file from explorer to edit code, or use the AI Agent to build updates."}
                </p>
              </div>
            )}
          </div>

          {/* Terminal Console Panel */}
          {isTerminalOpen && (
            <div className="h-48 bg-[#050507] border-t border-white/5 flex flex-col shrink-0">
              {/* Header */}
              <div className="h-8 bg-[#09090c] border-b border-white/5 flex items-center justify-between px-4 select-none">
                <div className="flex items-center gap-6">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Developer Console</span>
                  <div className="flex gap-4">
                    <span className="text-[8px] font-bold text-accent-cyan uppercase tracking-widest border-b border-accent-cyan py-2.5">local-shell</span>
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest py-2.5">bundler-logs</span>
                  </div>
                </div>
                <button 
                  onClick={() => setTerminalHistory([])}
                  className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white"
                  title="Clear Console Logs"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Logs area */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed space-y-1 select-text custom-scrollbar">
                {terminalHistory.map((line, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      line.type === 'error' && "text-red-400",
                      line.type === 'success' && "text-emerald-400",
                      line.type === 'info' && "text-zinc-400",
                      line.type === 'input' && "text-accent-cyan"
                    )}
                  >
                    {line.text}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Input Command runner */}
              <form onSubmit={handleTerminalSubmit} className="h-8 bg-[#09090c] border-t border-white/5 flex items-center px-3 gap-2">
                <span className="text-zinc-600 font-mono text-xs select-none">➜</span>
                <input 
                  type="text" 
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type 'help' to list console scripts..."
                  className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-accent-cyan placeholder:text-zinc-700"
                />
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Tab Panel (Live Preview / Coding Agent) */}
        {isRightSidebarOpen && (
          <div className="w-[35%] bg-[#08080a] border-l border-white/5 flex flex-col h-full shrink-0 select-none">
            {/* Header Tabs switcher */}
            <div className="h-10 bg-[#09090c] border-b border-white/5 flex items-center justify-between px-3">
              <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                <button 
                  onClick={() => setRightPanelTab('preview')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                    rightPanelTab === 'preview' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <Eye size={10} className="inline mr-1" /> Preview
                </button>
                <button 
                  onClick={() => setRightPanelTab('agent')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                    rightPanelTab === 'agent' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <Bot size={10} className="inline mr-1" /> AI Agent
                </button>
              </div>

              {/* Viewport switch controls on preview tab */}
              {rightPanelTab === 'preview' && (
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                  <button 
                    onClick={() => setPreviewViewport('desktop')}
                    className={cn("p-1.5 rounded-md", previewViewport === 'desktop' ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-300")}
                  >
                    <Laptop size={11} />
                  </button>
                  <button 
                    onClick={() => setPreviewViewport('tablet')}
                    className={cn("p-1.5 rounded-md", previewViewport === 'tablet' ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-300")}
                  >
                    <Tablet size={11} />
                  </button>
                  <button 
                    onClick={() => setPreviewViewport('mobile')}
                    className={cn("p-1.5 rounded-md", previewViewport === 'mobile' ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-300")}
                  >
                    <Smartphone size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Content area: Preview sandbox Iframe */}
            {rightPanelTab === 'preview' && (
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Mock address bar */}
                <div className="h-8 bg-[#09090c] border-b border-white/5 flex items-center px-3 justify-between">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  </div>
                  <div className="flex-1 max-w-[200px] bg-white/5 rounded-md text-[9px] font-mono text-zinc-500 py-0.5 text-center truncate">
                    http://localhost:3000/sandbox
                  </div>
                  <button onClick={compilePreview} className="text-zinc-500 hover:text-white" title="Hot Compile">
                    <RefreshCw size={10} />
                  </button>
                </div>

                {/* Resizable viewport rendering block */}
                <div className="flex-1 bg-zinc-950 flex items-center justify-center p-4 overflow-hidden relative">
                  <div 
                    className={cn(
                      "h-full bg-white rounded-2xl shadow-4xl overflow-hidden border border-white/10 transition-all duration-300 relative",
                      previewViewport === 'desktop' && "w-full",
                      previewViewport === 'tablet' && "w-[680px]",
                      previewViewport === 'mobile' && "w-[360px]"
                    )}
                  >
                    <iframe
                      title="Studio Sandbox Preview"
                      srcDoc={previewSrc}
                      className="absolute inset-0 w-full h-full border-none bg-white"
                      sandbox="allow-scripts allow-modals allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content area: AI Coding Agent console panel */}
            {rightPanelTab === 'agent' && (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* Agent Header Controls */}
                <div className="h-8 border-b border-white/5 bg-[#09090c] px-3 flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                        isHistorySidebarOpen ? "bg-accent-blue/10 text-accent-blue" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                      )}
                      title="Show project chat history"
                    >
                      <HistoryIcon size={10} /> History
                    </button>
                  </div>
                  
                  <button
                    onClick={handleCreateNewChatSession}
                    className="flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black uppercase tracking-wider text-white border border-white/5 transition-all"
                  >
                    <Plus size={10} /> New Chat
                  </button>
                </div>

                {/* Main panel container - holds history sidebar and chat feed side-by-side */}
                <div className="flex-1 flex overflow-hidden relative">
                  
                  {/* Left Side: Inline Chat Sessions Drawer */}
                  {isHistorySidebarOpen && (
                    <div className="w-48 bg-zinc-950/95 border-r border-white/5 flex flex-col h-full shrink-0 z-10 transition-all select-none">
                      <div className="p-2 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Conversations</span>
                        <button 
                          onClick={() => setIsHistorySidebarOpen(false)}
                          className="p-0.5 hover:bg-white/10 rounded text-zinc-600 hover:text-white"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                        {projectSessions.map(s => {
                          const isActive = activeSessionId === s.id;
                          return (
                            <div
                              key={s.id}
                              onClick={() => handleSwitchSession(s.id)}
                              className={cn(
                                "group/session p-2 rounded-xl border text-[10px] cursor-pointer flex items-center justify-between transition-all gap-1.5",
                                isActive 
                                  ? "bg-accent-blue/5 border-accent-blue/30 text-white font-bold" 
                                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                              )}
                            >
                              <span className="truncate flex-1 tracking-tight leading-tight">{s.title || "New Chat"}</span>
                              <button
                                onClick={(e) => handleDeleteChatSession(s.id, e)}
                                className="opacity-0 group-hover/session:opacity-100 p-0.5 hover:bg-white/10 rounded text-zinc-650 hover:text-red-400 transition-opacity"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Messages Feed */}
                  <div ref={agentScrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {messages.map((m, idx) => (
                      <div key={idx} className={cn("flex flex-col gap-1.5", m.role === 'user' ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-1.5 px-1 select-none">
                          {m.role === 'assistant' ? (
                            <>
                              <div className="w-4 h-4 rounded bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue shrink-0">
                                <Bot size={10} />
                              </div>
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Studio Agent</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Developer</span>
                              <div className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                                <User size={10} />
                              </div>
                            </>
                          )}
                        </div>

                        {m.role === 'user' ? (
                          <div className="p-[1px] bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 rounded-2xl rounded-tr-sm max-w-[90%] select-text">
                            <div className="px-3.5 py-2.5 bg-[#0c0c0f]/95 rounded-[calc(1rem-1px)] rounded-tr-sm text-xs leading-relaxed text-white">
                              {m.content}
                            </div>
                          </div>
                        ) : (
                          <div className="px-3.5 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-sm text-xs leading-relaxed text-zinc-300 max-w-[90%] select-text">
                            {renderMessageContent(m.content)}
                          </div>
                        )}
                      </div>
                    ))}
                    {isAiGenerating && (
                      <div className="flex flex-col gap-2 items-start animate-pulse select-none">
                        <div className="w-4 h-4 rounded bg-accent-blue/10 border border-accent-blue/20" />
                        <div className="w-3/4 h-8 bg-white/5 rounded-2xl" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Input block */}
                <div className="p-3 bg-[#09090c] border-t border-white/5 shrink-0 flex gap-2">
                  <textarea 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAiMessage();
                      }
                    }}
                    placeholder="Type your message here to chat with the AI Agent..."
                    className="flex-1 bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-550 outline-none focus:border-accent-blue/55 focus:ring-1 focus:ring-accent-blue/25 resize-none min-h-[50px] transition-all"
                  />
                  <button 
                    onClick={handleSendAiMessage}
                    disabled={!aiInput.trim() || isAiGenerating}
                    className="w-10 h-10 rounded-xl bg-accent-blue/20 text-accent-blue hover:bg-accent-blue hover:text-black flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-95"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. Tiny Status Bar */}
      <div className="h-6 bg-[#07070a] border-t border-white/5 flex items-center justify-between px-3 text-[9px] font-black uppercase tracking-widest text-zinc-600 shrink-0 select-none">
        <div className="flex gap-4">
           <div className="flex items-center gap-1.5 hover:text-zinc-400 cursor-pointer transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> 
              main*
           </div>
           <div className="hover:text-zinc-400 cursor-pointer transition-colors">Ln {activeFile ? "1" : "0"}, Col 1</div>
           <div className="hover:text-zinc-400 cursor-pointer transition-colors">Spaces: 2</div>
        </div>
        <div className="flex gap-4 items-center">
           <div className="flex items-center gap-1.5 text-accent-blue/70 italic">
              <Sparkles size={9} /> 
              Antigravity Active
           </div>
           <div className="hover:text-zinc-400 cursor-pointer transition-colors">UTF-8</div>
           <div className="text-accent-blue">Typescript</div>
        </div>
      </div>

      {/* Premium Toast Messages */}
      {toastMsg && (
        <div className={cn(
          "fixed bottom-8 right-8 z-[200] px-5 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest shadow-4xl backdrop-blur-md transition-all duration-300",
          toastMsg!.type === 'success' 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {toastMsg!.text}
        </div>
      )}

      {/* Global CSS injections */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.12); }
        .monaco-editor, .monaco-editor .margin, .monaco-editor-background { background-color: #07070a !important; }
      `}} />

    </div>
  );
}
