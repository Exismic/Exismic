"use client";

import React, { useState, useMemo } from "react";
import { Terminal, Copy, Check, FileCode, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function jsonToTypeScript(jsonStr: string, rootName: string = "RootObject", mode: "interface" | "type" | "zod"): string {
  try {
    const parsed = JSON.parse(jsonStr);

    const getType = (val: any): string => {
      if (val === null) return "any";
      if (Array.isArray(val)) {
        if (val.length === 0) return "any[]";
        return `${getType(val[0])}[]`;
      }
      if (typeof val === "object") {
        return "Record<string, any>";
      }
      return typeof val;
    };

    if (mode === "zod") {
      let code = `import { z } from 'zod';\n\nexport const ${rootName}Schema = z.object({\n`;
      if (typeof parsed === "object" && !Array.isArray(parsed) && parsed !== null) {
        Object.entries(parsed).forEach(([k, v]) => {
          let t = "z.any()";
          if (typeof v === "string") t = "z.string()";
          else if (typeof v === "number") t = "z.number()";
          else if (typeof v === "boolean") t = "z.boolean()";
          else if (Array.isArray(v)) t = "z.array(z.any())";
          else if (typeof v === "object") t = "z.object({})";
          code += `  ${k}: ${t},\n`;
        });
      }
      code += `});\n\nexport type ${rootName} = z.infer<typeof ${rootName}Schema>;`;
      return code;
    }

    if (mode === "type") {
      let code = `export type ${rootName} = {\n`;
      if (typeof parsed === "object" && !Array.isArray(parsed) && parsed !== null) {
        Object.entries(parsed).forEach(([k, v]) => {
          code += `  ${k}: ${getType(v)};\n`;
        });
      }
      code += `};`;
      return code;
    }

    let code = `export interface ${rootName} {\n`;
    if (typeof parsed === "object" && !Array.isArray(parsed) && parsed !== null) {
      Object.entries(parsed).forEach(([k, v]) => {
        code += `  ${k}: ${getType(v)};\n`;
      });
    }
    code += `}`;
    return code;
  } catch (err: any) {
    return `// Error parsing JSON: ${err.message}`;
  }
}

export default function JsonToTypes() {
  const [jsonInput, setJsonInput] = useState(
    `{\n  "id": 101,\n  "username": "alex_creator",\n  "email": "alex@exismic.xyz",\n  "isPro": true,\n  "credits": 500,\n  "tags": ["design", "ai", "tools"]\n}`
  );
  const [rootName, setRootName] = useState("UserProfile");
  const [targetFormat, setTargetFormat] = useState<"interface" | "type" | "zod">("interface");
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    return jsonToTypeScript(jsonInput, rootName, targetFormat);
  }, [jsonInput, rootName, targetFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-lime-950/40 via-emerald-900/20 to-neutral-900 border border-lime-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-300 text-xs font-semibold uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" /> Web Dev Utility
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          JSON to TypeScript & Zod Converter
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
          Instantly convert raw JSON payloads into clean, type-safe TypeScript interfaces, type aliases, or Zod validation schemas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              JSON Input Payload
            </label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="Root Object Name"
              className="w-36 p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs text-center"
            />
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={12}
            className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-lime-300 text-xs font-mono focus:outline-none focus:border-lime-500 leading-relaxed resize-none"
          />
        </div>

        {/* Output Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                {(["interface", "type", "zod"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all",
                      targetFormat === fmt ? "bg-lime-500/20 text-lime-300 border border-lime-500/30" : "text-neutral-400"
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-600 hover:bg-lime-500 text-white text-xs font-bold transition-all shadow-lg shadow-lime-600/30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied Code!" : "Copy Code"}
              </button>
            </div>

            <pre className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-lime-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner my-auto max-h-[300px]">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
