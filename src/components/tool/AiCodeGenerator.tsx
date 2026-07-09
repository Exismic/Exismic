"use client";

import ExismicCodeStudio from "./studio";

export function AiCodeGenerator({ fullPage = false }: { fullPage?: boolean }) {
  if (fullPage) {
    return <ExismicCodeStudio />;
  }

  return (
    <div className="h-[700px] w-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-4xl bg-[#050505]">
      <ExismicCodeStudio />
    </div>
  );
}
