import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  "title": "Account Appeal | Exismic",
  "description": "Contact Exismic to request a review of an account restriction.",
  "canonicalUrl": "/appeal"
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
