import { AlertTriangle, CheckCircle2, Cloud, Laptop, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { getToolReliability, type ToolReliabilityLevel } from "@/lib/tool-reliability";

const LEVEL_STYLES: Record<ToolReliabilityLevel, string> = {
  operational: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  "service-backed": "border-cyan-300/20 bg-cyan-400/10 text-cyan-200",
  "client-only": "border-white/10 bg-white/5 text-zinc-300",
  limited: "border-amber-300/25 bg-amber-400/10 text-amber-200",
  unavailable: "border-red-400/25 bg-red-500/10 text-red-200",
};

const NOTICE_STYLES: Record<ToolReliabilityLevel, string> = {
  operational: "border-emerald-400/15 bg-emerald-400/[0.04]",
  "service-backed": "border-cyan-300/15 bg-cyan-400/[0.04]",
  "client-only": "border-white/10 bg-white/[0.03]",
  limited: "border-amber-300/20 bg-amber-400/[0.06]",
  unavailable: "border-red-400/25 bg-red-500/[0.07]",
};

function ReliabilityIcon({ level, className }: { level: ToolReliabilityLevel; className?: string }) {
  if (level === "operational") return <CheckCircle2 className={className} />;
  if (level === "client-only") return <Laptop className={className} />;
  if (level === "service-backed") return <Cloud className={className} />;
  if (level === "limited") return <Wrench className={className} />;
  return <AlertTriangle className={className} />;
}

export function ToolReliabilityBadge({
  toolId,
  className,
  hideOperational = true,
}: {
  toolId: string;
  className?: string;
  hideOperational?: boolean;
}) {
  const reliability = getToolReliability(toolId);

  if (
    hideOperational &&
    (reliability.level === "operational" ||
      reliability.level === "service-backed" ||
      reliability.level === "client-only")
  ) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider backdrop-blur-md",
        LEVEL_STYLES[reliability.level],
        className
      )}
      title={reliability.headline}
    >
      <ReliabilityIcon level={reliability.level} className="h-2.5 w-2.5 shrink-0" />
      {reliability.label}
    </div>
  );
}

export function ToolReliabilityNotice({
  toolId,
  className,
  showClientOnly = false,
}: {
  toolId: string;
  className?: string;
  showClientOnly?: boolean;
}) {
  const reliability = getToolReliability(toolId);

  if (
    reliability.level === "operational" ||
    (reliability.level === "client-only" && !showClientOnly)
  ) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 sm:p-5",
        NOTICE_STYLES[reliability.level],
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border",
            LEVEL_STYLES[reliability.level]
          )}
        >
          <ReliabilityIcon level={reliability.level} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white">
              {reliability.headline}
            </h3>
            <ToolReliabilityBadge toolId={toolId} hideOperational={false} />
          </div>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-zinc-400">
            {reliability.description}
          </p>
        </div>
      </div>
    </div>
  );
}
