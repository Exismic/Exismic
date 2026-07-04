"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, Loader2, AlertCircle, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ToolUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes: Record<string, string[]>;
  maxSize: number; // in MB
  allowMultiple?: boolean;
}

export function ToolUploader({ onUpload, acceptedTypes, maxSize, allowMultiple = false }: ToolUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setFiles(acceptedFiles);
    setError(null);
    setIsUploading(true);

    try {
      await onUpload(acceptedFiles);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong during upload.");
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize: maxSize * 1024 * 1024,
    multiple: allowMultiple
  });

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div 
        {...getRootProps()} 
        className={cn(
          "group relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-6 text-center shadow-xl transition-all duration-300 ease-out sm:p-10",
          isDragActive 
            ? "scale-[0.99] border-cyan-300/50 bg-cyan-300/[0.05]"
            : "border-white/15 bg-zinc-950/65 hover:border-cyan-300/35 hover:bg-cyan-300/[0.03]",
          files.length > 0 ? "border-cyan-300/35 bg-cyan-300/[0.04]" : "",
          isUploading && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="mb-5 flex size-16 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] transition-all duration-300 group-hover:border-cyan-300/30">
                <Upload className="h-7 w-7 text-cyan-200" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white font-outfit">
                {allowMultiple ? "Choose files" : "Choose a file"}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-zinc-500">
                Drop {allowMultiple ? "them" : "it"} here or browse from your device.
                Keep it under <span className="text-zinc-300 font-medium">{maxSize}MB</span>.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="mb-5 flex size-16 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10">
                {isUploading ? (
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-200" />
                ) : (
                  <FileIcon className="h-7 w-7 text-cyan-200" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white truncate max-w-[250px]">
                  {files.length === 1 ? files[0].name : `${files.length} files selected`}
                </h3>
                <p className="text-sm text-zinc-500">
                  {(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total
                </p>
              </div>

              {!isUploading && (
                <button 
                  onClick={clearSelection}
                  className="mt-5 flex size-11 items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Clear selected files"
                >
                  <X size={18} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect on hover/drag */}
        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-cyan-300/[0.04]" />
        )}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {isUploading && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-400">Processing file...</span>
            <span className="font-medium text-cyan-200">Wait a moment</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-full w-1/3 bg-linear-to-r from-transparent via-cyan-300 to-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
