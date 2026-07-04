"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  X, 
  Plus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layout,
  Grid,
  Columns,
  Settings2,
  Sparkles,
  Loader2,
  Maximize2,
  RotateCw,
  Layers,
  Square,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type CollageLayout = 'duo' | 'classic' | 'grid-4' | 'grid-9' | 'pinterest' | 'auto' | 'custom';
type CollageRatio = '1:1' | '4:5' | '9:16' | '16:9' | '3:2' | '2:3';

interface CollageItem {
  id: string;
  preview: string;
  x: number; // Percent 0-100
  y: number; // Percent 0-100
  w: number; // Percent 0-100
  h: number; // Percent 0-100
  rotation: number;
  zIndex: number;
}

export function CollageMaker() {
  const [items, setItems] = useState<CollageItem[]>([]);
  const [activeLayout, setActiveLayout] = useState<CollageLayout>('auto');
  const [collageRatio, setCollageRatio] = useState<CollageRatio>('1:1');
  const [spacing, setSpacing] = useState(10);
  const [borderRadius, setBorderRadius] = useState(16);
  const [bgColor, setBgColor] = useState('#0a0a0a');
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultFormat, setResultFormat] = useState<"jpg" | "png">("jpg");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<CollageItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setError("Please upload image files only.");
      return;
    }

    const newItems = imageFiles.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      x: 0,
      y: 0,
      w: 50,
      h: 50,
      rotation: 0,
      zIndex: items.length + index
    }));
    
    setItems(prev => {
        const updated = [...prev, ...newItems].slice(0, 9);
        return applyLayoutPresets(updated, activeLayout);
    });
    setResult(null);
    setError(null);
  }, [items.length, activeLayout]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const applyLayoutPresets = (currentItems: CollageItem[], layout: CollageLayout): CollageItem[] => {
    const count = currentItems.length;
    if (count === 0) return [];
    
    const updated = currentItems.map((item) => ({ ...item }));

    if (layout === 'duo' && count >= 2) {
      updated[0] = { ...updated[0], x: 0, y: 0, w: 50, h: 100 };
      updated[1] = { ...updated[1], x: 50, y: 0, w: 50, h: 100 };
    } else if (layout === 'classic' && count >= 3) {
      updated[0] = { ...updated[0], x: 0, y: 0, w: 60, h: 100 };
      updated[1] = { ...updated[1], x: 60, y: 0, w: 40, h: 50 };
      updated[2] = { ...updated[2], x: 60, y: 50, w: 40, h: 50 };
    } else if (layout === 'grid-4' && count >= 4) {
      updated[0] = { ...updated[0], x: 0, y: 0, w: 50, h: 50 };
      updated[1] = { ...updated[1], x: 50, y: 0, w: 50, h: 50 };
      updated[2] = { ...updated[2], x: 0, y: 50, w: 50, h: 50 };
      updated[3] = { ...updated[3], x: 50, y: 50, w: 50, h: 50 };
    } else if (layout === 'grid-9' && count >= 1) {
       const cols = 3;
       const rows = 3;
       const unitW = 100 / cols;
       const unitH = 100 / rows;
       updated.forEach((item, i) => {
          if (i < 9) {
            item.x = (i % cols) * unitW;
            item.y = Math.floor(i / cols) * unitH;
            item.w = unitW;
            item.h = unitH;
          }
       });
    } else if (layout === 'pinterest') {
       const colHeights = [0, 0];
       updated.forEach((item, i) => {
          const col = colHeights[0] <= colHeights[1] ? 0 : 1;
          const itemHeight = i % 3 === 0 ? 48 : 34;
          item.x = col * 50;
          item.y = Math.min(100 - itemHeight, colHeights[col]);
          item.w = 50;
          item.h = itemHeight;
          colHeights[col] += itemHeight;
       });
    } else if (layout === 'auto') {
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const unitW = 100 / cols;
      const unitH = 100 / rows;
      updated.forEach((item, i) => {
        item.x = (i % cols) * unitW;
        item.y = Math.floor(i / cols) * unitH;
        item.w = unitW;
        item.h = unitH;
      });
    }

    return updated;
  };

  const handleLayoutChange = (l: CollageLayout) => {
    setActiveLayout(l);
    if (l !== 'custom') {
      setItems(prev => applyLayoutPresets(prev, l));
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const found = prev.find(item => item.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter(item => item.id !== id);
    });
    setResult(null);
  };

  const updateItem = (id: string, updates: Partial<CollageItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, ...updates };
      next.w = Math.max(8, Math.min(100, next.w));
      next.h = Math.max(8, Math.min(100, next.h));
      next.x = Math.max(0, Math.min(100 - next.w, next.x));
      next.y = Math.max(0, Math.min(100 - next.h, next.y));
      return next;
    }));
    setActiveLayout('custom'); // Any manual move makes it custom
    setResult(null);
  };

  const generateCollage = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);
    setError(null);
    
    // Neural feel
    await new Promise(resolve => setTimeout(resolve, 2000));

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      setError("Could not create export canvas.");
      return;
    }

    const getDimensions = () => {
        const base = 2000;
        switch(collageRatio) {
            case '4:5': return { w: base, h: base * 1.25 };
            case '9:16': return { w: base, h: base * (16/9) };
            case '16:9': return { w: base * (16/9), h: base };
            case '3:2': return { w: base * 1.5, h: base };
            case '2:3': return { w: base, h: base * 1.5 };
            default: return { w: base, h: base };
        }
    };

    const { w: width, h: height } = getDimensions();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      setError("Could not create export context.");
      return;
    }

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    try {
      for (const item of [...items].sort((a,b) => a.zIndex - b.zIndex)) {
        await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                ctx.save();
                
                const drawX = (item.x / 100) * width + spacing;
                const drawY = (item.y / 100) * height + spacing;
                const drawW = Math.max(1, (item.w / 100) * width - (spacing * 2));
                const drawH = Math.max(1, (item.h / 100) * height - (spacing * 2));

                if (borderRadius > 0) {
                    const br = (borderRadius / 100) * Math.min(drawW, drawH);
                    ctx.beginPath();
                    ctx.moveTo(drawX + br, drawY);
                    ctx.lineTo(drawX + drawW - br, drawY);
                    ctx.quadraticCurveTo(drawX + drawW, drawY, drawX + drawW, drawY + br);
                    ctx.lineTo(drawX + drawW, drawY + drawH - br);
                    ctx.quadraticCurveTo(drawX + drawW, drawY + drawH, drawX + drawW - br, drawY + drawH);
                    ctx.lineTo(drawX + br, drawY + drawH);
                    ctx.quadraticCurveTo(drawX, drawY + drawH, drawX, drawY + drawH - br);
                    ctx.lineTo(drawX, drawY + br);
                    ctx.quadraticCurveTo(drawX, drawY, drawX + br, drawY);
                    ctx.closePath();
                    ctx.clip();
                }

                if (item.rotation !== 0) {
                    ctx.translate(drawX + drawW/2, drawY + drawH/2);
                    ctx.rotate((item.rotation * Math.PI) / 180);
                    ctx.translate(-(drawX + drawW/2), -(drawY + drawH/2));
                }

                // Aspect correction
                const imgAspect = img.width / img.height;
                const targetAspect = drawW / drawH;
                let sW, sH, sX, sY;
                if (imgAspect > targetAspect) {
                   sH = img.height;
                   sW = img.height * targetAspect;
                   sX = (img.width - sW) / 2;
                   sY = 0;
                } else {
                   sW = img.width;
                   sH = img.width / targetAspect;
                   sX = 0;
                   sY = (img.height - sH) / 2;
                }

                ctx.drawImage(img, sX, sY, sW, sH, drawX, drawY, drawW, drawH);
                
                if (borderWidth > 0) {
                   ctx.strokeStyle = borderColor;
                   ctx.lineWidth = (borderWidth / 100) * width;
                   ctx.stroke();
                }

                ctx.restore();
                resolve();
            };
            img.onerror = () => reject(new Error("Could not load one of the collage images."));
            img.src = item.preview;
        });
      }

      const exportFormat = bgColor === 'transparent' ? 'png' : 'jpg';
      setResultFormat(exportFormat);
      setResult(exportFormat === 'png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.95));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate collage.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-12">
      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <div
              {...getRootProps()}
              className={cn(
                "group flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-5 text-center transition-all duration-700 sm:min-h-[450px] sm:rounded-[4rem] sm:p-12",
                isDragActive ? "border-accent-purple bg-accent-purple/5 shadow-3xl" : "border-zinc-800 glass-dark hover:border-white/20 shadow-xl"
              )}
            >
              <input {...getInputProps()} />
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-white/5 bg-zinc-800/50 text-zinc-500 shadow-4xl transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 group-hover:text-accent-purple sm:mb-10 sm:h-32 sm:w-32 sm:rounded-[3rem]">
                 <div className="absolute inset-0 bg-accent-purple/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                 <LayoutGrid className="h-9 w-9 sm:h-14 sm:w-14" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase italic leading-none tracking-tighter text-white sm:text-4xl">Initialize Collage</h3>
                <p className="mx-auto max-w-lg text-sm font-medium leading-relaxed text-zinc-500 sm:text-xl">
                   Drop multiple photos to begin high-fidelity layout synthesis.
                </p>
              </div>
              <div className="premium-gradient mt-7 flex min-h-12 w-full max-w-xs items-center justify-center rounded-2xl px-5 text-xs font-black uppercase tracking-wider text-white shadow-4xl transition-all group-hover:scale-[1.02] active:scale-95 sm:mt-10 sm:px-12 sm:text-sm sm:tracking-widest">
                Select Workspace Files
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
             {/* CONFIG PANEL */}
             <motion.aside 
               initial={{ opacity: 0, x: -30 }} 
               animate={{ opacity: 1, x: 0 }} 
               className="xl:col-span-4 space-y-8"
             >
                <div className="glass-dark relative space-y-7 overflow-hidden rounded-[2rem] border border-white/5 p-5 shadow-3xl sm:space-y-10 sm:rounded-[3rem] sm:p-8">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-accent-purple/5 blur-[80px] pointer-events-none" />
                   
                   {/* Elements List */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <div className="flex items-center gap-3">
                            <Layers size={18} className="text-accent-purple" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Neural Elements</h3>
                         </div>
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{items.length}/9 ACTIVE</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 min-[430px]:grid-cols-5 sm:gap-3">
                         {items.map((item) => (
                           <div key={item.id} className="relative group aspect-square">
                              <img src={item.preview} className="w-full h-full object-cover rounded-xl border border-white/10" alt="Collage item thumbnail" />
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X size={10} />
                              </button>
                           </div>
                         ))}
                         {items.length < 9 && (
                           <button {...getRootProps()} className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 hover:border-accent-purple hover:text-accent-purple transition-all">
                              <input {...getInputProps()} />
                              <Plus size={20} />
                           </button>
                         )}
                      </div>
                   </div>

                   {/* Layout Presets */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                         <Layout size={18} className="text-accent-purple" />
                         <h3 className="text-sm font-black uppercase tracking-widest text-white">Preset Matrix</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         {[
                           { id: 'duo', name: 'Duo', icon: Columns },
                           { id: 'classic', name: 'Classic', icon: Layout },
                           { id: 'grid-4', name: 'Grid 2x2', icon: Grid },
                           { id: 'grid-9', name: 'Grid 3x3', icon: LayoutGrid },
                           { id: 'pinterest', name: 'Pinterest', icon: Sparkles },
                           { id: 'auto', name: 'Auto Fit', icon: RotateCw },
                         ].map((l) => (
                           <button
                             key={l.id}
                             onClick={() => handleLayoutChange(l.id as CollageLayout)}
                             className={cn(
                               "flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-left group",
                               activeLayout === l.id ? "bg-accent-purple/10 border-accent-purple/50 text-white shadow-xl" : "border-white/5 bg-white/[0.02] text-zinc-500 hover:text-white"
                             )}
                           >
                             <l.icon size={16} className={cn("group-hover:rotate-12 transition-transform", activeLayout === l.id && "text-accent-purple")} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{l.name}</span>
                           </button>
                         ))}
                      </div>
                   </div>

                    {/* Global Styling */}
                   <div className="space-y-8">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                         <Settings2 size={18} className="text-accent-purple" />
                         <h3 className="text-sm font-black uppercase tracking-widest text-white">Composition Core</h3>
                      </div>
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                               <span>Output Ratio</span>
                               <span className="text-accent-purple font-black">{collageRatio}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                               {['1:1', '4:5', '9:16', '16:9', '3:2', '2:3'].map(r => (
                                 <button
                                   key={r}
                                   onClick={() => setCollageRatio(r as CollageRatio)}
                                   className={cn(
                                     "py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
                                     collageRatio === r ? "bg-accent-purple/20 border-accent-purple text-white" : "border-white/5 bg-white/[0.02] text-zinc-500 hover:text-white"
                                   )}
                                 >
                                   {r}
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                               <span>Internal Spacing</span>
                               <span>{spacing}PX</span>
                            </div>
                            <input type="range" min={0} max={60} value={spacing} onChange={(e) => setSpacing(parseInt(e.target.value))} className="w-full accent-accent-purple" />
                         </div>
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                               <span>Neural Curvature</span>
                               <span>{borderRadius}PX</span>
                            </div>
                            <input type="range" min={0} max={100} value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} className="w-full accent-accent-purple" />
                         </div>
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                               <span>Edge Profile</span>
                               <span>{borderWidth}PX</span>
                            </div>
                            <div className="flex gap-4 items-center">
                               <input type="range" min={0} max={20} value={borderWidth} onChange={(e) => setBorderWidth(parseInt(e.target.value))} className="flex-1 accent-accent-purple" />
                               <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-8 h-8 rounded-full border-none bg-transparent cursor-pointer" />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                               <span>Canvas Alpha</span>
                            </div>
                            <div className="flex gap-2">
                               {['#0a0a0a', '#ffffff', 'transparent', '#a855f7', '#06b6d4'].map(c => (
                                 <button 
                                   key={c}
                                   onClick={() => setBgColor(c)}
                                   className={cn(
                                     "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110",
                                     bgColor === c ? "border-accent-purple scale-110 shadow-lg" : "border-white/10"
                                   )}
                                   style={{ background: c === 'transparent' ? 'repeating-conic-gradient(#222 0% 25%, #111 0% 50%) 50% / 10px 10px' : c }}
                                 />
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={generateCollage}
                     disabled={isGenerating}
                     className="w-full py-6 rounded-2xl premium-gradient text-white font-black text-sm uppercase tracking-widest shadow-4xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                     {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                     {isGenerating ? "Synthesizing Layers..." : "Generate Masterpiece"}
                   </button>
                   {error && (
                     <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold leading-relaxed">
                       {error}
                     </div>
                   )}
                </div>
             </motion.aside>

             {/* PREVIEW CANVAS */}
             <motion.main 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="xl:col-span-8 flex flex-col gap-8"
             >
                <div 
                   ref={containerRef}
                   className="relative flex-1 rounded-[4rem] border border-white/10 glass-dark shadow-inner min-h-[600px] overflow-hidden group p-1 transition-all duration-500"
                   style={{ 
                       background: bgColor === 'transparent' ? 'repeating-conic-gradient(#111 0% 25%, #050505 0% 50%) 50% / 20px 20px' : bgColor,
                       aspectRatio: collageRatio.replace(':', '/')
                   }}
                >
                   {/* Grid Overlay Hints */}
                   <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-[0.03] pointer-events-none">
                      {Array.from({length: 144}).map((_, i) => <div key={i} className="border border-white/20" />)}
                   </div>

                   {items.map((item) => (
                      <motion.div
                        key={item.id}
                        drag
                        dragMomentum={false}
                        onDrag={(e, info) => {
                           const container = containerRef.current;
                           if (!container) return;
                           const rect = container.getBoundingClientRect();
                           const newX = ((info.point.x - rect.left) / rect.width) * 100 - item.w / 2;
                           const newY = ((info.point.y - rect.top) / rect.height) * 100 - item.h / 2;
                           updateItem(item.id, { x: newX, y: newY });
                        }}
                        style={{
                           position: 'absolute',
                           left: `${item.x}%`,
                           top: `${item.y}%`,
                           width: `${item.w}%`,
                           height: `${item.h}%`,
                           padding: `${spacing}px`,
                           zIndex: item.zIndex,
                           rotate: item.rotation,
                           cursor: 'move'
                        }}
                        className="group/item"
                      >
                         <div 
                           className="w-full h-full relative shadow-2xl transition-all"
                           style={{ 
                             borderRadius: `${borderRadius}px`, 
                             overflow: 'hidden',
                             border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'
                           }}
                         >
                            <img src={item.preview} className="w-full h-full object-cover select-none pointer-events-none" alt="Collage layer" />
                            
                            {/* Resize Handles */}
                            <div className="absolute inset-0 bg-accent-purple/20 opacity-0 group-hover/item:opacity-100 transition-opacity border-2 border-accent-purple pointer-events-none" />
                            
                            {/* Inner Controls Overlay */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                               <button 
                                 className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-accent-purple transition-colors"
                                 onPointerDown={(e) => {
                                    e.stopPropagation();
                                    updateItem(item.id, { rotation: item.rotation + 15 });
                                 }}
                               >
                                 <RotateCw size={14} />
                               </button>
                               <button 
                                 className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-accent-purple transition-colors"
                                 onPointerDown={(e) => {
                                   e.stopPropagation();
                                   updateItem(item.id, { w: Math.min(100, item.w + 10), h: Math.min(100, item.h + 10) });
                                 }}
                               >
                                 <Maximize2 size={14} />
                               </button>
                               <button 
                                 className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-accent-purple transition-colors"
                                 onPointerDown={(e) => {
                                   e.stopPropagation();
                                   updateItem(item.id, { w: Math.max(10, item.w - 10), h: Math.max(10, item.h - 10) });
                                 }}
                               >
                                 <Square size={12} className="scale-75" />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                   ))}

                   {/* Generation Processing Overlay */}
                   <AnimatePresence>
                      {isGenerating && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center p-12 overflow-hidden"
                        >
                           <div className="absolute inset-0 bg-linear-to-tr from-accent-purple/20 to-accent-blue/20 animate-pulse" />
                           <div className="relative w-40 h-40 mb-12">
                              <div className="absolute inset-0 rounded-full border-8 border-white/5" />
                              <motion.div 
                                className="absolute inset-0 rounded-full border-8 border-accent-purple border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <Sparkles className="text-accent-purple animate-bounce" size={48} />
                              </div>
                           </div>
                           <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 text-center">Exporting Masterpiece</h2>
                           <div className="flex items-center gap-4">
                              <Loader2 size={24} className="text-accent-purple animate-spin" />
                              <span className="text-sm font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse text-center">Generating High-Resolution Matrix</span>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                {/* Final Result Modal / State */}
                <AnimatePresence>
                   {result && (
                     <motion.div 
                       initial={{ opacity: 0, y: 50 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 md:p-20"
                     >
                        <div className="max-w-5xl w-full flex flex-col gap-8">
                           <div className="flex items-center justify-between">
                              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Result Finalized</h2>
                              <button onClick={() => setResult(null)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10">
                                 <X size={24} />
                              </button>
                           </div>
                            <div className="relative rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-4xl group bg-zinc-950 flex items-center justify-center">
                               <img src={result} className="max-w-full max-h-[70vh] object-contain" alt="Generated collage result" />
                               <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-emerald-500/80 backdrop-blur-md border border-emerald-400/20 text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                  <CheckCircle2 size={16} /> 
                                  {collageRatio === '1:1' ? '2000x2000' : 
                                   collageRatio === '4:5' ? '2000x2500' :
                                   collageRatio === '9:16' ? '2000x3555' :
                                   collageRatio === '16:9' ? '3555x2000' :
                                   collageRatio === '3:2' ? '3000x2000' : '2000x3000'} Neural Ultra-HD
                               </div>
                            </div>
                           <div className="flex flex-col md:flex-row gap-4">
                              <a 
                                href={result}
                                download={`toolverse-collage-${Date.now()}.${resultFormat}`}
                                className="flex-[2] py-8 rounded-3xl bg-emerald-500 text-white font-black text-lg uppercase tracking-widest shadow-4xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                              >
                                <Download size={28} /> Export as High-Res {resultFormat.toUpperCase()}
                              </a>
                              <button 
                                onClick={() => {
                                  items.forEach((item) => URL.revokeObjectURL(item.preview));
                                  setItems([]);
                                  setResult(null);
                                  setError(null);
                                }}
                                className="flex-1 py-8 rounded-3xl glass-dark border border-white/10 text-zinc-400 font-black text-lg uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-4"
                              >
                                <RefreshCw size={24} /> Start New
                              </button>
                           </div>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </motion.main>
          </div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
