export interface GiveawayPrizeTier {
  place: number;
  rankTitle: string;
  prizeAmount: number;
  prizeDisplay: string;
  badge: string;
}

export interface ActiveGiveawayConfig {
  id: string;
  title: string;
  subtitle: string;
  totalPrizePool: number;
  prizeType: "lifetime_credits";
  prizeDisplay: string;
  winnersCount: number;
  prizes: GiveawayPrizeTier[];
  requiredSpend: number;
  startsAt: string; // ISO String
  endsAt: string;   // ISO String
  status: "scheduled" | "active" | "ended" | "drawing";
  terms: string[];
}

export const TEST_WINNER_EMAIL = "syedrayan.dev@gmail.com";
export const TEST_WINNER_NAME = "SYED RAYAN";

export const PRIZE_TIERS: GiveawayPrizeTier[] = [
  {
    place: 1,
    rankTitle: "1st Place Winner",
    prizeAmount: 1500,
    prizeDisplay: "1,500 Permanent Credits",
    badge: "👑 Grand Champion",
  },
  {
    place: 2,
    rankTitle: "2nd Place Winner",
    prizeAmount: 1000,
    prizeDisplay: "1,000 Permanent Credits",
    badge: "🥈 Runner Up",
  },
  {
    place: 3,
    rankTitle: "3rd Place Winner",
    prizeAmount: 500,
    prizeDisplay: "500 Permanent Credits",
    badge: "🥉 Third Place",
  },
];

export const CURRENT_GIVEAWAY: ActiveGiveawayConfig | null = null;
