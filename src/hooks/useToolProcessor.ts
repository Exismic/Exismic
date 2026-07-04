"use client";

import { useState } from "react";
import axios from "axios";

function getProcessingErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || "Processing failed. Please try again.";
  }

  return error instanceof Error ? error.message : "Processing failed. Please try again.";
}

export function useToolProcessor(toolEndpoint: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 500);

    try {
      // Phase 2: Simple POST request
      // In a real prod setup, we'd use SSE or WebSockets for real progress
      // Here we simulate progress while waiting for the response
      const response = await axios.post(toolEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data.result);
      setIsProcessing(false);
      
      return response.data;
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setError(getProcessingErrorMessage(err));
      console.error("Processing Error:", err);
    }
  };

  return {
    processFile,
    isProcessing,
    progress,
    error,
    result,
    reset: () => {
      setResult(null);
      setProgress(0);
      setError(null);
    }
  };
}
