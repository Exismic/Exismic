# Exismic Studio — Master Project Continuation & Architecture Memory

> **Last Updated**: September 9, 2026  
> **Repository**: `Exismic/Exismic` (`c:\Users\rayan\.gemini\antigravity\scratch\exismic-project`)  
> **Status**: Production-ready, TypeScript clean (`tsc --noEmit` = 0 errors). Mobile navigation and GPU performance fully optimized.
> **Active Account**: `BMREZ` (`syedrayan.dev@gmail.com`).

---

## 📌 Summary of Completed Architecture & Features

### 0. ⚡ Mobile Performance & Navigation Latency Overhaul [COMPLETED]
* **Root Layout Remote DB Latency Eliminated**:
  * Added `getCachedUserRoleStatus(userId)` in [`src/lib/server/cached-config.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/server/cached-config.ts) utilizing Next.js `unstable_cache` with a 60-second revalidation tag.
  * Replaced un-cached direct `prisma.user.findUnique(...)` on every page click in [`src/app/layout.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/layout.tsx), shaving 200–500ms of database roundtrip delay off every link navigation.
* **Instant Mobile Drawer Dismissal & Link Prefetching**:
  * In [`src/components/layout/Sidebar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/Sidebar.tsx), wired `onClick={() => setMobileOpen(false)}` and `prefetch={true}` to all top navigation items, category dropdown subtools, "View All" buttons, Changelog, Help, Pro, and Vault links. Tapping a destination closes the drawer immediately without waiting for route rendering.
* **Instant 0ms Route Navigation Progress Laser**:
  * In [`src/components/providers/AppLoader.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/providers/AppLoader.tsx), added an instant link tap detector and top glowing neon laser progress bar (`z-[999999]`). Whenever an internal link is touched on mobile or desktop, the user receives instantaneous visual feedback while Next.js prepares the route.
