"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Check,
  Copy,
  Crown,
  Flame,
  Gauge,
  Keyboard,
  LineChart,
  RefreshCw,
  Share2,
  Target,
  Timer,
  Trophy,
  Type,
  Volume2,
  VolumeX,
  Zap,
  Info,
  RotateCcw,
  Sparkles as _ForbiddenSparkles, // explicitly not used
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFunctionalStorageItem, setFunctionalStorageItem } from "@/lib/cookie-consent";

type TestMode = "30" | "60" | "120" | "endless";
type ThemeId = "tech" | "motivation" | "story" | "coding" | "startup" | "daily";
type Status = "idle" | "running" | "finished";
type SoundMode = "off" | "thock" | "clicky";

type TypingStats = {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
};

type ResultRecord = TypingStats & {
  id: string;
  mode: TestMode;
  theme: ThemeId;
  date: string;
  duration: number;
};

type StreakState = {
  date: string;
  streak: number;
};

const MODE_OPTIONS: Array<{ id: TestMode; label: string; desc: string }> = [
  { id: "30", label: "30s", desc: "Sprint" },
  { id: "60", label: "60s", desc: "Classic" },
  { id: "120", label: "120s", desc: "Endurance" },
  { id: "endless", label: "Endless", desc: "Flow" },
];

const THEMES: Array<{ id: ThemeId; label: string; icon: typeof Type; accent: string }> = [
  { id: "tech", label: "Technology", icon: Activity, accent: "text-emerald-400" },
  { id: "motivation", label: "Motivation", icon: Flame, accent: "text-amber-400" },
  { id: "story", label: "Storytelling", icon: Type, accent: "text-cyan-400" },
  { id: "coding", label: "Code Snippets", icon: Keyboard, accent: "text-indigo-400" },
  { id: "startup", label: "Product & Craft", icon: Brain, accent: "text-purple-400" },
  { id: "daily", label: "Daily Drill", icon: CalendarCheck, accent: "text-rose-400" },
];

const THEME_BANK: Record<ThemeId, string[]> = {
  tech: [
    "Adaptive systems learn from noisy signals, refine predictions, and deliver calm interfaces that feel almost invisible.",
    "A resilient cloud platform balances latency, privacy, and reliability while millions of tiny requests move through the network.",
    "Designing useful automation requires taste, constraints, observability, and the humility to keep humans in control.",
    "Modern teams ship faster when dashboards reveal bottlenecks before customers ever notice a delay.",
    "The best tools hide their complexity and let creators move from idea to polished output without friction.",
  ],
  motivation: [
    "Momentum is built through small promises kept repeatedly, especially on days when inspiration refuses to arrive.",
    "Progress rarely feels dramatic in the moment, but consistent practice quietly compounds into visible mastery.",
    "Focus is a trained skill: protect the next minute, then the next page, then the next meaningful result.",
    "Confidence grows when effort has evidence, so measure honestly and improve without turning mistakes into identity.",
    "The person who returns after a difficult attempt is already building a stronger version of their craft.",
  ],
  story: [
    "At midnight the studio lights hummed softly while a single unfinished idea waited on the screen.",
    "The city below looked like a circuit board, every window blinking with a private ambition.",
    "She opened the old notebook and found a map drawn in silver ink, pointing toward a door nobody remembered.",
    "Rain traced the glass as the composer tried one more melody, hoping the room would answer back.",
    "The elevator stopped on a floor that should not exist, and the hallway smelled faintly of ozone and paper.",
  ],
  coding: [
    "const result = await pipeline.run(input); validate(result); cache.set(key, result);",
    "A clean reducer avoids hidden mutation, returns predictable state, and makes every render easier to reason about.",
    "When a flaky test fails, isolate the clock, mock the network, and remove shared global state before blaming the runner.",
    "function score(words, errors) { return Math.max(0, words * 5 - errors * 2); }",
    "Readable code is not slow code; it is code that lets the next engineer move safely at full speed.",
  ],
  startup: [
    "A sharp product does one painful job extremely well before it expands into a broader workflow.",
    "The fastest growth loops start with a user who feels a result clearly enough to invite someone else.",
    "Premium software earns trust through speed, polish, reliability, and the absence of tiny daily annoyances.",
    "Great onboarding removes doubt, shows value quickly, and lets people feel capable before asking for commitment.",
    "A founder best dashboard is not vanity traffic but repeat usage from people who would miss the product tomorrow.",
  ],
  daily: [
    "Today is a precision drill: type with relaxed hands, steady rhythm, and careful attention to every difficult transition.",
    "Daily progress rewards patience. Keep your eyes forward, correct calmly, and let accuracy pull speed upward.",
    "The challenge is simple: stay smooth under pressure while punctuation, numbers, and mixed words test your control.",
    "Your streak grows from one focused session. Breathe, settle your shoulders, and type the line in front of you.",
    "Elite typists look effortless because their rhythm survives mistakes; recover quickly and keep moving.",
  ],
};

