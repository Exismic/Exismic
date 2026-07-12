"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Copy, 
  RefreshCw, 
  Check, 
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PasswordOptions = {
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

const DEFAULT_OPTIONS: PasswordOptions = {
  upper: true,
  lower: true,
  number: true,
  symbol: true,
};

function createPassword(length: number, options: PasswordOptions) {
  const charset = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    symbol: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
  };
  const selected = (Object.keys(options) as Array<keyof PasswordOptions>)
    .filter((key) => options[key])
    .map((key) => charset[key]);

  if (selected.length === 0) return "SELECT OPTION";

  const fullCharset = selected.join("");
  const values = new Uint32Array(length);
  globalThis.crypto.getRandomValues(values);

  // Guarantee every selected character group appears at least once.
  const required = selected.map((characters, index) =>
    characters[values[index] % characters.length],
  );
  const remaining = Array.from(values.slice(required.length), (value) =>
    fullCharset[value % fullCharset.length],
  );
  const password = [...required, ...remaining];

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = values[index] % (index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }

  return password.join("");
}

function OptionToggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-14 items-center justify-between rounded-2xl border p-5 transition-all duration-300",
        active ? "bg-accent-purple/10 border-accent-purple/40 text-white" : "bg-zinc-900/40 border-white/5 text-zinc-500 hover:border-white/10",
      )}
    >
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      <div className={cn("relative h-5 w-10 rounded-full transition-colors duration-300", active ? "bg-accent-purple" : "bg-zinc-800")}>
        <motion.div animate={{ x: active ? 20 : 4 }} className="absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
      </div>
    </button>
  );
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [password, setPassword] = useState("GENERATING...");
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPassword(createPassword(16, DEFAULT_OPTIONS));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 10) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 24) score += 1;
    if (options.upper && options.lower) score += 1;
    if (options.number && options.symbol) score += 1;

    const data = [
      { label: "WEAK", color: "bg-red-500", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" },
      { label: "MEDIUM", color: "bg-orange-500", glow: "shadow-[0_0_20px_rgba(249,115,22,0.2)]" },
      { label: "STRONG", color: "bg-yellow-500", glow: "shadow-[0_0_20px_rgba(234,179,8,0.2)]" },
      { label: "VERY STRONG", color: "bg-emerald-500", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]" },
      { label: "ULTRA SECURE", color: "bg-accent-purple", glow: "shadow-[0_0_30px_rgba(124,58,237,0.4)]" }
    ];

    const index = Math.min(score, data.length - 1);
    return { score: index, ...data[index] };
  }, [password, options]);

  const generatePassword = () => setPassword(createPassword(length, options));

  const updateLength = (nextLength: number) => {
    setLength(nextLength);
    setPassword(createPassword(nextLength, options));
  };

  const toggleOption = (key: keyof PasswordOptions) => {
    const nextOptions = { ...options, [key]: !options[key] };
    setOptions(nextOptions);
    setPassword(createPassword(length, nextOptions));
  };

  const copyToClipboard = () => {
    if (password === "SELECT OPTION" || password === "GENERATING...") return;
    navigator.clipboard.writeText(password);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* SECTION 1: THE DISPLAY (Result) */}
      <div className="relative group">
        <div className={cn(
          "w-full p-10 md:p-16 rounded-[4rem] glass-dark border-2 transition-all duration-700 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden",
          password !== "SELECT OPTION" ? "border-white/5" : "border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
        )}>
          {/* Strength Background Glow */}
          <div className={cn("absolute inset-0 opacity-20 transition-all duration-1000 blur-[100px]", strength.color)} />

          <motion.span 
            key={password}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "text-3xl md:text-5xl font-mono font-black tracking-tight text-center break-all relative z-10 selection:bg-accent-purple selection:text-white px-4",
              password === "SELECT OPTION" ? "text-red-500/50" : "text-white"
            )}
          >
            {password}
          </motion.span>
          
          <div className="absolute top-8 right-10 flex gap-3 z-20">
             <button 
               onClick={generatePassword}
               aria-label="Generate a new password"
               className="p-4 rounded-2xl bg-zinc-800/80 backdrop-blur-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:rotate-180 duration-500 border border-white/5"
             >
                <RefreshCw size={20} />
             </button>
             <button 
               onClick={copyToClipboard}
               className={cn(
                 "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 backdrop-blur-md border",
                 isCopied ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white border-white text-black hover:bg-zinc-200"
               )}
             >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? "COPIED!" : "COPY"}
             </button>
          </div>

          {/* Strength & Metrics */}
          <div className="absolute bottom-10 inset-x-12 md:inset-x-20 space-y-4 z-10">
             <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Security Rating</p>
                   <p className={cn("text-xs font-black uppercase tracking-widest", strength.score >= 3 ? "text-emerald-400" : "text-zinc-300")}>
                      {strength.label}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Key Length</p>
                   <p className="text-xs font-black text-white">{length} Characters</p>
                </div>
             </div>
             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i} 
                    initial={false}
                    animate={{ 
                      backgroundColor: i <= strength.score ? (i === 4 ? '#A855F7' : (i === 3 ? '#10B981' : (i === 2 ? '#EAB308' : (i === 1 ? '#F97316' : '#EF4444')))) : 'rgba(255,255,255,0.05)'
                    }}
                    className={cn(
                      "flex-1 rounded-full",
                      i <= strength.score && strength.glow
                    )} 
                  />
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CONFIGURATION (Controls) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
         {/* Length Slider */}
         <div className="md:col-span-12 lg:col-span-5 p-10 rounded-[3rem] glass-dark border border-white/5 space-y-8 relative overflow-hidden group">
            <div className="flex justify-between items-center">
               <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Zap size={16} className="text-accent-purple" />
                     Entropy Length
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Random bits of security</p>
               </div>
               <span className="text-4xl font-black text-accent-purple">{length}</span>
            </div>
            
            <div className="relative py-4">
               <input 
                 type="range" 
                 min="8" 
                 max="32" 
                 value={length}
                 onChange={(e) => updateLength(Number.parseInt(e.target.value, 10))}
                 className="w-full accent-accent-purple bg-zinc-800 rounded-full h-2 cursor-pointer appearance-none transition-all hover:h-3"
               />
            </div>
            
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">
               <span>Basic (8)</span>
               <span>Master (32)</span>
            </div>
         </div>

         {/* Character Options */}
         <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionToggle active={options.upper} label="Uppercase (A-Z)" onClick={() => toggleOption("upper")} />
            <OptionToggle active={options.lower} label="Lowercase (a-z)" onClick={() => toggleOption("lower")} />
            <OptionToggle active={options.number} label="Numbers (0-9)" onClick={() => toggleOption("number")} />
            <OptionToggle active={options.symbol} label="Symbols (!@#$%*)" onClick={() => toggleOption("symbol")} />
         </div>
      </div>

      {/* Footer / Tip */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-[2.5rem] bg-linear-to-r from-accent-purple/5 to-transparent border border-white/5">
         <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple shrink-0">
            <ShieldCheck size={28} />
         </div>
         <p className="text-zinc-500 text-sm leading-relaxed font-medium">
            <strong className="text-zinc-300">Why it matters:</strong> Passwords with at least 16 characters are exponentially harder to crack. Combining character groups creates a stronger credential against modern brute-force hardware.
         </p>
      </div>
    </div>
  );
}
