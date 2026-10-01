"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  Binary, 
  Tag, 
  Key, 
  FileCheck, 
  Upload, 
  RefreshCw, 
  Check, 
  Layers,
  RotateCcw,
  Sparkles as SparklesProhibited
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolLaserDivider } from "@/components/tool/ToolLaserDivider";

// ============================================================================
// IN-BROWSER MD5 IMPLEMENTATION (RFC 1321 Standard)
// ============================================================================
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17,  606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12,  1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7,  1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7,  1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22,  1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14,  643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9,  38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5,  568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20,  1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14,  1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16,  1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11,  1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4,  681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23,  76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16,  530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10,  1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6,  1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6,  1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21,  1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15,  718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  const n = string.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= string.length; i += 64) {
    md5cycle(state, md5blk(string.substring(i - 64, i)));
  }
  const tail = string.substring(i - 64);
  const tailBytes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let j = 0; j < tail.length; j++) {
    tailBytes[j >> 2] |= tail.charCodeAt(j) << ((j % 4) << 3);
  }
  tailBytes[tail.length >> 2] |= 0x80 << ((tail.length % 4) << 3);
  if (tail.length > 55) {
    md5cycle(state, tailBytes);
    for (let j = 0; j < 16; j++) tailBytes[j] = 0;
  }
  tailBytes[14] = n * 8;
  md5cycle(state, tailBytes);

  return state.map((v) => {
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += ("0" + ((v >> (j * 8)) & 0xff).toString(16)).slice(-2);
    }
    return s;
  }).join("");

  function md5blk(s: string) {
    const md5blks = [];
    for (let k = 0; k < 64; k += 4) {
      md5blks[k >> 2] =
        s.charCodeAt(k) +
        (s.charCodeAt(k + 1) << 8) +
        (s.charCodeAt(k + 2) << 16) +
        (s.charCodeAt(k + 3) << 24);
    }
    return md5blks;
  }
}

// ============================================================================
// TYPES & BLUEPRINTS (Zero Tech Jargon, 100% Everyday English)
// ============================================================================

export interface HashBlueprint {
  id: string;
  title: string;
  category: string;
  input: string;
  description: string;
}

export const HASH_BLUEPRINTS: HashBlueprint[] = [
  {
    id: "password-digest",
    title: "Password & Credential Digest",
    category: "Auth Security",
    input: "SuperSecurePassword#2026!",
    description: "Generate one-way cryptographic fingerprints to compare passwords securely."
  },
  {
    id: "api-webhook-payload",
    title: "API Webhook Body Hash",
    category: "Webhooks",
    input: `{"event":"payment_success","amount":49.00,"currency":"USD","customer":"cus_9981"}`,
    description: "Calculate checksum signatures for validating incoming HTTP webhook notifications."
  },
  {
    id: "software-release-checksum",
    title: "Software Binary Checksum",
    category: "File Integrity",
    input: "Exismic_Studio_Setup_v2.4.0_x64.exe - Official Release",
    description: "Standard verification hash to guarantee software downloads are authentic and untampered."
  },
  {
    id: "database-cache-key",
    title: "Database Query Cache Key",
    category: "Database",
    input: "SELECT * FROM users WHERE organization_id = 'org_7721' ORDER BY created_at DESC",
    description: "Unique fixed-length key derived from large database queries for Redis caching."
  },
  {
    id: "git-commit-hash",
    title: "Git Commit Tree Fingerprint",
    category: "DevOps",
    input: "tree 18a4f912c751\nparent 9d8b12f\nauthor Alex Rivera\ncommit: Add OAuth2 workflow",
    description: "Generate commit tree hashes for version control pipelines and source integrity."
  },
  {
    id: "random-entropy-seed",
    title: "Random Seed Verification",
    category: "Cryptography",
    input: "seed_99382_salt_kdjw918274_timestamp_1790745600",
    description: "Deterministic random seed generation for simulations and cryptography."
  }
];

