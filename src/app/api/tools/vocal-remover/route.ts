import { NextRequest, NextResponse } from 'next/server';
import { getEngineRoute } from '@/config/engine';

/**
 * Vocal Separator API Route
 * This route calls the Hugging Face Inference API / Spaces to separate vocals and instrumental.
 * We use the Demucs v4 model which is the gold standard for music separation.
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Local AI Microservice (Highest Priority for Local Dev)
    const localApiUrl = getEngineRoute("/separate");
    
    try {
      console.log('Attempting local separation at:', localApiUrl);
      const localResponse = await fetch(localApiUrl, {
        method: "POST",
        body: formData,
        next: { revalidate: 0 }
      });

      if (localResponse.ok) {
        const result = await localResponse.json();
        if (result.success) return NextResponse.json(result);
      }
      
      const errorText = await localResponse.text();
      console.warn('Local separation failed or returned error:', errorText);
    } catch (localError: any) {
      console.warn('Local service unreachable, trying cloud...', localError.message);
    }

    // 2. Modal.com (Cloud Fallback)
    const modalUrl = process.env.MODAL_VOCAL_REMOVER_URL;
    if (modalUrl) {
      try {
        console.log('Attempting Modal.com separation...');
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Audio = buffer.toString('base64');
        
        const modalResponse = await fetch(modalUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            file_data_base64: base64Audio
          })
        });

        if (modalResponse.ok) {
          const result = await modalResponse.json();
          if (result.success) return NextResponse.json(result);
        }
      } catch (modalError: any) {
        console.warn('Modal unreachable:', modalError.message);
      }
    }

    // --- Fallback to Hugging Face (Tier 1: High Fidelity) ---
    const hfToken = process.env.HUGGINGFACE_TOKEN;
    if (!hfToken) {
      return NextResponse.json({ error: 'Primary service down and HF Token missing' }, { status: 503 });
    }

    const hfSpaceUrl = "https://r3gm-audio-separator.hf.space/api/predict";
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    
    try {
      const hfResponse = await fetch(hfSpaceUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [
            { name: file.name, data: `data:${file.type};base64,${base64Audio}` },
            "UVR-MDX-NET-Voc_FT",
            "Vocals",
            "v3"
          ]
        }),
        signal: AbortSignal.timeout(60000) // 60s timeout
      });

      if (hfResponse.ok) {
        const hfData = await hfResponse.json();
        if (hfData.data && hfData.data[0]) {
          const vocalsUrl = hfData.data[0].url || hfData.data[0];
          return NextResponse.json({
            success: true,
            result: { vocals: vocalsUrl, instrumental: vocalsUrl, fileName: file.name }
          });
        }
      }
    } catch (e) {
      console.warn("Tier 1 Fallback failed, trying Tier 2...");
    }

    // --- Fallback to Hugging Face (Tier 2: Ultimate Stability) ---
    const tier2Url = "https://sociallycompute-voice-separator.hf.space/api/predict";
    const tier2Response = await fetch(tier2Url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${hfToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [{ name: file.name, data: `data:${file.type};base64,${base64Audio}` }] })
    });

    if (tier2Response.ok) {
      const t2Data = await tier2Response.json();
      if (t2Data.data && t2Data.data[0]) {
        return NextResponse.json({
          success: true,
          result: { vocals: t2Data.data[0].url || t2Data.data[0], instrumental: t2Data.data[0].url || t2Data.data[0], fileName: file.name }
        });
      }
    }

    throw new Error('All separation services (Primary, Tier 1, and Tier 2) are currently unresponsive.');

  } catch (error: any) {
    console.error('Vocal separation error:', error);
    return NextResponse.json({ 
      error: 'The AI is currently overwhelmed. Please try a shorter clip or wait a moment.',
      details: error.message 
    }, { status: 500 });
  }
}
