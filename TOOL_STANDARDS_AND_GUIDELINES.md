# Exismic Studio — Tool Standards, Copy & Iconography Guidelines

> **Status**: Active & Mandatory Standard  
> **Applicability**: Applies to ALL existing tools, future tool creations, workspace interfaces, and SEO guide sections in `Exismic Studio`.

---

## 🎯 Core Directive
Whenever adding a new tool or updating an existing tool in Exismic Studio:
1. **Never use heavy technical / engineering jargon**. Always write in clear, natural, everyday English that anyone can instantly understand.
2. **Never use lazy `<Sparkles>` or generic star icons**. Always choose an authentic Lucide vector icon that directly relates to the tool’s real domain and purpose.
3. **Never leave awkward dead voids or truncated text**. Always balance column heights, bridge to the Guide & Overview with the category-reactive laser horizon divider, and allocate proportional width to labels.

---

## 📖 Standard 1: Zero Tech Jargon (Plain Everyday English Policy)

Exismic is built for creators, students, professionals, and everyday users — not audio engineers, DSP researchers, or compiler developers. Technical jargon alienates users and makes tools feel intimidating and overly complex.

### Writing Rules:
- **Write for human intent**: Describe what the feature *does for the user*, not the underlying algorithms or protocols it uses.
- **Eliminate audio/video/tech acronyms** like `DSP`, `WASM`, `EQ`, `Convolution`, `AST`, `16-bit PCM`, `Lossy`, `Biquad`, etc. from visible UI labels, buttons, and headers.
- **Action-first terminology**: Use words like *Speed*, *Echo*, *Bass*, *Quality*, *Download*, *Preview*, *Slow Down*, *Trim*, *Convert*.

### Jargon Translation Dictionary:

| ❌ Prohibited Tech Jargon | ✅ Required Plain Everyday English |
| :--- | :--- |
| *Studio DSP Console* | **Slowed & Reverb Studio** (or *Audio Effects Studio*) |
| *DSP Faders* | **Adjust Sound** (or *Sound Controls*) |
| *Real-Time Web Audio* | **Instant Preview** (or *Live Playback*) |
| *Zero-latency pitch shifting, convolution echo & 16-bit WAV export* | **Slow down songs, add dreamy echo, boost bass, and download clean audio** |
| *Sound Customizer (Real-Time)* | **Customize Sound** (or *Sound Controls*) |
| *Reset Flat* | **Reset All** (or *Reset to Default*) |
| *Speed & Pitch Multiplier* | **Song Speed & Pitch** (or *Speed & Pitch*) |
| *1.00x Flat* / *0.85x Viral* / *1.25x Night* | **1.00x Normal** / **0.85x Slowed** / **1.25x Fast** |
| *Room Reverb & Echo Space* | **Echo & Reverb** |
| *0% Dry* / *35% Subtle* / *65% Concert* / *90% Space* | **0% Off** / **35% Light** / **65% Concert Hall** / **90% Deep Echo** |
| *Sub-Bass Boost (120Hz)* | **Bass Boost** |
| *0 dB Flat* / *+4.5 dB Punch* / *+8.0 dB Club* / *+12 dB Heavy* | **0 dB Off** / **+4.5 dB Punchy** / **+8.0 dB Deep** / **+12 dB Max Bass** |
| *Monitoring Volume* | **Volume** (or *Playback Volume*) |
| *Continuous Loop Active* / *Single Play* | **Looping song** / **Plays once** |
| *Drop your song to load into DSP console* | **Drop your song to load** |
| *Download WAV* | **Download Song (WAV)** (or *Download Audio*) |
| *1-Click Style Blueprints* | **Instant Sound Styles** (or *Quick Styles* / *Quick Presets*) |
| *Curated Profiles* | **Popular Styles** (or *Instant Styles*) |
| *Submerged Hallway* / *Club Sub-Bass* | **Submerged Echo** / **Club Bass Boost** |
| *AST Tree Compilation / Transpilation* | **Convert Code** / **Format Code** |
| *Lossless WebP/PNG Quantization Pipeline* | **Fast High-Quality Image Export** |
| *Bilinear Canvas Interpolation* | **Smooth Image Scaling** |

---

## 🎨 Standard 2: Zero Sparkles (Authentic Iconography Policy)

The generic `<Sparkles>` icon has been overused across web apps as a lazy placeholder for anything "AI" or "fancy". In Exismic, sparkle icons are strictly prohibited for tools, actions, tabs, and catalogs. Every icon must represent the concrete function being performed.

### Icon Selection Guide:

