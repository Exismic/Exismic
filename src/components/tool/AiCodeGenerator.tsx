"use client";

import LumoraCodeStudio from "./studio";

export function AiCodeGenerator({ fullPage = false }: { fullPage?: boolean }) {
  if (fullPage) {
    return <LumoraCodeStudio />;
  }

  return (
    <div className="h-[700px] w-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-4xl bg-[#050505]">
      <LumoraCodeStudio />
    </div>
  );
}
