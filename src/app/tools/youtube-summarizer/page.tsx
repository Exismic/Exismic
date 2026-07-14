import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import YoutubeSummarizer from "@/components/tool/YoutubeSummarizer";

const YoutubeIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107c.502-1.89.502-5.837.502-5.837s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("youtube-summarizer", "ai");
}

export default function YoutubeSummarizerPage() {
  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-6 pt-24 font-sans text-white selection:bg-red-500/30 sm:px-6 md:px-12 md:pb-12 md:pt-28" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-xl">
                <YoutubeIcon className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-red-400">
                YouTube AI Summarizer
              </h1>
            </div>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium">
              Repurpose any YouTube video into detailed study notes, publication-ready blogs, or viral social threads instantly.
            </p>
          </div>
        </header>

        <main>
          <YoutubeSummarizer />
        </main>
      </div>

      {/* Atmospheric backgrounds */}
      <div className="fixed top-0 right-0 -z-10 w-[700px] h-[700px] bg-red-600/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-rose-600/[0.025] blur-[150px] rounded-full pointer-events-none animate-pulse" />
    </div>
  );
}
