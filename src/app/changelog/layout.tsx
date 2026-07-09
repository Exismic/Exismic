import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exismic Changelog",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
