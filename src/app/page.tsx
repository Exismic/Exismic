import { Dashboard } from "@/components/tool/Dashboard";
import { LandingPage } from "@/components/layout/LandingPage";
import { createClient } from "@/utils/supabase/server";
import { CategorySection } from "@/components/tool/CategorySection";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto py-12">
      {/* 1. Main Interactive Dashboard */}
      <Dashboard />

      {/* 2. Global Category Explorer (Moved to bottom as discovery) */}
      <section className="pt-24 border-t border-zinc-900">
         <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Pick a category</h2>
            <p className="text-zinc-500 font-medium">Choose what you want to work on</p>
         </div>
         <CategorySection />
      </section>

      {/* Atmospheric Accents */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[#030303]" />
        <div className="absolute top-[10%] right-[5%] w-[30%] h-[30%] bg-accent-purple/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-accent-blue/[0.03] blur-[150px] rounded-full" />
        <div className="absolute inset-0 scanline opacity-20" />
      </div>
    </div>
  );
}
