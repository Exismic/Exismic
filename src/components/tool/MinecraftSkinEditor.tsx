"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Eraser,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Pipette,
  Redo2,
  Save,
  ShieldCheck,
  Sparkles,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinecraftArmModel, MinecraftSkinPart } from "@/lib/minecraft-skin";

type EditorTool = "pencil" | "eraser" | "picker";
type EditorLayer = "base" | "outer";
type EditorPart = "full" | "head" | "torso" | "right-arm" | "left-arm" | "right-leg" | "left-leg";
type Region = { x: number; y: number; width: number; height: number };

interface MinecraftSkinEditorProps {
  skinUrl: string;
  skinName: string;
  armModel: MinecraftArmModel;
  onSaved: (skinUrl: string) => void;
  onAiEdit: (command: string, targetPart: MinecraftSkinPart, referenceImage: string) => Promise<void>;
}

const PART_OPTIONS: Array<{ id: EditorPart; label: string }> = [
  { id: "full", label: "Full texture" },
  { id: "head", label: "Head front" },
  { id: "torso", label: "Torso front" },
  { id: "right-arm", label: "Right arm" },
  { id: "left-arm", label: "Left arm" },
  { id: "right-leg", label: "Right leg" },
  { id: "left-leg", label: "Left leg" },
];

const BASE_FACES: Region[] = [
  { x: 8, y: 0, width: 8, height: 8 }, { x: 16, y: 0, width: 8, height: 8 },
  { x: 0, y: 8, width: 8, height: 8 }, { x: 8, y: 8, width: 8, height: 8 },
  { x: 16, y: 8, width: 8, height: 8 }, { x: 24, y: 8, width: 8, height: 8 },
  { x: 20, y: 16, width: 8, height: 4 }, { x: 28, y: 16, width: 8, height: 4 },
  { x: 16, y: 20, width: 4, height: 12 }, { x: 20, y: 20, width: 8, height: 12 },
  { x: 28, y: 20, width: 4, height: 12 }, { x: 32, y: 20, width: 8, height: 12 },
  { x: 4, y: 16, width: 4, height: 4 }, { x: 8, y: 16, width: 4, height: 4 },
  { x: 0, y: 20, width: 4, height: 12 }, { x: 4, y: 20, width: 4, height: 12 },
  { x: 8, y: 20, width: 4, height: 12 }, { x: 12, y: 20, width: 4, height: 12 },
  { x: 20, y: 48, width: 4, height: 4 }, { x: 24, y: 48, width: 4, height: 4 },
  { x: 16, y: 52, width: 4, height: 12 }, { x: 20, y: 52, width: 4, height: 12 },
  { x: 24, y: 52, width: 4, height: 12 }, { x: 28, y: 52, width: 4, height: 12 },
];

function armBaseFaces(model: MinecraftArmModel): Region[] {
  const width = model === "slim" ? 3 : 4;
  return [
    { x: 44, y: 16, width, height: 4 },
    { x: 44 + width, y: 16, width, height: 4 },
    { x: 40, y: 20, width: 4, height: 12 },
    { x: 44, y: 20, width, height: 12 },
    { x: 44 + width, y: 20, width: 4, height: 12 },
    { x: 48 + width, y: 20, width, height: 12 },
    { x: 36, y: 48, width, height: 4 },
    { x: 36 + width, y: 48, width, height: 4 },
    { x: 32, y: 52, width: 4, height: 12 },
    { x: 36, y: 52, width, height: 12 },
    { x: 36 + width, y: 52, width: 4, height: 12 },
    { x: 40 + width, y: 52, width, height: 12 },
  ];
}

