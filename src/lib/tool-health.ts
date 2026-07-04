import { TOOLS } from "@/data/tools";
import { getToolReliability } from "@/lib/tool-reliability";

type ToolHealthStatus = "ready" | "limited" | "setup-needed" | "offline";

function hasAnyEnv(keys: string[]) {
  return keys.some((key) => Boolean(process.env[key]));
}

function resolveToolStatus(toolId: string): ToolHealthStatus {
  const reliability = getToolReliability(toolId);

  if (reliability.level === "unavailable") return "offline";
  if (reliability.level === "client-only" && !reliability.dependencyGroups?.length) return "ready";

  const groups = reliability.dependencyGroups || [];
  const requiredGroups = groups.filter((group) => !group.optional);
  const optionalGroups = groups.filter((group) => group.optional);

  const missingRequired = requiredGroups.filter((group) => !hasAnyEnv(group.env));
  if (missingRequired.length > 0) return "setup-needed";

  const hasOptionalConfigured = optionalGroups.some((group) => hasAnyEnv(group.env));
  if (optionalGroups.length > 0 && !hasOptionalConfigured && reliability.level !== "client-only") {
    return "limited";
  }

  if (reliability.level === "limited") return "limited";
  return "ready";
}

export function getToolHealthDiagnostics() {
  const tools = TOOLS.map((tool) => {
    const reliability = getToolReliability(tool.id);
    const dependencyGroups = reliability.dependencyGroups || [];
    const dependencies = dependencyGroups.map((group) => {
      const configured = hasAnyEnv(group.env);
      return {
        label: group.label,
        optional: Boolean(group.optional),
        configured,
        env: group.env,
      };
    });
    const status = resolveToolStatus(tool.id);

    return {
      id: tool.id,
      name: tool.name,
      category: tool.category,
      href: tool.href,
      reliabilityLevel: reliability.level,
      status,
      label: reliability.label,
      headline: reliability.headline,
      dependencies,
      missingRequired: dependencies.filter((item) => !item.optional && !item.configured),
      missingOptional: dependencies.filter((item) => item.optional && !item.configured),
    };
  });

  const summary = {
    total: tools.length,
    ready: tools.filter((tool) => tool.status === "ready").length,
    limited: tools.filter((tool) => tool.status === "limited").length,
    setupNeeded: tools.filter((tool) => tool.status === "setup-needed").length,
    offline: tools.filter((tool) => tool.status === "offline").length,
  };

  return {
    status: summary.offline > 0 || summary.setupNeeded > 0 ? "warning" : "ok",
    summary,
    tools,
  };
}
