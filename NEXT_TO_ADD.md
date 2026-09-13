# 📋 Next Tools To Add — Roadmap & Design Standards

> **Quick Summary**: This file lists all the upcoming tools we will build for Exismic, organized by priority.  
> **Golden Rules for Every Tool**:
> 1. **No Tech Jargon**: All titles, buttons, sliders, and descriptions must use simple, everyday English.
> 2. **Mobile First & Bug Free**: Every tool must work effortlessly on smartphones (touch dragging, no cut-off corners, no weird scrollbars, cards that fit phone screens).
> 3. **High-End Luxury Design**: No flat or "mid" boxes. Use our signature Obsidian Glass look with glowing rims, high-contrast readable text, and smooth animations.
> 4. **Zero Server Cost**: Everything runs 100% inside the visitor's web browser, so hosting stays completely free ($0 server cost).

---

## 🚀 Status Overview

| # | Tool Name | Planned Route | Category | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **CSS Mesh Gradient & Glass Studio** | `/tools/developer/mesh-gradient` | Developer / Design | ✅ **Completed & Overhauled** |
| **2** | **Fake Social Post & Tweet Studio** | `/tools/creator/post-mockup` | Creator & Social | ✅ **Completed & Overhauled** |
| **3** | **Social Share Banner Studio (OG Maker)** | `/tools/seo/og-banner` | SEO & Creator | ✅ **Completed & Overhauled** |
| **4** | **Slowed + Reverb & Sped-Up Music Studio** | `/tools/audio/slowed-reverb` | Audio & Music | ✅ **Completed & Overhauled** |
| **5** | **Private Photo & Screen Blur Studio** | `/tools/image/redact-blur` | Image & Privacy | ✅ **Completed & Overhauled** |
| **6** | **Live Studio Teleprompter** | `/tools/creator/teleprompter` | Creator & Video | ✅ **Completed & Overhauled** |
| **7** | **Notes to Mind Map Studio** | `/tools/student/mind-map` | Student & Notes | ✅ **Completed & Overhauled** |
| **8** | **Text & Code Comparison Studio** | `/tools/developer/diff-checker` | Developer Tools | ✅ **Completed & Overhauled** |
| **9** | **Audio Waveform Video Maker** | `/tools/audio/audiogram` | Audio & Video | ✅ **Completed & Overhauled** |
| **10** | **AI Mega-Prompt Builder** | `/tools/ai/prompt-builder` | AI Magic | ✅ **Completed & Overhauled** |

---

## 🛠️ Tool Details & Requirements

### 1. 🎨 CSS Mesh Gradient & Glass Studio (Completed)
* **Route**: `/tools/developer/mesh-gradient`
* **What It Does**: Lets users drag glowing color bubbles to create modern wallpaper gradients and frosted glass cards, then copy website code or download 4K images in 1 click.
* **Mobile Ready**: Includes a Screen Shape selector (Desktop 16:9, Phone 9:16, Square 1:1, Banner 3:1), smooth touch controls, and clean view toggle.

---

### 2. 🐦 Fake Social Post & Tweet Studio (Completed)
* **Route**: `/tools/creator/post-mockup`
* **What It Does**:
  - Creates realistic, shareable mockup cards for **Twitter/X**, **Threads**, and **Instagram comments**.
  - Customize avatar photo, name, username (`@handle`), verified checkmarks (Blue or Gold badge), message text, time, and custom view/like counters.
  - Choose between Obsidian Glow (Exismic theme), Pure Black (OLED), Dim Twilight, and Clean Light.
  - 1-Click "Copy Picture" directly to system clipboard and 2.5x Retina PNG download.
  - Chaining with `MediaPipelineBar` to send directly into Background Eraser, Meme Studio, Resizer, Compressor, or Cloud Drive.
* **Why People Want It**:
  - Millions of creators use these as hooks in YouTube Shorts, TikTok videos, newsletters, and presentation slides.
* **Mobile & UI Rules**:
  - Card must fit phone screens without horizontal scrolling.
  - 1-click "Copy Picture" to clipboard or download as sharp image.

---