function getRegion(part: EditorPart, layer: EditorLayer, model: MinecraftArmModel): Region {
  if (part === "full") return { x: 0, y: 0, width: 64, height: 64 };
  const slimWidth = model === "slim" ? 3 : 4;
  const regions: Record<Exclude<EditorPart, "full">, { base: Region; outer: Region }> = {
    head: {
      base: { x: 8, y: 8, width: 8, height: 8 },
      outer: { x: 40, y: 8, width: 8, height: 8 },
    },
    torso: {
      base: { x: 20, y: 20, width: 8, height: 12 },
      outer: { x: 20, y: 36, width: 8, height: 12 },
    },
    "right-arm": {
      base: { x: 44, y: 20, width: slimWidth, height: 12 },
      outer: { x: 44, y: 36, width: slimWidth, height: 12 },
    },
    "left-arm": {
      base: { x: 36, y: 52, width: slimWidth, height: 12 },
      outer: { x: 52, y: 52, width: slimWidth, height: 12 },
    },
    "right-leg": {
      base: { x: 4, y: 20, width: 4, height: 12 },
      outer: { x: 4, y: 36, width: 4, height: 12 },
    },
    "left-leg": {
      base: { x: 20, y: 52, width: 4, height: 12 },
      outer: { x: 4, y: 52, width: 4, height: 12 },
    },
  };
  return regions[part][layer];
}

function partToApi(part: EditorPart): MinecraftSkinPart {
  if (part === "head") return "head";
  if (part === "torso") return "torso";
  if (part === "right-arm" || part === "left-arm") return "arms";
  if (part === "right-leg" || part === "left-leg") return "legs";
  return "all";
}

function rgbaToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as const;
}

function pixelsToDataUrl(pixels: Uint8ClampedArray) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");
  context.putImageData(new ImageData(new Uint8ClampedArray(pixels), 64, 64), 0, 0);
  return canvas.toDataURL("image/png");
}

function markFaces(mask: Uint8Array, faces: Region[]) {
  for (const face of faces) {
    for (let y = face.y; y < face.y + face.height; y += 1) {
      for (let x = face.x; x < face.x + face.width; x += 1) mask[y * 64 + x] = 1;
    }
  }
}

function validateSkin(pixels: Uint8ClampedArray, model: MinecraftArmModel) {
  const baseMask = new Uint8Array(64 * 64);
  markFaces(baseMask, [...BASE_FACES, ...armBaseFaces(model)]);
  let transparentBasePixels = 0;
  for (let pixel = 0; pixel < baseMask.length; pixel += 1) {
    if (baseMask[pixel] && pixels[pixel * 4 + 3] < 255) transparentBasePixels += 1;
  }
  return {
    valid: transparentBasePixels === 0,
    transparentBasePixels,
  };
}

function PixelCanvas({
  pixels,
  region,
  tool,
  onBeginStroke,
  onPixel,
  onEndStroke,
}: {
  pixels: Uint8ClampedArray;
  region: Region;
  tool: EditorTool;
  onBeginStroke: () => void;
  onPixel: (x: number, y: number) => void;
  onEndStroke: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const scale = region.width === 64 ? 8 : 32;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = region.width * scale;
    canvas.height = region.height * scale;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.imageSmoothingEnabled = false;

    for (let localY = 0; localY < region.height; localY += 1) {
      for (let localX = 0; localX < region.width; localX += 1) {
        const x = region.x + localX;
        const y = region.y + localY;
        const offset = (y * 64 + x) * 4;
        const checker = (localX + localY) % 2 === 0 ? "#161821" : "#0d0f16";
        context.fillStyle = checker;
        context.fillRect(localX * scale, localY * scale, scale, scale);
        if (pixels[offset + 3] > 0) {
          context.fillStyle = `rgba(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]},${pixels[offset + 3] / 255})`;
          context.fillRect(localX * scale, localY * scale, scale, scale);
        }
      }
    }

    context.strokeStyle = region.width === 64 ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.16)";
    context.lineWidth = 1;
    for (let x = 0; x <= region.width; x += 1) {
      context.beginPath();
      context.moveTo(x * scale + 0.5, 0);
      context.lineTo(x * scale + 0.5, canvas.height);
      context.stroke();
    }
    for (let y = 0; y <= region.height; y += 1) {
      context.beginPath();
      context.moveTo(0, y * scale + 0.5);
      context.lineTo(canvas.width, y * scale + 0.5);
      context.stroke();
    }
  }, [pixels, region, scale]);

  const resolvePixel = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = Math.min(region.width - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * region.width)));
    const localY = Math.min(region.height - 1, Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * region.height)));
    onPixel(region.x + localX, region.y + localY);
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "max-h-[520px] max-w-full touch-none border border-white/10 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.35)] [image-rendering:pixelated]",
        tool === "picker" ? "cursor-crosshair" : "cursor-cell"
      )}
      onPointerDown={(event) => {
        drawingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        onBeginStroke();
        resolvePixel(event);
      }}
      onPointerMove={(event) => {
        if (drawingRef.current && tool !== "picker") resolvePixel(event);
      }}
      onPointerUp={(event) => {
        drawingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
        onEndStroke();
      }}
      onPointerCancel={() => {
        drawingRef.current = false;
        onEndStroke();
      }}
      aria-label="Minecraft skin pixel editor"
    />
  );
}

