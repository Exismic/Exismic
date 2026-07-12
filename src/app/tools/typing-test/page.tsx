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
  Crown,
  Flame,
  Gauge,
  LineChart,
  RefreshCw,
  Share2,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Type,
  Wand2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFunctionalStorageItem, setFunctionalStorageItem } from "@/lib/cookie-consent";

type TestMode = "30" | "60" | "120" | "endless";
type ThemeId = "tech" | "motivation" | "story" | "coding" | "startup" | "daily";
type Status = "idle" | "running" | "finished";

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

const MODE_OPTIONS: Array<{ id: TestMode; label: string; description: string }> = [
  { id: "30", label: "30s", description: "Sprint" },
  { id: "60", label: "60s", description: "Classic" },
  { id: "120", label: "120s", description: "Endurance" },
  { id: "endless", label: "Endless", description: "Flow" },
];

const THEMES: Array<{ id: ThemeId; label: string; icon: typeof Sparkles; accent: string }> = [
  { id: "tech", label: "Tech", icon: Activity, accent: "text-cyan-300" },
  { id: "motivation", label: "Motivation", icon: Flame, accent: "text-amber-300" },
  { id: "story", label: "Storytelling", icon: Wand2, accent: "text-pink-300" },
  { id: "coding", label: "Coding", icon: Type, accent: "text-emerald-300" },
  { id: "startup", label: "Startup", icon: Brain, accent: "text-purple-300" },
  { id: "daily", label: "Daily Challenge", icon: CalendarCheck, accent: "text-blue-300" },
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
    "A founder's best dashboard is not vanity traffic but repeat usage from people who would miss the product tomorrow.",
  ],
  daily: [
    "Today is a precision drill: type with relaxed hands, steady rhythm, and careful attention to every difficult transition.",
    "Daily progress rewards patience. Keep your eyes forward, correct calmly, and let accuracy pull speed upward.",
    "The challenge is simple: stay smooth under pressure while punctuation, numbers, and mixed words test your control.",
    "Your streak grows from one focused session. Breathe, settle your shoulders, and type the line in front of you.",
    "Elite typists look effortless because their rhythm survives mistakes; recover quickly and keep moving.",
  ],
};

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

const GLOBAL_LEADERBOARD: ResultRecord[] = [
  { id: "g1", date: "Elite", mode: "60", theme: "tech", duration: 60, wpm: 168, rawWpm: 174, accuracy: 98, consistency: 94, correctChars: 820, incorrectChars: 14 },
  { id: "g2", date: "Elite", mode: "60", theme: "coding", duration: 60, wpm: 151, rawWpm: 160, accuracy: 96, consistency: 91, correctChars: 739, incorrectChars: 27 },
  { id: "g3", date: "Elite", mode: "30", theme: "story", duration: 30, wpm: 142, rawWpm: 149, accuracy: 97, consistency: 89, correctChars: 348, incorrectChars: 11 },
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
  const bank = THEME_BANK[theme];
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
      if (/^[a-z0-9]$/.test(key)) map[key] = (map[key] || 0) + 1;
    }
  }
  return map;
}

function buildInsights(stats: TypingStats, heatmap: Record<string, number>, input: string, target: string) {
  const topMistake = Object.entries(heatmap).sort((a, b) => b[1] - a[1])[0];
  const typedNumbers = /\d/.test(input);
  const targetHasNumbers = /\d/.test(target);
  const insights: string[] = [];

  if (stats.accuracy < 92) insights.push("Slow down slightly and rebuild accuracy first. Your speed will climb faster once corrections drop.");
  else insights.push("Your accuracy base is strong. Start pushing short 30s sprints to raise your ceiling.");

  if (stats.consistency < 75) insights.push("Your rhythm is spiky. Try typing in smooth word groups instead of reacting character by character.");
  else insights.push("Your cadence is stable. Keep that rhythm and gradually increase pace.");

  if (topMistake) {
    const fingerHint = "qaz".includes(topMistake[0]) ? "left pinky" : "p;/".includes(topMistake[0]) ? "right pinky" : "targeted finger";
    insights.push(`Most errors came from "${topMistake[0].toUpperCase()}". Add a 2-minute ${fingerHint} drill before your next test.`);
  }

  if (targetHasNumbers && !typedNumbers) insights.push("Numbers appeared in the text, but you avoided or missed them. Practice number-row transitions.");
  if (stats.wpm >= 100 && stats.accuracy >= 96) insights.push("Elite session. Your next gain will come from reducing hesitation after punctuation.");

  return insights.slice(0, 4);
}

