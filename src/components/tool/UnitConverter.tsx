"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Ruler,
  Scale,
  Thermometer,
  Droplets,
  Maximize2,
  Gauge,
  Clock,
  HardDrive,
  Zap,
  GaugeCircle,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  History,
  BookOpen,
  Info,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CyberDropdown, type DropdownOption } from "@/components/ui/CyberDropdown";

export type UnitCategory =
  | "length"
  | "weight"
  | "temp"
  | "volume"
  | "area"
  | "speed"
  | "time"
  | "data"
  | "energy"
  | "pressure";

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  ratio?: number; // Ratio relative to base unit of category
  description?: string;
}

export interface UnitCategoryConfig {
  id: UnitCategory;
  name: string;
  icon: LucideIcon;
  baseUnit: string;
  units: UnitDefinition[];
  intuition: (val: number, fromUnit: string) => string | null;
}

const CATEGORY_CONFIGS: Record<UnitCategory, UnitCategoryConfig> = {
  length: {
    id: "length",
    name: "Length & Distance",
    icon: Ruler,
    baseUnit: "m",
    units: [
      { id: "km", name: "Kilometers", symbol: "km", ratio: 1000, description: "Metric distance (1,000 meters)" },
      { id: "m", name: "Meters", symbol: "m", ratio: 1, description: "Standard metric base length" },
      { id: "cm", name: "Centimeters", symbol: "cm", ratio: 0.01, description: "Metric subunit (0.01 meters)" },
      { id: "mm", name: "Millimeters", symbol: "mm", ratio: 0.001, description: "Small metric subunit (1/1000 m)" },
      { id: "mi", name: "Miles", symbol: "mi", ratio: 1609.344, description: "Imperial road distance (5,280 ft)" },
      { id: "yd", name: "Yards", symbol: "yd", ratio: 0.9144, description: "Imperial sports & field (3 ft)" },
      { id: "ft", name: "Feet", symbol: "ft", ratio: 0.3048, description: "Imperial standard height (12 in)" },
      { id: "in", name: "Inches", symbol: "in", ratio: 0.0254, description: "Imperial craft & screen measurement" },
      { id: "nmi", name: "Nautical Miles", symbol: "nmi", ratio: 1852, description: "Marine and aviation navigation" },
    ],
    intuition: (val, unit) => {
      if (unit === "km") {
        return `${val} km is about ${(val * 10).toFixed(0)} soccer fields or roughly a ${(val * 12).toFixed(0)}-minute brisk walk.`;
      }
      if (unit === "mi") {
        return `${val} mile${val === 1 ? "" : "s"} is roughly ${(val * 4).toFixed(0)} standard stadium track laps.`;
      }
      if (unit === "m") {
        return `${val} meter${val === 1 ? "" : "s"} is approximately the length of ${(val * 1.1).toFixed(1)} adult strides.`;
      }
      return null;
    },
  },
  weight: {
    id: "weight",
    name: "Weight & Mass",
    icon: Scale,
    baseUnit: "g",
    units: [
      { id: "t", name: "Metric Tons", symbol: "t", ratio: 1000000, description: "Industrial metric mass (1,000 kg)" },
      { id: "kg", name: "Kilograms", symbol: "kg", ratio: 1000, description: "Standard metric body & food mass" },
      { id: "g", name: "Grams", symbol: "g", ratio: 1, description: "Cooking, science & postage weight" },
      { id: "mg", name: "Milligrams", symbol: "mg", ratio: 0.001, description: "Medicine & supplement dosing" },
      { id: "lb", name: "Pounds", symbol: "lb", ratio: 453.59237, description: "Imperial everyday body & grocery" },
      { id: "oz", name: "Ounces", symbol: "oz", ratio: 28.34952, description: "Imperial culinary weight (1/16 lb)" },
      { id: "st", name: "Stones", symbol: "st", ratio: 6350.293, description: "UK traditional body weight (14 lb)" },
      { id: "ton_us", name: "US Short Tons", symbol: "ton", ratio: 907184.74, description: "US heavy freight (2,000 lb)" },
    ],
    intuition: (val, unit) => {
      if (unit === "kg") {
        return `${val} kg is equal to the weight of about ${val} liter${val === 1 ? "" : "s"} of pure water.`;
      }
      if (unit === "lb") {
        return `${val} lb is roughly the weight of ${(val * 1.05).toFixed(1)} standard footballs.`;
      }
      if (unit === "g") {
        return `${val} gram${val === 1 ? "" : "s"} is about ${(val / 5).toFixed(1)} metal paperclips.`;
      }
      return null;
    },
  },
  temp: {
    id: "temp",
    name: "Temperature",
    icon: Thermometer,
    baseUnit: "c",
    units: [
      { id: "c", name: "Celsius", symbol: "°C", description: "Standard international weather & science" },
      { id: "f", name: "Fahrenheit", symbol: "°F", description: "US everyday weather & oven cooking" },
      { id: "k", name: "Kelvin", symbol: "K", description: "Absolute zero thermodynamic scale" },
      { id: "r", name: "Rankine", symbol: "°R", description: "Absolute thermodynamic Fahrenheit scale" },
    ],
    intuition: (val, unit) => {
      if (unit === "c") {
        if (val <= 0) return "At or below freezing point of water (0°C). Snow and ice form.";
        if (val >= 20 && val <= 24) return "Comfortable indoor room temperature range (20–24°C).";
        if (val >= 37 && val <= 38) return "Normal human body core temperature (~37°C).";
        if (val >= 100) return "At or above the boiling point of pure water at sea level (100°C).";
      }
      if (unit === "f") {
        if (val <= 32) return "At or below freezing point of water (32°F). Frost conditions.";
        if (val >= 68 && val <= 74) return "Standard comfortable indoor room temperature (68–74°F).";
        if (val >= 98 && val <= 99) return "Normal human body temperature (~98.6°F).";
        if (val >= 212) return "Boiling point of water at standard atmospheric pressure (212°F).";
      }
      return null;
    },
  },
  volume: {
    id: "volume",
    name: "Liquid & Volume",
    icon: Droplets,
    baseUnit: "l",
    units: [
      { id: "l", name: "Liters", symbol: "L", ratio: 1, description: "Standard metric beverage & bottle volume" },
      { id: "ml", name: "Milliliters", symbol: "mL", ratio: 0.001, description: "Metric cooking, medicine & cosmetics" },
      { id: "m3", name: "Cubic Meters", symbol: "m³", ratio: 1000, description: "Pool, reservoir & shipping volume" },
      { id: "gal", name: "Gallons (US)", symbol: "gal", ratio: 3.785411784, description: "US fuel, milk & bulk liquid (128 oz)" },
      { id: "qt", name: "Quarts (US)", symbol: "qt", ratio: 0.946352946, description: "US motor oil & cooking liquid (4 cups)" },
      { id: "pt", name: "Pints (US)", symbol: "pt", ratio: 0.473176473, description: "Beverage glass & dairy (2 cups)" },
      { id: "cup", name: "Cups (US)", symbol: "cup", ratio: 0.2365882365, description: "Standard kitchen recipe measuring cup" },
      { id: "floz", name: "Fluid Ounces (US)", symbol: "fl oz", ratio: 0.0295735295625, description: "Drinks, syrups & fragrance bottles" },
      { id: "tbsp", name: "Tablespoons (US)", symbol: "tbsp", ratio: 0.01478676478125, description: "Culinary measuring spoon (3 tsp)" },
      { id: "tsp", name: "Teaspoons (US)", symbol: "tsp", ratio: 0.00492892159375, description: "Small baking seasoning & medicine dose" },
    ],
    intuition: (val, unit) => {
      if (unit === "gal") {
        return `${val} US gallon${val === 1 ? "" : "s"} equals ${val * 16} standard kitchen cups.`;
      }
      if (unit === "cup") {
        return `${val} cup${val === 1 ? "" : "s"} is roughly ${(val * 236.6).toFixed(0)} milliliters or ${val * 16} tablespoons.`;
      }
      if (unit === "l") {
        return `${val} liter${val === 1 ? "" : "s"} is about ${(val * 4.2).toFixed(1)} standard drinking glasses of water.`;
      }
      return null;
    },
  },
  area: {
    id: "area",
    name: "Area & Surface",
    icon: Maximize2,
    baseUnit: "m2",
    units: [
      { id: "km2", name: "Square Kilometers", symbol: "km²", ratio: 1000000, description: "City, park & national territory" },
      { id: "ha", name: "Hectares", symbol: "ha", ratio: 10000, description: "Farmland, agriculture & forestry (10,000 m²)" },
      { id: "m2", name: "Square Meters", symbol: "m²", ratio: 1, description: "Apartment rooms, tiles & flooring" },
      { id: "sqmi", name: "Square Miles", symbol: "sq mi", ratio: 2589988.11, description: "Large geography & county size (640 acres)" },
      { id: "ac", name: "Acres", symbol: "ac", ratio: 4046.85642, description: "Real estate land & plots (43,560 sq ft)" },
      { id: "sqyd", name: "Square Yards", symbol: "sq yd", ratio: 0.83612736, description: "Fabric rolls, turf & landscaping" },
      { id: "sqft", name: "Square Feet", symbol: "sq ft", ratio: 0.09290304, description: "Standard US home, condo & office floor plan" },
      { id: "sqin", name: "Square Inches", symbol: "sq in", ratio: 0.00064516, description: "Paper size, screens & small prints" },
    ],
    intuition: (val, unit) => {
      if (unit === "ac") {
        return `${val} acre${val === 1 ? "" : "s"} is approximately ${(val * 0.76).toFixed(2)} American football fields.`;
      }
      if (unit === "sqft") {
        return `${val} sq ft is roughly a ${(Math.sqrt(val)).toFixed(1)} × ${(Math.sqrt(val)).toFixed(1)} foot square room.`;
      }
      if (unit === "ha") {
        return `${val} hectare${val === 1 ? "" : "s"} is roughly equivalent to ${(val * 1.4).toFixed(1)} regulation football pitches.`;
      }
      return null;
    },
  },
  speed: {
    id: "speed",
    name: "Speed & Velocity",
    icon: Gauge,
    baseUnit: "ms",
    units: [
      { id: "kph", name: "Kilometers / Hour", symbol: "km/h", ratio: 0.2777777778, description: "International driving speed limit" },
      { id: "mph", name: "Miles / Hour", symbol: "mph", ratio: 0.44704, description: "US and UK roadway speed indicator" },
      { id: "ms", name: "Meters / Second", symbol: "m/s", ratio: 1, description: "Scientific physics & wind measurement" },
      { id: "fts", name: "Feet / Second", symbol: "ft/s", ratio: 0.3048, description: "Ballistics, sports & engineering velocity" },
      { id: "kn", name: "Knots", symbol: "kn", ratio: 0.5144444444, description: "Maritime vessels & aviation aircraft" },
      { id: "mach", name: "Mach (Sound Speed)", symbol: "Ma", ratio: 343, description: "Supersonic flight in standard 20°C air" },
    ],
    intuition: (val, unit) => {
      if (unit === "mph") {
        return `${val} mph is roughly ${(val * 1.609).toFixed(1)} km/h (${val >= 60 ? "highway cruising pace" : "city road pace"}).`;
      }
      if (unit === "kph") {
        return `${val} km/h is roughly ${(val * 0.621).toFixed(1)} mph.`;
      }
      if (unit === "kn") {
        return `${val} knots equals ${(val * 1.151).toFixed(1)} mph over ground.`;
      }
      return null;
    },
  },
  time: {
    id: "time",
    name: "Time & Duration",
    icon: Clock,
    baseUnit: "s",
    units: [
      { id: "yr", name: "Years (Common)", symbol: "yr", ratio: 31536000, description: "Annual calendar duration (365 days)" },
      { id: "mo", name: "Months (Average)", symbol: "mo", ratio: 2629746, description: "Approximate monthly period (30.44 days)" },
      { id: "wk", name: "Weeks", symbol: "wk", ratio: 604800, description: "Standard 7-day period (168 hours)" },
      { id: "d", name: "Days", symbol: "d", ratio: 86400, description: "Earth solar day (24 hours)" },
      { id: "hr", name: "Hours", symbol: "hr", ratio: 3600, description: "Hourly time block (60 minutes)" },
      { id: "min", name: "Minutes", symbol: "min", ratio: 60, description: "Standard minute (60 seconds)" },
      { id: "s", name: "Seconds", symbol: "s", ratio: 1, description: "Base international unit of time" },
      { id: "ms", name: "Milliseconds", symbol: "ms", ratio: 0.001, description: "Computer latency & sports timers" },
    ],
    intuition: (val, unit) => {
      if (unit === "hr") {
        return `${val} hour${val === 1 ? "" : "s"} contains ${val * 60} minutes or ${val * 3600} seconds.`;
      }
      if (unit === "d") {
        return `${val} day${val === 1 ? "" : "s"} equals ${val * 24} hours or ${(val * 1440).toLocaleString()} minutes.`;
      }
      if (unit === "yr") {
        return `${val} year${val === 1 ? "" : "s"} is 8,760 hours or 525,600 minutes.`;
      }
      return null;
    },
  },
  data: {
    id: "data",
    name: "Digital Storage",
    icon: HardDrive,
    baseUnit: "b",
    units: [
      { id: "tb", name: "Terabytes", symbol: "TB", ratio: 1099511627776, description: "Hard drives, SSDs & cloud servers (1,024 GB)" },
      { id: "gb", name: "Gigabytes", symbol: "GB", ratio: 1073741824, description: "Phone storage, RAM & video downloads (1,024 MB)" },
      { id: "mb", name: "Megabytes", symbol: "MB", ratio: 1048576, description: "Photos, MP3 songs & PDF documents (1,024 KB)" },
      { id: "kb", name: "Kilobytes", symbol: "KB", ratio: 1024, description: "Small icons, documents & text logs (1,024 B)" },
      { id: "b", name: "Bytes", symbol: "B", ratio: 1, description: "Single character of computer text (8 bits)" },
      { id: "bit", name: "Bits", symbol: "bit", ratio: 0.125, description: "Binary digits (0 or 1), internet speed metric" },
    ],
    intuition: (val, unit) => {
      if (unit === "tb") {
        return `${val} TB can hold roughly ${(val * 250000).toLocaleString()} photos or ${(val * 500).toLocaleString()} hours of HD movies.`;
      }
      if (unit === "gb") {
        return `${val} GB can store roughly ${(val * 250).toLocaleString()} music tracks or ${(val * 300).toLocaleString()} high-res photos.`;
      }
      if (unit === "mb") {
        return `${val} MB is roughly ${(val / 4).toFixed(0)} average 320kbps MP3 songs.`;
      }
      return null;
    },
  },
  energy: {
    id: "energy",
    name: "Energy & Heat",
    icon: Zap,
    baseUnit: "j",
    units: [
      { id: "kj", name: "Kilojoules", symbol: "kJ", ratio: 1000, description: "International nutrition & mechanical work (1,000 J)" },
      { id: "j", name: "Joules", symbol: "J", ratio: 1, description: "Standard scientific energy unit (1 watt-second)" },
      { id: "kcal", name: "Kilocalories (Food Cal)", symbol: "kcal", ratio: 4184, description: "Dietary food calories on nutrition labels" },
      { id: "cal", name: "Gram Calories", symbol: "cal", ratio: 4.184, description: "Heat required to warm 1g of water by 1°C" },
      { id: "kwh", name: "Kilowatt-Hours", symbol: "kWh", ratio: 3600000, description: "Home electric utility power billing (3.6 MJ)" },
      { id: "wh", name: "Watt-Hours", symbol: "Wh", ratio: 3600, description: "Laptop & drone battery capacity" },
      { id: "btu", name: "British Thermal Units", symbol: "BTU", ratio: 1055.06, description: "Air conditioning & heater cooling rating" },
    ],
    intuition: (val, unit) => {
      if (unit === "kcal") {
        return `${val} kcal (food calories) equals ${(val * 4.184).toFixed(1)} kJ of dietary energy.`;
      }
      if (unit === "kwh") {
        return `${val} kWh can power a modern 10W LED bulb for ${(val * 100).toFixed(0)} hours continuously.`;
      }
      return null;
    },
  },
  pressure: {
    id: "pressure",
    name: "Pressure",
    icon: GaugeCircle,
    baseUnit: "pa",
    units: [
      { id: "bar", name: "Bar", symbol: "bar", ratio: 100000, description: "Atmospheric & scuba pressure (100 kPa)" },
      { id: "kpa", name: "Kilopascals", symbol: "kPa", ratio: 1000, description: "Meteorology & tire inflation (1,000 Pa)" },
      { id: "pa", name: "Pascals", symbol: "Pa", ratio: 1, description: "Standard SI unit of force per unit area" },
      { id: "psi", name: "Pounds / Square Inch", symbol: "psi", ratio: 6894.757, description: "US car tires & plumbing pressure" },
      { id: "atm", name: "Standard Atmospheres", symbol: "atm", ratio: 101325, description: "Average sea-level atmospheric pressure" },
      { id: "mmhg", name: "Millimeters Mercury (Torr)", symbol: "mmHg", ratio: 133.322, description: "Medical blood pressure gauge standard" },
    ],
    intuition: (val, unit) => {
      if (unit === "psi") {
        return `${val} psi is roughly ${(val / 14.7).toFixed(2)} times standard sea-level air pressure (car tires typically run ~32–35 psi).`;
      }
      if (unit === "atm") {
        return `${val} atm is ${val * 1.013} bar (water pressure increases by 1 atm for every 10 meters of depth).`;
      }
      return null;
    },
  },
};

