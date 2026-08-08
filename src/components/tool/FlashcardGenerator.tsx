"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BookMarked, 
  Sparkles, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Shuffle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Zap,
  GraduationCap,
  Layers,
  Keyboard
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  front: string;
  back: string;
  mastered?: boolean;
}

const PRESET_TOPICS = [
  { label: "Organic Chemistry", icon: "🧪" },
  { label: "Python Data Structures", icon: "🐍" },
  { label: "Quantum Physics", icon: "⚛️" },
  { label: "US History & Constitution", icon: "📜" },
  { label: "Microeconomics Principles", icon: "📈" },
  { label: "Human Anatomy", icon: "🫀" },
];

export default function FlashcardGenerator() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (selectedTopic?: string) => {
    const targetTopic = selectedTopic || topic;
    if (!targetTopic.trim()) return;
    setTopic(targetTopic);
    setIsGenerating(true);
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 6 high-yield study flashcards for topic: "${targetTopic}". Format output strictly as JSON array of objects with "front" (Question/Term) and "back" (Answer/Definition) keys.`,
          toolId: "flashcard-generator",
          systemInstruction: "You are an expert study flashcard generator. Return ONLY a valid JSON array of front/back flashcards."
        })
      });

      const data = await response.json();
      const rawText = data.output || data.text || "";
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed: Flashcard[] = JSON.parse(match[0]);
        setCards(parsed.map(c => ({ ...c, mastered: false })));
      } else {
        setCards(fallbackCards(targetTopic));
      }
    } catch {
      setCards(fallbackCards(targetTopic));
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackCards = (t: string): Flashcard[] => [
    { front: `What is the core definition of ${t}?`, back: `${t} refers to the foundational principles and theoretical framework governing this subject domain.`, mastered: false },
    { front: `Key Formula / Principle in ${t}`, back: `The primary rule or equation governing ${t} under standard conditions.`, mastered: false },
    { front: `Practical Application of ${t}`, back: `Widely utilized across real-world workflows, systems engineering, and academic research.`, mastered: false },
    { front: `Major Challenge or Edge Case`, back: `Common pitfalls include boundary condition limits, algorithmic complexity, or experimental variances.`, mastered: false },
    { front: `Historical / Theoretical Context`, back: `Developed to address key knowledge gaps and optimize foundational execution in ${t}.`, mastered: false },
    { front: `Best Practice for Mastering ${t}`, back: `Apply active recall, practice problem sets, and review spaced repetition decks daily.`, mastered: false }
  ];

  const handleNext = useCallback(() => {
    if (cards.length === 0) return;
    setFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    if (cards.length === 0) return;
    setFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  }, [cards.length]);

  const handleToggleFlip = useCallback(() => {
    if (cards.length === 0) return;
    setFlipped((prev) => !prev);
  }, [cards.length]);

  const handleShuffle = () => {
    if (cards.length === 0) return;
    setFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cards.length === 0) return;
    setCards((prev) =>
      prev.map((c, i) => (i === currentIndex ? { ...c, mastered: !c.mastered } : c))
    );
  };

  const handleCopyCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cards.length === 0) return;
    const currentCard = cards[currentIndex];
    const text = `Q: ${currentCard.front}\nA: ${currentCard.back}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0 || isGenerating) return;
      if (document.activeElement?.tagName === "INPUT") return;

      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleToggleFlip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards.length, isGenerating, handleNext, handlePrev, handleToggleFlip]);

  const masteredCount = cards.filter((c) => c.mastered).length;
  const currentCard = cards[currentIndex];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-zinc-950 to-indigo-950/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest shadow-inner">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>AI Powered Active Recall</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-amber-100 to-zinc-400 bg-clip-text text-transparent">
              AI Flashcard Deck
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Transform any study material into interactive flip decks tailored for long-term retention.
            </p>
          </div>

          {/* Quick Stats Pill */}
          {cards.length > 0 && (
            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-center px-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cards</p>
                <p className="text-xl font-black text-white">{cards.length}</p>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="text-center px-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mastered</p>
                <p className="text-xl font-black text-amber-400">{masteredCount}/{cards.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Quick Topics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <GraduationCap size={16} /> Study Topic or Material *
                </label>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">AI Generator</span>
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Organic Chemistry reaction mechanisms, Python async/await, Mitosis phases..."
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all resize-none font-medium"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Try Popular Topics:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_TOPICS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleGenerate(preset.label)}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-amber-500/10 hover:border-amber-500/40 text-xs font-semibold text-zinc-300 hover:text-amber-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={!topic.trim() || isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-white" />
                  <span>Generating Smart Deck...</span>
                </>
              ) : (
                <>
                  <Zap size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Generate Flashcard Deck</span>
                </>
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts Guide */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 backdrop-blur-md text-xs text-zinc-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-300">
              <Keyboard size={14} className="text-amber-400" />
              <span>Keyboard Controls</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex justify-between bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">
                <span>Space / Enter</span>
                <span className="text-amber-400 font-bold">Flip Card</span>
              </div>
              <div className="flex justify-between bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">
                <span>← / →</span>
                <span className="text-amber-400 font-bold">Prev / Next</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Flashcard Flip Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl min-h-[440px] flex flex-col justify-between items-center relative overflow-hidden">
            
            {isGenerating ? (
              /* Shimmer Loading State */
              <div className="w-full my-auto flex flex-col items-center justify-center space-y-6 py-16 animate-pulse">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-2xl">
                  <BookMarked size={36} className="text-amber-400 animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-base font-bold text-white uppercase tracking-wider">Crafting Study Cards...</p>
                  <p className="text-xs text-zinc-400 max-w-xs">Using AI active-recall formatting to structure key questions and answers.</p>
                </div>
              </div>
            ) : cards.length > 0 && currentCard ? (
              <div className="w-full space-y-6 flex flex-col items-center">
                
                {/* Top Deck Info Bar */}
                <div className="w-full flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                      Card {currentIndex + 1} / {cards.length}
                    </span>
                    {currentCard.mastered && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Mastered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShuffle}
                      title="Shuffle Deck"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Shuffle size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      title="Copy Card Content"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>

                {/* Card Indicator Dots / Timeline */}
                <div className="flex items-center gap-1.5 w-full">
                  {cards.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFlipped(false);
                        setCurrentIndex(idx);
                      }}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all cursor-pointer",
                        idx === currentIndex
                          ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : c.mastered
                          ? "bg-emerald-500/60"
                          : "bg-white/10 hover:bg-white/30"
                      )}
                    />
                  ))}
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={handleToggleFlip}
                  className="w-full min-h-[260px] sm:min-h-[280px] cursor-pointer group [perspective:1000px] select-none"
                >
                  <div
                    className={cn(
                      "relative w-full h-full min-h-[260px] sm:min-h-[280px] rounded-3xl transition-all duration-500 [transform-style:preserve-3d]",
                      flipped ? "[transform:rotateY(180deg)]" : ""
                    )}
                  >
                    {/* Front Face (Question) */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-black to-amber-950/20 p-8 flex flex-col justify-between text-center [backface-visibility:hidden] shadow-2xl group-hover:border-amber-400/60 transition-colors">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                          Front • Question
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium">Click to Reveal Answer 🔄</span>
                      </div>

                      <p className="text-lg sm:text-xl font-extrabold text-white leading-relaxed my-auto px-2">
                        {currentCard.front}
                      </p>

                      <div className="flex items-center justify-between w-full pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={toggleMastered}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                            currentCard.mastered
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                          )}
                        >
                          {currentCard.mastered ? (
                            <>
                              <CheckCircle2 size={14} /> Mastered
                            </>
                          ) : (
                            <>
                              <XCircle size={14} /> Mark as Mastered
                            </>
                          )}
                        </button>

                        <span className="text-xs text-amber-400/80 font-bold uppercase tracking-wider flex items-center gap-1">
                          <RotateCw size={12} /> Flip
                        </span>
                      </div>
                    </div>

                    {/* Back Face (Answer) */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-zinc-950 via-slate-950 to-indigo-950/30 p-8 flex flex-col justify-between text-center [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-2xl group-hover:border-indigo-400/60 transition-colors">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                          Back • Answer
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium">Click to Return 🔄</span>
                      </div>

                      <p className="text-base sm:text-lg font-bold text-indigo-100 leading-relaxed my-auto px-2">
                        {currentCard.back}
                      </p>

                      <div className="flex items-center justify-between w-full pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={toggleMastered}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                            currentCard.mastered
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                          )}
                        >
                          {currentCard.mastered ? (
                            <>
                              <CheckCircle2 size={14} /> Mastered
                            </>
                          ) : (
                            <>
                              <XCircle size={14} /> Mark as Mastered
                            </>
                          )}
                        </button>

                        <span className="text-xs text-indigo-400/80 font-bold uppercase tracking-wider flex items-center gap-1">
                          <RotateCw size={12} /> Flip
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between w-full pt-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFlip}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-400/30 text-amber-300 hover:text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:border-amber-400/60"
                  >
                    <RotateCw size={14} /> Flip Card
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xl">
                  <Layers size={36} className="text-amber-400/70" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">No Active Study Deck</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Type a custom study topic or choose one of the popular presets on the left to generate your interactive deck.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

