"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  Binary
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HashGenerator() {
  const [inputText, setInputText] = useState("Exismic AI Studio");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Web Crypto API Hash helper
  const [hashes, setHashes] = useState<{ sha1: string; sha256: string; sha512: string }>({
    sha1: "",
    sha256: "",
    sha512: ""
  });

  React.useEffect(() => {
    const computeHashes = async () => {
      if (!inputText) {
        setHashes({ sha1: "", sha256: "", sha512: "" });
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);

      const bufferSha1 = await crypto.subtle.digest("SHA-1", data);
      const bufferSha256 = await crypto.subtle.digest("SHA-256", data);
      const bufferSha512 = await crypto.subtle.digest("SHA-512", data);

      const hex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

      setHashes({
        sha1: hex(bufferSha1),
        sha256: hex(bufferSha256),
        sha512: hex(bufferSha512)
      });
    };

    computeHashes();
  }, [inputText]);

  const copyHash = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(type);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-lime-500/20 bg-gradient-to-br from-lime-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-300 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={14} className="text-lime-400" />
              <span>Security & Encryption</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Hash Generator (SHA-256 / SHA-512)
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate SHA-1, SHA-256, and SHA-512 cryptographic hashes in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
            Input Text String
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text string to compute hashes..."
            className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-lime-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Output List */}
        <div className="space-y-4">
          {[
            { label: "SHA-256", value: hashes.sha256 },
            { label: "SHA-512", value: hashes.sha512 },
            { label: "SHA-1", value: hashes.sha1 }
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-lime-400">{item.label}</span>
                <button
                  type="button"
                  onClick={() => copyHash(item.value, item.label)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedHash === item.label ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedHash === item.label ? "Copied" : "Copy Hash"}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-zinc-200 break-all bg-black/60 p-3 rounded-xl border border-white/5">
                {item.value || <span className="text-zinc-600 italic">Computing...</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
