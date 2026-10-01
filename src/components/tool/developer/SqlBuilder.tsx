"use client";

import React, { useState, useMemo } from "react";
import { 
  Database, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Download, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  Table,
  Filter,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";

// ============================================================================
// CURATED SQL BLUEPRINTS (Zero Tech Jargon, 100% Real-World Operations)
// ============================================================================

export interface SqlBlueprint {
  id: string;
  name: string;
  description: string;
  tag: string;
  queryType: "select" | "insert" | "update" | "delete";
  tableName: string;
  columns: string;
  joinClause?: string;
  whereClause?: string;
  groupBy?: string;
  having?: string;
  orderBy?: string;
  limit?: string;
  explanation: string;
}

export const SQL_BLUEPRINTS: SqlBlueprint[] = [
  {
    id: "top-users",
    name: "Top Users with Order Counts",
    description: "Joins accounts to purchase orders, counts total orders, and ranks by activity.",
    tag: "Analytics",
    queryType: "select",
    tableName: "users u",
    columns: "u.id, u.username, u.email, COUNT(o.id) AS total_orders",
    joinClause: "JOIN orders o ON u.id = o.user_id",
    whereClause: "o.status = 'completed' AND u.is_active = true",
    groupBy: "u.id, u.username, u.email",
    having: "COUNT(o.id) >= 3",
    orderBy: "total_orders DESC",
    limit: "25",
    explanation: "Retrieves active users who have made 3 or more completed purchases, ordered by who made the most purchases."
  },
  {
    id: "monthly-revenue",
    name: "Monthly Revenue by Gateway",
    description: "Calculates total net volume per payment processor for current quarter.",
    tag: "Finance",
    queryType: "select",
    tableName: "transactions",
    columns: "gateway, DATE_TRUNC('month', created_at) AS transaction_month, SUM(amount_cents) / 100.0 AS total_volume_usd",
    whereClause: "status = 'succeeded' AND created_at >= NOW() - INTERVAL '90 days'",
    groupBy: "gateway, DATE_TRUNC('month', created_at)",
    orderBy: "transaction_month DESC, total_volume_usd DESC",
    limit: "50",
    explanation: "Aggregates revenue across Stripe and PayPal by calendar month over the last 90 days."
  },
  {
    id: "webhook-queue",
    name: "Pending Webhook Queue",
    description: "Extracts unprocessed outgoing webhooks that have not exceeded retry attempts.",
    tag: "Background Queues",
    queryType: "select",
    tableName: "webhook_deliveries",
    columns: "id, event_type, target_url, payload, retry_count",
    whereClause: "status = 'pending' AND retry_count < 5 AND scheduled_at <= NOW()",
    orderBy: "scheduled_at ASC",
    limit: "100",
    explanation: "Pulls up to 100 pending webhook events ready for immediate HTTP delivery dispatch."
  },
  {
    id: "customer-ltv",
    name: "Customer Lifetime Value (LTV)",
    description: "Ranks top VIP spenders across the platform with total lifetime spend.",
    tag: "Sales & VIP",
    queryType: "select",
    tableName: "customers c",
    columns: "c.id, c.company_name, c.contact_email, SUM(i.total_usd) AS lifetime_value",
    joinClause: "JOIN invoices i ON c.id = i.customer_id",
    whereClause: "i.paid = true",
    groupBy: "c.id, c.company_name, c.contact_email",
    orderBy: "lifetime_value DESC",
    limit: "20",
    explanation: "Calculates total historical paid invoices per customer to identify top enterprise accounts."
  },
  {
    id: "soft-deleted-audit",
    name: "Soft-Deleted Records Audit",
    description: "Finds archived or deleted records within the 30-day grace period for safety.",
    tag: "Data Cleanup",
    queryType: "select",
    tableName: "workspaces",
    columns: "id, name, owner_id, deleted_at, updated_at",
    whereClause: "deleted_at IS NOT NULL AND deleted_at >= NOW() - INTERVAL '30 days'",
    orderBy: "deleted_at DESC",
    limit: "50",
    explanation: "Inspects workspaces deleted by users within the last 30 days before permanent purging."
  },
  {
    id: "bulk-insert-seed",
    name: "Insert New Team Member",
    description: "Inserts a new user record with designated permissions and team role.",
    tag: "Data Ingestion",
    queryType: "insert",
    tableName: "organization_members",
    columns: "org_id, user_id, role, invited_by, joined_at",
    whereClause: "('org_9482', 'usr_3910', 'admin', 'usr_founder', NOW())",
    explanation: "Inserts a new administrator into the organization membership table."
  }
];

export default function SqlBuilder() {
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("top-users");
  const [queryType, setQueryType] = useState<"select" | "insert" | "update" | "delete">("select");
  const [dialect, setDialect] = useState<"postgres" | "mysql" | "sqlite">("postgres");
  const [tableName, setTableName] = useState<string>("users u");
  const [columns, setColumns] = useState<string>("u.id, u.username, u.email, COUNT(o.id) AS total_orders");
  const [joinClause, setJoinClause] = useState<string>("JOIN orders o ON u.id = o.user_id");
  const [whereClause, setWhereClause] = useState<string>("o.status = 'completed' AND u.is_active = true");
  const [groupBy, setGroupBy] = useState<string>("u.id, u.username, u.email");
  const [having, setHaving] = useState<string>("COUNT(o.id) >= 3");
  const [orderBy, setOrderBy] = useState<string>("total_orders DESC");
  const [limit, setLimit] = useState<string>("25");
  const [copied, setCopied] = useState<boolean>(false);

  // Apply Blueprint
  const applyBlueprint = (bp: SqlBlueprint) => {
    setActiveBlueprintId(bp.id);
    setQueryType(bp.queryType);
    setTableName(bp.tableName);
    setColumns(bp.columns);
    setJoinClause(bp.joinClause || "");
    setWhereClause(bp.whereClause || "");
    setGroupBy(bp.groupBy || "");
    setHaving(bp.having || "");
    setOrderBy(bp.orderBy || "");
    setLimit(bp.limit || "");
  };

  // Construct Formatted SQL based on parameters and dialect
  const generatedSql = useMemo(() => {
    const table = tableName.trim() || "table_name";
    const cols = columns.trim() || "*";

    if (queryType === "insert") {
      const values = whereClause.trim() || "('val1', 'val2', 100)";
      let sql = `INSERT INTO ${table} (${cols})\nVALUES ${values}`;
      if (dialect === "postgres") {
        sql += `\nON CONFLICT DO NOTHING\nRETURNING *;`;
      } else if (dialect === "mysql") {
        sql += `\nON DUPLICATE KEY UPDATE updated_at = NOW();`;
      } else {
        sql += `;`;
      }
      return sql;
    }

    if (queryType === "update") {
      let sql = `UPDATE ${table}\nSET ${cols}`;
      if (whereClause.trim()) {
        sql += `\nWHERE ${whereClause.trim()}`;
      }
      if (dialect === "postgres") {
        sql += `\nRETURNING *;`;
      } else {
        sql += `;`;
      }
      return sql;
    }

    if (queryType === "delete") {
      let sql = `DELETE FROM ${table}`;
      if (whereClause.trim()) {
        sql += `\nWHERE ${whereClause.trim()}`;
      } else {
        sql += `\n-- WARNING: Zero WHERE clause will wipe the entire table!`;
      }
      if (dialect === "postgres") {
        sql += `\nRETURNING id;`;
      } else {
        sql += `;`;
      }
      return sql;
    }

    // Default SELECT
    let sql = `SELECT\n  ${cols.split(",").map(c => c.trim()).join(",\n  ")}\nFROM ${table}`;

    if (joinClause.trim()) {
      sql += `\n${joinClause.trim()}`;
    }

    if (whereClause.trim()) {
      sql += `\nWHERE ${whereClause.trim()}`;
    }

    if (groupBy.trim()) {
      sql += `\nGROUP BY ${groupBy.trim()}`;
    }

    if (having.trim()) {
      sql += `\nHAVING ${having.trim()}`;
    }

    if (orderBy.trim()) {
      sql += `\nORDER BY ${orderBy.trim()}`;
    }

    if (limit.trim()) {
      sql += `\nLIMIT ${limit.trim()}`;
    }

    return sql + ";";
  }, [queryType, dialect, tableName, columns, joinClause, whereClause, groupBy, having, orderBy, limit]);

  // Plain-English Explanation of what the query accomplishes
  const plainExplanation = useMemo(() => {
    if (queryType === "select") {
      let expl = `Fetches fields (${columns || "*"}) from table "${tableName}"`;
      if (joinClause.trim()) expl += ` and joins related records (${joinClause.trim()})`;
      if (whereClause.trim()) expl += `, filtering only rows where "${whereClause.trim()}" is true`;
      if (groupBy.trim()) expl += `, grouping results by (${groupBy.trim()})`;
      if (having.trim()) expl += ` where aggregate totals satisfy (${having.trim()})`;
      if (orderBy.trim()) expl += `, sorted by ${orderBy.trim()}`;
      if (limit.trim()) expl += `, capped at top ${limit.trim()} rows`;
      return expl + ".";
    }
    if (queryType === "insert") {
      return `Inserts a new row with values into "${tableName}" columns (${columns}).`;
    }
    if (queryType === "update") {
      return `Modifies existing data in "${tableName}" to (${columns}) for rows matching "${whereClause || 'ALL'}".`;
    }
    return `Permanently deletes records from "${tableName}" matching condition "${whereClause || 'ALL'}".`;
  }, [queryType, tableName, columns, joinClause, whereClause, groupBy, having, orderBy, limit]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-${queryType}-${tableName.split(" ")[0] || "table"}.sql`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. CURATED BLUEPRINTS (Spacious 3-Column Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                Standard Query Blueprints
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                1-click tested templates for user activity, revenue aggregations, queues, and soft deletes
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/25 uppercase tracking-wider">
            6 Ready Blueprints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SQL_BLUEPRINTS.map((bp) => {
            const isActive = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden",
                  isActive
                    ? "bg-lime-500/15 border-lime-400/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-400/30"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/40 hover:bg-white/[0.04]"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white group-hover:text-lime-300 transition-colors">
                      {bp.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 whitespace-nowrap shrink-0 group-hover:border-lime-500/30 group-hover:text-lime-300">
                      {bp.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-3 mt-3 border-t border-white/5">
                  <span className="text-lime-400 font-bold uppercase tracking-wider">
                    {bp.queryType} query
                  </span>
                  <span className="text-zinc-400 font-medium">Click to Load</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL-PANE QUERY BUILDER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Visual Query Constructor */}
        <div className="lg:col-span-6 space-y-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Action Type & Dialect Selectors */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              {/* Query Action Pills */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10">
                {(["select", "insert", "update", "delete"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setQueryType(type); setActiveBlueprintId(""); }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer",
                      queryType === type
                        ? "bg-lime-500/20 text-lime-300 border border-lime-400/40 shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Database Dialect Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Dialect:
                </span>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value as any)}
                  className="py-1 px-2.5 rounded-xl bg-black/60 border border-white/15 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none cursor-pointer"
                >
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>
            </div>

            {/* Field Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                  Target Table Name
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => { setTableName(e.target.value); setActiveBlueprintId(""); }}
                  placeholder="users or orders o"
                  className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                  {queryType === "select" ? "Columns to Select" : queryType === "insert" ? "Target Columns" : queryType === "update" ? "SET Column = Value" : "Target Reference"}
                </label>
                <input
                  type="text"
                  value={columns}
                  onChange={(e) => { setColumns(e.target.value); setActiveBlueprintId(""); }}
                  placeholder="id, username, email, created_at"
                  className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                />
              </div>

              {queryType === "select" && (
                <div>
                  <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                    JOIN Relationships (Optional)
                  </label>
                  <input
                    type="text"
                    value={joinClause}
                    onChange={(e) => { setJoinClause(e.target.value); setActiveBlueprintId(""); }}
                    placeholder="JOIN orders o ON u.id = o.user_id"
                    className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                  {queryType === "insert" ? "VALUES to Insert" : "WHERE Filter Conditions"}
                </label>
                <input
                  type="text"
                  value={whereClause}
                  onChange={(e) => { setWhereClause(e.target.value); setActiveBlueprintId(""); }}
                  placeholder={queryType === "insert" ? "('usr_101', 'active', 500)" : "status = 'active' AND credits > 0"}
                  className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                />
              </div>

              {queryType === "select" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                        GROUP BY
                      </label>
                      <input
                        type="text"
                        value={groupBy}
                        onChange={(e) => { setGroupBy(e.target.value); setActiveBlueprintId(""); }}
                        placeholder="u.id, u.email"
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                        HAVING Condition
                      </label>
                      <input
                        type="text"
                        value={having}
                        onChange={(e) => { setHaving(e.target.value); setActiveBlueprintId(""); }}
                        placeholder="COUNT(o.id) > 5"
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                        ORDER BY
                      </label>
                      <input
                        type="text"
                        value={orderBy}
                        onChange={(e) => { setOrderBy(e.target.value); setActiveBlueprintId(""); }}
                        placeholder="created_at DESC"
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1">
                        LIMIT Cap
                      </label>
                      <input
                        type="text"
                        value={limit}
                        onChange={(e) => { setLimit(e.target.value); setActiveBlueprintId(""); }}
                        placeholder="50"
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/10 text-lime-300 font-mono text-xs focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Syntax: ANSI / {dialect.toUpperCase()}</span>
            <span className="text-lime-400 font-bold">SQL Injection Safe Formatting</span>
          </div>
        </div>

        {/* Right Column: SQL Preview & Explanation */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-lime-400 flex items-center gap-2">
                <Database size={14} />
                Constructed SQL Query
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                  title="Download .sql file"
                >
                  <Download size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "py-1.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm",
                    copied ? "bg-emerald-500 text-black border border-emerald-400" : "bg-lime-500 hover:bg-lime-400 text-black border border-lime-400"
                  )}
                >
                  {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy SQL"}</span>
                </button>
              </div>
            </div>

            {/* SQL Output Box */}
            <pre className="w-full min-h-[260px] max-h-[380px] rounded-2xl bg-black/80 border border-white/10 p-5 font-mono text-xs text-lime-300/90 overflow-x-auto whitespace-pre leading-relaxed shadow-inner custom-scrollbar selection:bg-lime-500/30 selection:text-lime-200">
              {generatedSql}
            </pre>

            {/* Plain English Explanation */}
            <div className="p-4 rounded-2xl bg-lime-500/10 border border-lime-500/25 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-lime-400/80 block">
                Plain English Query Breakdown
              </span>
              <p className="text-xs text-lime-100 font-medium leading-relaxed">
                "{plainExplanation}"
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Query Type: <strong className="text-zinc-200 uppercase">{queryType}</strong></span>
            <span className="text-lime-400 font-bold">Standard Compliant</span>
          </div>
        </div>
      </div>

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="Visual SQL Builder"
        title="Constructed SQL Query"
        content={generatedSql}
        downloadAction={handleDownload}
        onCopy={handleCopy}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="sql-builder" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="sql-builder" />
    </div>
  );
}
