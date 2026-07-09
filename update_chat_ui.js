const fs = require('fs');

let content = fs.readFileSync('src/components/tool/ToolAssistantPanel.tsx', 'utf8');

const regex = /<motion\.section[\s\S]*?<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-400 via-cyan-300 to-fuchsia-400" \/>[\s\S]*?<div className="flex items-center justify-between gap-4">[\s\S]*?<div className="flex min-w-0 items-center gap-3">[\s\S]*?<div className="relative flex h-11 w-11 shrink-0 items-center justify-center">[\s\S]*?<ExismicMark size={42} \/>[\s\S]*?<\/div>[\s\S]*?<div className="min-w-0">[\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<p className="text-xs font-black uppercase tracking-\[0\.18em\] text-white">[\s\S]*?Exismic Ai[\s\S]*?<\/p>[\s\S]*?<span className="h-1\.5 w-1\.5 rounded-full bg-emerald-400 shadow-\[0_0_10px_rgba\(52,211,153,0\.9\)\]" \/>[\s\S]*?<\/div>[\s\S]*?<p className="truncate text-\[10px\] font-semibold text-zinc-500">[\s\S]*?Connected to \{category\.name\} \/ \{tool\.name\}[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<button[\s\S]*?type="button"[\s\S]*?onClick=\{[\s\S]*?\}[\s\S]*?className="flex h-11 w-11 items-center justify-center rounded-md border border-white\/10 bg-white\/\[0\.03\] text-zinc-500 transition-colors hover:bg-white\/\[0\.07\] hover:text-white"[\s\S]*?aria-label="Close Exismic Ai"[\s\S]*?>[\s\S]*?<X size=\{17\} \/>[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div ref=\{scrollRef\} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 custom-scrollbar">[\s\S]*?\{messages\.map\(\(message\) => \([\s\S]*?<article[\s\S]*?key=\{message\.id\}[\s\S]*?className=\{cn\([\s\S]*?"group relative border p-3\.5 text-sm font-medium leading-relaxed",[\s\S]*?message\.role === "assistant"[\s\S]*?\? "mr-6 rounded-lg border-cyan-300\/10 bg-cyan-300\/\[0\.035\] text-zinc-300"[\s\S]*?: "ml-9 rounded-lg border-violet-300\/15 bg-violet-400\/\[0\.08\] text-white",[\s\S]*?message\.isError && "border-red-400\/20 bg-red-400\/\[0\.06\] text-red-100",[\s\S]*?\)\}[\s\S]*?>[\s\S]*?<p className="whitespace-pre-wrap break-words">\{message\.content\}<\/p>[\s\S]*?\{message\.role === "assistant" && !message\.isError && \([\s\S]*?<div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white\/\[0\.06\] pt-2\.5">[\s\S]*?<button[\s\S]*?type="button"[\s\S]*?onClick=\{[\s\S]*?\}[\s\S]*?className="flex min-h-9 items-center gap-1\.5 rounded-md border border-white\/\[0\.08\] px-2\.5 text-\[9px\] font-black uppercase tracking-wider text-zinc-500 transition hover:bg-white\/\[0\.05\] hover:text-white"[\s\S]*?>[\s\S]*?\{copiedId === message\.id \? <Check size=\{12\} \/> : <Copy size=\{12\} \/>\}[\s\S]*?\{copiedId === message\.id \? "Copied" : "Copy"\}[\s\S]*?<\/button>[\s\S]*?\{message\.draft && \([\s\S]*?<button[\s\S]*?type="button"[\s\S]*?onClick=\{[\s\S]*?\}[\s\S]*?className="flex min-h-9 items-center gap-1\.5 rounded-md border border-violet-300\/20 bg-violet-400\/\[0\.08\] px-2\.5 text-\[9px\] font-black uppercase tracking-wider text-violet-100 transition hover:bg-violet-400\/\[0\.14\]"[\s\S]*?>[\s\S]*?<WandSparkles size=\{12\} \/>[\s\S]*?Use in tool[\s\S]*?<\/button>[\s\S]*?\)\}[\s\S]*?<\/div>[\s\S]*?\)\}[\s\S]*?<\/article>[\s\S]*?\)\)}[\s\S]*?\{isLoading && \([\s\S]*?<div className="mr-16 flex items-center gap-2 rounded-lg border border-white\/10 bg-white\/\[0\.03\] p-3 text-\[10px\] font-black uppercase tracking-widest text-zinc-500">[\s\S]*?<Loader2 size=\{14\} className="animate-spin text-cyan-300" \/>[\s\S]*?Reading this tool[\s\S]*?<\/div>[\s\S]*?\)\}[\s\S]*?<\/div>[\s\S]*?<div className="border-t border-white\/10 bg-black\/20 p-3\.5">[\s\S]*?<div className="mb-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">[\s\S]*?\{followUps\.map\(\(prompt\) => \([\s\S]*?<button[\s\S]*?key=\{prompt\}[\s\S]*?type="button"[\s\S]*?onClick=\{[\s\S]*?\}[\s\S]*?disabled=\{isLoading\}[\s\S]*?className="min-h-10 shrink-0 rounded-md border border-white\/10 bg-white\/\[0\.025\] px-3 text-\[9px\] font-black uppercase tracking-wider text-zinc-400 transition hover:border-cyan-300\/20 hover:bg-cyan-300\/\[0\.05\] hover:text-cyan-50 disabled:opacity-40"[\s\S]*?>[\s\S]*?\{prompt\}[\s\S]*?<\/button>[\s\S]*?\)\)}[\s\S]*?<\/div>[\s\S]*?\{actionStatus && \([\s\S]*?<div className="mb-2 flex items-center gap-2 text-\[9px\] font-black uppercase tracking-wider text-emerald-300">[\s\S]*?<Check size=\{12\} \/>[\s\S]*?\{actionStatus\}[\s\S]*?<\/div>[\s\S]*?\)\}[\s\S]*?<form onSubmit=\{handleSubmit\} className="flex items-end gap-2">[\s\S]*?<div className="relative min-w-0 flex-1">[\s\S]*?<textarea[\s\S]*?data-exismic-assistant="true"[\s\S]*?value=\{input\}[\s\S]*?onChange=\{[\s\S]*?\}[\s\S]*?onKeyDown=\{handleInputKeyDown\}[\s\S]*?placeholder=\{\`Ask about \$\{tool\.name\}\.\.\.\`\}[\s\S]*?className="max-h-32 min-h-12 w-full resize-none rounded-md border border-white\/10 bg-black\/45 px-3\.5 py-3 pr-10 text-sm font-medium text-white outline-none transition-all placeholder:text-zinc-700 focus:border-cyan-300\/35 focus:bg-black\/60"[\s\S]*?rows=\{1\}[\s\S]*?\/>[\s\S]*?<CornerDownLeft[\s\S]*?size=\{13\}[\s\S]*?className="pointer-events-none absolute bottom-4 right-3 text-zinc-700"[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?<button[\s\S]*?type="submit"[\s\S]*?disabled=\{isLoading \|\| !input\.trim\(\)\}[\s\S]*?className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-cyan-200\/20 bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 text-white shadow-\[0_8px_24px_rgba\(34,211,238,0\.18\)\] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35"[\s\S]*?aria-label="Ask Exismic Ai"[\s\S]*?>[\s\S]*?\{isLoading \? <Loader2 size=\{17\} className="animate-spin" \/> : <Send size=\{17\} \/>\}[\s\S]*?<\/button>[\s\S]*?<\/form>[\s\S]*?<div className="mt-2\.5 flex items-center justify-between gap-3 text-\[8px\] font-bold uppercase tracking-\[0\.14em\] text-zinc-700">[\s\S]*?<span className="flex items-center gap-1\.5">[\s\S]*?<SlidersHorizontal size=\{10\} \/>[\s\S]*?Reads active controls[\s\S]*?<\/span>[\s\S]*?<span className="flex items-center gap-1\.5">[\s\S]*?<Sparkles size=\{10\} \/>[\s\S]*?Tool-aware[\s\S]*?<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/motion\.section>/;

const newBlock = `<motion.section
            data-exismic-assistant="true"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 27 }}
            className="fixed inset-x-2 bottom-2 z-[70] mx-auto flex max-h-[min(720px,calc(100dvh-1rem))] max-w-[470px] flex-col overflow-hidden rounded-[26px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(12,10,24,0.98),rgba(4,7,12,0.99)_55%,rgba(4,13,17,0.98))] shadow-[0_35px_120px_rgba(0,0,0,0.82),0_0_70px_rgba(91,33,182,0.13)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-7 sm:right-7 sm:max-h-[min(720px,calc(100dvh-4rem))] sm:w-[470px]"
            aria-label={\`Exismic Ai assistant for \${tool.name}\`}
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,#8b5cf6,#ec4899,#22d3ee,transparent)] bg-[length:220%_100%]"
              animate={{ backgroundPosition: ["100% 0%", "-120% 0%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />

            <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/[0.07] bg-black/15 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <ExismicMark size={52} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="bg-gradient-to-r from-white via-violet-100 to-cyan-100 bg-clip-text text-sm font-black uppercase tracking-[0.16em] text-transparent">
                      Exismic Ai
                    </h2>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  </div>
                  <p className="mt-1 truncate text-[10px] font-semibold text-zinc-500">
                    Connected to {category.name} / {tool.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-zinc-500 transition hover:rotate-90 hover:border-fuchsia-300/20 hover:bg-fuchsia-300/[0.06] hover:text-white"
                aria-label="Close Exismic Ai"
              >
                <X size={17} />
              </button>
            </div>

            <div ref={scrollRef} className="custom-scrollbar relative z-10 flex-1 space-y-4 overflow-y-auto px-3.5 py-4 sm:p-5">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "space-y-3",
                    message.role === "user" ? "ml-6 sm:ml-10" : "mr-6 sm:mr-10"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3.5 text-sm font-medium leading-relaxed shadow-lg",
                      message.role === "assistant"
                        ? "border-white/[0.08] bg-[linear-gradient(120deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-zinc-300"
                        : "border-violet-300/20 bg-[linear-gradient(120deg,rgba(124,58,237,0.16),rgba(34,211,238,0.06))] text-white",
                      message.isError && "border-red-400/20 bg-[linear-gradient(120deg,rgba(248,113,113,0.16),rgba(248,113,113,0.06))] text-red-100",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    {message.role === "assistant" && !message.isError && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-2.5">
                        <button
                          type="button"
                          onClick={() => void copyMessage(message)}
                          className="flex min-h-9 items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </button>
                        {message.draft && (
                          <button
                            type="button"
                            onClick={() => void applyDraft(message.draft || "")}
                            className="flex min-h-9 items-center gap-1.5 rounded-md border border-violet-300/20 bg-violet-400/[0.08] px-2.5 text-[9px] font-black uppercase tracking-wider text-violet-200 transition hover:bg-violet-400/[0.14] hover:text-white"
                          >
                            <WandSparkles size={12} />
                            Use in tool
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 rounded-xl border border-violet-300/15 bg-violet-300/[0.045] px-4 py-3.5 text-xs font-semibold text-zinc-400 mr-10">
                  <span className="relative flex size-8 items-center justify-center rounded-lg border border-violet-300/15 bg-black/20">
                    <Loader2 size={14} className="animate-spin text-cyan-300" />
                  </span>
                  Reading this tool...
                </div>
              )}
            </div>

            <div className="relative z-10 border-t border-white/[0.07] bg-black/25 p-3.5 sm:p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {followUps.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void askCoach(prompt)}
                    disabled={isLoading}
                    className="min-h-10 shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 transition hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-violet-300/[0.055] hover:text-white disabled:opacity-40 active:scale-[0.99]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {actionStatus && (
                <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                  <Check size={12} />
                  {actionStatus}
                </div>
              )}

              <form onSubmit={handleSubmit} className="group/composer flex items-end gap-2 rounded-xl border border-white/[0.09] bg-black/35 p-1.5 shadow-inner transition focus-within:border-violet-300/25 focus-within:shadow-[0_0_28px_rgba(124,58,237,0.08)]">
                <textarea
                  data-exismic-assistant="true"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={\`Ask about \${tool.name}...\`}
                  className="max-h-32 min-h-12 w-full resize-none bg-transparent px-3 py-3 text-sm font-medium text-white outline-none placeholder:text-zinc-700"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#7c3aed,#2563eb_52%,#06b6d4)] text-white shadow-[0_10px_28px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:brightness-115 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Ask Exismic Ai"
                >
                  {isLoading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
              </form>

              <div className="mt-2.5 flex items-center justify-between gap-3 px-1 text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-700">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal size={10} />
                  Reads active controls
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={10} />
                  Tool-aware
                </span>
              </div>
            </div>
          </motion.section>`;

const replaced = content.replace(regex, newBlock);

if (replaced === content) {
  console.log("Regex didn't match.");
} else {
  fs.writeFileSync('src/components/tool/ToolAssistantPanel.tsx', replaced, 'utf8');
  console.log("Successfully replaced chat UI!");
}
