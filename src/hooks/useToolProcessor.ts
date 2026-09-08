"use client";

import { useState } from "react";
import axios from "axios";
import { 
  trackToolRun, 
  trackToolSuccess, 
  trackToolError, 
  trackAuthWallHit, 
  trackCreditWallHit 
} from "@/lib/analytics";
import { saveFileHistory } from "@/lib/history";

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
  const [authRequired, setAuthRequired] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(false);

  const toolName = toolEndpoint.split("/").filter(Boolean).pop() || "tool";

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setAuthRequired(false);
    setCreditsRequired(false);
    trackToolRun(toolName);

    const formData = new FormData();
    formData.append("file", file);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 500);

    try {
      const response = await axios.post(toolEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data.result);
      setIsProcessing(false);
      trackToolSuccess(toolName);

      // Automatically record completed action to unified history
      if (response.data?.result) {
        saveFileHistory({
          toolType: toolName,
          originalName: file.name,
          resultUrl: typeof response.data.result === "string" ? response.data.result : undefined,
          status: "completed",
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            endpoint: toolEndpoint,
            toolName: toolName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          }
        }).catch(() => {});
      }
      
      return response.data;
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setIsProcessing(false);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setAuthRequired(true);
          trackAuthWallHit(toolName);
          return;
        }
        if (status === 402) {
          setCreditsRequired(true);
          trackCreditWallHit(toolName);
          return;
        }
      }

      const errMsg = getProcessingErrorMessage(err);
      setError(errMsg);
      trackToolError(toolName, errMsg);
      console.error("Processing Error:", err);
    }
  };

  return {
    processFile,
    isProcessing,
    progress,
    error,
    result,
    authRequired,
    creditsRequired,
    reset: () => {
      setResult(null);
      setProgress(0);
      setError(null);
      setAuthRequired(false);
      setCreditsRequired(false);
    }
  };
}
