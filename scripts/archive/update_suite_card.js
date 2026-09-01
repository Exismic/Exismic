const fs = require('fs');
let content = fs.readFileSync('src/components/tool/Dashboard.tsx', 'utf-8');

const newSuiteCard = `function SuiteCard({ action, i }: { action: DashboardAction; i: number }) {
  const isPro = action.isPremium;
  const style = CATEGORY_ANIM_STYLES[action.category || "ai"] || CATEGORY_ANIM_STYLES.ai;
  const Icon = action.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * i, duration: 0.6 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative h-full min-w-0"
    >
      <Link href={action.href} className="block h-full rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] sm:rounded-[2.5rem] md:rounded-[3rem]">
        <div className={cn(
          "relative h-full min-h-[260px] flex flex-col p-5 sm:p-6 md:p-8 backdrop-blur-3xl transition-all duration-500 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden touch-manipulation",
          "border border-white/5",
          isPro 
            ? "bg-zinc-950/60 border-amber-500/20 shadow-[inset_0_1px_2px_rgba(245,158,11,0.1),0_0_15px_rgba(245,158,11,0.05)] hover:border-amber-400/60 hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]" 
            : cn("bg-zinc-950/50 hover:bg-zinc-900/60 transition-all duration-500 border", style.cardBorder),
          "md:group-hover:scale-[1.03] active:scale-[0.99]"
        )}>
          {/* Shine Animation Layer */}
          <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden pointer-events-none z-10">
            <div className={cn(
              "absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/10 to-transparent",
              isPro && "via-amber-500/20"
            )} />
          </div>

          {/* Badges */}
          {isPro && (
             <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 z-20">
               <div className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 backdrop-blur-md border border-amber-400/40 text-[8px] font-black uppercase tracking-widest text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                 <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
                 <Crown size={9} className="relative z-10 fill-amber-200 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                 <span className="relative z-10">Pro</span>
               </div>
             </div>
          )}

          {/* Icon Section */}
          <div className="mb-6 sm:mb-8 relative pr-20 sm:pr-24">
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center relative overflow-hidden md:group-hover:rotate-6 md:group-hover:scale-110 transition-all duration-500 shadow-2xl",
              "bg-[#0b0c12] border border-white/5",
            )}>
              <div className={cn("absolute inset-0 blur-xl animate-pulse transition-colors duration-500", isPro ? "bg-amber-500/20 group-hover:bg-amber-400/40" : style.aura)} />
              <div className={cn("absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500", isPro ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.4)_25%,transparent_50%)] group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.9)_25%,transparent_50%)]" : cn(style.spinIdle, style.spinHover))} />
              <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] md:rounded-[calc(2rem-1.5px)] bg-[#0b0c12] z-0 overflow-hidden">
                <div className={cn("absolute inset-0 bg-gradient-to-br from-white/5 to-transparent", isPro && "from-amber-500/10")} />
                <motion.div
                  className={cn("absolute top-0 left-[-100%] h-full w-[50%] skew-x-[-20deg]", isPro ? "bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" : "bg-gradient-to-r from-transparent via-white/10 to-transparent")}
                  animate={{ left: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                />
              </div>
              <Icon className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 transition-all duration-700 z-10",
                "group-hover:scale-110",
                isPro ? "text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] group-hover:text-amber-200 group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" : style.iconGlow
              )} />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
            <h3 className={cn(
              "text-xl sm:text-2xl font-black tracking-tighter leading-tight transition-colors break-words text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]",
              isPro ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]" : style.textGrad
            )}>
              {action.label}
            </h3>
            <p className="text-xs sm:text-[13px] font-medium text-zinc-500 line-clamp-3 sm:line-clamp-2 leading-relaxed tracking-tight group-hover:text-zinc-300 transition-colors break-words">
              {action.description}
            </p>
          </div>

          {/* Premium Button CTA */}
          <div className="mt-6 sm:mt-8">
            <div className={cn(
              "w-full min-h-12 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-500 relative overflow-hidden",
              isPro 
                ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-[1.02] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] border border-amber-300/50" 
                : cn("group-hover:scale-[1.02] border shadow-lg", style.buttonGrad)
            )}>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                Launch Tool
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
              </span>
            </div>
          </div>

          {/* Ambient Bottom Glow */}
          <div className={cn(
            "absolute inset-x-16 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[0.5px]",
            isPro ? "bg-linear-to-r from-transparent via-amber-400 to-transparent" : "bg-linear-to-r from-transparent via-white/50 to-transparent"
          )} />
        </div>
      </Link>
    </motion.div>
  );
}`;

const startIndex = content.indexOf('function SuiteCard({ action, i }: { action: DashboardAction; i: number }) {');
const endIndex = content.indexOf('export function Dashboard() {');
if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + newSuiteCard + '\\n\\n' + content.substring(endIndex);
    fs.writeFileSync('src/components/tool/Dashboard.tsx', content, 'utf-8');
    console.log('Successfully updated SuiteCard structure.');
} else {
    console.error('Could not find SuiteCard or Dashboard bounds.');
}