export function MinecraftSkinEditor({
  skinUrl,
  skinName,
  armModel,
  onSaved,
  onAiEdit,
}: MinecraftSkinEditorProps) {
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [originalPixels, setOriginalPixels] = useState<Uint8ClampedArray | null>(null);
  const pixelsRef = useRef<Uint8ClampedArray | null>(null);
  const strokeStartRef = useRef<Uint8ClampedArray | null>(null);
  const [undoStack, setUndoStack] = useState<Uint8ClampedArray[]>([]);
  const [redoStack, setRedoStack] = useState<Uint8ClampedArray[]>([]);
  const [tool, setTool] = useState<EditorTool>("pencil");
  const [color, setColor] = useState("#8b5cf6");
  const [part, setPart] = useState<EditorPart>("head");
  const [layer, setLayer] = useState<EditorLayer>("base");
  const [symmetry, setSymmetry] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiCommand, setAiCommand] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, 64, 64);
      context.drawImage(image, 0, 0, 64, 64);
      const loaded = new Uint8ClampedArray(context.getImageData(0, 0, 64, 64).data);
      pixelsRef.current = loaded;
      setPixels(loaded);
      setOriginalPixels(new Uint8ClampedArray(loaded));
      setUndoStack([]);
      setRedoStack([]);
      setMessage(null);
      setError(null);
    };
    image.onerror = () => !cancelled && setError("The skin texture could not be loaded into the editor.");
    image.src = `${skinUrl}${skinUrl.includes("?") ? "&" : "?"}editor=${Date.now()}`;
    return () => {
      cancelled = true;
    };
  }, [skinUrl]);

  const region = useMemo(() => getRegion(part, layer, armModel), [armModel, layer, part]);
  const validation = useMemo(
    () => pixels ? validateSkin(pixels, armModel) : { valid: false, transparentBasePixels: 0 },
    [armModel, pixels]
  );
  const palette = useMemo(() => {
    if (!pixels) return [];
    const counts = new Map<string, number>();
    for (let offset = 0; offset < pixels.length; offset += 4) {
      if (pixels[offset + 3] < 200) continue;
      const key = rgbaToHex(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([value]) => value);
  }, [pixels]);

  const updatePixels = useCallback((next: Uint8ClampedArray) => {
    pixelsRef.current = next;
    setPixels(next);
  }, []);

  const paintPixel = (x: number, y: number) => {
    const current = pixelsRef.current;
    if (!current) return;
    const offset = (y * 64 + x) * 4;
    if (tool === "picker") {
      if (current[offset + 3] > 0) setColor(rgbaToHex(current[offset], current[offset + 1], current[offset + 2]));
      setTool("pencil");
      return;
    }

    const next = new Uint8ClampedArray(current);
    const apply = (targetX: number) => {
      const targetOffset = (y * 64 + targetX) * 4;
      if (tool === "eraser") {
        next[targetOffset + 3] = 0;
      } else {
        const [red, green, blue] = hexToRgb(color);
        next[targetOffset] = red;
        next[targetOffset + 1] = green;
        next[targetOffset + 2] = blue;
        next[targetOffset + 3] = 255;
      }
    };
    apply(x);
    if (symmetry && part !== "full") {
      const mirroredX = region.x + region.width - 1 - (x - region.x);
      if (mirroredX !== x) apply(mirroredX);
    }
    updatePixels(next);
  };

  const beginStroke = () => {
    if (tool !== "picker" && pixelsRef.current) {
      strokeStartRef.current = new Uint8ClampedArray(pixelsRef.current);
    }
  };

  const endStroke = () => {
    const start = strokeStartRef.current;
    const current = pixelsRef.current;
    strokeStartRef.current = null;
    if (!start || !current) return;
    let changed = false;
    for (let index = 0; index < current.length; index += 1) {
      if (current[index] !== start[index]) {
        changed = true;
        break;
      }
    }
    if (changed) {
      setUndoStack((stack) => [...stack.slice(-39), start]);
      setRedoStack([]);
      setMessage(null);
    }
  };

  const undo = () => {
    if (!pixels || !undoStack.length) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [...stack.slice(-39), new Uint8ClampedArray(pixels)]);
    updatePixels(new Uint8ClampedArray(previous));
  };

  const redo = () => {
    if (!pixels || !redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));
    setUndoStack((stack) => [...stack.slice(-39), new Uint8ClampedArray(pixels)]);
    updatePixels(new Uint8ClampedArray(next));
  };

  const save = async () => {
    if (!pixels || !validation.valid) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/image/minecraft-skin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinDataUrl: pixelsToDataUrl(pixels),
          name: skinName,
          armModel,
        }),
      });
      const payload = await response.json() as { success?: boolean; skinUrl?: string; error?: string };
      if (!response.ok || !payload.success || !payload.skinUrl) {
        throw new Error(payload.error || "Could not save the edited skin.");
      }
      setOriginalPixels(new Uint8ClampedArray(pixels));
      setUndoStack([]);
      setRedoStack([]);
      setMessage("Pixel edits saved to your Exismic history.");
      onSaved(payload.skinUrl);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the edited skin.");
    } finally {
      setIsSaving(false);
    }
  };

  const runAiEdit = async () => {
    if (!pixels || aiCommand.trim().length < 3) return;
    setIsAiEditing(true);
    setError(null);
    setMessage(null);
    try {
      await onAiEdit(aiCommand.trim(), partToApi(part), pixelsToDataUrl(pixels));
      setAiCommand("");
    } catch (aiError) {
      setError(aiError instanceof Error ? aiError.message : "Exismic could not apply that edit.");
    } finally {
      setIsAiEditing(false);
    }
  };

  if (!pixels || !originalPixels) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-cyan-200" />
      </div>
    );
  }

  return (
    <div className="min-h-[520px] bg-[#070810] p-3 sm:p-5">
      <div className="grid gap-4 2xl:grid-cols-[220px_minmax(0,1fr)_260px]">
        <aside className="space-y-4 rounded-lg border border-white/10 bg-black/25 p-3">
          <div>
            <p className="mb-2 text-[11px] font-bold text-zinc-300">Body view</p>
            <select
              value={part}
              onChange={(event) => setPart(event.target.value as EditorPart)}
              className="min-h-11 w-full rounded-md border border-white/10 bg-[#0d0f16] px-3 text-xs font-semibold text-white outline-none focus:border-cyan-300/35"
            >
              {PART_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>

          {part !== "full" && (
            <div>
              <p className="mb-2 text-[11px] font-bold text-zinc-300">Texture layer</p>
              <div className="grid grid-cols-2 rounded-md border border-white/10 bg-black/30 p-1">
                {(["base", "outer"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLayer(value)}
                    className={cn(
                      "min-h-10 rounded px-2 text-[11px] font-semibold capitalize transition",
                      layer === value ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-bold text-zinc-300">Tool</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: "pencil", icon: Pencil, label: "Pencil" },
                { id: "eraser", icon: Eraser, label: "Eraser" },
                { id: "picker", icon: Pipette, label: "Pick color" },
              ] as const).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    onClick={() => setTool(item.id)}
                    className={cn(
                      "grid min-h-11 place-items-center rounded-md border transition",
                      tool === item.id
                        ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                        : "border-white/8 bg-white/[0.025] text-zinc-500 hover:text-white"
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-white/8 bg-white/[0.025] px-3">
            <span className="text-[11px] font-semibold text-zinc-300">Mirror horizontally</span>
            <input
              type="checkbox"
              checked={symmetry}
              disabled={part === "full"}
              onChange={(event) => setSymmetry(event.target.checked)}
              className="size-4 accent-cyan-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!undoStack.length}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/8 text-xs font-semibold text-zinc-400 transition hover:text-white disabled:opacity-30"
            >
              <Undo2 className="size-4" /> Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!redoStack.length}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/8 text-xs font-semibold text-zinc-400 transition hover:text-white disabled:opacity-30"
            >
              <Redo2 className="size-4" /> Redo
            </button>
          </div>
        </aside>

        <main className="flex min-h-[460px] flex-col items-center justify-center overflow-auto rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.08),transparent_46%)] p-4">
          <div className="mb-3 flex w-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">{PART_OPTIONS.find((option) => option.id === part)?.label}</p>
              <p className="mt-1 text-[10px] text-zinc-500">{region.width} x {region.height} pixels</p>
            </div>
            <button
              type="button"
              onClick={() => setShowOriginal((value) => !value)}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-md border px-3 text-[11px] font-semibold transition",
                showOriginal
                  ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                  : "border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              {showOriginal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showOriginal ? "Showing before" : "Compare before"}
            </button>
          </div>
          <PixelCanvas
            pixels={showOriginal ? originalPixels : pixels}
            region={region}
            tool={tool}
            onBeginStroke={beginStroke}
            onPixel={showOriginal ? () => undefined : paintPixel}
            onEndStroke={endStroke}
          />
        </main>

        <aside className="space-y-4 rounded-lg border border-white/10 bg-black/25 p-3">
          <div>
            <p className="mb-2 text-[11px] font-bold text-zinc-300">Paint color</p>
            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-black/30 p-2">
              <input
                type="color"
                value={color}
                onChange={(event) => {
                  setColor(event.target.value);
                  setTool("pencil");
                }}
                className="size-11 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Paint color"
              />
              <div>
                <p className="font-mono text-xs font-bold uppercase text-white">{color}</p>
                <p className="mt-1 text-[10px] text-zinc-600">Current swatch</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {palette.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  title={swatch}
                  aria-label={`Use ${swatch}`}
                  onClick={() => {
                    setColor(swatch);
                    setTool("pencil");
                  }}
                  className={cn(
                    "aspect-square rounded border transition hover:scale-105",
                    color === swatch ? "border-white ring-2 ring-cyan-300/40" : "border-white/10"
                  )}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          <div className={cn(
            "rounded-lg border p-3",
            validation.valid
              ? "border-emerald-300/18 bg-emerald-300/[0.045]"
              : "border-amber-300/20 bg-amber-300/[0.055]"
          )}>
            <div className="flex items-start gap-2.5">
              {validation.valid
                ? <ShieldCheck className="mt-0.5 size-4 text-emerald-200" />
                : <AlertTriangle className="mt-0.5 size-4 text-amber-200" />}
              <div>
                <p className="text-xs font-bold text-white">{validation.valid ? "Skin is game-ready" : "Base layer needs repair"}</p>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                  {validation.valid
                    ? "All required UV pixels are opaque."
                    : `${validation.transparentBasePixels} required pixels are transparent.`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold text-zinc-300">Exismic Ai edit</p>
            <textarea
              value={aiCommand}
              onChange={(event) => setAiCommand(event.target.value.slice(0, 240))}
              placeholder="Make the eyes angrier and add a short beard..."
              className="min-h-24 w-full resize-none rounded-md border border-white/10 bg-black/30 p-3 text-xs leading-5 text-white outline-none focus:border-violet-300/35"
            />
            <button
              type="button"
              onClick={() => void runAiEdit()}
              disabled={isAiEditing || aiCommand.trim().length < 3}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-violet-300/20 bg-violet-400/10 text-xs font-bold text-violet-100 transition hover:bg-violet-400/15 disabled:opacity-40"
            >
              {isAiEditing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Apply to current skin
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-300/20 bg-red-300/8 p-3 text-[11px] leading-5 text-red-100">{error}</div>
          )}
          {message && (
            <div className="flex items-start gap-2 rounded-md border border-emerald-300/18 bg-emerald-300/[0.045] p-3 text-[11px] leading-5 text-emerald-100">
              <Check className="mt-0.5 size-3.5 shrink-0" /> {message}
            </div>
          )}

          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving || !validation.valid}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-white text-xs font-black text-black transition hover:bg-cyan-50 disabled:opacity-40"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save pixel edits
          </button>
          <p className="text-center text-[10px] leading-4 text-zinc-600">
            Manual edits are free. AI edits use the displayed generation credits.
          </p>
        </aside>
      </div>
    </div>
  );
}
