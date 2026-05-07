import VideoToGif from "@/components/tool/VideoToGif";
import { Film, Sparkles } from "lucide-react";

export const metadata = {
  title: "Video to GIF | Lumora Studio",
  description: "Convert video clips to high-quality optimized GIFs with custom palettes.",
};

export default function VideoToGifPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-20 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Film className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Cinematic Loops</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tightest leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
          VIDEO TO <br /> <span className="text-purple-500 italic">GIF</span> STUDIO
        </h1>
        
        <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Create pixel-perfect GIFs with intelligent palette optimization and surgical frame precision.
        </p>
      </div>

      <VideoToGif />

      {/* Feature Info Section */}
      <div className="max-w-5xl mx-auto px-4 mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
         {[
           { title: "Palette AI", desc: "Two-pass analysis for perfect 256-color depth.", icon: Sparkles },
           { title: "Dithering", desc: "Smooth gradients with Sierra2 algorithm.", icon: Film },
           { title: "Optimization", desc: "Extreme compression without quality loss.", icon: Film }
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