const CATEGORIES_LIST: UnitCategory[] = [
  "length",
  "weight",
  "temp",
  "volume",
  "area",
  "speed",
  "time",
  "data",
  "energy",
  "pressure",
];

const CATEGORY_SHORT_NAMES: Record<UnitCategory, string> = {
  length: "Length",
  weight: "Weight",
  temp: "Temperature",
  volume: "Volume",
  area: "Area",
  speed: "Speed",
  time: "Time",
  data: "Storage",
  energy: "Energy",
  pressure: "Pressure",
};

interface QuickPreset {
  title: string;
  badge: string;
  category: UnitCategory;
  val: string;
  from: string;
  to: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  { title: "5k Running Race", badge: "Running", category: "length", val: "5", from: "km", to: "mi" },
  { title: "Baking Liquid Cup", badge: "Kitchen", category: "volume", val: "1", from: "cup", to: "ml" },
  { title: "Water Boiling Point", badge: "Science", category: "temp", val: "100", from: "c", to: "k" },
  { title: "Barbell Weight Plate", badge: "Gym", category: "weight", val: "135", from: "lb", to: "kg" },
  { title: "Vacation Weather", badge: "Travel", category: "temp", val: "75", from: "f", to: "c" },
  { title: "Hard Drive Storage", badge: "Tech", category: "data", val: "1", from: "tb", to: "gb" },
  { title: "Highway Speed Limit", badge: "Driving", category: "speed", val: "65", from: "mph", to: "kph" },
  { title: "Apartment Floor Space", badge: "Real Estate", category: "area", val: "1000", from: "sqft", to: "m2" },
];

