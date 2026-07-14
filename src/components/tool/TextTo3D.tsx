"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Box, 
  Sparkles, 
  Download, 
  RotateCcw, 
  AlertCircle,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";

interface StylePreset {
  id: string;
  name: string;
  emoji: string;
  promptSuffix: string;
  description: string;
}

const PRESETS: StylePreset[] = [
  { 
    id: "game", 
    name: "3D Game Asset", 
    emoji: "🎮", 
    promptSuffix: ", solo object, asset model, 3D game asset, white studio background, high details, game asset quality",
    description: "Detailed, textured meshes optimized for game assets."
  },
  { 
    id: "clay", 
    name: "Claymation Toy", 
    emoji: "🧸", 
    promptSuffix: ", clay toy model, cute cartoon style, smooth surfaces, solid white background, plastic clay shader",
    description: "Cute, stylized cartoon models with soft clay finishes."
  },
  { 
    id: "mecha", 
    name: "Sci-Fi Mecha", 
    emoji: "🤖", 
    promptSuffix: ", futuristic robot mecha part, clean metal surfaces, orthographic view, plain white background, sci-fi paneling details",
    description: "Futuristic machinery and hard-surface robotics."
  },
  { 
    id: "voxel", 
    name: "Low-Poly Voxel", 
    emoji: "🧱", 
    promptSuffix: ", low-poly retro fantasy object, voxel style, blocky pixel art, flat colors, white background, retro gaming aesthetics",
    description: "Retro low-poly blocks and fantasy pixel art models."
  }
];

const GUIDES = [
  { title: "Select Preset Style", desc: "Choose a pre-configured 3D asset style like Game Asset, Voxel, or Claymation." },
  { title: "Generate Concept Art", desc: "Enter a brief description to render a high-contrast 2D concept art image." },
  { title: "Adjust Settings", desc: "Toggle background removal or adjust resolution before mesh reconstruction." },
  { title: "Interact in 3D", desc: "Drag to spin, pinch to zoom, and download your finished GLB / OBJ model file." }
];

