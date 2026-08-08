import { Metadata } from "next";
import { Dashboard } from "@/components/tool/Dashboard";
import { LandingPage } from "@/components/layout/LandingPage";
import { createClient } from "@/utils/supabase/server";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = constructMetadata({
  title: "Dashboard - Exismic AI Studio",
  canonicalUrl: `${SITE_URL}/dashboard`,
  description: "Access all 50+ AI tools, developer suites, productivity tools, and recent activity from your personal Exismic workspace dashboard.",
});

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto py-8 md:py-12">
      <Dashboard />
    </div>
  );
}
