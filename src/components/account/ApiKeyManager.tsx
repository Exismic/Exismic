"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Terminal, 
  Crown, 
  AlertCircle,
  ExternalLink,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyItem {
  keyId: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPrefixId, setCopiedPrefixId] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [maxKeys, setMaxKeys] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/api-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
        setIsPro(data.isPro || false);
        setMaxKeys(data.maxKeys || (data.isPro ? 10 : 1));
      }
    } catch (err) {
      console.error("Failed to load keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const isLimitReached = !loading && keys.length >= maxKeys;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating || isLimitReached) return;
    setCreating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() || "Default API Key" }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewKey(data.apiKey);
        setKeyName("");
        if (data.maxKeys) setMaxKeys(data.maxKeys);
        fetchKeys();
      } else {
        setErrorMessage(data.error || "Failed to generate key.");
      }
    } catch (err) {
      console.error("Failed to generate key:", err);
      setErrorMessage("Network error generating key. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke "${name}"? Any applications using this API key will immediately stop working.`)) {
      return;
    }
    try {
      const res = await fetch("/api/user/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.keyId !== keyId));
        setErrorMessage(null);
      }
    } catch (err) {
      console.error("Failed to revoke key:", err);
    }
  };

  const handleCopyNewKey = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyPrefix = (prefix: string, keyId: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedPrefixId(keyId);
    setTimeout(() => setCopiedPrefixId(null), 1800);
  };

  const curlSnippet = `curl -X POST https://exismic.com/api/v1/tools/generate-text \\
  -H "Authorization: Bearer ${keys[0]?.keyPrefix ? `${keys[0].keyPrefix}...` : "ex_live_your_key_here"}" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Generate a creative startup pitch"}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#090a12]/95 via-[#07080f]/95 to-[#05060a]/98 p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-6">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-cyan-400/20 via-sky-500/10 to-indigo-950/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Key size={20} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Developer API Keys
              </h3>
              {isPro ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-[9px] font-black uppercase tracking-wider text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <Crown size={10} className="text-amber-300" fill="currentColor" />
                  <span>PRO TIER</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  FREE TIER
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Integrate Exismic AI generation, editing, and research tools directly into your backend or scripts.
            </p>
          </div>
        </div>

        {/* Key Count Meter Pill */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Keys:
          </span>
          <span className={cn(
            "text-xs font-black font-mono",
            isLimitReached ? "text-amber-400" : "text-cyan-300"
          )}>
            {keys.length} / {maxKeys}
          </span>
        </div>
      </div>

      {/* Free Tier Limit Notification Banner */}
      {isLimitReached && !isPro && (
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 backdrop-blur-xl shadow-[0_8px_25px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={17} className="text-amber-300 shrink-0" />
            <p className="text-xs text-amber-100 font-medium">
              Free plan is limited to <strong className="text-white font-bold">1 active API key</strong>. Upgrade to Pro for up to <strong className="text-white font-bold">10 keys</strong> and higher rate limits.
            </p>
          </div>
          <Link
            href="/pro"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Crown size={12} fill="currentColor" />
            <span>Upgrade to Pro</span>
          </Link>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="relative z-10 flex items-center justify-between p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs text-rose-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Creation Form */}
      <form onSubmit={handleCreate} className="relative z-10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            disabled={creating || isLimitReached}
            placeholder={isLimitReached ? "Key limit reached. Revoke a key or upgrade." : "e.g. Production Backend / Next.js Server / CLI Script"}
            className="w-full h-11 px-4 rounded-2xl bg-[#090b14]/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          />
        </div>

        <button
          type="submit"
          disabled={creating || isLimitReached}
          className={cn(
            "group/btn relative flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl p-[1px] select-none isolate transition-all duration-500 hover:scale-[1.03] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap",
            isLimitReached 
              ? "shadow-none"
              : "shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_15px_45px_rgba(34,211,238,0.35),0_0_30px_rgba(168,85,247,0.35)]"
          )}
        >
          {/* Radiant Halo Glow */}
          {!isLimitReached && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/50 via-indigo-500/40 to-cyan-400/50 opacity-70 blur-[5px] transition-all duration-500 group-hover/btn:opacity-100 group-hover/btn:blur-[8px]"
            />
          )}

          {/* Metallic Gradient Outer Border Rim */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 rounded-2xl p-[1px] transition-all duration-300",
              isLimitReached
                ? "bg-white/5"
                : "bg-gradient-to-r from-purple-400/60 via-cyan-300/80 to-indigo-400/60 group-hover/btn:from-purple-300 group-hover/btn:via-white group-hover/btn:to-cyan-300"
            )}
          />

          {/* Glassmorphic Cyber-Obsidian Core */}
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 backdrop-blur-2xl transition-all duration-300",
              isLimitReached
                ? "bg-[#0b0c14] border border-white/5 text-zinc-500"
                : "bg-gradient-to-r from-[#0d091e]/95 via-[#101438]/95 to-[#081226]/95 border border-purple-400/30 group-hover/btn:border-cyan-300/60"
            )}
          >
            {/* Ambient Radial Lighting */}
            {!isLimitReached && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_50%,rgba(168,85,247,0.3),transparent_48%),radial-gradient(circle_at_85%_50%,rgba(34,211,238,0.25),transparent_42%)]"
              />
            )}

            {/* Shimmer Light Sweep on Hover */}
            {!isLimitReached && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-16 w-12 skew-x-[-22deg] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-[1px] transition-transform duration-1000 group-hover/btn:translate-x-72"
              />
            )}

            {/* Electric Jewel Emblem */}
            <div className="relative flex items-center justify-center shrink-0">
              <div
                className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-lg border transition-all duration-300",
                  isLimitReached
                    ? "bg-zinc-800 border-white/5 text-zinc-500"
                    : "bg-gradient-to-b from-purple-400/30 via-cyan-400/20 to-indigo-900/40 border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover/btn:border-cyan-200 group-hover/btn:shadow-[0_0_15px_rgba(34,211,238,0.7)] group-hover/btn:scale-110"
                )}
              >
                {isLimitReached ? (
                  <Lock size={12} />
                ) : (
                  <Plus
                    size={13}
                    className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover/btn:rotate-90"
                  />
                )}
              </div>
            </div>

            {/* Luxury Embossed Gradient Typography */}
            <span
              className={cn(
                "relative z-10 font-black text-xs uppercase tracking-[0.18em] transition-all drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]",
                isLimitReached
                  ? "text-zinc-500"
                  : "bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent group-hover/btn:from-white group-hover/btn:via-white group-hover/btn:to-cyan-200"
              )}
            >
              {creating ? "Generating..." : isLimitReached ? "Limit Reached" : "Generate New Key"}
            </span>
          </div>
        </button>
      </form>

      {/* Secret Key Revealed Notification Modal / Callout */}
      {newKey && (
        <div className="relative z-10 p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#061c14]/95 via-[#06140e]/95 to-[#040907]/95 shadow-[0_12px_40px_rgba(16,185,129,0.2)] space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={16} />
              <span>API Key Generated Successfully</span>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-[10px] font-bold text-zinc-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors"
            >
              Done / Dismiss
            </button>
          </div>
          
          <p className="text-[11.5px] text-zinc-300 font-medium leading-relaxed">
            Please copy this secret key now. For your security, <strong className="text-emerald-300 font-bold">it will never be displayed again</strong>.
          </p>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/80 border border-emerald-500/30 font-mono text-xs text-emerald-300 select-all overflow-x-auto shadow-inner">
            <span className="flex-1 px-2 select-all break-all">{newKey}</span>
            <button
              onClick={handleCopyNewKey}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sans text-xs font-black tracking-wide uppercase transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.5)] active:scale-95"
            >
              {copiedKey ? <Check size={13} strokeWidth={3} /> : <Copy size={13} strokeWidth={2.5} />}
              <span>{copiedKey ? "Copied!" : "Copy Secret Key"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="relative z-10 space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10.5px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Active Keys ({keys.length})
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs text-zinc-500 font-medium">
            Loading API keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-zinc-500 text-xs font-medium space-y-2">
            <Key size={24} className="mx-auto text-zinc-600 opacity-60" />
            <p>No API keys generated yet. Click &quot;Generate New Key&quot; above to create one.</p>
          </div>
        ) : (
          keys.map((k) => (
            <div
              key={k.keyId}
              className="group/key flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-white/[0.06] bg-[#080912]/80 hover:border-cyan-400/30 hover:bg-[#0b0d1a] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold text-white truncate">{k.name}</span>
                  
                  {/* Prefix badge with copy tooltip */}
                  <button
                    type="button"
                    onClick={() => handleCopyPrefix(k.keyPrefix, k.keyId)}
                    title="Copy key prefix"
                    className="group/prefix inline-flex items-center gap-1 font-mono text-[10.5px] text-cyan-300 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    <span>{k.keyPrefix}...</span>
                    {copiedPrefixId === k.keyId ? (
                      <Check size={10} className="text-emerald-400" />
                    ) : (
                      <Copy size={10} className="opacity-60 group-hover/prefix:opacity-100" />
                    )}
                  </button>

                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                  <span>Created {new Date(k.createdAt).toLocaleDateString()}</span>
                  {k.lastUsedAt && (
                    <span>• Last used {new Date(k.lastUsedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleRevoke(k.keyId, k.name)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                  title="Revoke this API Key"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Developer REST API v1 Quickstart Console */}
      <div className="relative z-10 rounded-2xl border border-white/[0.08] bg-[#07080f]/90 p-5 space-y-3.5 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-zinc-200 text-xs font-bold">
            <Terminal size={15} className="text-cyan-400" />
            <span>Developer REST API v1 Quickstart</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCurl}
              className="inline-flex items-center gap-1 text-[10.5px] font-bold text-zinc-400 hover:text-cyan-300 transition-colors"
            >
              {copiedCurl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedCurl ? "Copied cURL" : "Copy cURL"}</span>
            </button>

            <Link
              href="/developer/docs"
              className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>API Explorer & Docs</span>
              <ExternalLink size={11} />
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Authenticate your requests by adding your API key in the <code className="text-cyan-300 font-mono bg-white/[0.04] px-1 py-0.5 rounded">Authorization: Bearer &lt;key&gt;</code> header.
        </p>

        <pre className="relative p-4 rounded-xl bg-black/70 border border-white/[0.06] text-[11px] font-mono text-zinc-300 overflow-x-auto select-all leading-relaxed">
          <code>{curlSnippet}</code>
        </pre>
      </div>

    </div>
  );
}