const KEYBOARD_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

const GLOBAL_LEADERBOARD: ResultRecord[] = [
  { id: "g1", date: "All-Time", mode: "60", theme: "tech", duration: 60, wpm: 148, rawWpm: 154, accuracy: 98, consistency: 94, correctChars: 740, incorrectChars: 12 },
  { id: "g2", date: "All-Time", mode: "60", theme: "coding", duration: 60, wpm: 132, rawWpm: 140, accuracy: 96, consistency: 91, correctChars: 660, incorrectChars: 22 },
  { id: "g3", date: "All-Time", mode: "30", theme: "story", duration: 30, wpm: 126, rawWpm: 131, accuracy: 97, consistency: 89, correctChars: 315, incorrectChars: 9 },
];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string) {
  return input.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 2166136261);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function generateParagraph(theme: ThemeId, mode: TestMode, salt = Date.now()) {
  const seed = theme === "daily" ? hashSeed(todayKey()) : hashSeed(`${theme}-${mode}-${salt}`);
  const random = seededRandom(seed);
  const bank = THEME_BANK[theme] || THEME_BANK.tech;
  const sentenceCount = mode === "120" || mode === "endless" ? 12 : mode === "60" ? 8 : 5;
  const selected: string[] = [];

  for (let index = 0; index < sentenceCount; index += 1) {
    const sentence = bank[Math.floor(random() * bank.length)];
    selected.push(sentence);
  }

  return selected.join(" ");
}

function getDuration(mode: TestMode) {
  if (mode === "endless") return null;
  return Number(mode);
}

function computeStats(input: string, target: string, elapsedSeconds: number, keyIntervals: number[]): TypingStats {
  const typed = input.length;
  let correct = 0;
  let incorrect = 0;

  for (let index = 0; index < typed; index += 1) {
    if (input[index] === target[index]) correct += 1;
    else incorrect += 1;
  }

  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);
  const wpm = Math.max(0, Math.round((correct / 5) / minutes));
  const rawWpm = Math.max(0, Math.round((typed / 5) / minutes));
  const accuracy = typed === 0 ? 100 : Math.round((correct / typed) * 100);
  const consistency = calculateConsistency(keyIntervals);

  return {
    wpm,
    rawWpm,
    accuracy,
    consistency,
    correctChars: correct,
    incorrectChars: incorrect,
  };
}

function calculateConsistency(intervals: number[]) {
  if (intervals.length < 5) return 100;
  const usable = intervals.filter((item) => item > 25 && item < 1500);
  if (usable.length < 5) return 100;
  const mean = usable.reduce((sum, value) => sum + value, 0) / usable.length;
  const variance = usable.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / usable.length;
  const deviation = Math.sqrt(variance);
  return Math.max(35, Math.min(100, Math.round(100 - (deviation / mean) * 55)));
}

function buildHeatmap(input: string, target: string) {
  const map: Record<string, number> = {};
  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== target[index]) {
      const key = (target[index] || input[index] || "").toLowerCase();
      if (/^[a-z0-9\-\=\[\]\;\',\.\/]$/.test(key)) {
        map[key] = (map[key] || 0) + 1;
      }
    }
  }
  return map;
}

