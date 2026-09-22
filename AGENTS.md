<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Memory & Session Continuation
- Whenever resuming or starting a new conversation in this workspace, ALWAYS read [SESSION_CONTINUATION.md](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/SESSION_CONTINUATION.md) to understand current architecture state, completed features, and the active retention roadmap.
- Maintain and track all new tools added during this sprint in [UPCOMING_TOOLS_RELEASE_LOG.md](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/UPCOMING_TOOLS_RELEASE_LOG.md) for the upcoming production release.
- **MANDATORY TOOL DESIGN & COPY RULES**: When adding a new tool or updating an existing tool, strictly enforce [TOOL_STANDARDS_AND_GUIDELINES.md](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/TOOL_STANDARDS_AND_GUIDELINES.md):
  1. **Zero Tech Jargon**: Always use plain, friendly everyday English (no engineering buzzwords like "DSP", "WASM", "AST", "Convolution", "Reset Flat", "120Hz", etc.).
  2. **Zero Sparkle Icons**: Never use `<Sparkles>` or generic star icons for tools, tabs, or presets — always use authentic, context-related Lucide icons (e.g. `<LayoutGrid>` for all tools, `<Disc3>`/`<Waves>` for audio, `<Film>` for video, `<ImageIcon>` for photos).
  3. **Balanced Layout & Laser Bridge**: Place presets directly below the player/workspace, avoid 100px+ empty black voids, and always bridge to the Guide & Overview with the category-reactive laser horizon divider (`theme.primaryHex`).

