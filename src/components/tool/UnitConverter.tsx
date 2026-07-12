"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Scale, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Zap,
  ChevronDown,
  Globe,
  Database,
  Thermometer,
  Clock,
  Ruler,
  Weight,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type UnitCategory = "length" | "weight" | "temp" | "volume" | "speed" | "time" | "data";

interface Unit {
  label: string;
  value: string;
  ratio?: number;
}

const UNITS: Record<UnitCategory, Unit[]> = {
  length: [
    { label: "Kilometers (km)", value: "km", ratio: 1000 },
    { label: "Meters (m)", value: "m", ratio: 1 },
    { label: "Centimeters (cm)", value: "cm", ratio: 0.01 },
    { label: "Miles (mi)", value: "mi", ratio: 1609.34 },
    { label: "Feet (ft)", value: "ft", ratio: 0.3048 },
    { label: "Inches (in)", value: "in", ratio: 0.0254 },
  ],
  weight: [
    { label: "Metric Tons", value: "t", ratio: 1000000 },
    { label: "Kilograms (kg)", value: "kg", ratio: 1000 },
    { label: "Grams (g)", value: "g", ratio: 1 },
    { label: "Pounds (lb)", value: "lb", ratio: 453.592 },
    { label: "Ounces (oz)", value: "oz", ratio: 28.3495 },
  ],
  temp: [
    { label: "Celsius (°C)", value: "c" },
    { label: "Fahrenheit (°F)", value: "f" },
    { label: "Kelvin (K)", value: "k" },
  ],
  volume: [
    { label: "Liters (l)", value: "l", ratio: 1 },
    { label: "Milliliters (ml)", value: "ml", ratio: 0.001 },
    { label: "Gallons (gal)", value: "gal", ratio: 3.78541 },
    { label: "Cups", value: "cup", ratio: 0.236588 },
  ],
  speed: [
    { label: "Kilometers / hr", value: "kph", ratio: 0.277778 },
    { label: "Miles / hr", value: "mph", ratio: 0.44704 },
    { label: "Meters / sec", value: "ms", ratio: 1 },
    { label: "Knots", value: "kn", ratio: 0.514444 },
  ],
  time: [
    { label: "Years", value: "yr", ratio: 31536000 },
    { label: "Days", value: "d", ratio: 86400 },
    { label: "Hours", value: "hr", ratio: 3600 },
    { label: "Minutes", value: "min", ratio: 60 },
    { label: "Seconds", value: "s", ratio: 1 },
  ],
  data: [
    { label: "Gigabytes (GB)", value: "gb", ratio: 1073741824 },
    { label: "Megabytes (MB)", value: "mb", ratio: 1048576 },
    { label: "Kilobytes (KB)", value: "kb", ratio: 1024 },
    { label: "Bytes (B)", value: "b", ratio: 1 },
  ]
};

const CATEGORIES: { id: UnitCategory, label: string, icon: LucideIcon }[] = [
  { id: "length", label: "Length", icon: Ruler },
  { id: "weight", label: "Weight", icon: Weight },
  { id: "temp", label: "Temp", icon: Thermometer },
  { id: "volume", label: "Volume", icon: Database },
  { id: "speed", label: "Speed", icon: Zap },
  { id: "time", label: "Time", icon: Clock },
  { id: "data", label: "Data", icon: Database },
];

