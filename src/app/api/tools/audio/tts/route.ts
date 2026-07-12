import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from '@/lib/api-security';

/**
 * ElevenLabs Text-to-Speech API Route
 */

export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`tts:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 20 : 5, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const { text, voice_id, settings } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const cleanText = String(text).trim();
    if (cleanText.length > 5000) {
      return NextResponse.json({ error: 'Text is too long. Maximum length is 5,000 characters.' }, { status: 413 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'The text-to-speech AI service is currently unavailable. Please try again later.' 
      }, { status: 500 });
    }

    const voiceId = voice_id || 'JBFqnCBsd6RMkjVDRZzb';

    console.log(`Generating TTS with ElevenLabs for voice: ${voiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API Error:', errorData);
      
      const errorMessage = errorData?.detail?.message || errorData?.detail || 'Failed to generate speech';
      
      if (response.status === 401) {
        // If it's the specific unusual activity error, return that
        if (errorData?.detail?.status === 'detected_unusual_activity') {
          return NextResponse.json({ 
            error: 'ElevenLabs unusual activity detected. Free tier is blocked. You may need a paid plan or to check your account.' 
          }, { status: 401 });
        }
        return NextResponse.json({ error: 'Invalid ElevenLabs API key or insufficient permissions' }, { status: 401 });
      }
      
      if (response.status === 429) {
        return NextResponse.json({ error: 'ElevenLabs quota exceeded' }, { status: 429 });
      }

      if (response.status === 402) {
        return NextResponse.json(
          { error: 'The selected speech voice is not available on the current provider plan.' },
          { status: 503 },
        );
      }
      
      throw new Error(errorMessage);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Return the audio as a stream
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: unknown) {
    console.error('TTS Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate speech',
    }, { status: 500 });
  }
}
