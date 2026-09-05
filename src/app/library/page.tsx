import { Metadata } from "next";
import { LibraryClient } from "./LibraryClient";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";

export const metadata: Metadata = {
  title: "Cloud Drive & Creation Vault | Exismic Studio",
  description:
    "Your private creative cloud drive. Store, organize, preview, batch download, and chain AI art, cutouts, memes, and documents directly into companion tools.",
};

export default function LibraryPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030306] px-4 py-8 text-white sm:px-6 md:px-12 md:py-12 selection:bg-purple-500/30">
      {/* Background ambient cosmic lighting effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent blur-[150px]" />
        <div className="absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-fuchsia-600/10 via-purple-600/10 to-transparent blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 md:space-y-10">
        <PageBreadcrumb items={[{ label: "Cloud Drive Vault" }]} />
        <LibraryClient />
      </div>
    </div>
  );
}
