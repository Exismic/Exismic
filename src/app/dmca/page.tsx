import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import DmcaClient from "./DmcaClient";

export const metadata: Metadata = constructMetadata({
  title: "DMCA & Copyright Policy | Exismic",
  description:
    "Exismic Digital Millennium Copyright Act (DMCA) policy, designated copyright agent information, takedown notice guidelines, and counter-notification process.",
  canonicalUrl: `${SITE_URL}/dmca`,
  keywords: [
    "exismic dmca",
    "copyright policy",
    "takedown notice",
    "designated copyright agent",
    "intellectual property",
    "safe harbor",
  ],
});

export default function DmcaPage() {
  return <DmcaClient />;
}