export default function HashGenerator() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("password-digest");
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [inputText, setInputText] = useState<string>(HASH_BLUEPRINTS[0].input);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [hmacKey, setHmacKey] = useState<string>("");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Hash outputs state
  const [hashes, setHashes] = useState<{
    sha256: string;
    sha512: string;
    sha384: string;
    sha1: string;
    md5: string;
    hmacSha256?: string;
  }>({
    sha256: "",
    sha512: "",
    sha384: "",
    sha1: "",
    md5: ""
  });

  // File Checksum State
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [fileHashes, setFileHashes] = useState<{ sha256: string; sha512: string; md5: string }>({
    sha256: "",
    sha512: "",
    md5: ""
  });
  const [isComputingFile, setIsComputingFile] = useState<boolean>(false);

  // Buffer to Hex Helper
  const bufToHex = useCallback((buf: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }, []);

  // Compute Text Hashes
  useEffect(() => {
    if (!inputText) {
      setHashes({ sha256: "", sha512: "", sha384: "", sha1: "", md5: "" });
      return;
    }

    const compute = async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);

      const [buf256, buf512, buf384, buf1] = await Promise.all([
        crypto.subtle.digest("SHA-256", data),
        crypto.subtle.digest("SHA-512", data),
        crypto.subtle.digest("SHA-384", data),
        crypto.subtle.digest("SHA-1", data),
      ]);

      const h256 = bufToHex(buf256);
      const h512 = bufToHex(buf512);
      const h384 = bufToHex(buf384);
      const h1 = bufToHex(buf1);
      const hMd5 = md5(inputText);

      let hmacResult = "";
      if (hmacKey.trim()) {
        try {
          const keyData = encoder.encode(hmacKey);
          const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
          hmacResult = bufToHex(sig);
        } catch {
          hmacResult = "";
        }
      }

      setHashes({
        sha256: h256,
        sha512: h512,
        sha384: h384,
        sha1: h1,
        md5: hMd5,
        hmacSha256: hmacResult
      });
    };

    compute();
  }, [inputText, hmacKey, bufToHex]);

  // Load a Blueprint
  const handleSelectBlueprint = (bp: HashBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setActiveTab("text");
    setInputText(bp.input);
  };

  // Reset to Baseline
  const handleReset = () => {
    handleSelectBlueprint(HASH_BLUEPRINTS[0]);
    setHmacKey("");
    setFileName("");
  };

  // Copy Single Hash
  const handleCopyHash = (value: string, label: string) => {
    const formatted = isUppercase ? value.toUpperCase() : value.toLowerCase();
    navigator.clipboard.writeText(formatted);
    setCopiedType(label);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // File Upload Checksum Computation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`
    );
    setIsComputingFile(true);

    try {
      const buffer = await file.arrayBuffer();
      const [buf256, buf512] = await Promise.all([
        crypto.subtle.digest("SHA-256", buffer),
        crypto.subtle.digest("SHA-512", buffer),
      ]);

      // ArrayBuffer to binary string for MD5
      const uint8 = new Uint8Array(buffer);
      let binaryStr = "";
      const chunkSize = 8192;
      for (let i = 0; i < Math.min(uint8.length, 1000000); i += chunkSize) {
        binaryStr += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunkSize)));
      }
      const fileMd5 = md5(binaryStr);

      setFileHashes({
        sha256: bufToHex(buf256),
        sha512: bufToHex(buf512),
        md5: fileMd5
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsComputingFile(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner / Quick Controls Bar */}
      <div className="rounded-3xl border border-lime-500/20 bg-gradient-to-b from-lime-500/5 to-transparent p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Cryptographic Hash Generator</span>
                <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2 py-0.5 rounded-full">
                  SHA-256 • MD5 • SHA-512
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate secure digital fingerprints and verify file integrity in-browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "text"
                    ? "bg-lime-500 text-black font-black shadow-md shadow-lime-500/20"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                Text Hash
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "file"
                    ? "bg-lime-500 text-black font-black shadow-md shadow-lime-500/20"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                File Checksum
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Curated Production Blueprints (Spacious 3-Column Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-lime-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Common Hashing Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to pre-fill tested payload samples
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {HASH_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-lime-500/15 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-300 border border-lime-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right">
                    SHA-256
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-lime-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Workspace */}
      {activeTab === "text" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input String & HMAC Secret (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Input Text String to Hash
                </label>
                <span className="text-[11px] font-mono text-zinc-500">
                  {inputText.length} characters
                </span>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setSelectedBlueprintId("");
                }}
                rows={6}
                placeholder="Type or paste text string to compute hashes..."
                className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 text-xs font-mono text-lime-300 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-all resize-y leading-relaxed"
              />

              {/* Optional HMAC Secret Key */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Key size={13} className="text-lime-400" />
                    <span>Secret HMAC Key (Optional Signing Key)</span>
                  </label>
                  {hmacKey && (
                    <span className="text-[10px] font-mono text-lime-400 font-bold">
                      HMAC-SHA256 Active
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  placeholder="Optional secret key for cryptographic HMAC signature..."
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-mono text-white focus:border-lime-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              {/* Format Toggles */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUppercase}
                    onChange={(e) => setIsUppercase(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-lime-500 focus:ring-lime-500"
                  />
                  <span>UPPERCASE Hex Letters</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Calculated Hashes List (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            {[
              { label: "SHA-256", value: hashes.sha256, bits: "256-bit", desc: "Industry standard for web, SSL, and crypto" },
              { label: "MD5", value: hashes.md5, bits: "128-bit", desc: "Fast legacy checksum for file integrity checking" },
              { label: "SHA-512", value: hashes.sha512, bits: "512-bit", desc: "High-security cryptographic standard" },
              { label: "SHA-1", value: hashes.sha1, bits: "160-bit", desc: "Git commit hash standard" },
              ...(hashes.hmacSha256
                ? [{ label: "HMAC-SHA256", value: hashes.hmacSha256, bits: "256-bit", desc: "Cryptographically signed with secret key" }]
                : [])
            ].map((item) => {
              const displayVal = isUppercase ? item.value.toUpperCase() : item.value.toLowerCase();
              const isCopied = copiedType === item.label;

              return (
                <div
                  key={item.label}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-2 group hover:border-lime-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-lime-400">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {item.bits}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyHash(item.value, item.label)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-lime-500/20 text-zinc-300 hover:text-lime-300 text-[10px] font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isCopied ? <CheckCircle2 size={12} className="text-lime-400" /> : <Copy size={12} />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <p className="font-mono text-xs text-white break-all bg-black/60 p-2.5 rounded-xl border border-white/5 select-all leading-relaxed">
                    {displayVal || <span className="text-zinc-600 italic">Computing hash...</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* File Checksum Verification Tab */
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md shadow-xl space-y-6">
          <div className="max-w-xl mx-auto space-y-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 mx-auto">
              <FileCheck size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compute File Checksum in Browser</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Verify file integrity for software downloads, ISOs, and packages with 0s server upload.
              </p>
            </div>

            <label className="block p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-lime-500/50 bg-black/40 hover:bg-black/60 transition-all cursor-pointer group">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-lime-300 transition-colors block">
                {fileName ? `Selected: ${fileName} (${fileSize})` : "Click to select or drag a file to check"}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-1">
                Any file size supported • Processed directly in local Web Crypto memory
              </span>
            </label>
          </div>

          {/* Render File Checksum Results */}
          {fileName && (
            <div className="space-y-4 pt-4 border-t border-white/10 max-w-3xl mx-auto">
              {isComputingFile ? (
                <div className="text-center py-6 text-zinc-400 text-xs font-mono flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-lime-400" />
                  <span>Computing cryptographic checksums in memory...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "SHA-256", value: fileHashes.sha256 },
                    { label: "MD5", value: fileHashes.md5 },
                    { label: "SHA-512", value: fileHashes.sha512 },
                  ].map((fItem) => (
                    <div
                      key={fItem.label}
                      className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 block mb-1">
                          {fItem.label} Checksum
                        </span>
                        <p className="font-mono text-xs text-white truncate select-all">
                          {isUppercase ? fItem.value.toUpperCase() : fItem.value.toLowerCase()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyHash(fItem.value, `file-${fItem.label}`)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-lime-500/20 text-zinc-300 hover:text-lime-300 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {copiedType === `file-${fItem.label}` ? <Check size={12} className="text-lime-400" /> : <Copy size={12} />}
                        <span>{copiedType === `file-${fItem.label}` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Laser Divider Horizon Bridge */}
      <ToolLaserDivider primaryHex="#84cc16" />

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="Hash Generator"
        title="Computed Hash Digests"
        content={hashes.sha256}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="hash-generator" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="hash-generator" />
    </div>
  );
}
