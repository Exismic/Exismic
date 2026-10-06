"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Box, RefreshCw } from "lucide-react";

function EditorLoading() {
  const [takingLonger, setTakingLonger] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTakingLonger(true), 15000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-cyan-400/15 bg-[#0b0c12] px-5 py-8 text-center"
      aria-busy="true"
    >
      <Box className="size-8 text-cyan-300" aria-hidden="true" />
      <p role="status" className="text-sm font-semibold text-zinc-200">
        {takingLonger ? "The skin editor is taking longer to open." : "Opening your skin editor…"}
      </p>
      <p className="max-w-md text-sm leading-relaxed text-zinc-400">
        You can read the guide below while it loads.
      </p>
      {takingLonger && <ReloadEditorButton />}
      <noscript>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Turn on JavaScript in your browser to use the skin editor. The guide below is still available.
        </p>
      </noscript>
    </div>
  );
}

function ReloadEditorButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
    >
      <RefreshCw size={16} aria-hidden="true" />
      Reload editor
    </button>
  );
}

// The large editor and its 3D libraries load separately from the public page.
// Browser-only rendering also prevents editor suspension from hiding the guide
// in a streamed replacement that requires the editor's JavaScript to run.
const MinecraftSkinMaker = dynamic(
  () => import("@/components/tool/MinecraftSkinMaker").then((module) => module.MinecraftSkinMaker),
  { ssr: false, loading: EditorLoading },
);

export class MinecraftEditorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-cyan-400/15 bg-[#0b0c12] px-5 py-8 text-center">
          <p role="alert" className="text-sm font-semibold text-zinc-200">
            The skin editor couldn’t open. Please reload to try again.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            The guide and other tools below are still available.
          </p>
          {/* A rejected lazy import is cached. A manual page reload fetches the
              current deployment instead of repeatedly resetting that import. */}
          <ReloadEditorButton />
        </div>
      );
    }

    return this.props.children;
  }
}

export function MinecraftSkinWorkspace() {
  return (
    <MinecraftEditorBoundary>
      <MinecraftSkinMaker />
    </MinecraftEditorBoundary>
  );
}