export function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromValue, setFromValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("km");
  const [toUnit, setToUnit] = useState<string>("m");
  const [isCopied, setIsCopied] = useState(false);

  // Auto-sync units on category change
  useEffect(() => {
    const units = UNITS[category];
    setFromUnit(units[0].value);
    setToUnit(units[1]?.value || units[0].value);
  }, [category]);

  const result = useMemo(() => {
    const val = parseFloat(fromValue);
    if (isNaN(val)) return "0";
    if (category === "temp") {
      if (fromUnit === toUnit) return val.toString();
      let c = val;
      if (fromUnit === "f") c = (val - 32) * (5/9);
      if (fromUnit === "k") c = val - 273.15;
      let f = c;
      if (toUnit === "f") f = (c * 9/5) + 32;
      if (toUnit === "k") f = c + 273.15;
      return Number(f.toFixed(4)).toString();
    }
    const fU = UNITS[category].find(u => u.value === fromUnit);
    const tU = UNITS[category].find(u => u.value === toUnit);
    if (!fU || !tU) return "0";
    const res = (val * fU.ratio!) / tU.ratio!;
    return Number(res.toPrecision(10)).toString();
  }, [category, fromValue, fromUnit, toUnit]);

  const handleSwap = () => {
    const prevFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(prevFrom);
    setFromValue(result);
  };

  const UnitSelect = ({ value, onChange, units }: { value: string; onChange: (value: string) => void; units: Unit[]; label: string }) => {
    const [open, setOpen] = useState(false);
    const active = units.find((unit) => unit.value === value);
    return (
      <div className="relative flex-1">
        <button 
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full h-16 px-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all text-sm font-bold text-zinc-300 group"
        >
          <span>{active?.label}</span>
          <ChevronDown className={cn("text-zinc-500 transition-transform", open && "rotate-180")} size={18} />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-100" onClick={() => setOpen(false)} />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute left-0 right-0 mt-2 p-2 rounded-2xl glass-dark border border-white/10 shadow-4xl z-110 max-h-[250px] overflow-y-auto"
              >
                {units.map((u) => (
                  <button 
                    key={u.value} 
                    onClick={() => { onChange(u.value); setOpen(false); }}
                    className={cn("w-full p-4 rounded-xl text-left text-xs font-bold transition-all", value === u.value ? "bg-accent-purple text-white" : "text-zinc-500 hover:bg-white/5 hover:text-white")}
                  >
                    {u.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* 1. Main Conversion Card */}
      <div className="p-8 md:p-12 rounded-[3.5rem] glass-dark border border-white/5 relative shadow-3xl overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-accent-purple/50 to-accent-blue/50" />
         
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Convert From */}
            <div className="flex-1 w-full space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 block ml-2">Convert From</label>
                  <input 
                    type="number" 
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    className="w-full bg-transparent text-5xl md:text-6xl font-black text-white focus:outline-none placeholder:text-zinc-800"
                  />
               </div>
               <UnitSelect label="Convert from" value={fromUnit} onChange={setFromUnit} units={UNITS[category]} />
            </div>

            {/* Swap Button Component */}
            <div className="shrink-0 pt-8">
               <button 
                 onClick={handleSwap}
                 className="w-14 h-14 rounded-full bg-accent-purple text-white flex items-center justify-center hover:scale-110 active:rotate-180 transition-all shadow-3xl group"
               >
                  <ArrowRightLeft size={24} className="group-hover:scale-110" />
               </button>
            </div>

            {/* Convert To */}
            <div className="flex-1 w-full space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 block ml-2">Result Value</label>
                  <div className="text-5xl md:text-6xl font-black text-accent-purple break-all min-h-[70px]">
                     {result}
                  </div>
               </div>
               <UnitSelect label="Convert to" value={toUnit} onChange={setToUnit} units={UNITS[category]} />
            </div>
         </div>

         {/* Copy Action */}
         <div className="mt-12 flex justify-center">
            <button 
              onClick={() => { navigator.clipboard.writeText(result); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}
              className={cn(
                "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all",
                isCopied ? "bg-emerald-500 text-white" : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
            >
               {isCopied ? <Check size={16} /> : <Copy size={16} />}
               {isCopied ? "Copied" : "Copy Result"}
            </button>
         </div>
      </div>

      {/* 2. Category Segmented Control */}
      <div className="p-3 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-wrap gap-2 justify-center">
         {CATEGORIES.map((cat) => {
           const Active = category === cat.id;
           const Icon = cat.icon;
           return (
             <button
               key={cat.id}
               onClick={() => setCategory(cat.id)}
               className={cn(
                 "px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all outline-none",
                 Active ? "bg-accent-purple text-white shadow-xl" : "text-zinc-500 hover:text-zinc-300"
               )}
             >
               <Icon size={14} />
               {cat.label}
             </button>
           );
         })}
      </div>

      {/* 3. Popular Chips & Note */}
      <div className="flex flex-col items-center gap-8">
         <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "km → mi", f: "km", t: "mi", c: "length" },
              { label: "kg → lb", f: "kg", t: "lb", c: "weight" },
              { label: "°C → °F", f: "c", t: "f", c: "temp" },
              { label: "GB → MB", f: "gb", t: "mb", c: "data" }
            ].map((chip, i) => (
              <button 
                key={i}
                onClick={() => { setCategory(chip.c as UnitCategory); setFromUnit(chip.f); setToUnit(chip.t); }}
                className="px-5 py-2.5 rounded-xl bg-zinc-800/50 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
              >
                {chip.label}
              </button>
            ))}
         </div>
         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 text-center">
            IEEE 754 Floating-Point Standard / 10-Decimal Precision Accuracy
         </p>
      </div>
    </div>
  );
}
