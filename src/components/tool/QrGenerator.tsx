"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  QrCode, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Sliders, 
  Smartphone, 
  CreditCard, 
  Frame, 
  RefreshCw, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";

const PRESETS = [
  { name: "Steampunk Gears", prompt: "A detailed steampunk clockwork gear pattern, golden brass pipes, highly detailed, metallic reflection" },
  { name: "Neon Cyberpunk", prompt: "A futuristic cyberpunk city street, neon glowing billboard signs, wet asphalt reflections, night photography, 4k" },
  { name: "Medieval Castle", prompt: "A beautiful medieval stone castle on a green hill, oil painting style, hyperdetailed, dramatic lighting" },
  { name: "Watercolor Flora", prompt: "A vibrant abstract watercolor painting of flowers and leaves, pastel background, splash art" }
];

const AUD_STEPS = [
  { title: "Target URL", desc: "Enter the link you want the QR code to open when scanned." },
  { title: "Visual Prompt", desc: "Describe the artistic style (e.g. steampunk gears, cyber city)." },
  { title: "Adjust Settings", desc: "Set the scannability scale. Higher = easier to scan; Lower = cleaner art blend." },
  { title: "Generate & Preview", desc: "Submit to generate the QR art and preview it inside live product mockups." }
];

type MockupType = "none" | "phone" | "card" | "frame";

