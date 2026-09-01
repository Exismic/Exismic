"use client";


export function ProBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030303]">
      {/* 1. Luxurious Golden/Violet Cosmic Mesh (Pure CSS) */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(168, 85, 247, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 85% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.07) 0%, transparent 45%)
          `
        }}
      />

      {/* 2. Precision Laser Grid */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px'
        }}
      />

      {/* 3. Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#030303_100%)] opacity-85" />
    </div>
  );
}
