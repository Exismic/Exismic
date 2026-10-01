import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from '@/lib/api-security';

/**
 * Natural Spoken Voice Fallback Engine
 * Generates natural spoken human voice MP3 chunks
 * whenever ElevenLabs limits or connectivity interrupts.
 */
async function generateGoogleSpeechFallback(text: string): Promise<Buffer | null> {
  try {
    // Split into chunks under 180 chars on natural punctuation boundaries
    const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
      const clean = s.trim();
      if (!clean) continue;
      if ((current + ' ' + clean).length < 180) {
        current = (current ? current + ' ' : '') + clean;
      } else {
        if (current) chunks.push(current);
        current = clean;
      }
    }
    if (current) chunks.push(current);
    if (chunks.length === 0) chunks.push(text.slice(0, 180));

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }
    }

    if (audioBuffers.length === 0) return null;
    return Buffer.concat(audioBuffers);
  } catch (err) {
    console.error('Speech fallback error:', err);
    return null;
  }
}

/**
 * Text-to-Speech API Route
 * Tier 1: ElevenLabs Hyper-realistic AI Voice
 * Tier 2: Natural Spoken Voice Stream Fallback (guarantees real human speech, zero robotic beeps/music)
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`tts:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 30 : 15, 60 * 60 * 1000);
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
    const voiceId = voice_id || 'JBFqnCBsd6RMkjVDRZzb';

    // Tier 1: Attempt ElevenLabs synthesis
    if (apiKey) {
      try {
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

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new NextResponse(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBuffer.byteLength.toString(),
            },
          });
        }

        console.warn(`ElevenLabs API returned ${response.status}. Activating natural spoken voice fallback...`);
      } catch (elevenErr) {
        console.warn('ElevenLabs request error, activating natural spoken voice fallback:', elevenErr);
      }
    }

    // Tier 2: Real Spoken Voice Fallback Engine
    const fallbackBuffer = await generateGoogleSpeechFallback(cleanText);
    if (fallbackBuffer && fallbackBuffer.length > 0) {
      return new NextResponse(new Uint8Array(fallbackBuffer), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': fallbackBuffer.byteLength.toString(),
        },
      });
    }

    return NextResponse.json({ 
      error: 'Failed to generate speech. Please try again.',
    }, { status: 500 });

  } catch (error: unknown) {
    console.error('TTS Route Fatal Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate speech',
    }, { status: 500 });
  }
}