export default function QrGenerator() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("ugly, disfigured, low quality, blurry, nsfw");
  const [conditioningScale, setConditioningScale] = useState(1.2);
  const [strength, setStrength] = useState(0.9);
  const [seed, setSeed] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result parameters
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [activeSeed, setActiveSeed] = useState<number | null>(null);
  const [activeMockup, setActiveMockup] = useState<MockupType>("none");

  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    setError(null);
  };

  const simulateProgress = () => {
    setProgress(5);
    setStatus("Connecting to Stable Diffusion worker...");
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        if (prev > 75) {
          setStatus("Optimizing contrast and finalizing download...");
          return prev + 1;
        }
        if (prev > 45) {
          setStatus("Blending QR structure with ControlNet QR Code Monster...");
          return prev + 2;
        }
        if (prev > 15) {
          setStatus("Generating latent image base using Stable Diffusion...");
          return prev + 4;
        }
        return prev + 5;
      });
    }, 500);

    return interval;
  };

  const handleGenerate = async () => {
    if (!url.trim() || !prompt.trim()) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post("/api/tools/ai/qr-generator", {
        url: url.trim(),
        prompt: prompt.trim(),
        negativePrompt,
        guidanceScale: 7.5,
        conditioningScale,
        strength,
        seed: seed.trim() || undefined
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatus("Art generated!");

      setResultImage(response.data.image);
      setActiveSeed(response.data.seed);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || "Failed to generate AI QR Code.";
      setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!resultImage) return;
    try {
      // Copy Base64 image to clipboard
      const res = await fetch(resultImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: copy base64 string
      navigator.clipboard.writeText(resultImage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `ai-qrcode-${activeSeed || "art"}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000000).toString());
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Main Console Workspace */}
        <div className="xl:col-span-8 space-y-10">
          
          <div className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/[0.005] blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <QrCode className="w-5 h-5 text-purple-400" />
                  </div>
                  Artistic QR Designer
                </h3>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">
                  Condition Stable Diffusion on structural link codes
                </p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Target Link */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Target Link / URL</label>
                <input 
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full h-16 bg-zinc-950/90 border border-white/5 focus:border-purple-500/20 rounded-2xl px-6 text-zinc-300 font-medium outline-none focus:ring-4 focus:ring-purple-500/5 transition-all duration-300 shadow-inner"
                />
              </div>

              {/* Visual Prompt */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Artistic Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the art style (e.g., medieval castle on a hill, oil painting, dramatic lighting)..."
                  className="w-full h-32 bg-zinc-950/90 border border-white/5 focus:border-purple-500/20 rounded-2xl p-6 text-zinc-300 font-medium outline-none focus:ring-4 focus:ring-purple-500/5 transition-all duration-300 shadow-inner resize-none"
                />
              </div>

              {/* Preset suggestion list */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Preset Styles</span>
                <div className="flex flex-wrap gap-2.5">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(preset.prompt)}
                      className={cn(
                        "px-4 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        prompt === preset.prompt 
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
                          : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/15 hover:text-white"
                      )}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders settings drawer */}
              <div className="p-6 rounded-2xl bg-zinc-950 border border-white/5 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Sliders size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Control Parameters</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Scannability slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        Scannability Scale
                        <span title="Higher scale forces QR squares to be darker and easier to scan, but reduces artistic blend.">
                          <HelpCircle size={10} className="opacity-50 cursor-help" />
                        </span>
                      </span>
                      <span className="text-purple-400 font-mono">{conditioningScale.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range"
                      min="0.8"
                      max="2.0"
                      step="0.05"
                      value={conditioningScale}
                      onChange={(e) => setConditioningScale(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Prompt Strength slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      <span>Art Influence Strength</span>
                      <span className="text-purple-400 font-mono">{strength.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={strength}
                      onChange={(e) => setStrength(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>

                {/* Seed controls */}
                <div className="space-y-3 pt-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Custom Seed (Optional)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="Random seed..."
                      className="w-full h-12 bg-black border border-white/5 focus:border-purple-500/20 rounded-xl px-4 text-xs font-semibold text-zinc-300 outline-none"
                    />
                    <button
                      onClick={handleRandomizeSeed}
                      className="h-12 px-4 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="Generate random seed"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Trigger */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!url.trim() || !prompt.trim() || isProcessing}
                  className={cn(
                    "w-full md:w-auto flex min-h-14 items-center justify-center gap-3 rounded-2xl px-10 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition hover:brightness-110 active:scale-98 cursor-pointer",
                    "bg-gradient-to-r from-purple-600 to-indigo-600",
                    "disabled:opacity-30 disabled:cursor-not-allowed"
                  )}
                >
                  <Sparkles size={16} />
                  {isProcessing ? "Generating Art..." : "Generate AI QR Code"}
                </button>
              </div>
            </div>
          </div>

          {/* Result viewports */}
          <AnimatePresence>
            {resultImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-8 relative overflow-hidden group"
              >
                
                {/* Result Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-4 border-b border-white/5 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-md">Art Generated</span>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">Seed: {activeSeed}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy Image"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer hover:bg-zinc-200"
                    >
                      <Download size={12} />
                      Download PNG
                    </button>
                  </div>
                </div>

                {/* Mockup tabs */}
                <div className="flex flex-wrap gap-2.5 relative z-10">
                  {[
                    { id: "none", name: "Standard Code", icon: QrCode },
                    { id: "phone", name: "Phone View", icon: Smartphone },
                    { id: "card", name: "Business Card", icon: CreditCard },
                    { id: "frame", name: "Framed Wall", icon: Frame }
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setActiveMockup(m.id as MockupType)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer",
                          activeMockup === m.id 
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                            : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                        )}
                      >
                        <Icon size={12} />
                        {m.name}
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Render Viewport */}
                <div className="flex items-center justify-center p-6 bg-zinc-950 border border-white/5 rounded-3xl relative z-10 min-h-[400px]">
                  {activeMockup === "none" && (
                    /* Standard view */
                    <motion.div layout className="relative w-80 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <img src={resultImage} alt="Artistic QR Code" className="w-full h-full object-cover" />
                    </motion.div>
                  )}

                  {activeMockup === "phone" && (
                    /* Smartphone screen mock */
                    <motion.div layout className="relative w-64 h-[450px] bg-zinc-900 rounded-[2.5rem] border-4 border-zinc-800 shadow-2xl p-6 flex flex-col justify-between items-center text-center overflow-hidden">
                      <div className="w-16 h-4 bg-zinc-800 rounded-full mb-4" /> {/* camera notch */}
                      <div className="space-y-2 mt-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-400">Scanned Brand</h5>
                        <p className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">Scan code to connect</p>
                      </div>
                      <div className="w-40 h-40 rounded-xl overflow-hidden border border-white/10 shadow-lg relative my-6">
                        <img src={resultImage} alt="QR Code Phone mockup" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-full py-2.5 rounded-xl bg-purple-600 text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                        Visit Website
                      </div>
                      <div className="w-24 h-1 bg-zinc-800 rounded-full mt-4" /> {/* home bar */}
                    </motion.div>
                  )}

                  {activeMockup === "card" && (
                    /* Business card view */
                    <motion.div layout className="w-96 h-56 rounded-2xl bg-zinc-900 border border-amber-500/10 shadow-2xl p-8 flex justify-between items-center relative overflow-hidden group">
                      {/* gold metallic reflection accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rotate-45 pointer-events-none" />
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-white">Alexander Thorne</h4>
                          <p className="text-[8px] font-black text-amber-500/80 uppercase tracking-widest">Creative Director</p>
                        </div>
                        <div className="space-y-0.5 text-[8px] text-zinc-500 font-medium">
                          <p>alex@exismic.design</p>
                          <p>+1 (555) 948-3829</p>
                        </div>
                      </div>
                      <div className="w-28 h-28 rounded-lg overflow-hidden border border-amber-500/20 shadow-xl shrink-0 bg-black">
                        <img src={resultImage} alt="QR Code card mockup" className="w-full h-full object-cover" />
                      </div>
                    </motion.div>
                  )}

                  {activeMockup === "frame" && (
                    /* Gallery Frame View */
                    <motion.div layout className="relative w-80 h-96 bg-zinc-900 rounded-lg shadow-2xl p-10 flex flex-col justify-between items-center border border-zinc-800">
                      {/* Museum styled frame */}
                      <div className="w-full h-64 bg-white p-6 border-8 border-zinc-950 shadow-inner flex items-center justify-center">
                        <div className="w-full h-full rounded shadow-md overflow-hidden relative">
                          <img src={resultImage} alt="QR Code wall frame mockup" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="text-center space-y-1 mt-4">
                        <h6 className="text-[8px] font-black uppercase text-zinc-400">Exismic Exhibit #094</h6>
                        <p className="text-[7px] font-mono text-zinc-600">Stable Diffusion / ControlNet</p>
                      </div>
                    </motion.div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Info Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          <PdfSidebar 
            accentColor="text-purple-400"
            steps={AUD_STEPS}
            stats={resultImage ? [
              { label: "Diffusion Client", value: "@gradio/client" },
              { label: "ControlNet Model", value: "QR Code Monster" },
              { label: "Inference Speed", value: "Free HF GPU" }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Generation Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Loader Screen */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <QrCode className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{status}</h4>
            <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-[0.4em]">Rendering vector lattices</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
