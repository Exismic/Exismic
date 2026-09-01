import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exismic Rewards | Earn Points, Free Credits & Pro Passes",
  description: "Complete daily check-ins, AI trivia, community polls, and partner quests to earn Exismic Reward Points. Redeem points for free generation credits, Pro passes, and exclusive perks.",
  openGraph: {
    title: "Exismic Rewards | Earn Points, Free Credits & Pro Passes",
    description: "Earn Exismic Reward Points daily and unlock free AI tool credits and Pro memberships without paying.",
    type: "website",
  },
};

export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#060913] text-white selection:bg-amber-500/30 selection:text-amber-200">
      {children}
    </div>
  );
}
