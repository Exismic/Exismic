"use client";

import React, { useState } from "react";
import { 
  BookMarked, 
  Sparkles, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardGenerator() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 6 study flashcards for topic: "${topic}". Format output strictly as JSON array of objects with "front" (Question/Term) and "back" (Answer/Definition) keys.`,
          toolId: "flashcard-generator",
          systemInstruction: "You are an expert study flashcard generator. Return ONLY a valid JSON array of front/back flashcards."
        })
      });

      const data = await response.json();
      const rawText = data.output || data.text || "";
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setCards(parsed);
      } else {
        setCards(fallbackCards(topic));
      }
    } catch {
      setCards(fallbackCards(topic));
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackCards = (t: string): Flashcard[] => [
    { front: `What is the core definition of ${t}?`, back: `${t} refers to the foundational principles and theoretical framework in this subject domain.` },
    { front: `Key Formula / Rule in ${t}`, back: `The primary equation or rule governing ${t} under standard conditions.` },
    { front: `Common Application of ${t}`, back: `Used widely across practical industry workflows and academic research models.` },
    { front: `Major Challenge / Limitation`, back: `Potential edge cases, computational constraints, or experimental errors.` }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <BookMarked size={14} className="text-amber-400" />
              <span>Interactive Study Deck</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              AI Flashcard Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Create digital flip flashcard decks from any study topic, notes, or concept list.
            </p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Study Topic or Material *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Organic Chemistry, US History, Python Data Structures"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Building Deck...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Flashcard Deck</span>
              </>
            )}
          </button>
        </div>

        {/* Deck Viewer */}
        <div className="lg:col-span-2 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between items-center">
          {cards.length > 0 ? (
            <div className="w-full space-y-6 flex flex-col items-center">
              <div className="flex justify-between items-center w-full text-xs font-mono font-bold text-zinc-400">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span className="text-amber-400">Click Card to Flip 🔄</span>
              </div>

              {/* Flip Card */}
              <div
                onClick={() => setFlipped(!flipped)}
                className="w-full min-h-[240px] rounded-3xl border border-amber-500/30 bg-gradient-to-br from-black via-zinc-950 to-amber-950/20 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-400/60 transition-all shadow-2xl relative select-none"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 pb-3">
                  {flipped ? "BACK (ANSWER)" : "FRONT (QUESTION)"}
                </p>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {flipped ? cards[currentIndex].back : cards[currentIndex].front}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
                    setFlipped(false);
                  }}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setFlipped(!flipped)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <RotateCw size={14} /> Flip Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
                    setFlipped(false);
                  }}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
              <BookMarked size={36} className="opacity-40" />
              <p className="text-xs font-medium max-w-xs">Enter a topic and click "Generate Flashcard Deck" to practice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
