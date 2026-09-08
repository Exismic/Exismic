import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exismic Currencies & Rewards Guide | Credits, Sparks & Refund Policy",
  description: "Learn how Generation Credits and Exismic Sparks work, how to earn them through daily quests and streaks, and our strict all-sales-final refund policy.",
  openGraph: {
    title: "Exismic Currencies & Rewards Guide | Credits, Sparks & Refund Policy",
    description: "Learn how Generation Credits and Exismic Sparks work, how to earn them through daily quests and streaks, and our strict all-sales-final refund policy.",
    type: "website",
  },
};

export default function CurrencyGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
