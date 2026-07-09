const fs = require('fs');

let content = fs.readFileSync('src/components/tool/Dashboard.tsx', 'utf-8');

const new_suite_card = `function SuiteCard({ action, i }: { action: DashboardAction; i: number }) {
  const isPro = action.isPremium;
  const style = CATEGORY_ANIM_STYLES[action.category] || CATEGORY_ANIM_STYLES.ai;

  return (
    <Link href={action.href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 * i, duration: 0.6 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className={cn(
          "group relative min-h-[190px] p-5 sm:p-6 rounded-[1.75rem] sm:rounded-[2.5rem] bg-[#0A0A0A]/80 backdrop-blur-2xl border transition-all duration-500 overflow-hidden h-full flex flex-col justify-between touch-manipulation active:scale-[0.99]",
          isPro 
            ? "border-amber-500/30 hover:border-amber-400/80 shadow-[inset_0_1px_2px_rgba(245,158,11,0.1),0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]" 
            : style.cardBorder
        )}
      >
        {/* Animated Border */}
        <div className="absolute inset-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10">
          <div className={cn(
            "absolute inset-0 animate-[spin_4s_linear_infinite]",
            isPro ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.9)_25%,transparent_50%)]" : style.spinHover
          )} />
        </div>
        {isPro && (
          <div className="absolute inset-[-100%] opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none -z-10">
            <div className="absolute inset-0 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.4)_25%,transparent_50%)]" />
          </div>
        )}
        {/* Inner Mask to hide border behind card background */}
        <div className="absolute inset-[1px] bg-[#0A0A0A]/95 rounded-[1.75rem] sm:rounded-[2.5rem] -z-10" />

        {/* Premium Pro Badge */}
        {action.isPremium && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <ProBadge size="sm" type={action.label.includes("Code") || action.label.includes("Screenshot") ? "studio" : "default"} />
          </div>
        )}

        {/* Shine Hover Effect Layer */}
        <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
          <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Ambient Hover Glows */}
        <div className={cn(
          "absolute -inset-px rounded-[1.75rem] sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-20",
          isPro ? "bg-amber-500/20 group-hover:bg-amber-400/40" : style.aura
        )} />

        <div className="space-y-4 relative z-10">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 md:group-hover:scale-110 md:group-hover:rotate-3 shadow-2xl bg-zinc-900/40 border border-white/5"
          )}>
            <div className={cn(
              "absolute inset-0 opacity-10",
              isPro ? "bg-amber-500" : style.aura.split(" ")[0]
            )} />
            <action.icon size={22} className={cn(
              "relative z-10 transition-all duration-500 group-hover:scale-110", 
              isPro ? "text-amber-500 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" : style.iconGlow
            )} />
          </div>

          <div className="space-y-1.5">
            <h3 className={cn(
              "pr-10 text-base font-bold leading-snug tracking-tight text-white transition-colors [overflow-wrap:normal] [word-break:normal] group-hover:text-white sm:text-lg",
              isPro ? "group-hover:bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]" : "group-hover:text-transparent group-hover:bg-clip-text " + style.textGrad
            )}>
              {action.label}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 transition-colors [overflow-wrap:normal] [word-break:normal] group-hover:text-zinc-300 sm:line-clamp-2 sm:text-[13px]">
              {action.description}
            </p>
          </div>
        </div>

        {/* Premium Button CTA */}
        <div className="mt-6 sm:mt-8 relative z-10">
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
      </motion.div>
    </Link>
  );
}
`;

const startIndex = content.indexOf('function SuiteCard({ action, i }: { action: DashboardAction; i: number }) {');
const endIndex = content.indexOf('export function Dashboard() {');

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + new_suite_card + "\n" + content.substring(endIndex);
    fs.writeFileSync('src/components/tool/Dashboard.tsx', content, 'utf-8');
    console.log("SuiteCard updated successfully.");
} else {
    console.log("Failed to find boundaries.");
}
