import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  "title": "Developer API Documentation | Exismic",
  "description": "Explore Exismic API endpoints, request examples, authentication, and responses.",
  "canonicalUrl": "/developer/docs"
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
