"use client";

import type {
  SupportAgent,
  SupportAgentInput,
  SupportAgentUsageSummary,
  SupportConversation,
  SupportDocument,
  SupportLead,
  SupportMessage,
  SupportUsageLog,
} from "./types";

const STORAGE_KEY = "exismic:support-agents:v1";
const DOCUMENTS_KEY = "exismic:support-documents:v1";
const CONVERSATIONS_KEY = "exismic:support-conversations:v1";
const MESSAGES_KEY = "exismic:support-messages:v1";
const LEADS_KEY = "exismic:support-leads:v1";
const USAGE_KEY = "exismic:support-usage:v1";

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `support_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function listSupportAgents(userId: string) {
  return readList<SupportAgent>(STORAGE_KEY)
    .filter((agent) => agent.user_id === userId)
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
}

export function getSupportAgent(userId: string, id: string) {
  return readList<SupportAgent>(STORAGE_KEY).find((agent) => agent.user_id === userId && agent.id === id) ?? null;
}

export function createSupportAgent(userId: string, input: SupportAgentInput) {
  const now = new Date().toISOString();
  const agent: SupportAgent = {
    ...input,
    id: createId(),
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  writeList(STORAGE_KEY, [agent, ...readList<SupportAgent>(STORAGE_KEY)]);
  return agent;
}

export function updateSupportAgent(userId: string, id: string, input: SupportAgentInput) {
  let updated: SupportAgent | null = null;
  const agents = readList<SupportAgent>(STORAGE_KEY).map((agent) => {
    if (agent.user_id !== userId || agent.id !== id) return agent;

    updated = {
      ...agent,
      ...input,
      updated_at: new Date().toISOString(),
    };

    return updated;
  });

  writeList(STORAGE_KEY, agents);
  return updated;
}

export function deleteSupportAgent(userId: string, id: string) {
  const before = readList<SupportAgent>(STORAGE_KEY);
  const after = before.filter((agent) => !(agent.user_id === userId && agent.id === id));
  writeList(STORAGE_KEY, after);
  return before.length !== after.length;
}

export function listSupportDocuments(userId: string, agentId: string) {
  return readList<SupportDocument>(DOCUMENTS_KEY)
    .filter((document) => document.user_id === userId && document.agent_id === agentId)
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
}

export function createSupportDocument(userId: string, agentId: string, input: Pick<SupportDocument, "title" | "content" | "source_type" | "source_url">) {
  const now = new Date().toISOString();
  const document: SupportDocument = {
    id: createId(),
    agent_id: agentId,
    user_id: userId,
    title: input.title,
    content: input.content,
    source_type: input.source_type,
    source_url: input.source_url ?? null,
    metadata: {},
    created_at: now,
    updated_at: now,
  };
  writeList(DOCUMENTS_KEY, [document, ...readList<SupportDocument>(DOCUMENTS_KEY)]);
  createSupportUsage(userId, agentId, "document", 1);
  return document;
}

export function deleteSupportDocument(userId: string, agentId: string, documentId: string) {
  const before = readList<SupportDocument>(DOCUMENTS_KEY);
  const after = before.filter((document) => !(document.user_id === userId && document.agent_id === agentId && document.id === documentId));
  writeList(DOCUMENTS_KEY, after);
  return before.length !== after.length;
}

export function listSupportConversations(agentId: string) {
  return readList<SupportConversation>(CONVERSATIONS_KEY)
    .filter((conversation) => conversation.agent_id === agentId)
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
}

export function listSupportMessages(agentId: string, conversationId?: string) {
  return readList<SupportMessage>(MESSAGES_KEY)
    .filter((message) => message.agent_id === agentId && (!conversationId || message.conversation_id === conversationId))
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
}

export function createLocalSupportChat(agentId: string, userId: string, visitorMessage: string, reply: string) {
  const now = new Date().toISOString();
  const conversation: SupportConversation = {
    id: createId(),
    agent_id: agentId,
    visitor_id: "local-visitor",
    status: "open",
    created_at: now,
    updated_at: now,
  };
  const messages: SupportMessage[] = [
    { id: createId(), conversation_id: conversation.id, agent_id: agentId, role: "visitor", content: visitorMessage, created_at: now },
    { id: createId(), conversation_id: conversation.id, agent_id: agentId, role: "assistant", content: reply, created_at: new Date(Date.now() + 1).toISOString() },
  ];
  writeList(CONVERSATIONS_KEY, [conversation, ...readList<SupportConversation>(CONVERSATIONS_KEY)]);
  writeList(MESSAGES_KEY, [...readList<SupportMessage>(MESSAGES_KEY), ...messages]);
  createSupportUsage(userId, agentId, "message", 1);
  return { conversation, messages, reply };
}

export function createSupportLead(agentId: string, input: Pick<SupportLead, "name" | "email" | "phone" | "message">) {
  const lead: SupportLead = {
    id: createId(),
    agent_id: agentId,
    name: input.name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    message: input.message ?? null,
    metadata: {},
    created_at: new Date().toISOString(),
  };
  writeList(LEADS_KEY, [lead, ...readList<SupportLead>(LEADS_KEY)]);
  return lead;
}

export function listSupportLeads(agentId: string) {
  return readList<SupportLead>(LEADS_KEY)
    .filter((lead) => lead.agent_id === agentId)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export function createSupportUsage(userId: string, agentId: string, eventType: SupportUsageLog["event_type"], units = 1) {
  const usage: SupportUsageLog = {
    id: createId(),
    user_id: userId,
    agent_id: agentId,
    event_type: eventType,
    units,
    metadata: {},
    created_at: new Date().toISOString(),
  };
  writeList(USAGE_KEY, [usage, ...readList<SupportUsageLog>(USAGE_KEY)]);
  return usage;
}

export function getSupportUsageSummary(userId: string, agentId?: string): SupportAgentUsageSummary {
  const documents = readList<SupportDocument>(DOCUMENTS_KEY).filter((document) => document.user_id === userId && (!agentId || document.agent_id === agentId)).length;
  const conversations = readList<SupportConversation>(CONVERSATIONS_KEY).filter((conversation) => !agentId || conversation.agent_id === agentId).length;
  const leads = readList<SupportLead>(LEADS_KEY).filter((lead) => !agentId || lead.agent_id === agentId).length;
  const messages = readList<SupportUsageLog>(USAGE_KEY)
    .filter((log) => log.user_id === userId && log.event_type === "message" && (!agentId || log.agent_id === agentId))
    .reduce((total, log) => total + log.units, 0);
  return { documents, conversations, leads, messages };
}