function saveResult(result: ResultRecord) {
  const stored = getFunctionalStorageItem("exismic_typing_leaderboard");
  const current = stored ? (JSON.parse(stored) as ResultRecord[]) : [];
  const next = [result, ...current]
    .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
    .slice(0, 12);
  setFunctionalStorageItem("exismic_typing_leaderboard", JSON.stringify(next));
  return next;
}

function loadLeaderboard() {
  if (typeof window === "undefined") return [];
  try {
    const stored = getFunctionalStorageItem("exismic_typing_leaderboard");
    return stored ? (JSON.parse(stored) as ResultRecord[]) : [];
  } catch {
    return [];
  }
}

function loadStreak(): StreakState {
  if (typeof window === "undefined") return { date: "", streak: 0 };
  try {
    const stored = getFunctionalStorageItem("exismic_typing_streak");
    return stored ? (JSON.parse(stored) as StreakState) : { date: "", streak: 0 };
  } catch {
    return { date: "", streak: 0 };
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
  const [ghostEnabled, setGhostEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const duration = getDuration(mode);
  const heatmap = useMemo(() => buildHeatmap(input, targetText), [input, targetText]);
  const liveStats = useMemo(() => computeStats(input, targetText, elapsed || 1, keyIntervals), [elapsed, input, keyIntervals, targetText]);
  const resultStats = finalResult ?? liveStats;
  const progress = duration ? Math.min(100, (elapsed / duration) * 100) : Math.min(100, (input.length / targetText.length) * 100);
  const remaining = duration ? Math.max(0, Math.ceil(duration - elapsed)) : null;
  const ghostWpm = mode === "30" ? 145 : mode === "120" ? 122 : 132;
  const ghostChars = Math.min(targetText.length, Math.floor((ghostWpm * 5 * elapsed) / 60));
  const insights = useMemo(() => buildInsights(resultStats, heatmap, input, targetText), [heatmap, input, resultStats, targetText]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLeaderboard(loadLeaderboard());
      setStreak(loadStreak());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const focusTypingArea = () => textareaRef.current?.focus();

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
    setLeaderboard(saveResult(result));
    completeDailyChallenge();
  }, [completeDailyChallenge, elapsed, input, keyIntervals, mode, targetText, theme]);

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

  const handleModeChange = (nextMode: TestMode) => {
    setMode(nextMode);
    resetTest(theme, nextMode);
  };

  const handleThemeChange = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    resetTest(nextTheme, mode);
  };

  const handleInput = (value: string) => {
    if (status === "finished") return;
    const now = Date.now();
    if (status === "idle") {
      setStatus("running");
      setStartTime(now);
      setElapsed(0);
    }
    if (lastKeyTime && value.length > input.length) {
      setKeyIntervals((current) => [...current.slice(-240), now - lastKeyTime]);
    }
    setLastKeyTime(now);

    const nextValue = value.slice(0, targetText.length);
    setInput(nextValue);

    if (nextValue.length >= targetText.length) {
      const nextElapsed = startTime ? (now - startTime) / 1000 : 1;
      window.setTimeout(() => finishTest(nextValue, nextElapsed), 0);
    }
  };

  const copySummary = async () => {
    const text = `Exismic Typing Test: ${resultStats.wpm} WPM, ${resultStats.accuracy}% accuracy, ${resultStats.consistency}% consistency.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadResultImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 860;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#050816");
    gradient.addColorStop(0.5, "#13051f");
    gradient.addColorStop(1, "#031822");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(168,85,247,0.22)";
    ctx.beginPath();
    ctx.arc(1180, 90, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(6,182,212,0.14)";
    ctx.beginPath();
    ctx.arc(160, 760, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 74px Arial";
    ctx.fillText("Exismic Typing Test", 90, 130);
    ctx.font = "700 28px Arial";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText(`${THEMES.find((item) => item.id === theme)?.label} • ${mode === "endless" ? "Endless" : `${mode}s`} • ${new Date().toLocaleDateString()}`, 94, 178);

    const cards = [
      ["WPM", resultStats.wpm],
      ["Accuracy", `${resultStats.accuracy}%`],
      ["Consistency", `${resultStats.consistency}%`],
      ["Errors", resultStats.incorrectChars],
    ];
    cards.forEach(([label, value], index) => {
      const x = 90 + index * 310;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, 260, 260, 190, 34);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#a78bfa";
      ctx.font = "900 22px Arial";
      ctx.fillText(String(label).toUpperCase(), x + 32, 318);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 68px Arial";
      ctx.fillText(String(value), x + 32, 395);
    });

    ctx.fillStyle = "#d1d5db";
    ctx.font = "700 32px Arial";
    ctx.fillText("AI Coach", 94, 560);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 26px Arial";
    insights.slice(0, 3).forEach((tip, index) => {
      ctx.fillText(`${index + 1}. ${tip.slice(0, 82)}`, 96, 615 + index * 50);
    });

    ctx.fillStyle = "#22d3ee";
    ctx.font = "900 28px Arial";
    ctx.fillText("exismic.ai/tools/typing-test", 94, 810);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `exismic-typing-${resultStats.wpm}wpm.png`;
    link.click();
  };

  const topMistakes = Object.entries(heatmap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#020204] text-white overflow-x-hidden selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.1),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:48px_48px] opacity-40" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28 space-y-8">
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 text-[10px] font-black uppercase tracking-widest text-cyan-200">
                  <Sparkles size={14} />
                  AI Typing Lab
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-none">
                    Typing Speed Tester
                  </h1>
                  <p className="max-w-2xl text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
                    Train WPM, accuracy, consistency, weak keys, and daily streaks in a focused premium typing arena.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-3">
                {MODE_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleModeChange(item.id)}
                    className={cn(
                      "min-h-14 rounded-2xl border px-4 text-left transition-all active:scale-95",
                      mode === item.id
                        ? "border-purple-300/40 bg-purple-400/15 shadow-[0_0_30px_rgba(168,85,247,0.12)]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    )}
                  >
                    <span className="block text-sm font-black text-white">{item.label}</span>
                    <span className="block text-[10px] font-bold uppercase text-zinc-500">{item.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <section className="rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-white/[0.035] backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 p-4 sm:p-5">
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleThemeChange(item.id)}
                        className={cn(
                          "min-h-11 rounded-2xl px-4 flex items-center gap-2 text-[10px] font-black uppercase transition-all active:scale-95",
                          theme === item.id ? "bg-white text-black" : "bg-black/30 border border-white/10 text-zinc-400 hover:text-white"
                        )}
                      >
                        <Icon size={14} className={theme === item.id ? "text-black" : item.accent} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => resetTest(theme, mode)}
                    className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[10px] font-black uppercase text-zinc-300 hover:text-white transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    New Paragraph
                  </button>
                  <button
                    onClick={() => setGhostEnabled((value) => !value)}
                    className={cn(
                      "min-h-11 rounded-2xl px-4 text-[10px] font-black uppercase transition-all flex items-center gap-2",
                      ghostEnabled ? "bg-cyan-300 text-black" : "border border-white/10 bg-white/[0.04] text-zinc-400"
                    )}
                  >
                    <Zap size={14} />
                    Ghost Mode
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 border-b border-white/10">
                <MetricCard icon={Gauge} label="WPM" value={liveStats.wpm} accent="text-cyan-300" />
                <MetricCard icon={Target} label="Accuracy" value={`${liveStats.accuracy}%`} accent="text-emerald-300" />
                <MetricCard icon={LineChart} label="Consistency" value={`${liveStats.consistency}%`} accent="text-purple-300" />
                <MetricCard icon={Timer} label={mode === "endless" ? "Elapsed" : "Time Left"} value={mode === "endless" ? `${Math.floor(elapsed)}s` : `${remaining ?? mode}s`} accent="text-amber-300" />
              </div>

              <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-300"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>

                <div
                  onClick={focusTypingArea}
                  className="relative min-h-[320px] cursor-text rounded-[1.75rem] sm:rounded-[2.25rem] border border-white/10 bg-[#050509]/90 p-5 sm:p-8 lg:p-10 shadow-inner overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
                  {ghostEnabled && status === "running" && (
                    <div className="absolute left-5 right-5 sm:left-8 sm:right-8 top-5 sm:top-7">
                      <div className="relative h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full bg-amber-300/70"
                          animate={{ width: `${Math.min(100, (ghostChars / targetText.length) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-[10px] font-black uppercase text-amber-200/80">Ghost pace: top typist at {ghostWpm} WPM</div>
                    </div>
                  )}

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => handleInput(event.target.value)}
                    disabled={status === "finished"}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="absolute inset-0 z-20 h-full w-full resize-none bg-transparent p-5 sm:p-8 lg:p-10 text-transparent caret-cyan-300 outline-none"
                    aria-label="Typing test input"
                  />

                  <div className="relative z-10 pt-10 sm:pt-8 text-xl sm:text-2xl lg:text-3xl leading-[1.8] font-semibold text-zinc-500 select-none">
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
                            "relative rounded-[0.35rem] transition-colors duration-100",
                            typed === undefined && "text-zinc-500",
                            typed !== undefined && isCorrect && "text-white",
                            isWrong && "bg-red-500/25 text-red-200",
                            isCurrent && "bg-cyan-300/20 text-cyan-100 animate-pulse",
                            isGhost && "after:absolute after:-top-5 after:left-1/2 after:h-4 after:w-px after:bg-amber-300"
                          )}
                        >
                          {char === " " ? "\u00A0" : char}
                        </span>
                      );
                    })}
                  </div>

                  {status === "idle" && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
                      <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 backdrop-blur-xl">
                        Click here and start typing
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase text-zinc-500">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">Correct {liveStats.correctChars}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">Errors {liveStats.incorrectChars}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">Raw {liveStats.rawWpm} WPM</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">Streak {streak.streak} days</span>
                  </div>

                  <div className="flex gap-3">
                    {status === "running" && (
                      <button onClick={() => finishTest(input, elapsed)} className="min-h-12 rounded-2xl bg-white text-black px-5 text-xs font-black uppercase transition-all hover:bg-zinc-200">
                        Finish Test
                      </button>
                    )}
                    <button onClick={() => resetTest(theme, mode)} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-xs font-black uppercase text-zinc-300 transition-all hover:text-white">
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <Panel title="Daily Challenge" icon={CalendarCheck}>
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                  <div className="flex items-center gap-3">
                    <Flame className="text-amber-300" size={22} />
                    <div>
                      <p className="text-2xl font-black text-white">{streak.streak}</p>
                      <p className="text-[10px] font-black uppercase text-amber-100/70">Day streak</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleThemeChange("daily")}
                  className="w-full min-h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-purple-500 text-white text-xs font-black uppercase shadow-[0_18px_40px_rgba(168,85,247,0.18)] transition-all hover:scale-[1.02] active:scale-95"
                >
                  Start Today&apos;s Drill
                </button>
              </div>
            </Panel>

            <Panel title="Typing Heatmap" icon={BarChart3}>
              <div className="space-y-4">
                <div className="space-y-2">
                  {KEY_ROWS.map((row) => (
                    <div key={row} className="flex justify-center gap-1.5">
                      {row.split("").map((key) => {
                        const count = heatmap[key] || 0;
                        return (
                          <div
                            key={key}
                            className={cn(
                              "h-9 min-w-8 rounded-lg border border-white/10 flex items-center justify-center text-[10px] font-black uppercase",
                              count === 0 && "bg-white/[0.03] text-zinc-600",
                              count > 0 && count < 3 && "bg-amber-400/15 text-amber-200",
                              count >= 3 && "bg-red-500/20 text-red-200 shadow-[0_0_18px_rgba(239,68,68,0.12)]"
                            )}
                          >
                            {key}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {topMistakes.length > 0 ? topMistakes.map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-xs">
                      <span className="font-black uppercase text-white">{key}</span>
                      <span className="text-zinc-500 font-bold">{count} misses</span>
                    </div>
                  )) : (
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">No errors yet. The heatmap wakes up as soon as mistakes appear.</p>
                  )}
                </div>
              </div>
            </Panel>

            <Panel title="Leaderboard" icon={Trophy}>
              <Leaderboard records={leaderboard.length ? leaderboard : GLOBAL_LEADERBOARD} local={leaderboard.length > 0} />
            </Panel>
          </aside>
        </section>

        <AnimatePresence>
          {status === "finished" && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 sm:p-8 space-y-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-300/10 border border-emerald-300/20 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-200">
                    <CheckCircle2 size={13} />
                    Test Complete
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white">Your Typing Report</h2>
                  <p className="text-zinc-500 text-sm font-medium">AI-style coaching, result cards, heatmap, and shareable image are ready.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={copySummary} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-xs font-black uppercase text-zinc-200 flex items-center justify-center gap-2">
                    <Share2 size={16} />
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                  <button onClick={downloadResultImage} className="min-h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-5 text-xs font-black uppercase text-white flex items-center justify-center gap-2 shadow-[0_18px_50px_rgba(6,182,212,0.15)]">
                    <Award size={16} />
                    Share Image
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <ResultCard label="WPM" value={resultStats.wpm} icon={Gauge} />
                <ResultCard label="Accuracy" value={`${resultStats.accuracy}%`} icon={Target} />
                <ResultCard label="Consistency" value={`${resultStats.consistency}%`} icon={LineChart} />
                <ResultCard label="Errors" value={resultStats.incorrectChars} icon={Zap} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Panel title="Improvement Insights" icon={Brain}>
                  <div className="space-y-3">
                    {insights.map((item, index) => (
                      <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-400/15 text-xs font-black text-purple-200">{index + 1}</div>
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel title="Local + Global Board" icon={Crown}>
                  <Leaderboard records={[...(leaderboard.length ? leaderboard.slice(0, 4) : []), ...GLOBAL_LEADERBOARD].slice(0, 6)} local />
                </Panel>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, accent }: { icon: typeof Activity; label: string; value: string | number; accent: string }) {
  return (
    <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r last:border-r-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase text-zinc-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-white">{value}</p>
        </div>
        <Icon className={accent} size={24} />
      </div>
    </div>
  );
}

function ResultCard({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
      <Icon size={22} className="text-cyan-300" />
      <p className="mt-5 text-[10px] font-black uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl sm:text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-2xl p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10">
          <Icon size={18} className="text-cyan-300" />
        </div>
        <h3 className="text-sm font-black uppercase text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Leaderboard({ records, local }: { records: ResultRecord[]; local?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-600">
        <span>{local ? "Local board" : "Global preview"}</span>
        <span>WPM</span>
      </div>
      {records.slice(0, 6).map((record, index) => (
        <div key={`${record.id}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
              index === 0 ? "bg-amber-300 text-black" : "bg-white/[0.06] text-zinc-400"
            )}>
              {index + 1}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase text-white truncate">{record.theme} / {record.mode === "endless" ? "Flow" : `${record.mode}s`}</p>
              <p className="text-[10px] font-bold text-zinc-600">{record.accuracy}% acc • {record.consistency}% rhythm</p>
            </div>
          </div>
          <p className="text-lg font-black text-cyan-200">{record.wpm}</p>
        </div>
      ))}
    </div>
  );
}
