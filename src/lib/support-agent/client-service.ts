"use client";

import {
  createLocalSupportChat,
  createSupportAgent as createLocalSupportAgent,
  createSupportDocument as createLocalSupportDocument,
  deleteSupportAgent as deleteLocalSupportAgent,
  deleteSupportDocument as deleteLocalSupportDocument,
  getSupportAgent as getLocalSupportAgent,
  getSupportUsageSummary as getLocalSupportUsageSummary,
  listSupportAgents as listLocalSupportAgents,
  listSupportConversations as listLocalSupportConversations,
  listSupportDocuments as listLocalSupportDocuments,
  listSupportLeads as listLocalSupportLeads,
  listSupportMessages as listLocalSupportMessages,
  updateSupportAgent as updateLocalSupportAgent,
} from "./local-store";
import { localSupportReply } from "./reply";
import type { SupportAgent, SupportAgentInput, SupportDocument, SupportLead, SupportMessage } from "./types";

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (response.status === 424) throw new Error("LOCAL_FALLBACK");
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Support Agent request failed.");
  }
  return response.json();
}

function isLocalFallback(error: unknown) {
  return error instanceof Error && error.message === "LOCAL_FALLBACK";
}

export async function listSupportAgentsForUser(userId: string) {
  try {
    const data = await fetchJson<{ agents: SupportAgent[] }>("/api/support-agent/agents");
    return data.agents;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return listLocalSupportAgents(userId);
  }
}

export async function getSupportAgentForUser(userId: string, id: string) {
  try {
    const data = await fetchJson<{ agent: SupportAgent }>(`/api/support-agent/agents/${id}`);
    return data.agent;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return getLocalSupportAgent(userId, id);
  }
}

export async function saveSupportAgentForUser(userId: string, input: SupportAgentInput, id?: string) {
  try {
    const data = await fetchJson<{ agent: SupportAgent }>(id ? `/api/support-agent/agents/${id}` : "/api/support-agent/agents", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return data.agent;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return id ? updateLocalSupportAgent(userId, id, input) : createLocalSupportAgent(userId, input);
  }
}

export async function removeSupportAgentForUser(userId: string, id: string) {
  try {
    await fetchJson<{ success: boolean }>(`/api/support-agent/agents/${id}`, { method: "DELETE" });
    return true;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return deleteLocalSupportAgent(userId, id);
  }
}

export async function listDocumentsForAgent(userId: string, agentId: string) {
  try {
    const data = await fetchJson<{ documents: SupportDocument[] }>(`/api/support-agent/agents/${agentId}/documents`);
    return data.documents;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return listLocalSupportDocuments(userId, agentId);
  }
}

export async function addDocumentForAgent(userId: string, agentId: string, input: Pick<SupportDocument, "title" | "content" | "source_type" | "source_url">) {
  try {
    const data = await fetchJson<{ document: SupportDocument }>(`/api/support-agent/agents/${agentId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return data.document;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return createLocalSupportDocument(userId, agentId, input);
  }
}

export async function removeDocumentForAgent(userId: string, agentId: string, documentId: string) {
  try {
    await fetchJson<{ success: boolean }>(`/api/support-agent/agents/${agentId}/documents/${documentId}`, { method: "DELETE" });
    return true;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return deleteLocalSupportDocument(userId, agentId, documentId);
  }
}

export async function chatWithSupportAgent(userId: string, agent: SupportAgent, message: string) {
  try {
    const data = await fetchJson<{ reply: string; messages: SupportMessage[] }>(`/api/support-agent/widget/${agent.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, visitorId: userId }),
    });
    return data;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    const documents = listLocalSupportDocuments(userId, agent.id);
    const reply = localSupportReply(agent, message, documents);
    return createLocalSupportChat(agent.id, userId, message, reply);
  }
}

export async function getSupportAgentInsights(userId: string, agentId: string) {
  try {
    const data = await fetchJson<{ conversations: unknown[]; messages: SupportMessage[]; leads: SupportLead[]; usage: ReturnType<typeof getLocalSupportUsageSummary> }>(
      `/api/support-agent/agents/${agentId}/conversations`
    );
    return data;
  } catch (error) {
    if (!isLocalFallback(error)) throw error;
    return {
      conversations: listLocalSupportConversations(agentId),
      messages: listLocalSupportMessages(agentId),
      leads: listLocalSupportLeads(agentId),
      usage: getLocalSupportUsageSummary(userId, agentId),
    };
  }
}