* **Offloaded Critical Bundle in AppShell**:
  * Converted non-critical modals (`MagicCommandPalette`, `GlobalToolAssistant`, `WelcomeModal`, `LaunchOfferModal`, `QuestCompletionToast`) in [`src/components/layout/AppShell.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/AppShell.tsx) to dynamic imports with `{ ssr: false }`.
* **Mobile GPU Blur & Compositor Optimization**:
  * In [`src/app/globals.css`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/globals.css), capped heavy `backdrop-blur-3xl` and `backdrop-blur-2xl` on mobile devices (`max-width: 1024px`) to `blur(10px)`. This eliminates severe GPU fillrate stalls while preserving the obsidian glass look on high-DPI phone screens.
  * Capped giant ambient blur orbs (`blur-[150px]`, `blur-[120px]`, etc.) to `blur(24px)`.
  * Paused continuous idle conic gradient spins (`mobile-pause-idle-spin`) across tool cards on mobile when unhovered.
* **Replaced Main-Thread JavaScript RAF Loops in Tool Cards**:
  * In [`src/components/ui/ToolCard.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/ui/ToolCard.tsx), replaced the JavaScript-driven Framer Motion `motion.div animate={{ left: ... }}` inside each tool icon with a pure hardware-accelerated CSS keyframe animation (`cardShine`). This eliminates dozens of simultaneous JS tickers on the main thread and restores silky 60fps scrolling and instant touch responsiveness.
  * Added `prefetch={true}` across `ToolCard`s and [`src/components/tool/PersonalizedHomeSection.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/PersonalizedHomeSection.tsx).

### 0. 🎨 Profile Cosmetics & Creator Identity Overhaul [COMPLETED]
* **Removed Header Canopies Completely**:
  * Stripped out all header canopies from Account Settings, Public Profile (`/u/[username]`), Rewards Shop (`/rewards`), and modals.
  * Safely deprecated legacy canopies in `cosmetics-access.ts` so users without canopies have a clean, sleek obsidian glass identity card.
* **Open Customization for All Creators**:
  * Profile customization is no longer gated behind Pro VIP branding. The section is welcoming to all creators, with direct links to the Exismic Sparks Rewards Shop.
* **Fixed Pro VIP Unlocks Bug**:
  * Pro members now receive 5 curated starter avatar frames and 5 starter name styles.
  * All remaining cosmetics must be unlocked using Exismic Sparks in the Rewards Shop.
* **15 Brand New Avatar Frames & 15 New Name Styles**:
  * Added 15 animated avatar frames (`astral-void`, `molten-dragon`, `cyber-glitch`, `frostfire-eclipse`, `chrono-warp`, `void-walker`, `synthwave-80s`, `jade-dynasty`, `blood-moon`, `quantum-maglev`, `starlight-valkyrie`, `toxic-biohazard`, `phantom-wraith`, `solaris-apex`, `abyssal-kraken`).
  * Added 15 matching glowing name styles in `PremiumName.tsx`.
  * Added all 30 new cosmetics to Rare, Epic, and Legendary tiers in the Sparks Shop (`sparks-shop.ts`).
* **Profile Customizer Studio Overhaul (`/account/settings`)**:
  * **Centerpiece Live Profile Identity Card**: Replaced the 3 disconnected vertical cards and dark hollow box cutouts with a unified, Discord/Steam-style live passport card. Combines avatar with active frame, animated glowing name gradient, creator insignia crest, and `@handle` exactly as it renders across all studios and public profiles.
  * **3 Sleek Customization Slots**: Compact, horizontal interactive rows for `Avatar Frame`, `Name Style`, and `Creator Insignia`. No nested black box cutouts, no duplicate user names, and no truncated `...` descriptions.
  * **Balanced Glass Controls**: Balanced `[ Change Frame/Style/Insignia ]` glass buttons with individual `RotateCcw` reset buttons and a quick-access banner to the Sparks Rewards Shop.
* **Landing Navbar UI Polish (Non-Logged-In Visitors)**:
  * **Refined Center Capsule**: Replaced the harsh multi-color rainbow border and jarring icon colors with an elegant Obsidian Glass capsule (`border-white/[0.08] bg-[#080914]/85 backdrop-blur-2xl`), subtle hairline highlight, consistent interactive zinc-to-accent icons, and a micro-badge for Pro (`10X`).
  * **Secondary 'Log in' Link**: Converted the bulky pill button with cyan door icon into a clean, modern ghost link (`text-zinc-300 hover:text-white px-3.5 py-2 hover:bg-white/[0.06]`) that doesn't compete with the primary CTA.
  * **Cosmic Jewel 'Try for Free' CTA**: Eliminated the banded magenta-cyan gradient and shouting all-caps text. Replaced with a smooth purple-indigo-cyan jewel button with a directional `ArrowRight` icon and subtle hover light sweep.
* **Enhanced Modals**:
  * Top-level layer (`z-[999999]`) with high-opacity obsidian backdrop (`bg-black/95 backdrop-blur-3xl`).
  * Global body scroll lock and Escape key listeners.
  * Direct "Unlock in Shop" action buttons for locked cosmetics.


### 1. 🔗 Quick Tool Chaining ("Next Action Pipelines") [COMPLETED]
* **Media Pipeline Engine**: [`src/components/tool/MediaPipelineBar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/MediaPipelineBar.tsx) with Obsidian glassmorphic styling, neon glows, and loading states.
* **IndexedDB + Session Pipeline**: [`src/lib/pipeline.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/pipeline.ts) (`sendToTool`, `consumePipelineItem`, `pipelineUrlToFile`, `clearPipelineItem`) preserves large image blobs across page unloads.
* **AI Image Generator (`/tools/ai/img-gen`)**:
  * [`src/components/tool/ImageGeneratorTool.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/ImageGeneratorTool.tsx) mounts `MediaPipelineBar` below generated 4K art.
  * 1-click handoffs to:
    - `[ ✂️ Remove Background ]` &rarr; `/tools/image/eraser`
    - `[ 🖼️ Turn into Meme ]` &rarr; `/tools/meme-generator`
    - `[ 📐 Resize & Crop ]` &rarr; `/tools/image/resizer`
    - `[ ⚡ Compress File ]` &rarr; `/tools/image/compressor`
    - `[ 🔄 Convert Format ]` &rarr; `/tools/image/converter`
* **Background Remover (`/tools/image/eraser`)**:
  * [`src/components/tool/BackgroundRemover.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/BackgroundRemover.tsx) automatically consumes incoming pipeline images on mount.
  * Added "Turn into Meme" (`/tools/meme-generator`) to the next-step action grid.
* **Meme Studio (`/tools/meme-generator`)**:
  * [`src/app/tools/meme-generator/MemeGeneratorClient.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/tools/meme-generator/MemeGeneratorClient.tsx) automatically loads incoming images as custom meme templates.
  * Mounts `MediaPipelineBar` on rendered canvas output to chain into Compressor, Converter, Resizer, and Eraser.

---

### 2. 🎁 Daily Credit Vault & Audio Synthesizer Fix [COMPLETED]
* **Audio Synthesizer**: [`src/components/reward/SoundController.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/reward/SoundController.ts)
  * Eliminated the harsh looping 2400Hz sawtooth oscillator ("zzzzzz" buzzer bug).
  * Replaced with warm triangle/sine harmonic risers, 850Hz low-pass filter ($Q=0.8$), volume 0.065, and a strict 1.4s auto-decay safety cutoff.
  * Decoupled sound stops from network latency in [`DailyRewardLootBox.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/reward/DailyRewardLootBox.tsx).
* **Modal Component**: [`src/components/reward/DailyRewardModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/reward/DailyRewardModal.tsx)
  * Portaled to `document.body` (`z-[99999]`), Obsidian glass aesthetics, particle canvas unboxing physics.
* **Top Navbar Pill**: [`src/components/layout/Navbar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/Navbar.tsx)
  * Displays dynamic `[ 🔥 {streak}d STREAK · CLAIM ✨ ]` pill when unclaimed; clean countdown badge when claimed.
  * Action buttons added to Desktop User Dropdown and Mobile Nav Drawer.
* **Dashboard Cockpit Hero**: [`src/components/tool/Dashboard.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/Dashboard.tsx)
  * Card 2 ("Daily Quest Streak") is interactive with `[ 🎁 CLAIM DROP ]` button and live status.

---

### 3. 💳 Luxury Personal Refill Modal & Pro Access [COMPLETED]
* **Modals**: [`BuyCreditsModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/credits/BuyCreditsModal.tsx), [`CreditModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/ui/CreditModal.tsx), [`ToolCreditGateModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/ToolCreditGateModal.tsx).
  * Obsidian glassmorphic styling, live balance, countdown to midnight reset.
  * Dual tabs: Credit Packs (Starter 500, Creator 2,000 + 500 bonus, Studio 6,000) vs Exismic Pro Pass.
  * Direct Razorpay & Stripe/PayPal payment handling with `PaymentSuccessModal`.
* **Unlocked Pro Tools for Free Members**:
  * [`src/lib/tool-access.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/tool-access.ts): Removed hard 403 blocks; free users spend calibrated credits.
  * Resume Builder, AI Resume Match, and AI Invoice Generator are fully unlocked with credit payments.

---

### 4. 📧 Safe "Email Me Result" & Retention Bar [COMPLETED]
* **API**: [`src/app/api/tools/email-result/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/tools/email-result/route.ts)
  * Rate-limited: Guests (2/24h, 60s cooldown), Members (10/24h, 15s cooldown).
  * Disposable email blocklist protecting Resend reputation.
  * Transactional dark branded email template via [`src/lib/emails.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/emails.ts).
* **Retention Bar**: [`src/components/tool/ResultRetentionBar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/ResultRetentionBar.tsx)
  * 1-click "Email Me Result", "Save to Cloud Library", and copy output with zero jargon.

---

### 5. 🗄️ Full Cloud Creation Hub (`/library` - "Exismic Cloud Drive") [COMPLETED]
* **Zero-Cost Storage Architecture**:
  * **Free Users**: 50 MB total quota, max 10 MB per file upload.
  * **Pro Users**: 5 GB total quota, max 50 MB per file upload.
  * Auto-compresses uploaded images to optimized WebP via `sharp`, saving up to 80% space so 1 GB Supabase free storage easily holds thousands of user creations at $0 cost to the owner.
* **Backend APIs**:
  * [`src/app/api/drive/storage/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/drive/storage/route.ts): Calculates real-time quota usage, byte breakdown, and file count.
  * [`src/app/api/drive/upload/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/drive/upload/route.ts): Direct file upload with quota verification, WebP compression, and Supabase CDN storage.
  * [`src/app/api/drive/batch-delete/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/drive/batch-delete/route.ts): Batch deletion freeing both database records and Supabase storage.
* **Frontend**:
  * [`src/app/library/page.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/library/page.tsx) & [`src/app/library/LibraryClient.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/library/LibraryClient.tsx).
  * Storage quota bar with progress percentage and Pro upgrade CTA.
  * Direct drag & drop upload dropzone with auto-compression badge.
  * Category filters: All Assets, AI Art, Cutouts, Memes, Documents, Uploads.
  * Multi-select mode with batch ZIP export (client-side via `jszip`, $0 server bandwidth cost) and batch delete.
  * 1-Click "Open in Tool" pipeline handoffs to Background Remover, Meme Studio, Resizer, Compressor, Converter via `sendToTool()`.
  * Added to [`Sidebar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/Sidebar.tsx) and linked from [`/history`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/history/page.tsx).

---

### 6. 🚫 Complete Watermark Removal [COMPLETED]
* **AI Image Generator**: [`src/app/api/tools/ai/image-generate/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/tools/ai/image-generate/route.ts)
  * Set `noWatermark = true` unconditionally and passes `nologo=true` to Pollinations AI `flux` and `turbo` endpoints so no logos or watermarks are ever baked into generated images.
* **Universal Download Policy**: [`src/utils/watermark.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/utils/watermark.ts)
  * Removed the canvas brand badge stamping on free tier downloads in `downloadWithBrandPolicy()`. All image downloads are 100% clean and pristine.
* **Collage Maker**: [`src/components/tool/CollageMaker.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/CollageMaker.tsx)
  * Removed the `if (!isPro)` canvas watermark badge stamp on collage exports.

---

### 7. 🛡️ Streak Freeze & Milestone Rewards (Duolingo-Style) [COMPLETED]
* **Database & Architecture**:
  * Added `streakShields`, `streakFreezeUsedAt`, `lastStreakReminderSentAt`, `streakMilestonesClaimed` to `User` in [`prisma/schema.prisma`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/prisma/schema.prisma).
* **Credit & Streak Logic**:
  * [`src/lib/credits.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/credits.ts): `calculateEffectiveStreak` preserves active streaks when `diffInDays === 2` if `streakShields > 0`.
  * Auto-consumes 1 shield when claiming after a missed day; automatically rewards +1 shield at every 7-day milestone (capped at max 2).
  * Implemented `buyStreakShield(userId)` (30 credits) and `claimStreakMilestone(userId, milestoneDay)`.
* **API Endpoints**:
  * [`src/app/api/credits/streak-shield/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/credits/streak-shield/route.ts): GET & POST to equip shield.
  * [`src/app/api/credits/streak-milestone/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/credits/streak-milestone/route.ts): GET & POST to inspect & claim Day 3, 7, 14, 30 milestones.
  * [`src/app/api/cron/streak-reminders/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/cron/streak-reminders/route.ts): Finds users with active streaks ($\ge 2$ days) with $\le 8$ hours left before reset and sends branded urgency alert emails.
* **Urgency Email Delivery**:
  * [`sendStreakExpiryWarningEmail()`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/emails.ts): Dark branded email with countdown warning, active shield status, and 1-click "Save My Streak" button.
* **UI & Client State [COMPLETED & REFINED]**:
  * [`src/components/reward/DailyRewardModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/reward/DailyRewardModal.tsx):
    - **Spacious AAA Game Layout**: Widened modal from `max-w-xl` (576px) to `max-w-2xl sm:max-w-3xl` (768px), eliminating the cramped, compact feel and giving all 4 milestone cards ample breathing room.
    - **Streak Freeze Shield Cyber Hub**: Holographic glass panel with live reactor icon, dual inventory sockets (`[ Slot 1 Armed ]`, `[ Slot 2 Armed ]`), dynamic equip button (30 cr), and max-capacity status.
    - **Streak Quest Roadmap with 100% Active Functional Perks**:
      * **Day 3 (Bronze)**: +25 bonus credits + **Ignition Boost** (database ensures minimum +15 cr floor on all daily rolls).
      * **Day 7 (Silver)**: +75 bonus credits + **+1 Free Streak Shield** (directly increments `streakShields` in Prisma).
      * **Day 14 (Gold)**: +150 bonus credits + **2x Vault Luck** (`rollDailyShopReward` doubles epic/legendary drop odds for users with 14+ streak/milestone).
      * **Day 30 (Mythic)**: +500 **Permanent Lifetime Reserve** (credited to `lifetimeCredits` which never expire or reset at midnight).
    - **Calibrated Progress Rail & Waypoint Nodes**: Aligned nodes with exact card centers (`12.5%`, `37.5%`, `62.5%`, `87.5%`). Calibrated piecewise progress math so Day 1 streak fills strictly to 4.17% (1/3 of the way to Day 3) instead of incorrectly overshooting past the `3d` node.
    - **Streak Fallback & 0-Streak Fix**: Fixed `{dailyStreak || 1}` bug in `Dashboard.tsx` and `Navbar.tsx`; users with 0 claims or broken streaks now accurately see `0 days` / `0d Streak`.
    - **Instant Real-Time Sync**: Daily claim response (`/api/credits/daily-claim`) returns `streak`, updating local Zustand store immediately in 0ms with zero latency before server reconciliation.

---

### 8. 🔍 Google Search Console & 2-Month Sitemap/Indexing Fix [COMPLETED]
* **The Root Cause**: 
  - Submitting `/sitemap.xml` with a leading slash in GSC caused Google to request `https://www.exismic.xyz//sitemap.xml`, which triggered a `308 Permanent Redirect`. GSC strictly rejects cross-host and redirecting sitemaps with *"Sitemap could not be read"*.
  - Historical commit `fa839d4` (July 25) had enabled indexing for 49 programmatic tools simultaneously, but near-identical boilerplate FAQs had trapped them in *"Crawled - currently not indexed"*.
  - `/pricing`, `/cookies`, and `/tools/discord-card` were explicitly blocked with `noIndex: true`.
  - Middleware was bouncing trailing-slash requests (`/tools/`, `/pricing/`) to `/auth/login` with 307 redirects.
* **The Fix**:
  - **Sitemap & Content**: Fixed in [`src/app/sitemap.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/sitemap.ts). Resubmitted as `sitemap.xml?v=1` &rarr; **Status: Success (117 discovered pages)**!
  - **Unblocked Directives**: Removed `noIndex: true` from `/pricing`, `/cookies`, and `/tools/discord-card`.
  - **Middleware**: Normalized paths (stripped trailing slashes) in [`src/utils/supabase/middleware.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/utils/supabase/middleware.ts).
  - **Google Verification**: Dual-token verification in [`src/lib/seo.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/seo.ts) supporting both DNS TXT and HTML tags.
  - **Helpful Content Quality Engine**: Dynamically tailored features, How-To steps, and FAQ schema per category in [`src/components/seo/ToolSeoSection.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/seo/ToolSeoSection.tsx).
  - **Eliminated 5x Validation Failure Root Causes**:
    * **Pre-Populated SSR Pricing**: In [`PricingCards.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/billing/PricingCards.tsx), initialized `plans` with `publicBillingPlans("GLOBAL")` and `loading: false`. Eliminated the empty loading spinner that rendered to Googlebot as a soft-404 thin page.
    * **Enriched Pricing Hub**: In [`src/app/pricing/page.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/pricing/page.tsx), added plan comparison matrix, comprehensive billing FAQs, and Schema.org `FAQPage` + `Product`/`OfferCatalog` structured data.
    * **Removed Duplicate Boilerplate Schema**: In [`ToolDetailClient.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/tools/%5Bcategory%5D/%5BtoolId%5D/ToolDetailClient.tsx), removed the legacy 2-question generic FAQ JSON-LD script that caused duplicate programmatic boilerplate warnings.
    * **Category Hubs Quality Engine**: Built [`CategorySeoSection.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/seo/CategorySeoSection.tsx) and mounted it in [`src/app/category/[id]/page.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/category/%5Bid%5D/page.tsx), turning thin card grids into content-rich hubs with deep-dive overviews, tailored FAQs, and `FAQPage` schema.
    * **Discord Card Studio SEO**: Added rich metadata and mounted `ToolSeoSection` in [`src/app/tools/discord-card/page.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/tools/discord-card/page.tsx).
  - **Verified Live**: Tested `/pricing` and all tools &rarr; `npx tsc --noEmit` clean (0 errors), live SSR HTML verified.

### 9. 🧠 Executive Studio Cockpit Dashboard (Structure 1) [COMPLETED]
* **Structure 1 Implementation**:
  * Restructured [`src/components/tool/Dashboard.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/Dashboard.tsx) and [`src/components/tool/PersonalizedHomeSection.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/PersonalizedHomeSection.tsx) into the unified **Executive Studio Cockpit**:
    1. **Greeting & Status Header**: Dynamic time-of-day greeting, Pro Pass tier badge, Cloud Drive & Creation Vault shortcuts.
    2. **Executive Vitals HUD**: The 4 Vital Stats Reactor Cards (Credits Remaining with Top Up, Daily Quest Streak with Claim Drop, Tools Used, Membership Status) positioned directly beneath the greeting.
    3. **Hero Launchpad (`CONTINUE USING`)**: Flagship showcase card themed with category styling (Cyan for image tools), prompt terminal pill, and 1-click continue session button.
    4. **Curated Workstation (`YOUR FAVORITES`)**: Full-fidelity studio cards matching catalog design in a 4-column responsive grid with conic spinning rings and gold star bookmarks.
    5. **Session Vault (`RECENTLY USED`)**: Full-fidelity studio cards with relative timestamps and replay session buttons.
    6. **Smart Studio Discovery (`RECOMMENDED FOR YOU`)**: Activity-driven recommendation engine with dedicated Compass 🧭 icon, contextual category badges, and tailored workflow pairing reasons.
    7. **Tool Suite Catalog (117 Tools)**: Search bar and 5 suite tabs above the catalog tool grid.
  * **Visual Polish & Precision**:
    * Replaced the tiny uncanny credit chip in StatCard 1 with sleek Lucide `Coins`.
    * Resolved text descender clipping on `g`, `y`, `p` across all headings with `pb-1.5 pt-0.5 leading-normal`.
    * Created dedicated [`MinecraftIcon`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/ui/MinecraftIcon.tsx) (iconic Creeper head geometry) replacing the generic `Gamepad2` controller across the dashboard, catalog, library, and studio editor.
    * Upgraded **Cloud Drive** & **Creation Vault** shortcut buttons into luxury obsidian reactor badges with glowing neon sockets, specular top rim highlights, hover light-sweep shimmer, and dynamic micro-arrow animations.
  * Cleaned out redundant bottom duplicate sections (`Recent Activity` and `Favorites`).
  * Typecheck verified: `npx tsc --noEmit` = 0 errors.

### 10. ⚡ Exismic Sparks Meta-Currency, Rewards Exchange & Cosmetics Rotation (`/rewards`) [COMPLETED]
* **Secondary Meta-Currency Architecture**:
  * Decoupled gamified daily quest rewards from raw credits to prevent credit hyperinflation.
  * Users earn **Exismic Sparks (`SPARKS`)** from daily (10–25 ⚡) and weekly (50–100 ⚡) quests.
  * Active users accumulate ~40–60 ⚡/day.
* **Proprietary Custom Vector Icon (`SparkIcon.tsx`)**:
  * [`src/components/ui/SparkIcon.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/ui/SparkIcon.tsx): Completely custom, bespoke 4-pointed quantum plasma star with 3D faceted diamond bevels, razor-sharp seams, central quantum singularity, specular light sweeps, and orbital energy embers. Never a generic emoji.
  * Replaced AI `Sparkles` icon in the Treasury HUD stat pod with a luxury `Gem` insignia (`{unlockedCosmeticsCount} Owned`).
* **Deterministic Cosmetics Ranking & Vault Rotation Engine**:
  * [`src/config/sparks-shop.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/config/sparks-shop.ts):
    * **Ranked Tiers**: All 22 avatar frames and 21 name styles classified into:
      - **Rare** (300 / 250 ⚡): Resets **every 24h** at 00:00 UTC (3 frames + 3 styles daily).
      - **Epic** (500 / 400 ⚡): Resets **every 3 days** at 00:00 UTC (3 frames + 3 styles).
      - **Legendary** (800 / 650 ⚡): Resets **weekly** (Monday 00:00 UTC) with **at least 3 Legendary frames and at least 3 Legendary name styles** guaranteed.
    * **Deterministic LCG Engine** (`getActiveCosmeticsRotation`): Computes mathematically synchronized rotations across all users without database queries or cron job overhead.
* **Interactive Goal Tracking & HUD Cleanliness**:
  * Removed the redundant full-width rotation timer banner to declutter the rewards interface.
  * Replaced the locked goal bar with an **Interactive Savings Goal Selector**: Users can freely select any item from the catalog via a dropdown, clear their goal, or 1-click set any reward as their target directly from card `[ 🎯 Track ]` buttons (saved to `localStorage:exismic:sparks_target_goal_id`).
* **PFP & Avatar Frame Previews**:
  * Passed the user's authentic profile photo (`custom_avatar_url` / `avatar_url` / `picture`) to `<AvatarWithFrame />` inside all shop frame cards, replacing the generic single letter "B" with their real image or a futuristic DiceBear cyber avatar.
* **AAA Cybernetic Quests & Challenges Modal (`DailyQuestsModal.tsx`)**:
  * Rebuilt the popup into an **Apex Creator Quest Vault**:
    - Deep obsidian glassmorphism (`#070710`, frosted blur `backdrop-blur-3xl`, multi-laser top beam).
    - 3D Gold & Plasma Reactor Crest header with quantum spark singularity.
    - Floating sliding capsule tabs for Daily Directives vs Weekly Mega Masteries.
    - 14px illuminated energy progress conduit with flowing plasma gradients, glowing leading-edge spark, and scanline shimmer.
* **Profile Unlock & Equip / Remove Mechanics**:
  * Purchased cosmetics atomically save to `unlockedAvatarFrames` and `unlockedNameGradients` in Prisma and update Supabase Auth metadata.
  * Both `/rewards` and `/account/settings` allow users to equip or remove (unequip) any unlocked cosmetic freely with 1 click.
  * `/api/user/avatar-frame` and `/api/user/name-gradient` support `{ frameId: null }` and `{ gradientId: null }` for instant unequip.
* **Pro Pass Memberships & Auto-Expiration**:
  * Sparks shop offers 24h Pass (350 ⚡), 7d Pass (1,800 ⚡), and 30d Pass (6,000 ⚡).
  * Auto-expiration: `hasActiveProAccess` and `/api/user/profile` verify `planExpiresAt <= new Date()`. Expired passes automatically degrade to `plan: "free"`, `subscriptionStatus: "none"`, and cap daily credits at 50 without leaving orphaned Pro entitlements.
* **Card Layout Symmetry & Zero Gaps**:
  * Solved the CSS Grid height stretching issue where short avatar cards left a ~200px empty black gap between top content and price footer.
  * Standardized all cards (Avatar Frames, Name Styles, Profile Themes, and Pro Passes/Credits) to have identical **155px min-height cinematic showcase stage boxes**.
  * Avatar Frame cards now feature a **centered luxury pedestal** with 72px avatar frame preview, ambient glow matching rarity/accent, and live creator username tag.
* **Real-Time Live Theme Preview Engine**:
  * Users can test any theme in real time on the live interface before purchasing it with Sparks.
  * Interactive **`[ 👁️ Live Preview ]`** button on every theme card in `/rewards` and in `ThemeSelectorModal.tsx`.
  * Instantly broadcasts `profile-theme-updated`, transforming the whole page's background gradients, card borders, and atmospheric lighting.
  * Floating persistent top banner allows users to keep exploring the app under the theme, click `Exit Preview` to revert, or click `Buy for X ⚡` to purchase immediately.
* **Sparks Profile Themes Catalog & Permissions**:
  * Added all 12 custom profile themes to the Sparks Shop rotation across Rare (350 ⚡), Epic (550 ⚡), and Legendary (850 ⚡) pools.
  * Added `unlockedProfileThemes` to Prisma User schema and synchronized with Supabase metadata.
  * Pro members receive a curated bundle of 5 items (2 Rare, 2 Epic, 1 Legendary). When Pro expires, non-Sparks-purchased themes/cosmetics are automatically unequipped.
  * Owned cosmetics are filtered out of the Sparks Shop catalog and savings goal dropdown.

### 10. 🔮 Creator Identity Matrix: Insignias & Studio Canopies [COMPLETED]
* **Clean 4-Pillar Cosmetic Suite**: With Pedestal Auras permanently retired, the platform features 4 distinct, balanced cosmetics:
  1. **Avatar Frames**: Animated luxury rings and holographic borders around user avatars.
  2. **Name Styles**: Premium glowing gradient styles for creator usernames.
  3. **Creator Insignias**: 11 prestige title crests (Overcharged Spark, Cyber Rose, Quantum Diamond, Solar Phoenix, Void Crown, etc.) placed inline beside usernames in `<PremiumName />`.
  4. **Header Canopies (Studio Canopies)**: 9 widescreen procedural cyberpunk backdrops wrapping the creator's profile card (Cyber Conduits, Tokyo Rain, Deep Nebula, Synthwave Horizon, Singularity Gate, Obsidian Gold, etc.) with specular chamfer top rims.
* **Balanced 2x2 Customization Grid**: Clean 4-card layout in `/account/settings` with zero clutter.
* **Unified Cosmetic System**:
  * **Database & Permissions**: Stored on `User` in Prisma (`avatarFrame`, `nameGradient`, `insignia`, `canopy`) and validated in `cosmetics-access.ts`.
  * **Backend Endpoints**: `/api/user/avatar-frame`, `/api/user/name-gradient`, `/api/user/insignia`, `/api/user/canopy`, plus expiration protection in `/api/user/profile`.
  * **Sparks Shop**: Integrated into `/rewards` with 155px visual stages, rarity tiers (Rare, Epic, Legendary), and deterministic rotation engine.
  * **Customization Hub**: Live preview, equip/unequip in `/account/settings` and on public profile pages (`/u/[username]`).
  * **Card Hover Alignment**: Dynamic card title hover colors aligned to item accent colors (`cyan`, `purple`, `fuchsia`, `emerald`, `amber`, `rose`, `red`, `blue`, `silver`), eliminating the uniform yellow hover.
  * **Rewards Header Gap**: Reduced excessive top padding (`pt-24` -> `pt-4 sm:pt-6`) and tuned vertical spacing so breadcrumb and hero section sit cleanly at the top of the viewport.
### 11. 🎫 Sparks Pro Pass Vouchers & Razorpay Renewal Auto-Expiration [COMPLETED]
* **Sparks Pro Pass Voucher Generator**:
  * Buying a Pro Pass (24h or 7d) in `/rewards` with Sparks no longer immediately forces Pro onto the user's plan.
  * Generates a unique, single-use voucher code (`PRO-24H-XXXX-XXXX` or `PRO-7D-XXXX-XXXX`) saved to `PromoCode` with a 1-year expiration window.
  * Sends an in-app notification to the creator's inbox with the voucher code.
  * Success modal features a dedicated Cyber Voucher card with:
    - **"Copy"** button for clipboard copy (gift or save for later).
    - **"Activate Now on This Account"** 1-click button (calls `/api/user/promos/redeem` and instantly activates the pass without having to copy-paste).
* **Live Razorpay Subscription Sync & Renewal Protection**:
  * Built [`src/lib/billing/razorpay-sync.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/billing/razorpay-sync.ts) with `syncUserRazorpaySubscription(userId)`.
  * For users with Razorpay recurring subscription IDs (`sub_...`), queries Razorpay directly to verify if the payment was actually collected for the cycle.
  * If the subscription renewed, advances `planExpiresAt` to the new billing cycle end.
  * If payment was not received, halted, cancelled, or expired, and the user's paid period has ended:
    - Immediately ends Pro membership (`plan: "free"`).
    - Caps daily credits back down to free tier (50 credits).
    - Strips non-permanent Pro cosmetics from active equipment.
  * Integrated live sync into `/api/user/profile` on every user load.
  * Fixed `/api/cron/reset-credits` where `subscriptionStatus: 'active'` was bypassing expiration and granting 500 daily credits indefinitely.
  * Fixed Account Settings page (`/account/settings`), replacing the static `"Next billing date: June 1, 2026"` placeholder with dynamic formatting from `dbUser.plan_expires_at` and handling halted/past_due states.
  * **Claim Drop & Dashboard Streak Card Polish**:
    - Replaced generic AI sparkles (`Sparkles`) icons across Navbar streak pill and user menus with related `Gift` (for daily vault drops) and `Trophy` (for quest claims).
    - Fixed the cramped Dashboard Streak card: upgraded vitals grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, replaced the cut-off `"Open Myster..."` footer with a prominent top-right `[ 🎁 CLAIM DROP ]` button and a clean, full-text `[ 🎁 Daily Vault Ready ]` / `[ 🏆 Quests ]` footer.
  * **Continuous Idle Border Orbit Animation (AFK Animation)**:
    - Preserved the rich, thick, luminous metallic gradient outer borders and inner beveled borders on all three navbar buttons (`Vault`, `Streak`, `Quests`).
    - Layered an orbiting laser comet with a brilliant white tip (`animate-border-orbit` with `mix-blend-screen`) directly onto the thick metallic rim, creating an electric surging line that circles all around the perimeter while idle / AFK.
    - Tailored neon trails: glowing cyan for Vault, flame orange for Streak, imperial gold for Quests.

### 12. 🎟️ Universal Redeem Code Modal & 2-Step Confirmation Flow [COMPLETED]
* **Terminology Neutrality (Credits + Passes + Badges)**:
  - Replaced all restrictive "Redeem Pass" and "Redeem Gift Pass" headers and button labels across `RedeemPromoModal.tsx`, `Navbar.tsx`, and `RedeemClient.tsx` with **"Redeem Code"** / **"Redeem Code / Voucher"**.
  - Subtitles and placeholders clearly communicate that users can redeem generation credits, creator promo vouchers, Pro passes, and badges.
* **Safe 2-Step Verification & Confirmation Preview Flow**:
  - **Backend Endpoint (`/api/user/promos/redeem`)**:
    - Added `verifyOnly: boolean` parameter. When `true`, it validates the code, checks expiration, checks redemption limits, and verifies the user hasn't already claimed it.
    - Returns `{ success: true, valid: true, code, rewardType, rewardTitle, rewardDescription, rewardValue, expiresAt }` WITHOUT consuming the code or altering user balance.
  - **Modal Flow (`RedeemPromoModal.tsx`)**:
    - **Step 1 (Input & Verify)**: User inputs code and clicks `[ 🛡️ Verify Code ]` (with revolving conic border animation).
    - **Step 2 (Confirmation Preview)**: If valid, displays a glowing reward preview card showing the exact reward (`+500 Generation Credits`, `1-Year Exismic Pro Pass`, etc.), full description, verified code pill, and status. Offers two actions:
      1. `[ ⚡ Confirm & Claim Now ]` with revolving conic border animation.
      2. `[ ↺ Enter a different code ]` allowing users to swap codes before claiming.
    - **Step 3 (Celebration)**: Claims code via transaction, bursts confetti, refreshes live balances, and displays the success screen.
* **Daily Quests Modal Visual Overhaul**:
  - Completely eliminated the flat, empty black void layout in [`DailyQuestsModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/reward/DailyQuestsModal.tsx).
  - Added tab-responsive ambient lighting (amber/cyan for Daily, violet/fuchsia for Weekly), cyber micro-grid textures, and top laser edge rim.
  - Added live user Sparks Vault balance badge (`⚡ {sparks} Sparks`) in the top-right header linking to `/rewards`.
  - Added a dedicated Mission Command Bar with visual cycle milestone completion tracking (`X/4 Completed`) and countdown badge.
  - Upgraded quest cards from empty dark boxes into vibrant cyberpunk glass chips with glowing holographic icon sockets, radiant Sparks reward badges, color-matched action buttons, and stepped illuminated progress conduits.
  - Balanced footer showing earned vs available Sparks with a prominent golden `"Spend in Sparks Shop →"` button.
* **Sparks Rewards Shop Cards — Full Perimeter Border Glow & Anti-Nesting Overhaul**:
  - **Full-Perimeter Illuminated Borders**: Removed the isolated top-only beam line (`topBeam`). Replaced with a continuous, rich `border-2 border-{color}-400/80` and matching 360° neon ambient drop-shadow (`shadow-[0_0_25px_rgba(...)]`) wrapping all 4 edges and rounded corners of every card in the shop.
  - **Eliminated "Card-in-Card-in-Card" Nesting**: Removed the miniature black rectangle keycards, fake serial numbers, and mini-pill badges that were nested inside the stage box. Replaced with an open, spacious, hero medallion showcase matching the cosmetic cards:
    - **Pro Pass**: Open, glowing Crown crest medallion with radiant tier typography (`24-Hour Pro Pass`, `7-Day Pro Pass`, `30-Day Pro Pass`) and clean perks subtitle (`500 Daily Credits · All Studios Included`).
    - **Credits**: Open, glowing Coins medallion with vibrant cyan typography (`+100 Credits`, `+500 Credits`, `+1,500 Credits`) and clean subtitle (`Permanent Balance · Never Expires`).
  - **Copy & Jargon Polish**: Zero fake tech jargon, zero "instant injection", zero AI sparkles icon (`✨`), and zero repeated labels.
* **Automatic Timer-Based Shop Rotation & Toolbar Cleanup**:
  - **Automatic Cycle Rotation**: The shop automatically rotates strictly according to UTC reset timers:
    - Daily Drops rotate automatically every 24h at 00:00 UTC.
    - 3-Day Vault rotates automatically every 3 days at 00:00 UTC.
    - Weekly Vault rotates automatically every Monday at 00:00 UTC.
  - **Removed Manual "Refresh Shop" Button**: Cleaned up the UI to ensure users only see organic, timer-driven rotation.
  - **Removed Redundant "Live Balance"**: Eliminated the duplicate live balance text beside the tabs since user Sparks are already prominently shown in the hero card.
  - **Eliminated Scrollbar Slider**: Added universal cross-browser scrollbar hiding (`.scrollbar-none`, `[-ms-overflow-style:none]`, `[scrollbar-width:none]`, `[&::-webkit-scrollbar]:hidden`) so the category tabs never show an ugly native Windows scroll slider track.

### 13. 💳 Payment & Top-Up Flow [STATUS QUO PRESERVED]
* **Reverted Slide-Over Experiment**:
  - Reverted experimental slide-over payment drawer back to the canonical centered credit purchase modal as per user direction.
  - Preserved all top-up options and existing checkout touchpoints across the application.

### 14. ⚡ Sparks Economy Rebalancing & Revenue Protection [COMPLETED]
* **Revenue Protection (Zero Cannibalization)**:
  - **Removed Bulk Compute & Pro Passes**: Removed `sparks_pro_24h`, `sparks_pro_7d`, `sparks_pro_30d`, `sparks_credits_500`, and `sparks_credits_1500` from `sparks-shop.ts`. Creators can no longer bypass real-money subscription fees or credit pack purchases using free daily engagement points.
* **Feature #3 Integration (Streak Freeze & Shields)**:
  - Added **Streak Freeze (1x Shield)** (250 Sparks) and **Streak Guardian (3x Bundle)** (600 Sparks).
  - Atomically increments `user.streakShields` (capped at 3 maximum active shields).
  - Automatically preserves streaks on missed login days via `calculateEffectiveStreak()`.
  - UI automatically displays current shields (`{streakShields}/3`) and locks purchase at capacity (`Vault Full (3/3)`).
* **Real-Money Shop Discount Vouchers (Sales Funnel)**:
  - Added **₹100 / $1.50 OFF Voucher** (400 Sparks) and **20% OFF Pro Pass Voucher** (850 Sparks).
  - Generates verified single-use promo codes in `prisma.promoCode` and notifies users, driving creators to complete real-money checkouts in `/shop`.
* **Emergency Refuel**:
  - Added a single **Emergency Refuel (+25 Credits)** (350 Sparks) as a 24-hour taster to prevent abandoned generations without enabling credit hoarding.
* **Sparks Shop UI Polish (`/rewards`)**:
  - Updated category filter tabs: replaced "Pro Passes" and "Credits" with **"Perks & Shields"** (`ShieldCheck` icon) and **"Shop Vouchers"** (`Ticket` icon).
  - Dedicated holographic stages for Streak Shields, Vouchers, and Emergency Refuels.
  - Confirmation modals show context-aware shield rules, coupon usage, and current balances.

### 15. 📖 Dedicated Currency Policies, ToS & Earning Guide [COMPLETED]
* **Official Terms of Service Update (`/terms-of-service`)**:
  - Added **Section 6: Platform Currencies (Generation Credits & Exismic Sparks)**: Clear formal definition of Generation Credits (compute fuel, daily refresh allowance vs permanent lifetime reserve) and Exismic Sparks (engagement meta-currency earned strictly from directives, masteries, and streaks).
  - Added **Section 7: Strict All-Sales-Final & Non-Refund Policy**: Plain formal English stating that once Credits are spent running tools or Sparks are spent on cosmetics, shields, vouchers, or boosts, all transactions are strictly final and non-refundable under any circumstance.
  - Anti-Farming & Fair Play: Explicit ban on automated scripts, bots, macro recorders, or dummy accounts to farm rewards under penalty of permanent suspension and complete forfeiture of balances.
  - **Zero Mention of 00:00 UTC**: Daily reset is cleanly described as "refreshed every 24 hours" / "daily allowance".
* **Help Center & FAQ Integration (`/help`)**:
  - Added dedicated FAQ cards for Sparks earning paths, dual-balance credit mechanics, no-cash conversion, and strict non-refund policies.
  - Added quick-prompt chips for the AI support assistant.
* **Dedicated Currencies & Rewards Guide Page (`/rewards/guide`)**:
  - Built full Obsidian Glass guide page featuring:
    1. **Interactive Dual-Currency Comparison Matrix**: Compute Fuel (Credits) vs Creator Prestige (Sparks).
    2. **Generation Credits Deep-Dive**: Daily Allowance vs Permanent Lifetime Reserve, fail-safe automatic error refund guarantee.
    3. **Exismic Sparks Deep-Dive**: Complete breakdown of Daily Directives (+10 to 25 ⚡), Weekly Masteries (+50 to 100 ⚡), Streak Milestones, and the cosmetics catalog.
    4. **Strict All-Sales-Final Policy Panel**: High-visibility warning explaining why spent credits and sparks are non-refundable, zero cash value, and fair-play enforcement.
    5. **Direct Legal Backing**: Jump links to Section 6 & 7 in `/terms-of-service`.
* **Cross-Platform Navigation Links**:
  - Added **`[ 📖 Guide & Policy ]`** button to `/rewards` quick actions row.
  - Added **`[ Credit Rules & Non-Refund Policy → ]`** badge to `/shop` header.
  - Added breadcrumb navigation and SEO metadata layout.

### 16. 🎁 100 Free Sparks Community Gift (7-Day Limited-Time Event) [COMPLETED]
* **Overview**:
  - Added a limited-time celebration drop of **100 Free Sparks** for every creator directly in the Sparks Shop (`/rewards`).
  - **7-Day Expiration**: Active from September 7, 2026 until **September 14, 2026 23:59:59 UTC** (`FREE_SPARKS_GIFT_EXPIRES_AT`).
  - **One-Time Claimable & Vanishes When Claimed**:
    - Backend checks `prisma.sparksTransaction` for `source: "free_gift_100"` / itemId `sparks_free_gift_100` to prevent duplicate claims.
    - Added `hasClaimedFreeSparks` to `UserSparksProfile` and `/api/user/sparks`.
    - Once claimed, the item completely vanishes from the creator's shop page and filters in 0ms.
  - **Zero Tech Jargon**: Friendly, natural creator copy throughout ("Special Community Gift", "Claim Gift", "FREE", "+100 Free Sparks Added!").
  - **Visual Polish**: Radiant golden amber stage with a 3D animated `Gift` emblem, 7-day countdown badge (`Ends in 7d`), and green `FREE` pill with revolving light sweep.
  - **Rewards Guide (`/rewards/guide`) Polish**:
    - Fixed text edge clipping on hero headline and section headers: removed `italic` slants that sliced leftmost serifs (like the `H` in `HOW`), relaxed `leading-[1.08]` to `leading-[1.18]`, and added `inline-block py-1 px-2 overflow-visible` on the gradient text clip span.
    - Removed unrelated generic AI sparkles icons (`✨`): replaced with relevant `Eye` icon on `[ At A Glance ]` and `Palette` icon on `[ Avatar Frames & Glowing Names ]`.
    - Clarified that **Bonus Drops** are for special occasions, milestone celebrations, and community giveaways (not daily streaks, which reward generation credits/shields).
    - Standardized discount vouchers to strictly USD ($) across both Guide and Terms of Service (Section 6).

### 17. 🤖 Exismic Support Agent Tool Under Maintenance [COMPLETED]
* **Reliability Registry Entry**:
  - Registered `"support-agent"` in [`src/lib/tool-reliability.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/tool-reliability.ts) with `level: "unavailable"` and `label: "Maintenance"`.
  - Propagates automatically across catalog, search, and tool cards with the "Maintenance" badge and "View status" button.
* **Dedicated Obsidian Glass Maintenance Screen**:
  - Built [`src/components/support-agent/SupportAgentMaintenanceScreen.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/support-agent/SupportAgentMaintenanceScreen.tsx) with cyber glow lighting, bot + wrench insignia, upcoming upgrade details, email notification form, and back-to-dashboard navigation.
* **Route Protection & Admin Bypass**:
  - Created [`src/app/dashboard/support-agent/layout.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/dashboard/support-agent/layout.tsx).
  - Intercepts all `/dashboard/support-agent/*` sub-routes (such as `/dashboard/support-agent/new`).
  - Regular visitors see the full maintenance screen; admins (e.g. `BMREZ`) receive a sticky amber bypass banner allowing continuous administration.
* **Landing Page Notice**:
  - Updated [`src/app/tools/support-agent/page.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/tools/support-agent/page.tsx) with an "Under Maintenance" badge and "Maintenance Details" action button.

### 18. ⚡ Admin Panel Telemetry Expansion (Quests, Daily Vault, Sparks & Paid Orders) [COMPLETED]
* **Quests & Daily Vault Telemetry Tab (`QuestsVaultTab.tsx`)**:
  - **Quests Feed**: Real-time table showing which creator completed which quest (Daily Directive vs Weekly Mastery) and exact Sparks awarded (`+15 ⚡`, `+50 ⚡`), balance after, and timestamp.
  - **Daily Vault Ledger**: Real-time unboxings showing drop rarity with signature colored glows (Common, Uncommon, Rare, Epic, Legendary, Mythic), credits granted (`+15` to `+150 cr`), active streak days (`🔥 Xd`), and shields owned (`🛡️ Y/3`).
  - **Streak Hall of Fame Leaderboard**: Top 20 creators ranked by streak length, total vault unboxings, and active shields.
  - **Backend APIs**: [`/api/admin/quests`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/admin/quests/route.ts) & [`/api/admin/vault`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/admin/vault/route.ts).
* **Sparks Economy & Redemptions Tab (`SparksEconomyTab.tsx`)**:
  - **Treasury HUD**: Total Sparks in circulation, total spent in shop, total redemptions count, and community free gift claims.
  - **Shop Redemptions Feed**: Audit trail of who purchased what with Sparks (Avatar Frames, Name Styles, Profile Themes, Insignias, Streak Shields, ₹100 / $1.50 OFF Vouchers, Emergency Refuels, and Free Gifts).
  - **Backend API**: [`/api/admin/sparks`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/admin/sparks/route.ts).
* **Real-Money Orders & Subscriptions Tab (`OrdersRevenueTab.tsx`)**:
  - **Monetization HUD**: Total Gross Revenue (INR & USD), Active Pro Members, Credit Packs Sold, and Total Paid Orders.
  - **Orders Stream**: Purchases across Razorpay, Stripe, and PayPal with customer details, product type (Pro Subscription vs Credit Pack), amount paid, gateway order/payment ID with 1-click copy, and timestamp.
  - **Backend API**: [`/api/admin/orders`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/admin/orders/route.ts).
* **Enhanced Users Directory & 360° Creator Intelligence Dossier**:
  - In [`src/app/admin/page.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/admin/page.tsx) and [`/api/admin/users`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/admin/users/route.ts), added Streak flame (`🔥 Xd`), Shields (`🛡️ Y/3`), Sparks (`⚡ Z`), Vault Drops count (`🎁 N drops`), and an action button **`[ 🔍 Dossier ]`** on every creator row.
  - Built [`src/components/admin/UserDossierModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/admin/UserDossierModal.tsx) backed by [`/api/admin/users/[id]/dossier`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/admin/users/[id]/dossier/route.ts) displaying live avatar with frame, glowing name gradient, insignia, vitals, and tabbed history for Quests, Daily Vault, Sparks Shop, and Orders.
### 19. 🔒 Complete Tool Discovery Cloaking & Permanent Admin Grant [COMPLETED]
* **Complete Tool Discovery Cloaking (`support-agent`)**:
  - In [`src/data/tools.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/data/tools.ts), added `hidden?: boolean` to `Tool` interface.
  - Set `support-agent` with `hidden: true`, `popular: false`, `indexable: false`.
  - Re-exported `TOOLS` as `ALL_TOOLS.filter((t) => !t.hidden)`. Automatically cloaks the tool completely from the Search Bar, Command Palette (`MagicCommandPalette`), Tools Catalog (`/tools`), AI Category (`/category/ai`), Sidebar, and Concierge AI.
  - Removed link from [`src/components/layout/Footer.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/Footer.tsx).
  - In [`src/app/tools/support-agent/page.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/tools/support-agent/page.tsx), directly renders [`SupportAgentMaintenanceScreen`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/support-agent/SupportAgentMaintenanceScreen.tsx) instead of the marketing/landing page.
* **Permanent Admin Grant to `BMREZ` (`syedrayan.dev@gmail.com`)**:
  - Executed database promotion setting `role = "admin"` for `syedrayan.dev@gmail.com` in PostgreSQL `User` table.
  - Added all alias addresses to `ADMIN_EMAILS` in `.env.local`.
  - Updated [`src/lib/admin.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/admin.ts) with hardcoded default admin fallbacks so permissions are permanently active.
  - Added dedicated **Admin Panel** link (rose obsidian styling with `ShieldCheck` icon and `ADMIN` badge) directly into the user profile dropdown menu in [`src/components/layout/Navbar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/Navbar.tsx) and mobile menu.
  - Updated [`src/components/layout/Sidebar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/Sidebar.tsx) and [`src/components/layout/UserMenu.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/UserMenu.tsx) with dual role & email admin checks.

### 20. 🏷️ Exismic Pro Monthly v1.6 Launch Special (One-Time 7-Day Discount) [COMPLETED]
* **Pricing & Rules**:
  - **Launch Prices**: USD **$3.99** / INR **₹299** for month 1 (regular $6.99 / ₹499, ~43% / 40% discount).
  - **Eligibility**: Valid for 7 days (`2026-09-08` through `2026-09-15T23:59:59Z`). Pro Monthly only (Yearly and Credit Packs excluded).
  - **Strict 1-Time Only & Cross-Purchase Restriction**: Once redeemed by an account, the benefit is consumed permanently. Redeeming for personal subscription blocks discount on gifting; redeeming for a gift blocks discount on personal subscription.
  - **Subsequent Month Charging**: Subsequent renewals automatically bill normal full price ($6.99 / ₹499). PayPal Subscriptions uses 2-sequence plan (Trial Sequence 1 for $3.99, Regular Sequence 2 for $6.99). Razorpay Subscriptions applies a negative discount addon (-₹200) for invoice #1 while keeping base plan at ₹499.
  - **Promo Stacking Blocked for Eligible Users**: When eligible, the launch special is auto-applied and the coupon input is locked to prevent code stacking.
  - **Coupon Unlocking After Redemption**: Once the 1-time launch discount is redeemed (or user is ineligible), the coupon input is **fully unlocked**, allowing users to apply other valid vouchers (`PRO20`, `OFF100`, etc.).
* **Core Architecture Files**:
  - Config: [`src/config/pricing.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/config/pricing.ts) with `PRICING_CONFIG.V16_LAUNCH_PROMO` and `isLaunchPromoActive()`.
  - Eligibility Engine: [`src/lib/billing/launch-discount.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/billing/launch-discount.ts) (`checkUserLaunchDiscountEligibility`).
  - Status API: [`src/app/api/billing/launch-discount-status/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/billing/launch-discount-status/route.ts).
  - Coupon Validator: [`src/app/api/billing/validate-coupon/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/billing/validate-coupon/route.ts).
  - Order Creation & PayPal / Razorpay: [`src/app/api/billing/create-order/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/billing/create-order/route.ts) & [`src/lib/paypal.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/paypal.ts).
### 21. 👤 Account Pro Removal & Avatar Glow Clipping Fix [COMPLETED]
* **Account Downgrade for `BMREZ` (`syedrayan.dev@gmail.com`)**:
  - Updated database record to `plan: "free"`, `subscriptionStatus: "none"`, `dailyCredits: 50`, `aiGenerationsLimit: 50`.
  - Retained `role: "admin"` so full administrative access to the Admin Panel remains intact.
  - Decoupled `role === "admin"` from hardcoding `isPro = true` in [`src/hooks/usePro.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/hooks/usePro.ts), [`src/config/cosmetics-access.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/config/cosmetics-access.ts), [`src/hooks/useDashboardStats.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/hooks/useDashboardStats.ts), and [`src/components/tool/Dashboard.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/Dashboard.tsx). Admins can now test on Free tier without being forced into Pro status.
* **Avatar Frame Glow Clipping Fix**:
  - In [`src/components/ui/UserProfile.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/ui/UserProfile.tsx), replaced `p-8` with `pt-12 px-6 pb-6` (48px top headroom), removed default `scale-105` shifting avatar into the ceiling, and moved `overflow-hidden rounded-[2.5rem]` strictly to the inner atmospheric background layer so the container no longer clips the avatar aura.
  - In [`src/components/ui/AvatarWithFrame.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/ui/AvatarWithFrame.tsx), refined volumetric glow rings from ballooning `-inset-4 blur-2xl scale-105` to richer, concentrated `-inset-3 blur-xl` and `-inset-2 blur-lg`.
  - In [`src/components/layout/Navbar.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/layout/Navbar.tsx), cleaned desktop user dropdown layout to eliminate double padding around `UserProfile`.

---

## 🎯 Next Features Roadmap (Retention & Growth)

### 🔜 Feature #4: 🌐 Viral Creation Showcase Link (`/share/[id]`)
* **Goal**: Viral user acquisition from user shares.
* **Components**:
  - Public showcase view for any file with OpenGraph social preview tags.
  - "Made with Exismic AI — Try with 50 Free Credits" viral referral CTA.

---

## ⚙️ Key Technical Patterns
* **Credit & Streak Hook**: `useCredits()` in [`src/hooks/useCredits.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/hooks/useCredits.ts).
* **Tool Pipeline**: `sendToTool(targetHref, payload)` and `consumePipelineItem()` in [`src/lib/pipeline.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/pipeline.ts).
* **Event Dispatching**: Custom events for live cross-component sync:
  - `credits-updated`, `quests-updated`
  - `avatar-frame-updated`, `name-gradient-updated`
  - `insignia-updated`, `canopy-updated`
