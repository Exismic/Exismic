"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  KeyRound, 
  Copy, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Tag, 
  Layers, 
  ListFilter,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// ============================================================================
// TYPES & BLUEPRINTS (Zero Tech Jargon, 100% Everyday English)
// ============================================================================

export interface PasswordBlueprint {
  id: string;
  title: string;
  category: string;
  length: number;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
  excludeAmbiguous?: boolean;
  description: string;
}

export const PASSWORD_BLUEPRINTS: PasswordBlueprint[] = [
  {
    id: "balanced-standard",
    title: "Balanced Account Security",
    category: "Standard",
    length: 16,
    upper: true,
    lower: true,
    number: true,
    symbol: true,
    excludeAmbiguous: false,
    description: "16-character balanced mix recommended for everyday websites, emails, and apps."
  },
  {
    id: "fortress-vault",
    title: "Maximum Vault Fortress",
    category: "Ultra Secure",
    length: 32,
    upper: true,
    lower: true,
    number: true,
    symbol: true,
    excludeAmbiguous: false,
    description: "32-character maximum defense for password managers, crypto wallets, and root logins."
  },
  {
    id: "numeric-pin",
    title: "Quick PIN Passcode",
    category: "Digits Only",
    length: 6,
    upper: false,
    lower: false,
    number: true,
    symbol: false,
    excludeAmbiguous: false,
    description: "6-digit passcode for phone lock screens, debit cards, and two-factor authentication."
  },
  {
    id: "easy-to-read",
    title: "Easy to Read & Type",
    category: "No Confusion",
    length: 14,
    upper: true,
    lower: true,
    number: true,
    symbol: false,
    excludeAmbiguous: true,
    description: "Omits lookalike characters like 0/O, 1/l/I so you can easily type it on phones or paper."
  },
  {
    id: "api-secret-key",
    title: "API Token & Webhook Key",
    category: "Developer Key",
    length: 32,
    upper: true,
    lower: true,
    number: true,
    symbol: false,
    excludeAmbiguous: false,
    description: "Clean alphanumeric secret key designed for environment variables and webhooks."
  },
  {
    id: "wifi-passphrase",
    title: "Wi-Fi & Shared Device",
    category: "Memorable",
    length: 20,
    upper: true,
    lower: true,
    number: true,
    symbol: true,
    excludeAmbiguous: true,
    description: "20-character high-security phrase suitable for home routers and shared family devices."
  }
];

// Helper to generate cryptographic password in-browser
function generateSecurePassword(
  length: number,
  options: {
    upper: boolean;
    lower: boolean;
    number: boolean;
    symbol: boolean;
    excludeAmbiguous?: boolean;
  }
): string {
  let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lowerChars = "abcdefghijklmnopqrstuvwxyz";
  let numChars = "0123456789";
  let symChars = "!@#$%^&*()_+~|}{[]:;?><,./-=";

  if (options.excludeAmbiguous) {
    upperChars = upperChars.replace(/[O]/g, "");
    lowerChars = lowerChars.replace(/[l|i]/g, "");
    numChars = numChars.replace(/[0|1]/g, "");
    symChars = symChars.replace(/[|]/g, "");
  }

  const charGroups: string[] = [];
  if (options.upper) charGroups.push(upperChars);
  if (options.lower) charGroups.push(lowerChars);
  if (options.number) charGroups.push(numChars);
  if (options.symbol) charGroups.push(symChars);

  if (charGroups.length === 0) return "Choose at least 1 option";

  const allChars = charGroups.join("");
  const passwordArray: string[] = [];
  const randomBytes = new Uint32Array(length);
  globalThis.crypto.getRandomValues(randomBytes);

  // Guarantee at least 1 character from each chosen group
  charGroups.forEach((group, idx) => {
    passwordArray.push(group[randomBytes[idx] % group.length]);
  });

  // Fill remainder
  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(allChars[randomBytes[i] % allChars.length]);
  }

  // Fisher-Yates shuffle with crypto values
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = randomBytes[i] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}

