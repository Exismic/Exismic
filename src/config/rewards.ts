export interface RewardItem {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  category: "credits" | "pro" | "cosmetic";
  icon: "Zap" | "Crown" | "Sparkles" | "Ticket" | "Flame" | "Star";
  accentColor: "cyan" | "purple" | "amber" | "emerald";
  badge?: string;
  rewardType: "bonus_credits" | "pro_duration_hours" | "cosmetic_badge" | "giveaway_tickets";
  rewardValue: number;
  popular?: boolean;
}

export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DailyPoll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
}

export interface EarningQuest {
  id: string;
  title: string;
  description: string;
  points: number;
  category: "growth" | "partner" | "community";
  badge: string;
  actionUrl?: string;
  actionLabel: string;
  type: "one_click" | "external_link" | "submit_url";
  partnerName?: string;
}

export interface RewardProfileData {
  userId: string;
  points: number;
  lifetimePoints: number;
  currentStreak: number;
  lastCheckInDate: string | null;
  hasCheckedInToday: boolean;
  hasCompletedQuizToday: boolean;
  hasVotedPollToday: boolean;
  selectedGoalId: string;
  completedQuestIds: string[];
  recentRedemptions: {
    id: string;
    rewardTitle: string;
    costPoints: number;
    voucherCode?: string;
    redeemedAt: string;
    status: string;
  }[];
}

// ==========================================
// 1. REWARDS CATALOG
// ==========================================
export const REWARDS_CATALOG: RewardItem[] = [
  {
    id: "reward_credits_250",
    title: "250 Credits",
    description: "Instant top-up for image generation, skins, and chat.",
    costPoints: 250,
    category: "credits",
    icon: "Zap",
    accentColor: "cyan",
    badge: "Starter",
    rewardType: "bonus_credits",
    rewardValue: 250,
  },
  {
    id: "reward_credits_1000",
    title: "1,000 Credits",
    description: "Extra compute for bulk runs and higher model settings.",
    costPoints: 850,
    category: "credits",
    icon: "Sparkles",
    accentColor: "purple",
    badge: "Save 15%",
    rewardType: "bonus_credits",
    rewardValue: 1000,
    popular: true,
  },
  {
    id: "reward_credits_2500",
    title: "2,500 Credits",
    description: "Massive pack for power users and heavy generation.",
    costPoints: 2000,
    category: "credits",
    icon: "Zap",
    accentColor: "amber",
    badge: "Save 20%",
    rewardType: "bonus_credits",
    rewardValue: 2500,
  },
  {
    id: "reward_pro_24h",
    title: "24-Hour Pro Pass",
    description: "Full Pro perks for a day: 500 daily credits & priority speed.",
    costPoints: 500,
    category: "pro",
    icon: "Crown",
    accentColor: "amber",
    badge: "1-Day Pass",
    rewardType: "pro_duration_hours",
    rewardValue: 24,
    popular: true,
  },
  {
    id: "reward_pro_7d",
    title: "7-Day Pro Pass",
    description: "One full week of Pro access and higher rate limits.",
    costPoints: 2500,
    category: "pro",
    icon: "Crown",
    accentColor: "purple",
    badge: "7-Day Pass",
    rewardType: "pro_duration_hours",
    rewardValue: 168,
  },
  {
    id: "reward_pro_30d",
    title: "30-Day Pro Pass",
    description: "A full month of Exismic Pro ($6.99 value) totally free.",
    costPoints: 8000,
    category: "pro",
    icon: "Crown",
    accentColor: "amber",
    badge: "Top Tier",
    rewardType: "pro_duration_hours",
    rewardValue: 720,
    popular: true,
  },
  {
    id: "reward_cosmic_badge",
    title: "Cosmic Gold Badge",
    description: "Exclusive gold name glow and avatar frame in Exismic.",
    costPoints: 400,
    category: "cosmetic",
    icon: "Star",
    accentColor: "emerald",
    badge: "Exclusive",
    rewardType: "cosmetic_badge",
    rewardValue: 1,
  },
];

// ==========================================
// 2. EARNING BOUNTIES
// ==========================================
export const EARNING_QUESTS: EarningQuest[] = [
  {
    id: "quest_discord_join",
    title: "Join Discord",
    description: "Connect with creators, share skins & get early drops.",
    points: 50,
    category: "growth",
    badge: "+50 RP",
    actionUrl: "https://discord.gg/exismic",
    actionLabel: "Join",
    type: "external_link",
  },
  {
    id: "quest_twitter_follow",
    title: "Follow on X",
    description: "Daily prompt ideas, feature sneak-peeks & updates.",
    points: 50,
    category: "growth",
    badge: "+50 RP",
    actionUrl: "https://x.com/exismic",
    actionLabel: "Follow",
    type: "external_link",
  },
  {
    id: "quest_tiktok_youtube_bounty",
    title: "Creator Bounty",
    description: "Post a short or TikTok showing an Exismic creation with #Exismic.",
    points: 300,
    category: "growth",
    badge: "+300 RP",
    actionLabel: "Submit Link",
    type: "submit_url",
  },
  {
    id: "quest_trustpilot_review",
    title: "Leave a Review",
    description: "Share your honest thoughts on Trustpilot.",
    points: 150,
    category: "growth",
    badge: "+150 RP",
    actionUrl: "https://www.trustpilot.com/evaluate/exismic.com",
    actionLabel: "Review",
    type: "external_link",
  },
  {
    id: "quest_invite_friend",
    title: "Invite a Friend",
    description: "Get 200 RP for every friend who signs up with your link.",
    points: 200,
    category: "growth",
    badge: "+200 RP",
    actionUrl: "/referrals",
    actionLabel: "Get Link",
    type: "one_click",
  },
  {
    id: "partner_notion_trial",
    title: "Try Notion Free",
    description: "Create a free workspace for your notes and projects.",
    points: 300,
    category: "partner",
    badge: "+300 RP",
    actionUrl: "https://notion.so",
    actionLabel: "Open Notion",
    type: "external_link",
    partnerName: "Partner",
  },
  {
    id: "partner_canva_create",
    title: "Try Canva Free",
    description: "Check out quick design tools and templates.",
    points: 250,
    category: "partner",
    badge: "+250 RP",
    actionUrl: "https://canva.com",
    actionLabel: "Open Canva",
    type: "external_link",
    partnerName: "Partner",
  },
  {
    id: "partner_brave_browser",
    title: "Check Out Brave",
    description: "Fast, ad-blocking browser with built-in privacy.",
    points: 200,
    category: "partner",
    badge: "+200 RP",
    actionUrl: "https://brave.com",
    actionLabel: "Open Brave",
    type: "external_link",
    partnerName: "Partner",
  },
  {
    id: "quest_feature_feedback",
    title: "Feature Idea",
    description: "Tell us what tool or feature you'd like us to build next.",
    points: 100,
    category: "community",
    badge: "+100 RP",
    actionLabel: "Send Idea",
    type: "submit_url",
  },
];
