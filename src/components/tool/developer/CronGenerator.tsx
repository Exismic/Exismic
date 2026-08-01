"use client";

import React, { useState, useMemo } from "react";
import { Zap, Copy, Check, Clock, Calendar, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CronGenerator() {
  const [minute, setMinute] = useState("*/5");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [copied, setCopied] = useState(false);

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const humanExplanation = useMemo(() => {
    if (cronExpression === "*/5 * * * *") return "Every 5 minutes";
    if (cronExpression === "0 0 * * *") return "Every day at midnight (00:00)";
    if (cronExpression === "0 9 * * 1") return "Every Monday at 9:00 AM";
    if (cronExpression === "0 0 1 * *") return "On the 1st of every month at midnight";
    return `At minute (${minute}), hour (${hour}), day of month (${dayOfMonth}), month (${month}), day of week (${dayOfWeek})`;
  }, [cronExpression, minute, hour, dayOfMonth, month, dayOfWeek]);

  const setPreset = (m: string, h: string, dom: string, mon: string, dow: string) => {
    setMinute(m);
    setHour(h);
    setDayOfMonth(dom);
    setMonth(mon);
    setDayOfWeek(dow);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-lime-950/40 via-emerald-900/20 to-neutral-900 border border-lime-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-300 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" /> DevOps & Automation
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cron Expression Generator & Explainer
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
          Build, parse, and translate 5-part cron expressions visually into plain English human descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preset & Interactive Controls */}
        <div className="lg:col-span-6 space-y-5 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPreset("*/5", "*", "*", "*", "*")}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-lime-500 text-xs text-neutral-300 font-medium transition-all text-left"
              >
                ⚡ Every 5 minutes
              </button>
              <button
                onClick={() => setPreset("0", "0", "*", "*", "*")}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-lime-500 text-xs text-neutral-300 font-medium transition-all text-left"
              >
                🌙 Daily at midnight
              </button>
              <button
                onClick={() => setPreset("0", "9", "*", "*", "1")}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-lime-500 text-xs text-neutral-300 font-medium transition-all text-left"
              >
                📅 Mondays at 9:00 AM
              </button>
              <button
                onClick={() => setPreset("0", "0", "1", "*", "*")}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-lime-500 text-xs text-neutral-300 font-medium transition-all text-left"
              >
                🗓️ 1st of every month
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-neutral-800">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Minute</label>
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-lime-300 font-mono text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Hour</label>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-lime-300 font-mono text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Day(Mo)</label>
              <input
                type="text"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-lime-300 font-mono text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Month</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-lime-300 font-mono text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Day(Wk)</label>
              <input
                type="text"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-lime-300 font-mono text-xs text-center"
              />
            </div>
          </div>
        </div>

        {/* Live Output & Translation */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">
                Generated Cron Expression
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-600 hover:bg-lime-500 text-white text-xs font-bold transition-all shadow-lg shadow-lime-600/30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Expression"}
              </button>
            </div>

            <div className="text-center my-auto space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-2xl sm:text-3xl font-black text-lime-300 tracking-wider shadow-inner">
                {cronExpression}
              </div>

              <div className="p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-xs text-lime-200 font-medium">
                <span className="text-neutral-400 block mb-1 uppercase font-bold text-[10px]">Human Explanation</span>
                "{humanExplanation}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