### 3. 🖼️ Social Share Banner Studio (OG Maker) (Completed)
* **Route**: `/tools/seo/og-banner`
* **What It Does**:
  - Design custom 1200 × 630 Open Graph banner images for blogs, SaaS launches, and open source projects.
  - 5 Layouts: Modern Product Launch, Tech Blog Article, GitHub Repo, Minimalist Studio, and Split Spotlight.
  - 8 Color Atmosphere Themes + 4 Texture Patterns.
  - Realistic social share simulators for Twitter/X Large Cards, Discord Embeds, LinkedIn, and Google Search.
  - 1-Click "Copy Picture", "Download 1200x630 PNG", and "Copy Meta Tags".
  - Chaining with `MediaPipelineBar`.

---

### 4. 🎧 "Slowed + Reverb" & Sped-Up Music Studio (Completed)
* **Route**: `/tools/audio/slowed-reverb`
* **What It Does**:
  - Drop any song or voice recording (or test with built-in synthwave demo).
  - Real-time Web Audio sliders: "Speed & Pitch" (0.50x to 1.50x), "Room Reverb" (0 to 100% cathedral), and "Deep Bass Rumble" (+0 to +12dB).
  - Real-time 64-band glowing neon spectrum visualizer canvas.
  - 4 Viral 1-click presets (Classic Slowed + Reverb, Nightcore Sped Up, Cathedral Echoes, Midnight Lo-Fi).
  - 1-Click lossless 16-bit WAV audio download rendered 100% in-memory via `OfflineAudioContext` ($0 server cost).
* **Mobile & UI Rules**:
  - Large touch-friendly Play/Pause and seekbar controls that work instantly on mobile browsers.

---

### 5. 🛡️ Private Photo & Screen Blur Studio (Redaction) (Completed)
* **Route**: `/tools/image/redact-blur`
* **What It Does**:
  - Drop any screenshot, photo, or press `Ctrl+V` to paste directly from clipboard.
  - Drag boxes over sensitive areas with 3 styles: Smooth Gaussian Blur, 8-Bit Pixelate / Mosaic, and Black Out Tape.
  - Guaranteed 100% private: images are processed purely inside browser canvas and never leave the device.
  - 1-Click "Copy Picture" and high-res lossless PNG download.
  - Pipeline integration (`MediaPipelineBar`) to chain into Compressor, Resizer, Converter, or Cloud Drive.

---

### 6. 🎙️ Live Studio Teleprompter (Completed)
* **Route**: `/tools/creator/teleprompter`
* **What It Does**:
  - Full-screen, distraction-free scrolling script reader with hardware-accelerated auto-scroll.
  - Hardware Mirror Mode (`scaleX(-1)`) for physical beamsplitter teleprompter glass.
  - Live corner selfie webcam preview (PiP) to monitor eye line and framing.
  - Sliders for Scroll Speed (1x-10x), Text Size (24px-76px), and Margin Column Width.
  - Focus eye-line laser indicator with top and bottom atmospheric reading fade.
  - Keyboard shortcuts (Space to Play/Pause, Up/Down for Speed, F for Fullscreen, R to Reset).
* **Mobile & UI Rules**:
  - Native touch-friendly controls that work horizontally or vertically on phones perched next to a camera.

---

### 7. 🧠 Notes to Mind Map Studio (Completed)
* **Route**: `/tools/student/mind-map`
* **What It Does**:
  - Paste bullet points, outlines, or markdown lists &rarr; instantly parses hierarchical trees and draws interactive concept mind maps.
  - 3 Mind Map Layouts: Radial / Central Map (Tony Buzan style), Horizontal Tree (Left to Right), and Vertical Org Chart.
  - 3 Connecting Line Styles: Smooth Fluid Curves (Cubic Bezier), Stepped Orthogonal 90°, and Straight Lines.
  - 5 Atmosphere Themes: Obsidian Cyber (Signature), Synthwave Sunset, Emerald Aurora, Tokyo Twilight, and Clean Whiteboard.
  - Interactive Canvas: Pan with mouse/touch, scroll to zoom, auto "Fit to Screen", and center map.
  - In-Place Node Editing: Rename topics, add sub-branches (`+`), add siblings, collapse/expand branches (`+N` badge), and custom branch color tags.
  - 4 Built-In Academic & Business Presets: Full-Stack Web Roadmap, Human Nervous System, Product Launch Strategy, and The Industrial Revolution.
  - 1-Click "Copy Picture" to system clipboard, High-Res PNG download, Scalable Vector SVG download, and Markdown outline export ($0 server cost).
  - Chaining with `MediaPipelineBar` to send images to Compressor, Resizer, Converter, Meme Studio, or Cloud Drive.
* **Why People Want It**:
  - Students and researchers use it to visualize complex topics and study for exams.

