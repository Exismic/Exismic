/**
 * Utility to detect if the user's device is capable of running client-side AI models
 * (such as @imgly/background-removal via Web Workers / WebGPU / WASM).
 */

export interface NetworkInformation {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  saveData?: boolean;
}

export function detectDeviceCapabilities(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  try {
    // 1. WebGPU Support
    const hasWebGPU = "gpu" in navigator && !!(navigator as unknown as { gpu: unknown }).gpu;
    if (!hasWebGPU) {
      return false;
    }

    // 2. CPU Cores Check (Require >= 4 cores for smooth WASM/worker processing)
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    if (hardwareConcurrency < 4) {
      return false;
    }

    // 3. Network Speed Check (Avoid client-side download if on slow 2G/3G or saveData)
    const connection = (navigator as unknown as { connection?: NetworkInformation }).connection;
    if (connection) {
      if (connection.saveData === true) {
        return false;
      }
      const effectiveType = connection.effectiveType;
      if (effectiveType === "slow-2g" || effectiveType === "2g" || effectiveType === "3g") {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn("Device capability detection fallback triggered:", error);
    return false;
  }
}
