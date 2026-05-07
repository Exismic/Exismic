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
    } catch (err: any) {
      setError(err.message || "Something went wrong during upload.");
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
    <div className="w-full max-w-2xl mx-auto">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative group border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 ease-out flex flex-col items-center justify-center text-center overflow-hidden",
          isDragActive 
            ? "border-violet-500 bg-violet-500/5 scale-[0.99]" 
            : "border-white/10 hover:border-violet-500/30 hover:bg-white/5",
          files.length > 0 ? "border-violet-500/50 bg-violet-500/5" : "",
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
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-500/10 transition-all duration-500">
                <Upload className="w-10 h-10 text-zinc-400 group-hover:text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-outfit">
                {allowMultiple ? "Drop your files here" : "Drop your file here"}
              </h3>
              <p className="text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Click to browse or drag and drop. 
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
              <div className="w-20 h-20 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6">
                {isUploading ? (
                  <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                ) : (
                  <FileIcon className="w-10 h-10 text-violet-400" />
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
                  className="mt-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect on hover/drag */}
        {isDragActive && (
          <div className="absolute inset-0 pointer-events-none bg-violet-500/5 animate-pulse" />
        )}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {isUploading && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-400">Processing file...</span>
            <span className="text-violet-400 font-medium">Wait a moment</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-full w-1/3 bg-linear-to-r from-transparent via-violet-500 to-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
