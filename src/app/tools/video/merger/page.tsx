import VideoMerger from "@/components/tool/VideoMerger";
import { Film, Layout } from "lucide-react";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Video Merger | Lumora Studio",
  description: "Merge multiple video clips into a single high-quality production master.",
  canonicalUrl: `${SITE_URL}/tools/video/merger`,
});

export default function VideoMergerPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-20 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Layout className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Master Production</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tightest leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
          VIDEO <br /> <span className="text-purple-500 italic">MERGER</span> STUDIO
        </h1>
        
        <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Combine multiple clips into a single seamless masterpiece with automated normalization and high-bitrate encoding.
        </p>
      </div>

      <VideoMerger />

      {/* Workflow Section */}
      <div className="max-w-5xl mx-auto px-4 mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
         {[
           { title: "Smart Normalization", desc: "Auto-scales every clip to 1080p for a consistent viewing experience.", icon: Film },
           { title: "Lossless Merge", desc: "Preserves original quality with high-bitrate H.264 masters.", icon: Film },
           { title: "Storyboard Control", desc: "Drag, reorder, and manage your production timeline with ease.", icon: Film }
         ].map((feature, i) => (
           <div key={i} className="space-y-4">
              <h4 className="text-lg font-black uppercase tracking-widest text-white">{feature.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
           </div>
         ))}
      </div>
    </main>
  );
}
