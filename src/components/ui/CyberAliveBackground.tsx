"use client";


export function CyberAliveBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030303]">
      {/* 1. Subtle Precision Cyber Grid Lines (CSS pure hardware acceleration) */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px'
        }}
      />

      {/* 2. Pure CSS Static Cosmic Ambient Aura (Zero GPU blur overhead) */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.09) 0%, transparent 45%),
            radial-gradient(circle at 90% 15%, rgba(6, 182, 212, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
          `
        }}
      />

      {/* 3. Deep Space Radial Vignette for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#030303_100%)] opacity-90" />
    </div>
  );
}