function buildInsights(stats: TypingStats, heatmap: Record<string, number>) {
  const topMistake = Object.entries(heatmap).sort((a, b) => b[1] - a[1])[0];
  const insights: string[] = [];

  if (stats.accuracy < 92) {
    insights.push("Prioritize rhythm over speed. Slow down 5 WPM to reduce backspacing; speed will naturally follow once your accuracy exceeds 96%.");
  } else {
    insights.push("Exceptional accuracy foundation. Start pushing your boundaries on short 30-second sprints to unlock higher top-end speed.");
  }

  if (stats.consistency < 75) {
    insights.push("Noticeable speed spikes between word transitions. Practice reading two words ahead so your fingers move in fluid phrases rather than single keystrokes.");
  } else {
    insights.push("Steady, metronomic cadence. Your finger travel time between difficult keys is balanced and efficient.");
  }

  if (topMistake) {
    const key = topMistake[0].toUpperCase();
    const fingerHint = "QAZ1".includes(key) ? "left pinky" : "P;/0-=".includes(key) ? "right pinky" : "targeted key placement";
    insights.push(`Key '${key}' had the highest error rate (${topMistake[1]} misses). Focus on your ${fingerHint} before starting your next round.`);
  }

  return insights.slice(0, 3);
}

function getRankBadge(wpm: number, accuracy: number) {
  if (wpm >= 100 && accuracy >= 95) return { title: "Godspeed Master", color: "from-amber-400 to-emerald-400 text-black border-amber-300", icon: Crown };
  if (wpm >= 80) return { title: "Elite Typist", color: "from-emerald-400 to-teal-400 text-black border-emerald-300", icon: Trophy };
  if (wpm >= 60) return { title: "Advanced Typist", color: "from-cyan-400 to-blue-400 text-black border-cyan-300", icon: Gauge };
  if (wpm >= 40) return { title: "Fluent Typist", color: "from-indigo-400 to-purple-400 text-white border-indigo-300", icon: Zap };
  return { title: "Building Speed", color: "from-zinc-300 to-zinc-400 text-black border-white/20", icon: Target };
}

// Client-side Web Audio Synthesizer for tactile mechanical keyboard sound effects ($0 external files)
let audioCtx: AudioContext | null = null;
function playKeyClick(mode: SoundMode) {
  if (mode === "off" || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (mode === "thock") {
      // Deep mechanical switch sound
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.035);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } else {
      // Crisp typewriter click
      osc.type = "triangle";
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.025);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    }
  } catch {
    // Ignore audio policy errors
  }
}

