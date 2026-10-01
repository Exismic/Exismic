import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  "title": "Exismic Community - Upcoming Features",
  "description": "See what is planned for the Exismic creator community and its upcoming features.",
  "canonicalUrl": "/community"
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