export function PasswordGenerator() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("balanced-standard");
  const [length, setLength] = useState<number>(16);
  const [upper, setUpper] = useState<boolean>(true);
  const [lower, setLower] = useState<boolean>(true);
  const [number, setNumber] = useState<boolean>(true);
  const [symbol, setSymbol] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  // Bulk Generator State
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate Current Password
  const handleGenerate = useCallback(() => {
    const opts = { upper, lower, number, symbol, excludeAmbiguous };
    const main = generateSecurePassword(length, opts);
    setPassword(main);

    if (bulkCount > 1) {
      const list: string[] = [];
      for (let i = 0; i < bulkCount; i++) {
        list.push(generateSecurePassword(length, opts));
      }
      setBulkPasswords(list);
    } else {
      setBulkPasswords([]);
    }
  }, [length, upper, lower, number, symbol, excludeAmbiguous, bulkCount]);

  // Initial load
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  // Select Blueprint
  const handleSelectBlueprint = (bp: PasswordBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setLength(bp.length);
    setUpper(bp.upper);
    setLower(bp.lower);
    setNumber(bp.number);
    setSymbol(bp.symbol);
    setExcludeAmbiguous(bp.excludeAmbiguous ?? false);
  };

  // Reset to Baseline
  const handleReset = () => {
    handleSelectBlueprint(PASSWORD_BLUEPRINTS[0]);
  };

  // Copy Main Password
  const handleCopyMain = () => {
    if (!password || password.includes("Choose at least")) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy Bulk Item
  const handleCopyBulkItem = (pass: string, idx: number) => {
    navigator.clipboard.writeText(pass);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Plain-English Security Rating & Strength Analysis
  const securityAnalysis = useMemo(() => {
    let score = 0;
    if (length >= 10) score += 1;
    if (length >= 16) score += 1;
    if (length >= 24) score += 1;
    if (upper && lower) score += 1;
    if (number && symbol) score += 1;

    if (score <= 1) {
      return {
        level: "Basic / Weak",
        colorText: "text-amber-400",
        colorBg: "bg-amber-400",
        bars: 1,
        timeToCrack: "Under a few hours",
        advice: "Increase length to at least 16 characters for online accounts."
      };
    }
    if (score === 2) {
      return {
        level: "Medium Protection",
        colorText: "text-yellow-400",
        colorBg: "bg-yellow-400",
        bars: 2,
        timeToCrack: "Several months",
        advice: "Good for low-risk utilities. Add symbols for financial logins."
      };
    }
    if (score === 3 || score === 4) {
      return {
        level: "Strong Defense",
        colorText: "text-lime-400",
        colorBg: "bg-lime-400",
        bars: 4,
        timeToCrack: "Decades",
        advice: "Safe against modern automated brute-force attacks."
      };
    }
    return {
      level: "Maximum Fortress",
      colorText: "text-emerald-400",
      colorBg: "bg-emerald-400",
      bars: 5,
      timeToCrack: "Centuries on modern GPU clusters",
      advice: "Recommended for master passwords, crypto keys, and root servers."
    };
  }, [length, upper, lower, number, symbol]);

  return (
    <div className="w-full space-y-8">
      {/* Top Banner / Quick Controls Bar */}
      <div className="rounded-3xl border border-lime-500/20 bg-gradient-to-b from-lime-500/5 to-transparent p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Secure Password Generator</span>
                <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2 py-0.5 rounded-full">
                  100% In-Browser Privacy
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Created directly in your device memory with zero server uploads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset to default settings"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2 rounded-2xl bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-xs font-bold text-lime-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-lime-500/10"
            >
              <RefreshCw size={14} className="text-lime-400" />
              <span>Generate New</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Curated Production Blueprints (Spacious 3-Column Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-lime-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              1-Click Security Presets
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Pick a tested preset matching your exact security needs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PASSWORD_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-lime-500/15 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-300 border border-lime-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right">
                    {bp.length} characters
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-lime-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Password Display & Generator Hero (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Password Output Stage */}
          <div className="rounded-3xl border border-lime-500/30 bg-black/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            {/* Subtle Matrix Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Lock size={13} className="text-lime-400" />
                  <span>Generated Secure Password</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Reveal password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Generate new password"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Password Text Display */}
              <div className="p-4 rounded-2xl bg-black/80 border border-white/10 min-h-[90px] flex items-center justify-center break-all">
                <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold tracking-tight text-white text-center select-all">
                  {showPassword ? (
                    password
                  ) : (
                    "•".repeat(Math.min(password.length, 32))
                  )}
                </p>
              </div>
            </div>

            {/* Strength Meter & Quick Copy */}
            <div className="space-y-4 pt-4 relative z-10 border-t border-white/10">
              {/* Strength Readout */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Protection Level:</span>
                  <span className={cn("font-bold uppercase tracking-wider", securityAnalysis.colorText)}>
                    {securityAnalysis.level}
                  </span>
                </div>
                {/* 5-Segment Strength Bar */}
                <div className="grid grid-cols-5 gap-1.5 h-2 w-full rounded-full overflow-hidden bg-white/5">
                  {[1, 2, 3, 4, 5].map((barIndex) => (
                    <div
                      key={barIndex}
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        barIndex <= securityAnalysis.bars
                          ? cn(securityAnalysis.colorBg, "shadow-[0_0_10px_rgba(132,204,22,0.4)]")
                          : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Primary Copy Action Button */}
              <button
                type="button"
                onClick={handleCopyMain}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-lime-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{copied ? "Password Copied to Clipboard!" : "Copy Password"}</span>
              </button>
            </div>
          </div>

          {/* Plain-English Security Advice Card */}
          <div className="p-4 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0 mt-0.5">
              <ShieldCheck size={16} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Estimated Brute-Force Resistance</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Crack resistance: <strong className="text-zinc-200">{securityAnalysis.timeToCrack}</strong>. {securityAnalysis.advice}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Password Length ({length} Characters)
                </label>
                <span className="text-[11px] font-mono text-lime-400 font-bold px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
                  {length} Chars
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => {
                  setLength(parseInt(e.target.value, 10));
                  setSelectedBlueprintId("");
                }}
                className="w-full h-2 rounded-lg bg-zinc-800 accent-lime-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-1">
                <span>4 Min</span>
                <span>16 Recommended</span>
                <span>32 Fortress</span>
                <span>64 Max</span>
              </div>
            </div>

            {/* Character Composition Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                Character Sets Included
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: "upper",
                    label: "Uppercase Letters (A-Z)",
                    sample: "A B C D",
                    checked: upper,
                    toggle: () => { setUpper(!upper); setSelectedBlueprintId(""); }
                  },
                  {
                    id: "lower",
                    label: "Lowercase Letters (a-z)",
                    sample: "a b c d",
                    checked: lower,
                    toggle: () => { setLower(!lower); setSelectedBlueprintId(""); }
                  },
                  {
                    id: "number",
                    label: "Numbers (0-9)",
                    sample: "1 2 3 4",
                    checked: number,
                    toggle: () => { setNumber(!number); setSelectedBlueprintId(""); }
                  },
                  {
                    id: "symbol",
                    label: "Symbols (!@#$%)",
                    sample: "! @ # $ %",
                    checked: symbol,
                    toggle: () => { setSymbol(!symbol); setSelectedBlueprintId(""); }
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.toggle}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer",
                      item.checked
                        ? "bg-lime-500/10 border-lime-500/40 text-white"
                        : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold leading-tight">{item.label}</p>
                      <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{item.sample}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                      item.checked
                        ? "bg-lime-400 border-lime-300 text-black font-black"
                        : "border-zinc-700 bg-zinc-900"
                    )}>
                      {item.checked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Exclude Lookalike Characters Toggle */}
              <button
                type="button"
                onClick={() => {
                  setExcludeAmbiguous(!excludeAmbiguous);
                  setSelectedBlueprintId("");
                }}
                className={cn(
                  "w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer mt-2",
                  excludeAmbiguous
                    ? "bg-lime-500/10 border-lime-500/40 text-white"
                    : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20"
                )}
              >
                <div>
                  <p className="text-xs font-bold leading-tight">Exclude Ambiguous Characters</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Removes lookalike characters like 0/O, 1/l/I for effortless typing</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                  excludeAmbiguous
                    ? "bg-lime-400 border-lime-300 text-black font-black"
                    : "border-zinc-700 bg-zinc-900"
                )}>
                  {excludeAmbiguous && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            </div>

            {/* Bulk Quantity Mode */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Bulk Generation Quantity
                </label>
                <div className="flex gap-1.5">
                  {[1, 5, 10].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBulkCount(qty)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all",
                        bulkCount === qty
                          ? "bg-lime-500 text-black border-lime-400"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      {qty === 1 ? "Single" : `${qty}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Passwords List */}
              {bulkCount > 1 && bulkPasswords.length > 0 && (
                <div className="space-y-2 pt-2 max-h-[160px] overflow-y-auto pr-1">
                  {bulkPasswords.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-white/10 group hover:border-lime-500/30 transition-all"
                    >
                      <span className="font-mono text-xs text-lime-300 truncate mr-2 select-all">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyBulkItem(item, idx)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-lime-500/20 text-zinc-300 hover:text-lime-300 text-[10px] font-bold border border-white/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedIndex === idx ? <Check size={11} className="text-lime-400" /> : <Copy size={11} />}
                        <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="Password Generator"
        title="Generated Secure Password"
        content={password}
        onCopy={handleCopyMain}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="productivity-passgen" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="productivity-passgen" />
    </div>
  );
}
export default PasswordGenerator;
