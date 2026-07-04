export type SupportAgentTone = "friendly" | "professional" | "luxury" | "direct" | "playful";
export type SupportAgentTheme = "midnight" | "aurora" | "graphite" | "frost";
export type SupportAgentWidgetPosition = "bottom-right" | "bottom-left";

export interface SupportAgentInput {
  name: string;
  business_name: string;
  website_url: string;
  description: string;
  tone: SupportAgentTone;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  widget_position: SupportAgentWidgetPosition;
  widget_icon_url: string;
  theme: SupportAgentTheme;
  lead_capture_enabled: boolean;
}

export interface SupportAgent extends SupportAgentInput {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SupportDocument {
  id: string;
  agent_id: string;
  user_id: string;
  title: string;
  source_type: "document" | "faq" | "url" | "note";
  source_url?: string | null;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupportConversation {
  id: string;
  agent_id: string;
  visitor_id?: string | null;
  lead_id?: string | null;
  status: "open" | "resolved";
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  agent_id: string;
  role: "visitor" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SupportLead {
  id: string;
  agent_id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SupportUsageLog {
  id: string;
  agent_id: string;
  user_id: string;
  event_type: "message" | "lead" | "document";
  units: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SupportAgentUsageSummary {
  messages: number;
  documents: number;
  leads: number;
  conversations: number;
}

export interface SupportAgentPlan {
  id: "free" | "starter" | "pro";
  name: string;
  agentLimit: number;
  messageLimit: number;
  documentLimit: number;
  leadCapture: boolean;
  analytics: boolean;
  widgetCustomization: boolean;
}

export const SUPPORT_AGENT_DEFAULTS: SupportAgentInput = {
  name: "",
  business_name: "",
  website_url: "",
  description: "",
  tone: "friendly",
  welcome_message: "Hi, welcome in. How can I help today?",
  fallback_message: "I want to make sure you get the right answer. Please leave your details and our team will follow up.",
  primary_color: "#8B5CF6",
  widget_position: "bottom-right",
  widget_icon_url: "",
  theme: "midnight",
  lead_capture_enabled: true,
};

export const SUPPORT_AGENT_TONES: Array<{ value: SupportAgentTone; label: string; description: string }> = [
  { value: "friendly", label: "Friendly", description: "Warm, helpful, and easy to talk to." },
  { value: "professional", label: "Professional", description: "Clear, polished, and business-focused." },
  { value: "luxury", label: "Luxury", description: "Premium, calm, and concierge-style." },
  { value: "direct", label: "Direct", description: "Short answers with quick next steps." },
  { value: "playful", label: "Playful", description: "Light, upbeat, and brand-forward." },
];

export const SUPPORT_AGENT_THEMES: Array<{ value: SupportAgentTheme; label: string; colors: string[] }> = [
  { value: "midnight", label: "Midnight", colors: ["#05050A", "#8B5CF6", "#22D3EE"] },
  { value: "aurora", label: "Aurora", colors: ["#07111F", "#06B6D4", "#A855F7"] },
  { value: "graphite", label: "Graphite", colors: ["#0D0D10", "#71717A", "#FFFFFF"] },
  { value: "frost", label: "Frost", colors: ["#ECFEFF", "#0284C7", "#111827"] },
];

export const SUPPORT_AGENT_FEATURES = [
  "Train with business documents",
  "Website chat widget",
  "Lead capture",
  "Human handoff",
  "Conversation history",
  "Analytics",
];

export const SUPPORT_AGENT_USE_CASES = [
  "Ecommerce stores",
  "Clinics",
  "Coaching institutes",
  "Local businesses",
  "SaaS websites",
  "Restaurants",
];

export const SUPPORT_AGENT_PRICING = [
  {
    name: "Free",
    price: "₹0/month",
    features: ["1 support agent", "50 messages/month", "3 documents"],
  },
  {
    name: "Starter",
    price: "₹499/month",
    features: ["3 support agents", "1,000 messages/month", "50 documents", "Lead capture"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₹1499/month",
    features: ["10 support agents", "10,000 messages/month", "Advanced analytics", "Widget customization"],
  },
];

export const SUPPORT_AGENT_PLANS: Record<SupportAgentPlan["id"], SupportAgentPlan> = {
  free: {
    id: "free",
    name: "Free",
    agentLimit: 1,
    messageLimit: 50,
    documentLimit: 3,
    leadCapture: false,
    analytics: false,
    widgetCustomization: false,
  },
  starter: {
    id: "starter",
    name: "Starter",
    agentLimit: 3,
    messageLimit: 1000,
    documentLimit: 50,
    leadCapture: true,
    analytics: false,
    widgetCustomization: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    agentLimit: 10,
    messageLimit: 10000,
    documentLimit: 500,
    leadCapture: true,
    analytics: true,
    widgetCustomization: true,
  },
};

export function getSupportAgentPlan(plan?: string | null): SupportAgentPlan {
  if (plan === "pro") return SUPPORT_AGENT_PLANS.pro;
  if (plan === "starter") return SUPPORT_AGENT_PLANS.starter;
  return SUPPORT_AGENT_PLANS.free;
}
