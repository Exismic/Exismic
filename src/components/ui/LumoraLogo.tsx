"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface LumoraLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  innerClassName?: string;
  logoLink?: boolean;
}

export function LumoraMark({
  size = 36,
  className,
  animated = true,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <span
      className={cn(
        "group/mark relative isolate inline-flex shrink-0 items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/lumora-app-icon.png"
        alt="Lumora"
        width={512}
        height={512}
        priority
        className="relative z-10 h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(91,109,255,0.22)]"
      />
      <span
        aria-hidden="true"
        className={cn(
          "lumora-neon-outline absolute inset-[3%] z-20 opacity-90",
          animated ? "lumora-neon-outline--animated" : "lumora-neon-outline--static"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "lumora-neon-outline absolute inset-[3%] z-20 opacity-80 blur-[4px]",
          animated ? "lumora-neon-outline--animated" : "lumora-neon-outline--static"
        )}
      />
    </span>
  );
}

export function LumoraLogo({
  size = 36,
  showText = true,
  className = "",
  innerClassName = "",
  logoLink = true,
}: LumoraLogoProps) {
  const titleSizeClass = size <= 32 
    ? "text-[14px]" 
    : size <= 40 
      ? "text-[17px]" 
      : "text-[22px]";
      
  const subtitleSizeClass = size <= 32 
    ? "text-[7px] tracking-[0.28em] mt-0.5" 
    : size <= 40 
      ? "text-[8px] tracking-[0.3em] mt-1" 
      : "text-[9px] tracking-[0.32em] mt-1.5";

  const logoContent = (
    <div className={cn("flex items-center gap-3 group relative cursor-pointer select-none", className)}>
      <LumoraMark size={size} className={innerClassName} />

      {/* Premium Typography Branding */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <h1 className={cn(
            "font-black tracking-[-0.015em] text-white leading-none flex items-center transition-colors duration-300 group-hover:text-zinc-100",
            titleSizeClass
          )}>
            Lumora
            <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] ml-[1px]">.</span>
          </h1>
          <span className={cn(
            "font-black text-zinc-500 uppercase transition-colors duration-300 group-hover:text-zinc-400",
            subtitleSizeClass
          )}>
            AI Studio
          </span>
        </div>
      )}
    </div>
  );

  if (logoLink) {
    return (
      <Link href="/" className="inline-block outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