export default function TypingSpeedTesterPage() {
  const [mode, setMode] = useState<TestMode>("60");
  const [theme, setTheme] = useState<ThemeId>("tech");
  const [targetText, setTargetText] = useState(() => generateParagraph("tech", "60", 0));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastKeyTime, setLastKeyTime] = useState<number | null>(null);
  const [keyIntervals, setKeyIntervals] = useState<number[]>([]);
  const [finalResult, setFinalResult] = useState<ResultRecord | null>(null);
  const [leaderboard, setLeaderboard] = useState<ResultRecord[]>([]);
  const [streak, setStreak] = useState<StreakState>({ date: "", streak: 0 });
  const [ghostEnabled, setGhostEnabled] = useState(false);
  const [soundMode, setSoundMode] = useState<SoundMode>("off");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const duration = getDuration(mode);
  const heatmap = useMemo(() => buildHeatmap(input, targetText), [input, targetText]);
  const liveStats = useMemo(
    () => computeStats(input, targetText, elapsed || 1, keyIntervals),
    [elapsed, input, keyIntervals, targetText]
  );
  const resultStats = finalResult ?? liveStats;
  const progress = duration
    ? Math.min(100, (elapsed / duration) * 100)
    : Math.min(100, (input.length / targetText.length) * 100);
  const remaining = duration ? Math.max(0, Math.ceil(duration - elapsed)) : null;
  const ghostWpm = mode === "30" ? 140 : mode === "120" ? 115 : 125;
  const ghostChars = Math.min(targetText.length, Math.floor((ghostWpm * 5 * elapsed) / 60));
  const insights = useMemo(() => buildInsights(resultStats, heatmap), [heatmap, resultStats]);

  // Load persistence
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedLeaderboard = getFunctionalStorageItem("exismic_typing_leaderboard");
        if (storedLeaderboard) setLeaderboard(JSON.parse(storedLeaderboard));
        const storedStreak = getFunctionalStorageItem("exismic_typing_streak");
        if (storedStreak) setStreak(JSON.parse(storedStreak));
        const storedSound = getFunctionalStorageItem("exismic_typing_sound") as SoundMode;
        if (storedSound) setSoundMode(storedSound);
      } catch {
        // Fallback
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const focusTypingArea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const resetTest = useCallback((nextTheme = theme, nextMode = mode) => {
    setTargetText(generateParagraph(nextTheme, nextMode));
    setInput("");
    setStatus("idle");
    setElapsed(0);
    setStartTime(null);
    setLastKeyTime(null);
    setKeyIntervals([]);
    setFinalResult(null);
    setCopied(false);
    window.setTimeout(() => textareaRef.current?.focus(), 50);
  }, [mode, theme]);

  const completeDailyChallenge = useCallback(() => {
    if (theme !== "daily") return;
    const today = todayKey();
    setStreak((current) => {
      if (current.date === today) return current;
      const nextStreak = current.date === yesterdayKey() ? current.streak + 1 : 1;
      const next = { date: today, streak: nextStreak };
      setFunctionalStorageItem("exismic_typing_streak", JSON.stringify(next));
      return next;
    });
  }, [theme]);

  const finishTest = useCallback((inputSnapshot = input, elapsedSnapshot = elapsed) => {
    const actualDuration = Math.max(elapsedSnapshot, 1);
    const stats = computeStats(inputSnapshot, targetText, actualDuration, keyIntervals);
    const result: ResultRecord = {
      ...stats,
      id: crypto.randomUUID(),
      mode,
      theme,
      duration: Math.round(actualDuration),
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
    setFinalResult(result);
    setStatus("finished");

    // Save to leaderboard
    setLeaderboard((prev) => {
      const updated = [result, ...prev].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).slice(0, 10);
      setFunctionalStorageItem("exismic_typing_leaderboard", JSON.stringify(updated));
      return updated;
    });

    completeDailyChallenge();
  }, [completeDailyChallenge, elapsed, input, keyIntervals, mode, targetText, theme]);

  // Main countdown timer
  useEffect(() => {
    if (status !== "running" || !startTime) return;
    const timer = window.setInterval(() => {
      const nextElapsed = (Date.now() - startTime) / 1000;
      setElapsed(nextElapsed);
      if (duration && nextElapsed >= duration) {
        window.clearInterval(timer);
        finishTest(input, duration);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [duration, finishTest, input, startTime, status]);

  // Handle keyboard input & sound
  const handleInput = (value: string) => {
    if (status === "finished") return;
    const now = Date.now();

    if (status === "idle") {
      setStatus("running");
      setStartTime(now);
      setElapsed(0);
    }

    if (value.length > input.length) {
      playKeyClick(soundMode);
      if (lastKeyTime) {
        setKeyIntervals((current) => [...current.slice(-240), now - lastKeyTime]);
      }
    }
    setLastKeyTime(now);

    const nextValue = value.slice(0, targetText.length);
    setInput(nextValue);

    if (nextValue.length >= targetText.length) {
      const nextElapsed = startTime ? (now - startTime) / 1000 : 1;
      window.setTimeout(() => finishTest(nextValue, nextElapsed), 0);
    }
  };

  // Keyboard shortcut listener (Tab or Esc to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resetTest(theme, mode);
      } else if (e.key === "Tab") {
        e.preventDefault();
        resetTest(theme, mode);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, resetTest, theme]);

  const handleModeChange = (nextMode: TestMode) => {
    setMode(nextMode);
    resetTest(theme, nextMode);
  };

  const handleThemeChange = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    resetTest(nextTheme, mode);
  };

  const toggleSound = () => {
    const next: SoundMode = soundMode === "off" ? "thock" : soundMode === "thock" ? "clicky" : "off";
    setSoundMode(next);
    setFunctionalStorageItem("exismic_typing_sound", next);
    if (next !== "off") playKeyClick(next);
  };

  const copySummary = async () => {
    const text = `Exismic Typing Test: ${resultStats.wpm} WPM | ${resultStats.accuracy}% Accuracy | ${resultStats.consistency}% Rhythm | Mode: ${mode === "endless" ? "Flow" : `${mode}s`}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const downloadResultImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#080c14");
    gradient.addColorStop(0.5, "#0b151e");
    gradient.addColorStop(1, "#071c17");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle emerald light glow
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.beginPath();
    ctx.arc(1050, 120, 260, 0, Math.PI * 2);
    ctx.fill();

    // Brand title
    ctx.fillStyle = "#10b981";
    ctx.font = "900 24px sans-serif";
    ctx.fillText("EXISMIC STUDIO • TYPING SPEED TEST", 80, 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px sans-serif";
    ctx.fillText(`${resultStats.wpm} WPM`, 80, 180);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 20px sans-serif";
    const modeLabel = mode === "endless" ? "Endless Flow" : `${mode}-Second Sprint`;
    ctx.fillText(`${modeLabel} • ${resultStats.accuracy}% Accuracy • ${resultStats.consistency}% Rhythm`, 80, 225);

    // Metric Cards
    const metrics = [
      ["Net Speed", `${resultStats.wpm} WPM`],
      ["Accuracy", `${resultStats.accuracy}%`],
      ["Rhythm", `${resultStats.consistency}%`],
      ["Total Keystrokes", `${resultStats.correctChars} / ${resultStats.correctChars + resultStats.incorrectChars}`],
    ];

    metrics.forEach(([lbl, val], idx) => {
      const x = 80 + idx * 260;
      const y = 300;
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, 240, 150, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#6ee7b7";
      ctx.font = "800 14px sans-serif";
      ctx.fillText(lbl.toUpperCase(), x + 24, y + 45);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px sans-serif";
      ctx.fillText(val, x + 24, y + 105);
    });

    // Verification link
    ctx.fillStyle = "#64748b";
    ctx.font = "600 16px sans-serif";
    ctx.fillText("Tested on exismic.ai/tools/typing-test", 80, 620);

    const link = document.createElement("a");
    link.download = `exismic-typing-${resultStats.wpm}wpm.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const rank = getRankBadge(resultStats.wpm, resultStats.accuracy);
  const RankIcon = rank.icon;

  return (
    <div className="w-full space-y-8" suppressHydrationWarning>
      {/* ==================================================================== */}
      {/* 1. HERO TYPING ARENA: FRONT, CENTER & MESMERIZING                     */}
      {/* ==================================================================== */}
      <section className="rounded-3xl border-2 border-emerald-500/25 bg-[#090d16]/95 p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.08)] backdrop-blur-2xl">
        
        {/* Sleek Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          {/* Duration Mode Pills */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1">
            {MODE_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleModeChange(item.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                  mode === item.id
                    ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{item.label}</span>
                <span className={cn("text-[9px] uppercase opacity-75 font-semibold", mode === item.id ? "text-black" : "text-zinc-500")}>
                  {item.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Action Toggles */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle (Off / Thock / Clicky) */}
            <button
              type="button"
              onClick={toggleSound}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                soundMode !== "off"
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              )}
              title="Click to cycle typing sound effects (Off, Thock, Clicky)"
            >
              {soundMode === "off" ? <VolumeX size={14} /> : <Volume2 size={14} className="text-emerald-400" />}
              <span className="capitalize">{soundMode === "off" ? "Muted" : soundMode}</span>
            </button>

            {/* Ghost Mode Toggle */}
            <button
              type="button"
              onClick={() => setGhostEnabled(!ghostEnabled)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                ghostEnabled
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              )}
              title="Race against a simulated 125 WPM top typist"
            >
              <Zap size={14} />
              <span>Ghost {ghostEnabled ? "On" : "Pace"}</span>
            </button>

            {/* Quick Restart Button */}
            <button
              type="button"
              onClick={() => resetTest(theme, mode)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              title="Quick restart (Shortcut: Tab or Esc)"
            >
              <RefreshCw size={13} className={status === "running" ? "animate-spin" : ""} />
              <span className="hidden sm:inline">New Text</span>
            </button>
          </div>
        </div>

        {/* Topic Category Strip */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">
            Topic:
          </span>
          {THEMES.map((item) => {
            const Icon = item.icon;
            const isActive = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleThemeChange(item.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-medium transition-all active:scale-95",
                  isActive
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-sm"
                    : "border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <Icon size={12} className={isActive ? "text-emerald-400" : item.accent} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live HUD Telemetry Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-y border-white/5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Gauge size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Net WPM</p>
              <p className="text-2xl font-black text-white tracking-tight">{liveStats.wpm}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Target size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Accuracy</p>
              <p className={cn(
                "text-2xl font-black tracking-tight",
                liveStats.accuracy >= 96 ? "text-emerald-400" : liveStats.accuracy >= 90 ? "text-amber-400" : "text-rose-400"
              )}>
                {liveStats.accuracy}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <LineChart size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rhythm</p>
              <p className="text-2xl font-black text-white tracking-tight">{liveStats.consistency}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Timer size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {mode === "endless" ? "Elapsed Time" : "Time Left"}
              </p>
              <p className="text-2xl font-black text-amber-300 tracking-tight">
                {mode === "endless" ? `${Math.floor(elapsed)}s` : `${remaining ?? mode}s`}
              </p>
            </div>
          </div>
        </div>

        {/* Slim Progress Bar */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: "linear" }}
          />
        </div>

        {/* ================================================================ */}
        {/* INTERACTIVE TYPING STAGE                                         */}
        {/* ================================================================ */}
        <div
          onClick={focusTypingArea}
          className="relative mt-5 min-h-[260px] cursor-text rounded-2xl border border-emerald-500/20 bg-black/60 p-6 sm:p-8 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] overflow-hidden transition-all focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.12)]"
        >
          {/* Subtle Ghost Bar */}
          {ghostEnabled && status === "running" && (
            <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span>Ghost Target Pace: {ghostWpm} WPM</span>
              </div>
              <span className="font-mono text-[10px] text-amber-200/80">
                {Math.round((ghostChars / targetText.length) * 100)}% Complete
              </span>
            </div>
          )}

          {/* Hidden Actual Native Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            disabled={status === "finished"}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            className="absolute inset-0 z-20 h-full w-full opacity-0 cursor-text resize-none p-6 outline-none"
            aria-label="Typing test input arena"
          />

          {/* Rendered Text with High-Contrast Typography & Caret */}
          <div className="relative z-10 font-mono text-xl sm:text-2xl leading-[2.1] font-medium select-none tracking-normal break-words">
            {targetText.split("").map((char, index) => {
              const typed = input[index];
              const isCurrent = index === input.length && status !== "finished";
              const isCorrect = typed === char;
              const isWrong = typed !== undefined && typed !== char;
              const isGhost = ghostEnabled && status === "running" && index === ghostChars;

              return (
                <span
                  key={`${char}-${index}`}
                  className={cn(
                    "relative transition-colors duration-75 rounded-[3px]",
                    typed === undefined && "text-zinc-500",
                    typed !== undefined && isCorrect && "text-emerald-300 font-semibold",
                    isWrong && "bg-red-500/30 text-red-200 font-bold px-0.5",
                    isCurrent && "border-b-2 border-emerald-400 text-white bg-emerald-500/20 animate-pulse",
                    isGhost && "ring-1 ring-amber-400/50"
                  )}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Floating Instructions when Idle */}
          {status === "idle" && (
            <div className="pointer-events-none mt-6 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md animate-bounce">
                <Keyboard size={14} />
                <span>Click here or begin typing to start</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom Arena Footer Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Correct: <strong className="text-white">{liveStats.correctChars}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Mistakes: <strong className="text-white">{liveStats.incorrectChars}</strong>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="hidden sm:inline text-zinc-500">
              Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">Esc</kbd> or{" "}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">Tab</kbd> to restart
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === "running" && (
              <button
                type="button"
                onClick={() => finishTest(input, elapsed)}
                className="rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 transition-all active:scale-95"
              >
                Finish Early
              </button>
            )}
            <button
              type="button"
              onClick={() => resetTest(theme, mode)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. CELEBRATORY TEST REPORT CARD (Shown on finish)                    */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {status === "finished" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl border-2 border-emerald-500/40 bg-[#090e18] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] space-y-6"
          >
            {/* Header with Rank Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Test Completed Successfully
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">Your Typing Scorecard</h3>
              </div>

              {/* Dynamic Speed Tier Badge */}
              <div className={cn("flex items-center gap-2 rounded-2xl border px-4 py-2 font-black text-xs shadow-md bg-gradient-to-r", rank.color)}>
                <RankIcon size={16} />
                <span>{rank.title}</span>
              </div>
            </div>

            {/* 4 Large Highlight Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Net Speed</span>
                  <Gauge size={18} />
                </div>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-white">{resultStats.wpm}</p>
                <p className="mt-1 text-[11px] text-zinc-400">Words Per Minute</p>
              </div>

              <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 sm:p-5">
                <div className="flex items-center justify-between text-teal-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Accuracy</span>
                  <Target size={18} />
                </div>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-white">{resultStats.accuracy}%</p>
                <p className="mt-1 text-[11px] text-zinc-400">{resultStats.incorrectChars} typing errors</p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 sm:p-5">
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Consistency</span>
                  <LineChart size={18} />
                </div>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-white">{resultStats.consistency}%</p>
                <p className="mt-1 text-[11px] text-zinc-400">Rhythm stability score</p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 sm:p-5">
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Raw Keystrokes</span>
                  <Keyboard size={18} />
                </div>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-white">{resultStats.rawWpm}</p>
                <p className="mt-1 text-[11px] text-zinc-400">Raw typing velocity</p>
              </div>
            </div>

            {/* Improvement Insights Callout */}
            {insights.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <Brain size={15} />
                  <span>Personalized Typing Insights</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {insights.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-xs text-zinc-300 leading-relaxed font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => resetTest(theme, mode)}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black shadow-md hover:bg-emerald-400 transition-all active:scale-95"
              >
                <RefreshCw size={14} />
                <span>Start Another Round</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copySummary}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-white/10 transition-all"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? "Score Copied!" : "Copy Result"}</span>
                </button>

                <button
                  type="button"
                  onClick={downloadResultImage}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
                >
                  <Award size={14} />
                  <span>Share Card (PNG)</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* 3. BALANCED POWER STATION: HEATMAP, STREAK & LOCAL BEST             */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Visual Keyboard Heatmap */}
        <section className="rounded-3xl border border-emerald-500/20 bg-[#090d16]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Keyboard size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Visual Keystroke Heatmap</h4>
                <p className="text-[10px] text-zinc-400">Error hotspots highlight keys with frequent misses</p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-zinc-500 uppercase">QWERTY Layout</span>
          </div>

          {/* Interactive Keyboard Matrix */}
          <div className="space-y-1.5 pt-1">
            {KEYBOARD_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1">
                {row.map((key) => {
                  const errorCount = heatmap[key] || 0;
                  const hasErrors = errorCount > 0;
                  return (
                    <div
                      key={key}
                      className={cn(
                        "h-8 min-w-[28px] sm:min-w-[34px] rounded-lg border flex items-center justify-center text-[10px] font-mono font-bold uppercase transition-all",
                        !hasErrors && "border-white/5 bg-white/[0.03] text-zinc-400",
                        hasErrors && errorCount === 1 && "border-amber-500/40 bg-amber-500/20 text-amber-200",
                        hasErrors && errorCount >= 2 && "border-rose-500/50 bg-rose-500/25 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      )}
                      title={`Key: ${key.toUpperCase()} (${errorCount} errors)`}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Top Misses Pill Summary */}
          <div className="border-t border-white/5 pt-3">
            {Object.keys(heatmap).length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Top Problem Keys:</span>
                {Object.entries(heatmap)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([key, count]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-300 font-mono"
                    >
                      <span>{key.toUpperCase()}</span>
                      <span className="text-[9px] opacity-75">({count}x)</span>
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Zero key errors recorded in this current session. Keep it steady!</span>
              </p>
            )}
          </div>
        </section>

        {/* Right Column: Daily Streak & Top Personal Bests */}
        <section className="rounded-3xl border border-emerald-500/20 bg-[#090d16]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Daily Streak & Best Scores</h4>
                <p className="text-[10px] text-zinc-400">Build consistency with daily typing drills</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-300">
              <Flame size={13} className="text-amber-400" />
              <span>{streak.streak} Day Streak</span>
            </div>
          </div>

          {/* Quick Streak Booster Button */}
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white">Daily Challenge Drill</p>
              <p className="text-[10px] text-zinc-400">Complete today&apos;s focused paragraph to maintain your streak</p>
            </div>
            <button
              type="button"
              onClick={() => handleThemeChange("daily")}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-md hover:scale-105 transition-all"
            >
              Start Today&apos;s Drill
            </button>
          </div>

          {/* Local Scoreboard */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              <span>Recent Best Runs</span>
              <span>Speed / Acc</span>
            </div>

            <div className="space-y-1.5">
              {(leaderboard.length > 0 ? leaderboard.slice(0, 4) : GLOBAL_LEADERBOARD).map((rec, idx) => (
                <div
                  key={`${rec.id}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 px-3.5 py-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black",
                      idx === 0 ? "bg-amber-400 text-black" : "bg-white/10 text-zinc-300"
                    )}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white capitalize">{rec.theme} ({rec.mode === "endless" ? "Flow" : `${rec.mode}s`})</p>
                      <p className="text-[9px] text-zinc-500">{rec.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm font-black text-emerald-400">{rec.wpm} WPM</span>
                    <span className="block text-[9px] text-zinc-500">{rec.accuracy}% acc</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
