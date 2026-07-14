import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import AmbientMixer from "@/components/tool/AmbientMixer";
import { Music } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("ambient-mixer", "audio");
}

export default function AmbientMixerPage() {
  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-6 pt-24 font-sans text-white selection:bg-purple-500/30 sm:px-6 md:px-12 md:pb-12 md:pt-28" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-xl">
                <Music className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-400">
                Cinematic Ambient Mixer
              </h1>
            </div>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium">
              Mix custom, high-fidelity foley soundscapes with custom AI-generated Lo-Fi music loops for study and focus.
            </p>
          </div>
        </header>

        <main>
          <AmbientMixer />
        </main>
      </div>

      {/* Atmospheric background glows */}
      <div className="fixed top-0 left-0 -z-10 w-[700px] h-[700px] bg-purple-600/[0.025] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-600/[0.02] blur-[150px] rounded-full pointer-events-none animate-pulse" />
    </div>
  );
}
