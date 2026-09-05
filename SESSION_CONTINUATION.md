# Exismic Studio — Master Project Continuation & Architecture Memory

> **Last Updated**: September 2026  
> **Repository**: `Exismic/Exismic` (`c:\Users\rayan\.gemini\antigravity\scratch\exismic-project`)  
> **Status**: Production-ready, TypeScript clean (`tsc --noEmit` = 0 errors), active dev server on Turbopack (`http://localhost:3000`).

---

## 🚀 Quick Resume Prompt
When opening a new chat session in Antigravity IDE, simply paste:
```text
Read SESSION_CONTINUATION.md and let's continue with Feature #4: Viral Creation Showcase Link (/share/[id]).
```

---

## 📌 Summary of Completed Architecture & Features

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
  * Resume Builder, AI Resume Match, AI Invoice Generator, and Screenshot-to-Code are fully unlocked with credit payments.

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
* **UI**:
  * [`src/components/reward/DailyRewardModal.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/reward/DailyRewardModal.tsx): Added Streak Freeze Shield protection bar with equip button + 4-tier milestone road track with live status indicators and zero visual clutter.

---

## 🎯 Next Features Roadmap (Retention & Growth)

### 🔜 Feature #4: 🌐 Viral Creation Showcase Link (`/share/[id]`)
* **Goal**: Viral user acquisition from user shares.
* **Components**:
  - Public showcase view for any file with OpenGraph social preview tags.
  - "Made with Exismic AI — Try with 50 Free Credits" viral referral CTA.

---

## ⚙️ Key Technical Patterns
* **Credit & Streak Hook**: `useCredits()` in [`src/hooks/useCredits.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/hooks/useCredits.ts) (`credits`, `dailyStreak`, `streakShields`, `streakMilestonesClaimed`, `todayClaim`, `countdown`, `refreshCredits`).
* **Tool Pipeline**: `sendToTool(targetHref, payload)` and `consumePipelineItem()` in [`src/lib/pipeline.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/pipeline.ts).
* **Event Dispatching**: Custom events for live cross-component sync:
  - `window.dispatchEvent(new Event("credits-updated"))`
  - `window.dispatchEvent(new Event("quests-updated"))`
  - `window.dispatchEvent(new Event("avatar-frame-updated"))`
  - `window.dispatchEvent(new Event("name-gradient-updated"))`