| Feature / Concept | ❌ Prohibited | ✅ Required Authentic Lucide Icon |
| :--- | :---: | :--- |
| **All Tools / Catalog / Grid** | `<Sparkles>` | `<LayoutGrid>` |
| **Audio Player & Waveform** | `<Sparkles>` | `<Disc3>`, `<Volume2>`, `<Waves>` |
| **Echo & Reverb** | `<Sparkles>` | `<Waves>`, `<Radio>` |
| **Bass / Energy** | `<Sparkles>` | `<Flame>`, `<Zap>` |
| **Headphones / Lo-Fi** | `<Sparkles>` | `<Headphones>` |
| **Microphone / Voice / Vocal Remover** | `<Sparkles>` | `<Mic2>`, `<AudioWaveform>` |
| **Video Editing / Trimmer** | `<Sparkles>` | `<Film>`, `<Scissors>`, `<Video>` |
| **Image / Background Remover** | `<Sparkles>` | `<ImageIcon>`, `<Palette>`, `<Crop>` |
| **Text / AI Writer / Resume** | `<Sparkles>` | `<FileText>`, `<PenTool>`, `<Type>`, `<BookOpen>` |
| **Code / Developer Tools** | `<Sparkles>` | `<Code2>`, `<Terminal>`, `<Cpu>`, `<Database>` |
| **PDF / Documents** | `<Sparkles>` | `<FileText>`, `<ScanText>`, `<FileCheck>` |
| **Speed / Acceleration** | `<Sparkles>` | `<Gauge>`, `<Zap>` |
| **Exploration / Discovery** | `<Sparkles>` | `<Compass>` |
| **Pro Plan / Membership** | `<Sparkles>` | `<Crown>` |
| **Community / Collaboration** | `<Sparkles>` | `<Users>` |
| **Security / Privacy / Blur** | `<Sparkles>` | `<ShieldCheck>`, `<Lock>`, `<EyeOff>` |

*(Note: The only approved decorative uses of Sparkles in the codebase are the falling stardust particle effects in specific shop backgrounds or branded economy token icons where sparkles literally represent sparks).*

---

## 📐 Standard 3: Balanced Layout & Void Elimination

1. **Avoid Empty Vertical Voids**:
   - Preset cards, templates, or style selectors must sit **directly below the main workspace / player** in the same column rather than being shoved to the bottom of an elongated side column.
   - Both columns on desktop should remain visual equals in height.
2. **Eliminate 100px+ Gap Above Guide & Overview**:
   - Tool interactive containers must not have excessive desktop bottom padding (`lg:pb-0` or `lg:pb-2`).
   - SEO guide sections must use tight top margins (`mt-2 sm:mt-4`) rather than `mt-16`.
3. **Category-Reactive Anamorphic Laser Horizon Divider**:
   - Every tool page must include the signature cyber laser horizon divider between the tool workspace and the Guide & Overview card:
     ```tsx
     {/* Ambient Flare */}
     <div style={{ background: `radial-gradient(ellipse at center, ${theme.primaryHex}, transparent 70%)` }} />
     {/* Laser Hairline */}
     <div style={{ background: `linear-gradient(90deg, transparent 0%, ${theme.primaryHex}20 15%, ${theme.primaryHex} 50%, ${theme.primaryHex}20 85%, transparent 100%)` }} />
     {/* Specular White Needle */}
     <div style={{ background: `linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)` }} />
     {/* Cyber Core Jewel */}
     <div style={{ background: "#ffffff", boxShadow: `0 0 10px 2px ${theme.primaryHex}` }} />
     ```
4. **Zero Ellipsis Truncation**:
   - Never let chips or badges truncate into `Ec...`, `Lo...`, etc.
   - Use `whitespace-nowrap`, proportional column sizing (e.g. `grid-cols-[1fr_1.35fr_1fr]`), and 2-column grids on split layouts to give every badge generous room.

---

## ✅ Pre-Release Review Checklist

Before marking any new or modified tool as complete, verify:
- [ ] **No Tech Jargon**: All titles, sliders, buttons, badges, and drop zones use friendly plain English.
- [ ] **No Sparkle Icons**: `<Sparkles>` is not used as an icon for the tool, its tabs, buttons, or presets.
- [ ] **No Dead Void**: The gap between the tool and Guide & Overview is bridged with the category-colored laser horizon divider.
- [ ] **No Text Truncation**: All pills, chips, and labels display their full text cleanly across all viewports.
- [ ] **TypeScript Clean**: `npx tsc --noEmit` passes with 0 errors.
