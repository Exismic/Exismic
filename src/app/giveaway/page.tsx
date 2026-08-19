import { Metadata } from "next";
import { GiveawayPageClient } from "@/components/giveaway/GiveawayPageClient";

export const metadata: Metadata = {
  title: "New Giveaway Coming Soon | Exismic",
  description:
    "A special community giveaway is dropping on Exismic! Stay tuned for the official countdown, prize reveals, and entry qualification.",
  openGraph: {
    title: "New Giveaway Coming Soon · Exismic",
    description:
      "A special community giveaway is dropping on Exismic! Stay tuned for the official countdown and prize reveals.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Exismic Giveaway" }],
  },
};

export default function GiveawayPage() {
  return <GiveawayPageClient />;
}
