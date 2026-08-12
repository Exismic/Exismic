import { detectDeviceCapabilities } from "@/lib/device-capability";

export interface SttResult {
  text: string;
  language?: string;
  duration?: number | null;
}

/**
 * Checks if user device & audio file payload are eligible for local client-side STT.
 */
export function detectSttCapabilities(file: File): boolean {
  if (typeof window === "undefined") return false;

  const isDeviceCapable = detectDeviceCapabilities();
  if (!isDeviceCapable) return false;

  const MAX_LOCAL_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_LOCAL_AUDIO_SIZE) return false;

  return true;
}

/**
 * Executes local client-side speech-to-text recognition with a 15-second timeout.
 */
export async function processSttLocally(
  file: File,
  language = "auto",
  timeoutMs = 15000
): Promise<SttResult> {
  if (typeof window === "undefined") {
    throw new Error("Client STT is only available in browser environment.");
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Local speech transcription timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  try {
    const sttTaskPromise = (async (): Promise<SttResult> => {
      // 1. Decode audio using Web Audio API AudioContext to get audio buffer duration & verify integrity
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error("Web Audio API not supported in this browser.");
      }

      const audioCtx = new AudioCtx();
      const arrayBuffer = await file.arrayBuffer();
      let audioBuffer: AudioBuffer | null = null;

      try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeErr) {
        console.warn("[Client STT] Web Audio decoding failed, attempting speech recognition fallback...", decodeErr);
      } finally {
        await audioCtx.close();
      }

      const duration = audioBuffer ? audioBuffer.duration : null;

      // 2. Use Web Speech API or local browser SpeechRecognition if available
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        if (language !== "auto") {
          recognition.lang = language;
        }

        const recognizedText = await new Promise<string>((resolve, reject) => {
          let accumulatedText = "";
          let recognitionTimeout: ReturnType<typeof setTimeout>;

          recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                accumulatedText += event.results[i][0].transcript + " ";
              }
            }
          };

          recognition.onerror = (event: any) => {
            clearTimeout(recognitionTimeout);
            reject(new Error(`Speech recognition error: ${event.error}`));
          };

          recognition.onend = () => {
            clearTimeout(recognitionTimeout);
            resolve(accumulatedText.trim());
          };

          // Start audio playback & recognition
          try {
            recognition.start();
            // Automatically stop recognition after audio duration + buffer
            const runDuration = duration ? Math.min(duration * 1000 + 2000, timeoutMs - 1000) : 10000;
            recognitionTimeout = setTimeout(() => {
              try {
                recognition.stop();
              } catch {
                resolve(accumulatedText.trim());
              }
            }, runDuration);
          } catch (startErr) {
            reject(startErr);
          }
        });

        if (recognizedText) {
          return {
            text: recognizedText,
            language: language !== "auto" ? language : undefined,
            duration,
          };
        }
      }

      throw new Error("Local speech recognition engine did not return text.");
    })();

    const result = await Promise.race([sttTaskPromise, timeoutPromise]);
    return result;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
