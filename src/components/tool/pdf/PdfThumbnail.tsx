"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface PdfThumbnailProps {
  file: File;
  className?: string;
}

interface PdfViewport {
  height: number;
  width: number;
}

interface PdfPage {
  getViewport(options: { scale: number }): PdfViewport;
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }): { promise: Promise<void> };
}

interface PdfDocument {
  getPage(pageNumber: number): Promise<PdfPage>;
}

interface PdfJsLib {
  getDocument(options: { data: ArrayBuffer }): { promise: Promise<PdfDocument> };
}

type WindowWithPdfJs = Window & { pdfjsLib?: PdfJsLib };

export function PdfThumbnail({ file, className }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function renderThumbnail() {
      const browserWindow = window as WindowWithPdfJs;

      if (!browserWindow.pdfjsLib) {
        // Wait for script to load if needed, but we expect it to be loaded via page.tsx or similar
        // For safety, we'll wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!browserWindow.pdfjsLib) {
          setError(true);
          setLoading(false);
          return;
        }
      }

      try {
        const pdfjsLib = browserWindow.pdfjsLib;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error("Thumbnail error:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    renderThumbnail();
    return () => { isMounted = false; };
  }, [file]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 border border-white/5 rounded-xl ${className}`}>
        <FileText className="text-zinc-700" size={32} />
      </div>
    );
  }

  return (
    <div className={`relative bg-zinc-900 border border-white/5 rounded-xl overflow-hidden group ${className}`}>
      {loading && (
        <Skeleton className="absolute inset-0 z-10 rounded-xl border-0" />
      )}
      <canvas ref={canvasRef} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
