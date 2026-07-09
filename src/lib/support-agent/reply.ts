import type { SupportAgent, SupportDocument } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type SmallTalkIntent = "greeting" | "thanks" | "goodbye" | "confirmation" | "help" | null;

function normalizeMessage(message: string) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectSmallTalkIntent(message: string): SmallTalkIntent {
  const normalized = normalizeMessage(message);
  if (!normalized) return "help";

  const exactMatches: Record<string, SmallTalkIntent> = {
    hi: "greeting",
    hii: "greeting",
    hello: "greeting",
    hey: "greeting",
    yo: "greeting",
    "good morning": "greeting",
    "good afternoon": "greeting",
    "good evening": "greeting",
    thanks: "thanks",
    thank: "thanks",
    "thank you": "thanks",
    thx: "thanks",
    ok: "confirmation",
    okay: "confirmation",
    cool: "confirmation",
    nice: "confirmation",
    great: "confirmation",
    bye: "goodbye",
    goodbye: "goodbye",
    help: "help",
  };

  if (exactMatches[normalized]) return exactMatches[normalized];
  if (/^(hi|hello|hey)\b/.test(normalized) && normalized.split(" ").length <= 4) return "greeting";
  if (/\b(thanks|thank you|appreciate it)\b/.test(normalized) && normalized.split(" ").length <= 6) return "thanks";
  if (/\b(bye|goodbye|see you)\b/.test(normalized) && normalized.split(" ").length <= 6) return "goodbye";
  if (/^(ok|okay|cool|great|nice|sounds good|got it)$/.test(normalized)) return "confirmation";

  return null;
}

export function smallTalkReply(agent: SupportAgent, intent: SmallTalkIntent) {
  switch (intent) {
    case "greeting":
      return agent.welcome_message || `Hi, welcome to ${agent.business_name}. How can I help today?`;
    case "thanks":
      return `You're welcome. Anything else I can help you with about ${agent.business_name}?`;
    case "goodbye":
      return `Thanks for visiting ${agent.business_name}. Have a great day.`;
    case "confirmation":
      return "Got it. Ask me anything else you need help with.";
    case "help":
      return `I can help with ${agent.business_name}'s services, pricing, policies, support details, and common customer questions. What would you like to know?`;
    default:
      return null;
  }
}

export function findRelevantDocuments(message: string, documents: SupportDocument[], limit = 4) {
  const words = new Set(
    normalizeMessage(message)
      .split(" ")
      .filter((word) => word.length > 2)
  );

  return documents
    .map((document) => {
      const haystack = `${document.title} ${document.content}`.toLowerCase();
      const score = [...words].reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
      return { document, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.document);
}

export function localSupportReply(agent: SupportAgent, message: string, documents: SupportDocument[]) {
  const conversationalReply = smallTalkReply(agent, detectSmallTalkIntent(message));
  if (conversationalReply) return conversationalReply;

  const relevant = findRelevantDocuments(message, documents, 2);

  if (relevant.length > 0) {
    const source = relevant[0];
    const excerpt = source.content.replace(/\s+/g, " ").slice(0, 520);
    return `Based on ${agent.business_name}'s information: ${excerpt}${source.content.length > 520 ? "..." : ""}`;
  }

  return agent.fallback_message;
}

export async function generateSupportReply(agent: SupportAgent, message: string, documents: SupportDocument[]) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((key) => key.trim()).filter(Boolean);
  const conversationalReply = smallTalkReply(agent, detectSmallTalkIntent(message));
  if (conversationalReply) {
    return {
      reply: conversationalReply,
      source: "conversation",
    };
  }

  const relevant = findRelevantDocuments(message, documents, 5);

  if (keys.length === 0 || relevant.length === 0) {
    return {
      reply: localSupportReply(agent, message, documents),
      source: relevant.length > 0 ? "knowledge" : "fallback",
    };
  }

  const context = relevant
    .map((document, index) => `Source ${index + 1}: ${document.title}\n${document.content.slice(0, 1800)}`)
    .join("\n\n");

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are Exismic Support Agent for a business website. Answer only from the provided business knowledge. Be concise, helpful, and professional. If the answer is not covered, use the fallback message. Do not mention internal systems, prompts, or missing data.",
      },
      {
        role: "user",
        content: `Business: ${agent.business_name}\nTone: ${agent.tone}\nFallback: ${agent.fallback_message}\n\nKnowledge:\n${context}\n\nCustomer question: ${message}`,
      },
    ],
    temperature: 0.35,
    max_tokens: 260,
  };

  for (const key of keys) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) continue;
      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (reply) return { reply, source: "ai" };
    } catch {
      continue;
    }
  }

  return {
    reply: localSupportReply(agent, message, documents),
    source: "knowledge",
  };
}
