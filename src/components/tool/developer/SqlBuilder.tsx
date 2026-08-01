"use client";

import React, { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SqlBuilder() {
  const [tableName, setTableName] = useState("users");
  const [columns, setColumns] = useState("id, username, email, credits, created_at");
  const [whereClause, setWhereClause] = useState("credits > 100 AND is_active = true");
  const [orderBy, setOrderBy] = useState("created_at DESC");
  const [limit, setLimit] = useState("50");
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedSql = useMemo(() => {
    if (promptText.trim()) {
      // Natural language quick converter mock
      return `-- Generated from prompt: "${promptText}"\nSELECT u.id, u.username, COUNT(o.id) as total_orders\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.status = 'completed'\nGROUP BY u.id, u.username\nHAVING COUNT(o.id) > 5\nORDER BY total_orders DESC\nLIMIT 20;`;
    }

    let sql = `SELECT ${columns.trim() || "*"}\nFROM ${tableName.trim() || "table_name"}`;
    if (whereClause.trim()) {
      sql += `\nWHERE ${whereClause.trim()}`;
    }
    if (orderBy.trim()) {
      sql += `\nORDER BY ${orderBy.trim()}`;
    }
    if (limit.trim()) {
      sql += `\nLIMIT ${limit.trim()}`;
    }
    return sql + ";";
  }, [tableName, columns, whereClause, orderBy, limit, promptText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-lime-950/40 via-emerald-900/20 to-neutral-900 border border-lime-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-300 text-xs font-semibold uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" /> Database Assistant
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Visual SQL Query Builder & AI Assistant
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
          Construct complex SQL queries visually or translate plain English requests into clean, formatted PostgreSQL and MySQL queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Builder Form */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              Natural Language Prompt (Optional)
            </label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Find top 10 users with completed orders over $100..."
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-lime-500"
            />
          </div>

          <div className="relative border-t border-neutral-800 pt-4">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-3">Or Visual Builder Parameters</span>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Table Name</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => { setPromptText(""); setTableName(e.target.value); }}
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">SELECT Columns</label>
                <input
                  type="text"
                  value={columns}
                  onChange={(e) => { setPromptText(""); setColumns(e.target.value); }}
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">WHERE Clause</label>
                <input
                  type="text"
                  value={whereClause}
                  onChange={(e) => { setPromptText(""); setWhereClause(e.target.value); }}
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">ORDER BY</label>
                  <input
                    type="text"
                    value={orderBy}
                    onChange={(e) => { setPromptText(""); setOrderBy(e.target.value); }}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">LIMIT</label>
                  <input
                    type="text"
                    value={limit}
                    onChange={(e) => { setPromptText(""); setLimit(e.target.value); }}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SQL Output Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">
                Formatted SQL Query
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-600 hover:bg-lime-500 text-white text-xs font-bold transition-all shadow-lg shadow-lime-600/30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied SQL!" : "Copy SQL"}
              </button>
            </div>

            <pre className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-lime-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner my-auto max-h-[300px]">
              {generatedSql}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
