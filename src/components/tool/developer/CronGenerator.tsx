"use client";

import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Copy, 
  Check, 
  Calendar, 
  Sliders, 
  Layers, 
  RotateCcw, 
  Terminal,
  CheckCircle2,
  CalendarDays,
  FileCode,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";

// ============================================================================
// CURATED CRON BLUEPRINTS (Zero Tech Jargon, 100% Everyday English)
// ============================================================================

export interface CronBlueprint {
  id: string;
  name: string;
  description: string;
  tag: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export const CRON_BLUEPRINTS: CronBlueprint[] = [
  {
    id: "five-mins",
    name: "High-Frequency Polling",
    description: "Triggers every 5 minutes around the clock for queues and cache warmup.",
    tag: "High Frequency",
    minute: "*/5",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  },
  {
    id: "hourly-heartbeat",
    name: "Hourly Service Pulse",
    description: "Triggers at the start of every hour (00 min) for health checks and syncs.",
    tag: "Hourly",
    minute: "0",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  },
  {
    id: "nightly-backup",
    name: "Nightly Database Backup",
    description: "Triggers every night exactly at midnight (00:00) during low traffic.",
    tag: "Daily Nightly",
    minute: "0",
    hour: "0",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  },
  {
    id: "weekly-digest",
    name: "Weekly Analytics Digest",
    description: "Triggers every Monday morning at 9:00 AM for weekly recap emails.",
    tag: "Weekly",
    minute: "0",
    hour: "9",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "1",
  },
  {
    id: "monthly-billing",
    name: "Monthly Billing Settlement",
    description: "Triggers on the 1st of every month at midnight to reconcile balances.",
    tag: "Monthly",
    minute: "0",
    hour: "0",
    dayOfMonth: "1",
    month: "*",
    dayOfWeek: "*",
  },
  {
    id: "weekend-maintenance",
    name: "Sunday Maintenance Window",
    description: "Triggers every Sunday at 2:00 AM for database vacuuming and updates.",
    tag: "Maintenance",
    minute: "0",
    hour: "2",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "0",
  },
];

const COMMON_MINUTE_OPTIONS = [
  { label: "Every Minute (*)", value: "*" },
  { label: "Every 5 Mins (*/5)", value: "*/5" },
  { label: "Every 15 Mins (*/15)", value: "*/15" },
  { label: "Every 30 Mins (*/30)", value: "*/30" },
  { label: "At Minute 0 (0)", value: "0" },
];

const COMMON_HOUR_OPTIONS = [
  { label: "Every Hour (*)", value: "*" },
  { label: "Every 2 Hours (*/2)", value: "*/2" },
  { label: "Midnight (0)", value: "0" },
  { label: "9:00 AM (9)", value: "9" },
  { label: "Noon (12)", value: "12" },
  { label: "6:00 PM (18)", value: "18" },
];

export default function CronGenerator() {
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("five-mins");
  const [minute, setMinute] = useState("*/5");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [customCommand, setCustomCommand] = useState("/usr/bin/curl -s https://api.exismic.xyz/jobs/sync");
  const [copiedExpression, setCopiedExpression] = useState(false);
  const [copiedCrontab, setCopiedCrontab] = useState(false);

  const cronExpression = useMemo(() => {
    return `${minute.trim() || "*"} ${hour.trim() || "*"} ${dayOfMonth.trim() || "*"} ${month.trim() || "*"} ${dayOfWeek.trim() || "*"}`;
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  // Apply Blueprint
  const applyBlueprint = (bp: CronBlueprint) => {
    setActiveBlueprintId(bp.id);
    setMinute(bp.minute);
    setHour(bp.hour);
    setDayOfMonth(bp.dayOfMonth);
    setMonth(bp.month);
    setDayOfWeek(bp.dayOfWeek);
  };

  // Plain English Human Translation
  const humanExplanation = useMemo(() => {
    // Specific exact matches
    if (cronExpression === "* * * * *") return "Runs continuously every single minute.";
    if (cronExpression === "*/5 * * * *") return "Runs every 5 minutes throughout the day.";
    if (cronExpression === "*/15 * * * *") return "Runs every 15 minutes past every hour.";
    if (cronExpression === "*/30 * * * *") return "Runs every 30 minutes past every hour.";
    if (cronExpression === "0 * * * *") return "Runs once every hour, right at minute 00.";
    if (cronExpression === "0 */2 * * *") return "Runs every 2 hours, right on the hour.";
    if (cronExpression === "0 0 * * *") return "Runs every day at midnight (00:00).";
    if (cronExpression === "0 9 * * 1") return "Runs every week on Monday at 9:00 AM.";
    if (cronExpression === "0 9 * * 1-5") return "Runs Monday through Friday at 9:00 AM.";
    if (cronExpression === "0 0 1 * *") return "Runs on the 1st day of every month at midnight.";
    if (cronExpression === "0 2 * * 0") return "Runs every Sunday at 2:00 AM.";

    // Analytical breakdown
    const parts: string[] = [];

    // Minute
    if (minute === "*") parts.push("every minute");
    else if (minute.startsWith("*/")) parts.push(`every ${minute.replace("*/", "")} minutes`);
    else parts.push(`at minute ${minute}`);

    // Hour
    if (hour === "*") {
      if (minute !== "*") parts.push("of every hour");
    } else if (hour.startsWith("*/")) {
      parts.push(`every ${hour.replace("*/", "")} hours`);
    } else {
      const h = parseInt(hour);
      if (!isNaN(h)) {
        const ampm = h >= 12 ? "PM" : "AM";
        const displayH = h % 12 === 0 ? 12 : h % 12;
        parts.push(`during the ${displayH}:00 ${ampm} hour`);
      } else {
        parts.push(`at hour ${hour}`);
      }
    }

    // Day of Month
    if (dayOfMonth !== "*") {
      parts.push(`on day ${dayOfMonth} of the month`);
    }

    // Month
    if (month !== "*") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mNum = parseInt(month);
      if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
        parts.push(`in ${monthNames[mNum - 1]}`);
      } else {
        parts.push(`in month ${month}`);
      }
    }

    // Day of Week
    if (dayOfWeek !== "*") {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dNum = parseInt(dayOfWeek);
      if (!isNaN(dNum) && dNum >= 0 && dNum <= 6) {
        parts.push(`specifically on ${dayNames[dNum]}`);
      } else if (dayOfWeek === "1-5") {
        parts.push("Monday through Friday");
      } else {
        parts.push(`on day-of-week ${dayOfWeek}`);
      }
    }

    const assembled = parts.join(", ");
    return `Runs ${assembled}.`;
  }, [cronExpression, minute, hour, dayOfMonth, month, dayOfWeek]);

  // Projected next 5 run times simulation
  const nextRuns = useMemo(() => {
    const runs: string[] = [];
    const now = new Date();

    // Check simple patterns
    if (cronExpression === "*/5 * * * *") {
      const currentMin = now.getMinutes();
      const nextMin = Math.ceil((currentMin + 1) / 5) * 5;
      for (let i = 0; i < 5; i++) {
        const target = new Date(now);
        target.setMinutes(nextMin + i * 5, 0, 0);
        runs.push(target.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } else if (cronExpression === "0 * * * *") {
      for (let i = 1; i <= 5; i++) {
        const target = new Date(now);
        target.setHours(target.getHours() + i, 0, 0, 0);
        runs.push(target.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }));
      }
    } else if (cronExpression === "0 0 * * *") {
      for (let i = 1; i <= 5; i++) {
        const target = new Date(now);
        target.setDate(target.getDate() + i);
        target.setHours(0, 0, 0, 0);
        runs.push(target.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + " at 00:00");
      }
    } else {
      // General simulation
      for (let i = 1; i <= 5; i++) {
        const target = new Date(now.getTime() + i * 3600000);
        runs.push(target.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }));
      }
    }

    return runs;
  }, [cronExpression]);

  const fullCrontabLine = `${cronExpression} ${customCommand}`;

  const handleCopyExpression = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopiedExpression(true);
    setTimeout(() => setCopiedExpression(false), 2000);
  };

  const handleCopyCrontab = () => {
    navigator.clipboard.writeText(fullCrontabLine);
    setCopiedCrontab(true);
    setTimeout(() => setCopiedCrontab(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. CURATED BLUEPRINTS (Spacious 3-Column Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                Standard Schedule Blueprints
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                1-click tested schedules for servers, webhooks, databases, and reporting
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/25 uppercase tracking-wider">
            6 Ready Blueprints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CRON_BLUEPRINTS.map((bp) => {
            const isActive = activeBlueprintId === bp.id;
            const expr = `${bp.minute} ${bp.hour} ${bp.dayOfMonth} ${bp.month} ${bp.dayOfWeek}`;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden",
                  isActive
                    ? "bg-lime-500/15 border-lime-400/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-400/30"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/40 hover:bg-white/[0.04]"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white group-hover:text-lime-300 transition-colors">
                      {bp.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 whitespace-nowrap shrink-0 group-hover:border-lime-500/30 group-hover:text-lime-300">
                      {bp.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-3 mt-3 border-t border-white/5">
                  <span className="text-lime-400 font-bold tracking-wider">
                    {expr}
                  </span>
                  <span className="text-zinc-400 font-medium">Click to Load</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL-PANE CRON STUDIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 5-Part Cron Segment Inputs */}
        <div className="lg:col-span-6 space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
                  <Sliders size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">
                    5-Part Schedule Segments
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Edit values or pick quick presets below
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMinute("*");
                  setHour("*");
                  setDayOfMonth("*");
                  setMonth("*");
                  setDayOfWeek("*");
                  setActiveBlueprintId("");
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-lime-500/20 text-zinc-400 hover:text-lime-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
                title="Reset to every minute (* * * * *)"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* 5 Input Boxes */}
            <div className="grid grid-cols-5 gap-2.5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase text-center truncate">
                  Minute
                </label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => { setMinute(e.target.value); setActiveBlueprintId(""); }}
                  placeholder="*"
                  className="w-full py-3 px-2 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-sm text-center font-bold focus:border-lime-500 focus:outline-none"
                />
                <span className="block text-[9px] text-zinc-500 text-center font-mono">0-59</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase text-center truncate">
                  Hour
                </label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => { setHour(e.target.value); setActiveBlueprintId(""); }}
                  placeholder="*"
                  className="w-full py-3 px-2 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-sm text-center font-bold focus:border-lime-500 focus:outline-none"
                />
                <span className="block text-[9px] text-zinc-500 text-center font-mono">0-23</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase text-center truncate">
                  Day (Mo)
                </label>
                <input
                  type="text"
                  value={dayOfMonth}
                  onChange={(e) => { setDayOfMonth(e.target.value); setActiveBlueprintId(""); }}
                  placeholder="*"
                  className="w-full py-3 px-2 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-sm text-center font-bold focus:border-lime-500 focus:outline-none"
                />
                <span className="block text-[9px] text-zinc-500 text-center font-mono">1-31</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase text-center truncate">
                  Month
                </label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => { setMonth(e.target.value); setActiveBlueprintId(""); }}
                  placeholder="*"
                  className="w-full py-3 px-2 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-sm text-center font-bold focus:border-lime-500 focus:outline-none"
                />
                <span className="block text-[9px] text-zinc-500 text-center font-mono">1-12</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase text-center truncate">
                  Day (Wk)
                </label>
                <input
                  type="text"
                  value={dayOfWeek}
                  onChange={(e) => { setDayOfWeek(e.target.value); setActiveBlueprintId(""); }}
                  placeholder="*"
                  className="w-full py-3 px-2 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-sm text-center font-bold focus:border-lime-500 focus:outline-none"
                />
                <span className="block text-[9px] text-zinc-500 text-center font-mono">0-6 (Sun-Sat)</span>
              </div>
            </div>

            {/* Quick Segment Helper Pills */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                Quick Minute Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_MINUTE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setMinute(opt.value); setActiveBlueprintId(""); }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border cursor-pointer",
                      minute === opt.value
                        ? "bg-lime-500/20 text-lime-300 border-lime-400/40"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                Quick Hour Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_HOUR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setHour(opt.value); setActiveBlueprintId(""); }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border cursor-pointer",
                      hour === opt.value
                        ? "bg-lime-500/20 text-lime-300 border-lime-400/40"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Linux Crontab Command Helper */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Attached Crontab Command</span>
              <span className="text-[10px] text-zinc-500 font-mono">Executable Script</span>
            </label>
            <input
              type="text"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder="/path/to/script.sh"
              className="w-full py-2.5 px-3.5 rounded-xl bg-black/60 border border-white/10 text-zinc-200 font-mono text-xs focus:border-lime-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Output Stage, Translation & Timeline */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header & Expression Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-lime-400 flex items-center gap-2">
                  <Clock size={14} />
                  Active Cron Expression
                </span>

                <button
                  type="button"
                  onClick={handleCopyExpression}
                  className="py-1.5 px-3 rounded-xl bg-lime-500 hover:bg-lime-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedExpression ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                  <span>{copiedExpression ? "Copied!" : "Copy Expression"}</span>
                </button>
              </div>

              {/* Big Expression Display */}
              <div className="p-5 rounded-2xl bg-black/80 border border-lime-500/30 text-center font-mono text-2xl sm:text-3xl font-black text-lime-300 tracking-widest shadow-inner select-all">
                {cronExpression}
              </div>
            </div>

            {/* Plain English Translation Card */}
            <div className="p-4 rounded-2xl bg-lime-500/10 border border-lime-500/25 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-lime-400/80 block">
                Plain English Explanation
              </span>
              <p className="text-xs sm:text-sm text-lime-100 font-medium leading-relaxed">
                "{humanExplanation}"
              </p>
            </div>

            {/* Simulated Next 5 Executions Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <CalendarDays size={12} className="text-lime-400" />
                Next 5 Scheduled Executions
              </span>

              <div className="grid grid-cols-1 gap-1.5">
                {nextRuns.map((time, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
                  >
                    <span className="text-zinc-500 font-bold">Run #{idx + 1}</span>
                    <span className="text-zinc-200 font-medium">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crontab Line Copy Footer */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Full Crontab Entry</span>
              <button
                type="button"
                onClick={handleCopyCrontab}
                className="text-lime-400 hover:text-lime-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedCrontab ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedCrontab ? "Copied Crontab!" : "Copy Line"}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-zinc-300 font-mono text-[11px] truncate select-all">
              {fullCrontabLine}
            </pre>
          </div>
        </div>
      </div>

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="Cron Expression Generator"
        title="Generated Cron Schedule"
        content={cronExpression}
        onCopy={handleCopyExpression}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="cron-generator" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="cron-generator" />
    </div>
  );
}