---

### 8. 🔍 Text & Code Comparison Studio (Diff Checker) (Completed)
* **Route**: `/tools/developer/diff-checker`
* **What It Does**:
  - Compare two versions of text, code, or contracts side by side with zero server latency ($0 server cost).
  - Highlights added lines (green), removed lines (red), and modified lines (amber).
  - Word & Character Level Granularity: Highlights exact words changed within modified lines with glowing pill badges.
  - Dual Views: Split / Side-by-Side view with synchronized scrolling and Unified Git Stream view.
  - Live Statistics: Lines Added, Lines Removed, Lines Modified, and Content Similarity % Match score.
  - Controls: Ignore Whitespace, Ignore Case, Swap Panes, and Drag & Drop file uploads.
  - 4 Built-In Presets: TypeScript/React Hook Refactor, Legal NDA Clause, College Essay Thesis Polish, and JSON API Response Schema.
  - 1-Click "Copy Modified", "Copy Git Patch (.diff)", and Download `.diff` file.
* **Why People Want It**:
  - Writers, lawyers, students, and coders constantly need to check what changed between two versions of a document.

---

### 9. 🌊 Audio Waveform Video Maker (Podcast Reels) (Completed)
* **Route**: `/tools/audio/audiogram`
* **What It Does**:
  - Turn voice clips, podcast soundbites, and music into animated waveform videos for Instagram Reels, TikTok, and YouTube Shorts.
  - 3 Social Aspect Ratios: 9:16 Vertical Reel (1080x1920), 1:1 Square Feed (1080x1080), and 16:9 Landscape YouTube (1920x1080).
  - 4 Waveform Animation Styles: Bouncing EQ Bars, Liquid Radial Aura, Smooth Flowing Wave, and Pulse Dots.
  - 5 Atmosphere Themes: Obsidian Neon, Sunset Blaze, Emerald Aurora, Tokyo Twilight, and Golden Solaris.
  - In-Memory Web Audio Synthesis: Built-in synthwave lo-fi demo track generated with zero external requests.
  - Custom Cover Photo & Podcast Branding: Upload cover photo with reactive bass pulse, custom episode titles, and speaker bylines.
  - 100% Client-Side HD Video Export ($0 server cost): Real-time MediaRecorder video rendering with synchronized audio into `.webm` / `.mp4`.
  - 1-Click "Save Cover PNG" snapshot and `MediaPipelineBar` chaining.
* **Why People Want It**:
  - Audio files cannot be posted directly to TikTok or Instagram; they must be converted into videos.

---

### 10. ⚡ AI Mega-Prompt Builder (Completed)
* **Route**: `/tools/ai/prompt-builder`
* **What It Does**:
  - Type a simple 1-line idea (e.g., *"write an email to ask for a refund"*, *"design a database schema"*).
  - Automatically expands it into an engineered master prompt tailored for specific LLMs ($0 server cost).
  - Multi-LLM Architecture: Custom prompt output formats for Claude 3.5 Sonnet (XML tags `<role>`, `<context>`, `<rules>`), ChatGPT / GPT-4o, DeepSeek R1/V3, and Google Gemini 1.5.
  - 4 Prompting Frameworks: CREATE Protocol, Chain-of-Thought (CoT reasoning), RTF (Role-Task-Format), and APE (Action-Purpose-Expectation).
  - 6 Specialized Personas: World-Class Specialist, Senior Software Architect, Elite Copywriter, Academic Researcher, Executive Consultant, Master Teacher.
  - Strict Quality Guardrails: Ban conversational filler/throat-clearing, mandate step-by-step reasoning, and auto-append clarifying follow-up questions.
  - 1-Click "Open in ChatGPT", "Open in Claude", "Copy Master Prompt", and "Download .md".
* **Why People Want It**:
  - Most people write basic prompts and get generic answers; this makes their prompts professional and 10x more effective.

---

## 🔒 Mobile & Quality Assurance Checklist (Before Shipping Any Tool)
- [x] No tech jargon anywhere on the page (use everyday words only).
- [x] Tested on mobile phone viewports (no cut-off borders, no overlapping text).
- [x] Touch gestures work smoothly without dragging the web page.
- [x] Luxury Obsidian Cyber look (frosted glass, specular highlights, dark obsidian backgrounds).
- [x] 100% free client-side processing ($0 server cost).
- [x] `npx tsc --noEmit` passes with 0 errors.