interface HistoryEntry {
  id: string;
  fromVal: string;
  fromSymbol: string;
  toVal: string;
  toSymbol: string;
  category: UnitCategory;
  fromId: string;
  toId: string;
}

export function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromValue, setFromValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("km");
  const [toUnit, setToUnit] = useState<string>("m");
  const [precision, setPrecision] = useState<"auto" | "2" | "4" | "6">("auto");
  const [isCopied, setIsCopied] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Update units on category change
  useEffect(() => {
    const config = CATEGORY_CONFIGS[category];
    if (config && config.units.length >= 2) {
      setFromUnit(config.units[0].id);
      setToUnit(config.units[1].id);
    }
  }, [category]);

  // Core conversion calculation
  const calculateConversion = useCallback(
    (valStr: string, fUnit: string, tUnit: string, cat: UnitCategory): string => {
      const num = parseFloat(valStr);
      if (isNaN(num)) return "0";

      if (cat === "temp") {
        if (fUnit === tUnit) return num.toString();
        // Convert to Celsius base
        let c = num;
        if (fUnit === "f") c = (num - 32) * (5 / 9);
        else if (fUnit === "k") c = num - 273.15;
        else if (fUnit === "r") c = (num - 491.67) * (5 / 9);

        // Convert Celsius to Target
        let res = c;
        if (tUnit === "f") res = (c * 9) / 5 + 32;
        else if (tUnit === "k") res = c + 273.15;
        else if (tUnit === "r") res = (c + 273.15) * (9 / 5);

        if (precision === "2") return Number(res.toFixed(2)).toString();
        if (precision === "4") return Number(res.toFixed(4)).toString();
        if (precision === "6") return Number(res.toFixed(6)).toString();
        return Number(res.toFixed(4)).toString();
      }

      const cfg = CATEGORY_CONFIGS[cat];
      const fromObj = cfg.units.find((u) => u.id === fUnit);
      const toObj = cfg.units.find((u) => u.id === tUnit);

      if (!fromObj || !toObj || !fromObj.ratio || !toObj.ratio) return "0";

      const baseVal = num * fromObj.ratio;
      const converted = baseVal / toObj.ratio;

      if (precision === "2") return Number(converted.toFixed(2)).toString();
      if (precision === "4") return Number(converted.toFixed(4)).toString();
      if (precision === "6") return Number(converted.toFixed(6)).toString();

      // Clean Auto Precision
      if (Math.abs(converted) >= 1e9 || (Math.abs(converted) > 0 && Math.abs(converted) < 1e-5)) {
        return converted.toExponential(4);
      }
      return Number(converted.toPrecision(8)).toString();
    },
    [precision]
  );

  const result = useMemo(() => {
    return calculateConversion(fromValue, fromUnit, toUnit, category);
  }, [fromValue, fromUnit, toUnit, category, calculateConversion]);

  // Current objects
  const currentCategoryConfig = CATEGORY_CONFIGS[category];
  const activeFromObj = currentCategoryConfig.units.find((u) => u.id === fromUnit) || currentCategoryConfig.units[0];
  const activeToObj = currentCategoryConfig.units.find((u) => u.id === toUnit) || currentCategoryConfig.units[1];

  // Save to recent conversions history
  useEffect(() => {
    if (!fromValue || isNaN(parseFloat(fromValue)) || parseFloat(fromValue) === 0) return;
    const timeout = setTimeout(() => {
      setHistory((prev) => {
        const newEntry: HistoryEntry = {
          id: `${Date.now()}-${fromUnit}-${toUnit}`,
          fromVal: fromValue,
          fromSymbol: activeFromObj.symbol,
          toVal: result,
          toSymbol: activeToObj.symbol,
          category,
          fromId: fromUnit,
          toId: toUnit,
        };
        // Avoid duplicates at top
        if (
          prev.length > 0 &&
          prev[0].fromVal === newEntry.fromVal &&
          prev[0].fromId === newEntry.fromId &&
          prev[0].toId === newEntry.toId
        ) {
          return prev;
        }
        return [newEntry, ...prev.slice(0, 4)];
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [fromValue, fromUnit, toUnit, result, category, activeFromObj.symbol, activeToObj.symbol]);

  // Swap Units
  const handleSwap = () => {
    const prevFrom = fromUnit;
    const prevTo = toUnit;
    setFromUnit(prevTo);
    setToUnit(prevFrom);
    if (!isNaN(parseFloat(result)) && parseFloat(result) !== 0) {
      setFromValue(result);
    }
  };

  // Copy Main Result
  const handleCopyResult = () => {
    navigator.clipboard.writeText(`${result} ${activeToObj.symbol}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Copy Row Result
  const handleCopyRow = (val: string, sym: string, id: string) => {
    navigator.clipboard.writeText(`${val} ${sym}`);
    setCopiedRowId(id);
    setTimeout(() => setCopiedRowId(null), 1800);
  };

  // Formula explanation
  const formulaExplanation = useMemo(() => {
    if (category === "temp") {
      if (fromUnit === "c" && toUnit === "f") return "Formula: (°C × 9/5) + 32 = °F";
      if (fromUnit === "f" && toUnit === "c") return "Formula: (°F − 32) × 5/9 = °C";
      if (fromUnit === "c" && toUnit === "k") return "Formula: °C + 273.15 = K";
      if (fromUnit === "k" && toUnit === "c") return "Formula: K − 273.15 = °C";
      if (fromUnit === toUnit) return "Same unit selected (1:1 ratio)";
      return "Direct thermodynamic temperature scale calculation";
    }

    if (!activeFromObj.ratio || !activeToObj.ratio) return null;
    const multiplier = activeFromObj.ratio / activeToObj.ratio;
    if (multiplier === 1) return "Same unit selected (1:1 ratio)";
    if (multiplier > 1) {
      return `Formula: 1 ${activeFromObj.symbol} = ${Number(multiplier.toPrecision(6))} ${activeToObj.symbol} (Multiply by ${Number(multiplier.toPrecision(6))})`;
    }
    const divisor = 1 / multiplier;
    return `Formula: 1 ${activeToObj.symbol} = ${Number(divisor.toPrecision(6))} ${activeFromObj.symbol} (Divide by ${Number(divisor.toPrecision(6))})`;
  }, [category, fromUnit, toUnit, activeFromObj, activeToObj]);

  // Real world intuition
  const intuitionText = useMemo(() => {
    const val = parseFloat(fromValue);
    if (isNaN(val)) return null;
    return currentCategoryConfig.intuition(val, fromUnit);
  }, [fromValue, fromUnit, currentCategoryConfig]);

  // Options for Dropdowns
  const dropdownOptions: DropdownOption[] = useMemo(() => {
    return currentCategoryConfig.units.map((u) => ({
      value: u.id,
      label: `${u.name} (${u.symbol})`,
      description: u.description,
      badge: u.symbol,
    }));
  }, [currentCategoryConfig]);

  // Multi-unit equivalent breakdown
  const multiUnitBreakdown = useMemo(() => {
    const valNum = parseFloat(fromValue);
    if (isNaN(valNum)) return [];
    return currentCategoryConfig.units
      .filter((u) => u.id !== fromUnit)
      .map((u) => {
        const converted = calculateConversion(fromValue, fromUnit, u.id, category);
        return {
          ...u,
          converted,
        };
      });
  }, [fromValue, fromUnit, category, currentCategoryConfig, calculateConversion]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-4">
      {/* =========================================================================
          1. CATEGORY DOCK (Responsive 2x5 Grid on Desktop, 3 cols tablet, 2 cols mobile)
      ========================================================================== */}
      <div className="rounded-3xl p-2 sm:p-2.5 bg-[#090b14]/90 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {CATEGORIES_LIST.map((catKey) => {
            const cat = CATEGORY_CONFIGS[catKey];
            const isActive = category === catKey;
            const Icon = cat.icon;
            const shortName = CATEGORY_SHORT_NAMES[catKey] || cat.name;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategory(catKey)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border select-none w-full group",
                  isActive
                    ? "bg-amber-400/15 border-amber-400/50 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.22)] ring-1 ring-amber-400/30"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    size={15}
                    className={cn(
                      "shrink-0 transition-transform duration-200",
                      isActive ? "text-amber-300 scale-110" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span className="truncate">{shortName}</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors shrink-0 ml-1.5",
                    isActive
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : "bg-white/5 text-zinc-500"
                  )}
                >
                  {cat.units.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. MAIN CONVERSION STUDIO CARD
      ========================================================================== */}
      <div className="relative rounded-[2.5rem] bg-[#090b14]/95 border border-white/10 shadow-[0_25px_65px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] p-6 sm:p-8 md:p-10 backdrop-blur-2xl">
        {/* Ambient Amber Core Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header Utility Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300/90">
              Live Conversion Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Precision Selector */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-[10px] font-bold">
              <span className="text-zinc-500 px-2 uppercase tracking-wider">Decimals:</span>
              {(["auto", "2", "4", "6"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrecision(p)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer",
                    precision === p
                      ? "bg-amber-400 text-black font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Quick Reset */}
            <button
              type="button"
              onClick={() => {
                setFromValue("1");
              }}
              title="Reset value to 1"
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Dual Conversion Workspace */}
        <div className="relative z-30 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-8 pt-6">
          {/* LEFT: Convert From */}
          <div className="space-y-4 rounded-3xl p-5 sm:p-6 bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all relative z-40">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Convert From
              </label>
              {/* Quick Increment Chips */}
              <div className="flex items-center gap-1">
                {["+1", "+10", "-1"].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(fromValue) || 0;
                      const delta = parseFloat(step);
                      setFromValue(Math.max(0, cur + delta).toString());
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Number Input */}
            <div className="relative">
              <input
                type="number"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-4xl sm:text-5xl md:text-6xl font-black text-white focus:outline-none placeholder:text-zinc-800 tracking-tight"
              />
              <span className="absolute right-0 bottom-2 text-xs font-mono font-bold text-amber-400/80 px-2 py-1 rounded-md bg-amber-400/10 border border-amber-400/20">
                {activeFromObj.symbol}
              </span>
            </div>

            {/* Dropdown Unit Selector */}
            <div className="pt-2">
              <CyberDropdown
                value={fromUnit}
                onChange={setFromUnit}
                options={dropdownOptions}
                themeColor="amber"
              />
            </div>
          </div>

          {/* CENTER: Interactive Swap Button */}
          <div className="flex justify-center -my-2 lg:my-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap units"
              className="relative group p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_45px_rgba(245,158,11,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <ArrowRightLeft
                size={22}
                className="transition-transform duration-300 group-hover:rotate-180"
              />
            </button>
          </div>

          {/* RIGHT: Converted Result */}
          <div className="space-y-4 rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-amber-500/[0.04] to-transparent border border-amber-500/30 hover:border-amber-400/50 transition-all relative z-40">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                Result Value
              </label>
              <span className="text-[10px] font-bold text-zinc-500">
                Live Calculated
              </span>
            </div>

            {/* Converted Value Output */}
            <div className="relative min-h-[54px] sm:min-h-[72px] flex items-center justify-between gap-3">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 break-all tracking-tight pr-4">
                {result}
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 px-2 py-1 rounded-md bg-amber-400/20 border border-amber-400/40 shrink-0">
                {activeToObj.symbol}
              </span>
            </div>

            {/* Dropdown Unit Selector */}
            <div className="pt-2">
              <CyberDropdown
                value={toUnit}
                onChange={setToUnit}
                options={dropdownOptions}
                themeColor="amber"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. FORMULA BAR & REAL-WORLD CONTEXT
        ========================================================================== */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formula pill */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
            <div className="size-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <BookOpen size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Mathematical Conversion
              </p>
              <p className="font-mono text-zinc-200 text-xs truncate mt-0.5">
                {formulaExplanation}
              </p>
            </div>
          </div>

          {/* Real-world intuition note */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
            <div className="size-8 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-300 shrink-0">
              <Info size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Everyday Reference
              </p>
              <p className="text-zinc-300 text-xs truncate mt-0.5">
                {intuitionText || "Instant accurate conversion based on official metric and imperial standards."}
              </p>
            </div>
          </div>
        </div>

        {/* Master Copy Button */}
        <div className="relative z-10 mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleCopyResult}
            className={cn(
              "px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-300 cursor-pointer shadow-lg active:scale-95",
              isCopied
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-white/10 hover:bg-amber-400 hover:text-black border border-white/10 hover:border-amber-400 text-zinc-200 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
            )}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            <span>{isCopied ? "Copied To Clipboard" : `Copy Result (${result} ${activeToObj.symbol})`}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. ALL EQUIVALENT UNITS (Live Multi-Unit Breakdown Table)
      ========================================================================== */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#090b14]/90 border border-white/5 backdrop-blur-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="text-amber-400">Equivalent Values in All</span> {currentCategoryConfig.name} Units
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Converting {fromValue} {activeFromObj.name} into all other supported units simultaneously
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 self-start sm:self-auto bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            {multiUnitBreakdown.length} equivalents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {multiUnitBreakdown.map((item) => {
            const isRowCopied = copiedRowId === item.id;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-200 truncate">{item.name}</span>
                    <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      {item.symbol}
                    </span>
                  </div>
                  <div className="text-sm font-black text-white font-mono truncate mt-1">
                    {item.converted}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyRow(item.converted, item.symbol, item.id)}
                  title={`Copy ${item.converted} ${item.symbol}`}
                  className={cn(
                    "size-8 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer border",
                    isRowCopied
                      ? "bg-emerald-500 text-white border-emerald-400"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-amber-500/40"
                  )}
                >
                  {isRowCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          5. INSTANT STUDY PRESETS (High-Utility Quick Blueprints)
      ========================================================================== */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#090b14]/90 border border-white/5 backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-sm tracking-wider uppercase">
              Quick Study Presets
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            1-Click Setups
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCategory(preset.category);
                setFromUnit(preset.from);
                setToUnit(preset.to);
                setFromValue(preset.val);
              }}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/40 hover:bg-amber-400/[0.05] text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  {preset.badge}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-amber-300 transition-colors">
                  {preset.val} {preset.from} → {preset.to}
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-200 group-hover:text-white truncate mt-2">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          6. RECENT CONVERSIONS SCRATCHPAD (History)
      ========================================================================== */}
      {history.length > 0 && (
        <div className="rounded-3xl p-5 sm:p-6 bg-[#090b14]/70 border border-white/5 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <History size={14} className="text-amber-400" />
              <span>Recent Conversions Scratchpad</span>
            </div>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Clear History
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-3">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.category);
                  setFromUnit(item.fromId);
                  setToUnit(item.toId);
                  setFromValue(item.fromVal);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>
                  {item.fromVal} {item.fromSymbol} = <span className="text-amber-300 font-bold">{item.toVal}</span> {item.toSymbol}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clean Everyday Assurance Label (Zero Tech Jargon) */}
      <p className="text-[11px] font-bold text-zinc-500 text-center tracking-wide">
        High-precision instant calculation • Updates live as you type
      </p>
    </div>
  );
}