export default function TextTo3D() {
  const [stage, setStage] = useState<"input" | "concept" | "mesh">("input");
  
  // Input State
  const [prompt, setPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(PRESETS[0]);
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
  
  // Concept State
  const [conceptImage, setConceptImage] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [resolution, setResolution] = useState(256);
  const [isReconstructing, setIsReconstructing] = useState(false);
  
  // Mesh State
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [objUrl, setObjUrl] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  // Dynamically load Google's model-viewer script when entering mesh view stage
  useEffect(() => {
    if (stage === "mesh" && !document.getElementById("model-viewer-script")) {
      const script = document.createElement("script");
      script.id = "model-viewer-script";
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, [stage]);

  // Stage 1: Generate 2D Concept Art
  const handleGenerateConcept = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingConcept(true);
    setError(null);

    try {
      const fullPrompt = prompt.trim() + selectedPreset.promptSuffix;
      const response = await axios.post("/api/tools/ai/text-to-3d", {
        action: "generate-image",
        prompt: fullPrompt
      });

      setConceptImage(response.data.image);
      setStage("concept");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to generate concept art.");
    } finally {
      setIsGeneratingConcept(false);
    }
  };

  // Stage 2: Convert 2D Concept Art into 3D mesh
  const handleGenerateMesh = async () => {
    if (!conceptImage) return;
    setIsReconstructing(true);
    setError(null);

    try {
      const response = await axios.post("/api/tools/ai/text-to-3d", {
        action: "generate-3d",
        imageUrl: conceptImage,
        removeBg,
        resolution
      });

      setGlbUrl(response.data.glbUrl);
      setObjUrl(response.data.objUrl);
      setStage("mesh");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to reconstruct 3D mesh.");
    } finally {
      setIsReconstructing(false);
    }
  };

  // Reset workstation
  const handleReset = () => {
    setStage("input");
    setPrompt("");
    setConceptImage(null);
    setGlbUrl(null);
    setObjUrl(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Main Workstation Studio */}
        <div className="xl:col-span-8 space-y-10">
          
          <div className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-8 relative overflow-hidden group">
            
            {/* Header Stage Tracker */}
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 pb-6 border-b border-white/5">
              <span className={cn(stage === "input" && "text-purple-400 font-black")}>1. Prompt & Style</span>
              <ChevronRight size={10} />
              <span className={cn(stage === "concept" && "text-purple-400 font-black")}>2. Concept Art</span>
              <ChevronRight size={10} />
              <span className={cn(stage === "mesh" && "text-purple-400 font-black")}>3. 3D Model</span>
            </div>

            <AnimatePresence mode="wait">
              
              {/* STAGE 1: INPUT AND PRESETS */}
              {stage === "input" && (
                <motion.div 
                  key="input-stage"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Select Style Preset</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setSelectedPreset(preset)}
                          className={cn(
                            "p-6 rounded-3xl text-left border cursor-pointer transition-all space-y-3 relative group overflow-hidden",
                            selectedPreset.id === preset.id 
                              ? "bg-purple-600/10 border-purple-500/30 text-white" 
                              : "bg-zinc-950 border-white/5 hover:border-white/10 text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{preset.emoji}</span>
                            <span className="text-xs font-black uppercase tracking-wider">{preset.name}</span>
                          </div>
                          <p className="text-[9px] font-medium leading-relaxed opacity-70">{preset.description}</p>
                          {selectedPreset.id === preset.id && (
                            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Model Description</label>
                    <div className="flex flex-col gap-4">
                      <textarea
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. detailed chibi knight with a sword, miniature castle ruins, retro space blaster..."
                        className="w-full bg-black border border-white/5 focus:border-purple-500/20 rounded-2xl p-5 text-xs font-semibold text-zinc-300 outline-none resize-none"
                      />
                      <button
                        onClick={handleGenerateConcept}
                        disabled={isGeneratingConcept || !prompt.trim()}
                        className="h-14 w-full rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all"
                      >
                        <Sparkles size={14} />
                        {isGeneratingConcept ? "Generating Concept Art..." : "Generate 2D Concept Art"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: CONCEPT ART PREVIEW & SETTINGS */}
              {stage === "concept" && conceptImage && (
                <motion.div 
                  key="concept-stage"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Concept Art Card */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">2D Concept Preview</label>
                      <div className="p-4 rounded-3xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center aspect-square relative group">
                        <img 
                          src={conceptImage} 
                          alt="Concept art" 
                          className="w-full h-full object-contain rounded-2xl" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <Maximize2 className="w-6 h-6 text-white animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* 3D Reconstruction Settings */}
                    <div className="space-y-8 flex flex-col justify-between">
                      
                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-purple-400" />
                          Reconstruction Settings
                        </label>

                        {/* Background Removal */}
                        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">Isolate Object</span>
                            <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wide">Automatically strip background layer</p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={removeBg}
                            onChange={(e) => setRemoveBg(e.target.checked)}
                            className="w-4 h-4 cursor-pointer accent-purple-500 rounded bg-black border-white/10"
                          />
                        </div>

                        {/* Marching cubes resolution */}
                        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 space-y-4">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-300">
                            <span>Mesh Quality</span>
                            <span className="text-purple-400">{resolution} quality</span>
                          </div>
                          <input 
                            type="range"
                            min="128"
                            max="320"
                            step="32"
                            value={resolution}
                            onChange={(e) => setResolution(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={handleReset}
                          className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <RotateCcw size={14} />
                          Back
                        </button>
                        <button
                          onClick={handleGenerateMesh}
                          disabled={isReconstructing}
                          className="flex-1 h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-colors"
                        >
                          <Box size={14} />
                          {isReconstructing ? "Constructing Mesh..." : "Construct 3D Model"}
                        </button>
                      </div>

                    </div>

                  </div>
                </motion.div>
              )}

              {/* STAGE 3: INTERACTIVE 3D MODEL VIEWPORT */}
              {stage === "mesh" && glbUrl && (
                <motion.div 
                  key="mesh-stage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      3D Model Viewer (Interactive Viewport)
                    </label>

                    {/* Google's model-viewer rendered securely via React.createElement */}
                    <div className="w-full h-96 min-h-[400px] bg-black border border-white/5 rounded-3xl overflow-hidden relative shadow-inner">
                      {React.createElement("model-viewer", {
                        src: glbUrl,
                        alt: "AI Generated 3D Model",
                        "auto-rotate": true,
                        "camera-controls": true,
                        "shadow-intensity": "1.5",
                        "touch-action": "pan-y",
                        style: { width: "100%", height: "100%" }
                      })}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                    <button
                      onClick={handleReset}
                      className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw size={14} />
                      Generate New Model
                    </button>

                    <div className="flex gap-4">
                      {objUrl && (
                        <a
                          href={objUrl}
                          download="mesh_obj.obj"
                          className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Download size={14} />
                          Download OBJ
                        </a>
                      )}
                      <a
                        href={glbUrl}
                        download="mesh_glb.glb"
                        className="h-14 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 cursor-pointer shadow-lg transition-colors"
                      >
                        <Download size={14} />
                        Download GLB
                      </a>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>

        {/* Info Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          <PdfSidebar 
            accentColor="text-purple-400"
            steps={stage === "input" 
              ? [GUIDES[0], GUIDES[1]] 
              : stage === "concept" 
                ? [GUIDES[2]] 
                : [GUIDES[3]]
            }
            stats={stage === "mesh" ? [
              { label: "Rendering Tech", value: "WebGL model-viewer" },
              { label: "Mesh Format", value: "GLTF/GLB binary format" },
              { label: "Texture Mapping", value: "Vertex Color mapping" }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Reconstruction Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Full screen loader transitions */}
      <AnimatePresence>
        {(isGeneratingConcept || isReconstructing) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <Box className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 px-4 pr-4 -mx-4">
              {isGeneratingConcept ? "Generating Concept Art..." : "Reconstructing 3D Mesh..."}
            </h4>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] max-w-sm leading-relaxed">
              {isGeneratingConcept 
                ? "Rendering Stable Diffusion 2D orthographic perspectives." 
                : "TripoSR neural networks isolating background layers and compiling vertex texture mappings."
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
