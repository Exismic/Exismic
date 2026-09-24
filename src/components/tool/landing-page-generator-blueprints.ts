export interface LandingPageBlueprint {
  id: string;
  name: string;
  tagline: string;
  category: string;
  style: "modern" | "minimalist" | "creative" | "emerald";
  iconName: "Layout" | "Palette" | "Smartphone" | "Cpu";
  prompt: string;
  html: string;
}

export const LANDING_PAGE_BLUEPRINTS: LandingPageBlueprint[] = [
  {
    id: "saas-analytics",
    name: "Dark SaaS Analytics",
    tagline: "High-conversion revenue intelligence dashboard",
    category: "SaaS • Analytics",
    style: "modern",
    iconName: "Layout",
    prompt: "A modern dark-themed SaaS analytics dashboard for high-growth tech companies with glowing charts, real-time KPI counters, revenue metrics, and tiered pricing cards.",
    html: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ApexMetrics • Real-Time Revenue Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Outfit', 'sans-serif'] },
          colors: {
            brand: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' }
          }
        }
      }
    };
  </script>
  <style>
    body { font-family: 'Outfit', sans-serif; background-color: #07080d; color: #f4f4f5; }
    .glass-card { background: rgba(18, 20, 29, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .amber-glow { box-shadow: 0 0 40px -10px rgba(245, 158, 11, 0.35); }
  </style>
</head>
<body class="min-h-screen bg-[#07080d] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-300">
  <!-- Floating Glass Navbar -->
  <nav class="fixed top-4 inset-x-0 mx-auto max-w-5xl z-50 px-6 py-3 glass-card rounded-2xl flex items-center justify-between border border-white/10 shadow-2xl">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-amber-500/30">
        <i data-lucide="activity" class="w-4 h-4 text-zinc-950"></i>
      </div>
      <span class="font-bold tracking-tight text-lg text-white">Apex<span class="text-amber-400">Metrics</span></span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
      <a href="#features" class="hover:text-amber-400 transition-colors">Features</a>
      <a href="#analytics" class="hover:text-amber-400 transition-colors">Live Analytics</a>
      <a href="#pricing" class="hover:text-amber-400 transition-colors">Pricing</a>
      <a href="#reviews" class="hover:text-amber-400 transition-colors">Testimonials</a>
    </div>
    <div class="flex items-center gap-3">
      <button class="text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors">Sign In</button>
      <button class="text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 px-4 py-2 rounded-xl hover:brightness-110 transition shadow-lg shadow-amber-500/20">Start Free Trial</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="pt-36 pb-20 px-6 text-center max-w-5xl mx-auto relative">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
      <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
      Real-Time Retention Forecaster 2.0
    </div>
    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
      Turn Complex Data Into <br class="hidden sm:block" />
      <span class="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Predictable Revenue Growth</span>
    </h1>
    <p class="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      The unified analytics dashboard engineered for modern software leaders. Monitor MRR velocity, customer cohort retention, and churn in sub-second real time.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
      <button class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold rounded-xl shadow-xl shadow-amber-500/25 hover:brightness-110 transition flex items-center justify-center gap-2">
        <i data-lucide="rocket" class="w-4 h-4"></i> Launch Free Workspace
      </button>
      <button class="w-full sm:w-auto px-8 py-3.5 glass-card text-zinc-200 font-semibold rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2">
        <i data-lucide="play-circle" class="w-4 h-4 text-amber-400"></i> Interactive Demo
      </button>
    </div>

    <!-- Rating Proof -->
    <div class="flex items-center justify-center gap-4 text-xs text-zinc-400">
      <div class="flex text-amber-400">
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
      </div>
      <span class="font-semibold text-zinc-200">4.9/5 Rating</span>
      <span class="text-zinc-600">•</span>
      <span>Used by 4,200+ high-growth teams</span>
    </div>
  </header>

  <!-- Interactive Live Dashboard Preview -->
  <section id="analytics" class="max-w-6xl mx-auto px-6 mb-28">
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden amber-glow">
      <div class="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          <span class="ml-4 text-xs font-mono text-zinc-500">live.apexmetrics.io/realtime-mrr</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Streaming Live
          </span>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div class="text-xs text-zinc-400 font-medium mb-1">Monthly Recurring Revenue</div>
          <div class="text-2xl font-bold text-white mb-2">$184,920</div>
          <div class="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +28.4% vs last mo
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div class="text-xs text-zinc-400 font-medium mb-1">Net Churn Velocity</div>
          <div class="text-2xl font-bold text-white mb-2">0.82%</div>
          <div class="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i> -1.2% all-time low
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div class="text-xs text-zinc-400 font-medium mb-1">Active Workspaces</div>
          <div class="text-2xl font-bold text-white mb-2">14,290</div>
          <div class="flex items-center gap-1 text-xs text-amber-400 font-semibold">
            <i data-lucide="users" class="w-3.5 h-3.5"></i> +1,420 this week
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div class="text-xs text-zinc-400 font-medium mb-1">LTV : CAC Multiplier</div>
          <div class="text-2xl font-bold text-white mb-2">4.8x</div>
          <div class="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <i data-lucide="zap" class="w-3.5 h-3.5"></i> Exceptional health
          </div>
        </div>
      </div>

      <!-- Chart Simulation -->
      <div class="p-5 rounded-2xl bg-black/40 border border-white/5">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm font-semibold text-zinc-200">Cohort Revenue Progression (12 Months)</div>
          <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span class="inline-block w-2.5 h-2.5 rounded bg-amber-400"></span> Enterprise
            <span class="inline-block w-2.5 h-2.5 rounded bg-emerald-400 ml-2"></span> Pro Tier
          </div>
        </div>
        <div class="h-36 flex items-end gap-2 sm:gap-4 pt-6">
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[40%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[52%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[48%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[65%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[72%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[68%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[82%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[79%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[91%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[88%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/70 rounded-t h-[96%]"></div>
          <div class="flex-1 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t h-[100%] shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="max-w-6xl mx-auto px-6 mb-28">
    <div class="text-center mb-16">
      <h2 class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Enterprise Core Features</h2>
      <p class="text-3xl sm:text-4xl font-bold text-white">Everything needed to scale with total clarity</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-8 rounded-3xl hover:border-amber-500/30 transition group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
          <i data-lucide="zap" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-3">Sub-Second Live Sync</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">
          Zero delay between customer events and executive dashboards. Stream Stripe, Paddle, and App Store metrics simultaneously.
        </p>
      </div>
      <div class="glass-card p-8 rounded-3xl hover:border-amber-500/30 transition group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
          <i data-lucide="brain-circuit" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-3">Predictive Churn Warnings</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">
          Identifies accounts displaying drop-off signals 21 days before they cancel so customer success can intervene proactively.
        </p>
      </div>
      <div class="glass-card p-8 rounded-3xl hover:border-amber-500/30 transition group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
          <i data-lucide="shield-check" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-3">Bank-Grade Privacy</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">
          End-to-end encrypted metric pipelines with SOC2 Type II compliance and granular role-based team permissions.
        </p>
      </div>
    </div>
  </section>

  <!-- Pricing Preview -->
  <section id="pricing" class="max-w-4xl mx-auto px-6 mb-28">
    <div class="text-center mb-16">
      <h2 class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Simple Transparent Pricing</h2>
      <p class="text-3xl sm:text-4xl font-bold text-white">Start free. Upgrade as revenue expands.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Starter -->
      <div class="glass-card p-8 rounded-3xl flex flex-col justify-between">
        <div>
          <div class="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Starter Tier</div>
          <div class="text-4xl font-extrabold text-white mb-4">$39 <span class="text-sm font-normal text-zinc-500">/ month</span></div>
          <p class="text-xs text-zinc-400 mb-6">Perfect for early stage startups up to $25k monthly revenue.</p>
          <ul class="space-y-3 text-sm text-zinc-300 mb-8">
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Up to 5 team seats</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Stripe & Paddle integration</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> 1-minute metric refresh</li>
          </ul>
        </div>
        <button class="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 font-semibold text-sm transition">Choose Starter</button>
      </div>

      <!-- Growth Pro -->
      <div class="glass-card p-8 rounded-3xl border-2 border-amber-500/60 shadow-2xl shadow-amber-500/10 flex flex-col justify-between relative">
        <div class="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow">
          Most Popular
        </div>
        <div>
          <div class="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">Growth Scale</div>
          <div class="text-4xl font-extrabold text-white mb-4">$99 <span class="text-sm font-normal text-zinc-500">/ month</span></div>
          <p class="text-xs text-zinc-400 mb-6">Designed for scaling SaaS companies with multi-currency revenue.</p>
          <ul class="space-y-3 text-sm text-zinc-200 mb-8">
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Unlimited seats & teams</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Sub-second streaming events</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Predictive churn engine</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Dedicated Slack channel</li>
          </ul>
        </div>
        <button class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 transition">Start 14-Day Free Trial</button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-white/5 py-12 px-6 text-center text-xs text-zinc-500">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">A</div>
        <span class="font-bold text-zinc-300">ApexMetrics</span>
      </div>
      <div>© 2026 ApexMetrics Technologies Inc. All rights reserved.</div>
      <div class="flex gap-6">
        <a href="#" class="hover:text-zinc-300">Privacy Policy</a>
        <a href="#" class="hover:text-zinc-300">Terms of Service</a>
        <a href="#" class="hover:text-zinc-300">Status</a>
      </div>
    </div>
  </footer>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`
  },
  {
    id: "creative-agency",
    name: "Modern Creative Agency",
    tagline: "Bold typography, editorial layout & curated client work",
    category: "Agency • Portfolio",
    style: "minimalist",
    iconName: "Palette",
    prompt: "A sleek, minimalist portfolio website for a digital creative agency with bold editorial typography, monochrome aesthetics, client logos, and project showcases.",
    html: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura • Digital Experience & Brand Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            display: ['Space Grotesk', 'sans-serif']
          }
        }
      }
    };
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0c0d12; color: #f4f4f5; }
    h1, h2, h3, .font-display { font-family: 'Space Grotesk', sans-serif; }
    .project-card:hover .project-overlay { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body class="min-h-screen bg-[#0c0d12] text-zinc-100">
  <!-- Minimalist Pill Navbar -->
  <header class="fixed top-6 inset-x-0 max-w-5xl mx-auto z-50 px-6">
    <nav class="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
      <a href="#" class="font-display font-bold text-xl tracking-tight text-white flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
        AURA<span class="text-zinc-500 font-normal text-sm">/STUDIO</span>
      </a>
      <div class="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <a href="#work" class="hover:text-white transition">Work</a>
        <a href="#philosophy" class="hover:text-white transition">Philosophy</a>
        <a href="#services" class="hover:text-white transition">Capabilities</a>
      </div>
      <a href="#contact" class="px-5 py-2 rounded-full bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition">
        Let's Talk
      </a>
    </nav>
  </header>

  <!-- Hero Section -->
  <section class="pt-44 pb-24 px-6 max-w-6xl mx-auto">
    <div class="space-y-6">
      <div class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 border border-white/10 px-3 py-1 rounded-full">
        <span>Independent Design & Strategy</span>
        <span>•</span>
        <span>Tokyo / London / NYC</span>
      </div>
      <h1 class="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-none">
        WE BUILD BRANDS THAT DEFINE THE NEXT DECADE.
      </h1>
      <p class="text-lg sm:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed pt-4">
        A multidisciplinary design practice crafting category-defining identities, digital flagships, and spatial brand systems for visionary founders.
      </p>
      <div class="pt-6 flex flex-wrap gap-4">
        <a href="#work" class="px-8 py-4 bg-white text-zinc-950 font-bold rounded-2xl hover:bg-zinc-200 transition flex items-center gap-3 text-sm">
          Explore Selected Work <i data-lucide="arrow-down-right" class="w-4 h-4"></i>
        </a>
        <a href="#contact" class="px-8 py-4 bg-zinc-900 border border-white/10 text-white font-medium rounded-2xl hover:bg-zinc-800 transition text-sm">
          Schedule Discovery Call
        </a>
      </div>
    </div>
  </section>

  <!-- Client Logos Marquee -->
  <section class="py-12 border-y border-white/5 bg-zinc-950/50">
    <div class="max-w-6xl mx-auto px-6">
      <p class="text-xs uppercase tracking-[0.3em] font-mono text-zinc-500 mb-8 text-center">Selected Collaborators & Partners</p>
      <div class="flex flex-wrap items-center justify-center gap-12 sm:gap-20 text-zinc-400 font-display font-bold text-xl opacity-70">
        <span class="hover:text-white transition cursor-default">STRIPE</span>
        <span class="hover:text-white transition cursor-default">LINEAR</span>
        <span class="hover:text-white transition cursor-default">FIGMA</span>
        <span class="hover:text-white transition cursor-default">VERCEL</span>
        <span class="hover:text-white transition cursor-default">RAYCAST</span>
      </div>
    </div>
  </section>

  <!-- Selected Work Grid -->
  <section id="work" class="py-28 max-w-6xl mx-auto px-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
      <div>
        <h2 class="text-xs uppercase tracking-[0.3em] font-mono text-zinc-500 mb-2">Portfolio Showcase</h2>
        <p class="font-display text-4xl sm:text-5xl font-bold text-white">Recent Work (2025–2026)</p>
      </div>
      <span class="text-sm font-mono text-zinc-400">04 Curated Case Studies</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Project 1 -->
      <div class="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-6 flex flex-col justify-between min-h-[420px] transition hover:border-white/20">
        <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>01 / FINTECH REBRAND</span>
          <span>2026</span>
        </div>
        <div class="my-auto py-12 text-center">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500">
            <i data-lucide="layers" class="w-10 h-10 text-white"></i>
          </div>
          <h3 class="font-display text-2xl font-bold text-white mb-2">Kinetic Financial Protocol</h3>
          <p class="text-sm text-zinc-400 max-w-sm mx-auto">Complete design system, mobile iOS architecture, and web flagship.</p>
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-white/5">
          <span class="text-xs text-zinc-400 font-mono">Mobile App • 3D Motion</span>
          <span class="text-xs font-semibold text-white group-hover:translate-x-1 transition flex items-center gap-1">View Project <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></span>
        </div>
      </div>

      <!-- Project 2 -->
      <div class="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-6 flex flex-col justify-between min-h-[420px] transition hover:border-white/20">
        <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>02 / HARDWARE BRANDING</span>
          <span>2025</span>
        </div>
        <div class="my-auto py-12 text-center">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500">
            <i data-lucide="headphones" class="w-10 h-10 text-white"></i>
          </div>
          <h3 class="font-display text-2xl font-bold text-white mb-2">Solstice Spatial Acoustics</h3>
          <p class="text-sm text-zinc-400 max-w-sm mx-auto">Acoustic packaging, web store, and kinetic typography campaign.</p>
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-white/5">
          <span class="text-xs text-zinc-400 font-mono">Brand Identity • E-Commerce</span>
          <span class="text-xs font-semibold text-white group-hover:translate-x-1 transition flex items-center gap-1">View Project <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></span>
        </div>
      </div>
    </div>
  </section>

  <!-- Quote Section -->
  <section class="py-24 border-t border-white/5 bg-zinc-950">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <blockquote class="font-display text-2xl sm:text-3xl text-zinc-200 font-light leading-relaxed mb-8">
        "Aura redefined how enterprise customers perceive our tech stack. Our sales velocity doubled in the 90 days following our global redesign."
      </blockquote>
      <div class="font-mono text-xs uppercase tracking-widest text-zinc-400">
        Elena Rostova — Chief Product Officer, Kinetic
      </div>
    </div>
  </section>

  <!-- Contact Footer -->
  <footer id="contact" class="py-24 px-6 border-t border-white/10 max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
    <div>
      <h3 class="font-display text-4xl sm:text-6xl font-bold text-white mb-4">LET'S COLLABORATE.</h3>
      <p class="text-zinc-400 max-w-md text-sm leading-relaxed mb-8">Currently booking select Q3/Q4 brand transformations and web flagships.</p>
      <a href="mailto:hello@aurastudio.design" class="text-xl font-mono text-white underline underline-offset-8 hover:text-zinc-300">
        hello@aurastudio.design
      </a>
    </div>
    <div class="flex flex-col gap-3 font-mono text-xs text-zinc-400">
      <span>© 2026 AURA DESIGN LAB LTD.</span>
      <span>ALL RIGHTS RESERVED.</span>
      <div class="flex gap-4 pt-4 text-white">
        <a href="#" class="hover:text-zinc-300">TWITTER / X</a>
        <a href="#" class="hover:text-zinc-300">READCV</a>
        <a href="#" class="hover:text-zinc-300">INSTAGRAM</a>
      </div>
    </div>
  </footer>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`
  },
  {
    id: "mobile-app",
    name: "Mobile App Showcase",
    tagline: "High-energy iOS & Android product promo page",
    category: "Mobile • Health",
    style: "creative",
    iconName: "Smartphone",
    prompt: "An energetic mobile health application promo page with high contrast elements, phone frame mockup, real-time heart rate stats callouts, and App Store download CTAs.",
    html: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PulseFit • AI Personal Performance Coach</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; background-color: #07090e; color: #f4f4f5; }
    .phone-mockup { box-shadow: 0 25px 70px -15px rgba(139, 92, 246, 0.35); }
  </style>
</head>
<body class="min-h-screen bg-[#07090e] text-zinc-100">
  <!-- Navbar -->
  <nav class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
        <i data-lucide="zap" class="w-5 h-5 text-white"></i>
      </div>
      <span class="font-extrabold text-xl tracking-tight text-white">Pulse<span class="text-violet-400">Fit</span></span>
    </div>
    <div class="flex items-center gap-4">
      <a href="#features" class="hidden sm:inline-block text-sm text-zinc-400 hover:text-white font-medium">Features</a>
      <a href="#reviews" class="hidden sm:inline-block text-sm text-zinc-400 hover:text-white font-medium">Reviews</a>
      <button class="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-violet-600/30">
        Get App Free
      </button>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="pt-16 pb-24 px-6 text-center max-w-4xl mx-auto">
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-6">
      <i data-lucide="award" class="w-3.5 h-3.5 text-violet-400"></i>
      Apple App Store "App of the Day" Winner
    </div>
    <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
      Your Daily Fitness Flow, <br />
      <span class="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Intelligently Reimagined.</span>
    </h1>
    <p class="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
      Custom adaptive workout plans, real-time biofeedback, and habit gamification that turns daily consistency into your superpower.
    </p>

    <!-- App Store Badges -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
      <button class="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-2xl flex items-center justify-center gap-3 transition">
        <i data-lucide="apple" class="w-6 h-6 text-white"></i>
        <div class="text-left">
          <div class="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">Download on the</div>
          <div class="text-sm font-bold text-white">Apple App Store</div>
        </div>
      </button>
      <button class="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-2xl flex items-center justify-center gap-3 transition">
        <i data-lucide="play" class="w-6 h-6 text-white"></i>
        <div class="text-left">
          <div class="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">Get it on</div>
          <div class="text-sm font-bold text-white">Google Play</div>
        </div>
      </button>
    </div>

    <!-- Phone Mockup -->
    <div class="relative max-w-xs mx-auto">
      <div class="phone-mockup rounded-[3rem] bg-zinc-950 border-4 border-zinc-800 p-4 shadow-2xl relative z-10">
        <!-- Phone screen -->
        <div class="rounded-[2.4rem] bg-[#0d0f17] p-5 border border-white/5 space-y-5 text-left">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>Today's Target</span>
            <span class="text-violet-400 font-bold">82% Completed</span>
          </div>
          <!-- Calorie Ring Simulation -->
          <div class="p-6 rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 border border-violet-500/20 text-center">
            <div class="text-3xl font-extrabold text-white mb-1">840 <span class="text-sm font-normal text-zinc-400">kcal</span></div>
            <div class="text-xs text-zinc-400">Burned of 950 Goal</div>
          </div>
          <!-- Real-Time Heart Rate -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <i data-lucide="heart" class="w-4 h-4 fill-red-400"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-white">Heart Rate</div>
                <div class="text-[10px] text-zinc-400">Aerobic Zone</div>
              </div>
            </div>
            <div class="text-lg font-bold text-white font-mono">142 <span class="text-xs text-zinc-500 font-normal">BPM</span></div>
          </div>
          <button class="w-full py-3 rounded-xl bg-violet-600 text-white font-bold text-xs uppercase tracking-wider shadow">
            Start Live Session
          </button>
        </div>
      </div>
      <!-- Ambient Glow Behind Phone -->
      <div class="absolute inset-0 bg-violet-500/20 blur-3xl -z-10 rounded-full"></div>
    </div>
  </header>

  <!-- Features Highlights -->
  <section id="features" class="max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="p-8 rounded-3xl bg-zinc-950 border border-white/5">
        <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-6">
          <i data-lucide="flame" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Adaptive Rep Counting</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">Computer-vision camera tracking automatically counts reps and checks your lifting form in real time.</p>
      </div>
      <div class="p-8 rounded-3xl bg-zinc-950 border border-white/5">
        <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
          <i data-lucide="battery-charging" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Smart Recovery Scores</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">Synthesizes sleep quality and HRV from your smartwatch to advise whether to push hard or rest.</p>
      </div>
      <div class="p-8 rounded-3xl bg-zinc-950 border border-white/5">
        <div class="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 mb-6">
          <i data-lucide="trophy" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Friend Challenges</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">Turn workouts into friendly competitions with weekend distance leagues, streak badges, and trophies.</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 border-t border-white/5 text-center text-xs text-zinc-500">
    <p>© 2026 PulseFit Mobile Technologies. Available on iOS 17+ and Android 14+.</p>
  </footer>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`
  },
  {
    id: "ai-studio",
    name: "AI Studio Platform",
    tagline: "Exismic signature obsidian & solar amber luxury launch",
    category: "AI • Obsidian Gold",
    style: "creative",
    iconName: "Cpu",
    prompt: "A luxury Obsidian Gold themed AI studio launch page with solar amber halos, live multi-model feature cards, 3-tier pricing table with popular badge, and FAQ accordion.",
    html: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Synthetix AI • Autonomous Creative Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; background-color: #08090d; color: #f4f4f5; }
    .amber-halo { box-shadow: 0 0 50px -10px rgba(245, 158, 11, 0.4); }
    .gold-border { border-color: rgba(245, 158, 11, 0.25); }
  </style>
</head>
<body class="min-h-screen bg-[#08090d] text-zinc-100">
  <!-- Floating Obsidian Navbar -->
  <header class="fixed top-5 inset-x-0 max-w-5xl mx-auto z-50 px-6">
    <nav class="bg-[#0e1017]/85 backdrop-blur-xl border gold-border rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-2xl">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-amber-500/20">
          <i data-lucide="cpu" class="w-4 h-4 text-zinc-950"></i>
        </div>
        <span class="font-extrabold text-lg tracking-tight text-white">Synthetix<span class="text-amber-400">.ai</span></span>
      </div>
      <div class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-zinc-400">
        <a href="#models" class="hover:text-amber-400 transition">Models</a>
        <a href="#features" class="hover:text-amber-400 transition">Workflows</a>
        <a href="#pricing" class="hover:text-amber-400 transition">Pricing</a>
      </div>
      <button class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-amber-500/20">
        Launch Studio
      </button>
    </nav>
  </header>

  <!-- Hero Section -->
  <section class="pt-40 pb-24 px-6 text-center max-w-4xl mx-auto">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
      <i data-lucide="crown" class="w-3.5 h-3.5 text-amber-400"></i>
      Introducing Synthetix 3.0 Platform
    </div>
    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
      Production-Ready <br />
      <span class="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Creative Intelligence</span>
    </h1>
    <p class="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
      Deploy multi-modal AI pipelines for codebases, copywriting, 4K visuals, and spatial audio with sub-second response times.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
      <button class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 transition flex items-center justify-center gap-2">
        <i data-lucide="rocket" class="w-4 h-4"></i> Get 50 Free Daily Credits
      </button>
      <button class="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 transition">
        Explore Documentation
      </button>
    </div>
  </section>

  <!-- Multi-Model Grid -->
  <section id="models" class="max-w-6xl mx-auto px-6 mb-28">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-8 rounded-3xl bg-[#0e1017] border gold-border hover:border-amber-400/50 transition group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
          <i data-lucide="code" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Automated Web Engines</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">Turn natural language requirements into complete single-file responsive web applications ready for deployment.</p>
      </div>
      <div class="p-8 rounded-3xl bg-[#0e1017] border gold-border hover:border-amber-400/50 transition group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
          <i data-lucide="image" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">4K Visual Generative Canvas</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">Produce brand assets, product mockups, and logos with crisp vector SVG export and transparent PNG pipelines.</p>
      </div>
      <div class="p-8 rounded-3xl bg-[#0e1017] border gold-border hover:border-amber-400/50 transition group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
          <i data-lucide="sparkles" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Humanized Prose Engine</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">Refine marketing copy, social scripts, and documentation with 100% natural conversational clarity.</p>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="max-w-4xl mx-auto px-6 mb-28">
    <div class="text-center mb-16">
      <h2 class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Scalable Compute Credits</h2>
      <p class="text-3xl sm:text-4xl font-bold text-white">Choose the plan that fits your output volume</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="p-8 rounded-3xl bg-[#0e1017] border border-white/10 flex flex-col justify-between">
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Free Starter</div>
          <div class="text-4xl font-extrabold text-white mb-4">$0 <span class="text-sm font-normal text-zinc-500">/ forever</span></div>
          <ul class="space-y-3 text-sm text-zinc-400 mb-8">
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> 50 Daily Free Credits</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Standard generation speed</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Full code & HTML download</li>
          </ul>
        </div>
        <button class="w-full py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition">Get Started Free</button>
      </div>

      <div class="p-8 rounded-3xl bg-[#0e1017] border-2 border-amber-500/80 shadow-2xl shadow-amber-500/20 flex flex-col justify-between relative">
        <div class="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider">
          Creator Pro
        </div>
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Unlimited Velocity</div>
          <div class="text-4xl font-extrabold text-white mb-4">$19 <span class="text-sm font-normal text-zinc-500">/ month</span></div>
          <ul class="space-y-3 text-sm text-zinc-200 mb-8">
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> 1,000 Daily Credits</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Turbo priority GPU compute</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Commercial usage rights</li>
            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Direct Cloud Vault syncing</li>
          </ul>
        </div>
        <button class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-amber-500/30">
          Upgrade to Pro
        </button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 border-t border-white/5 text-center text-xs text-zinc-500">
    <p>© 2026 Synthetix AI Systems Inc. Crafted for modern creators.</p>
  </footer>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`
  }
];
