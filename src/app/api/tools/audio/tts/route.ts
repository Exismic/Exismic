import { NextRequest, NextResponse } from 'next/server';

/**
 * ElevenLabs Text-to-Speech API Route
 */

export async function POST(req: NextRequest) {
  try {
    const { text, voice_id, settings } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'ElevenLabs API key is missing. Please add it to your .env file.' 
      }, { status: 503 });
    }

    const voiceId = voice_id || '21m00Tcm4TlvDq8ikWAM'; // Default: Rachel

    console.log(`Generating TTS with ElevenLabs for voice: ${voiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text,
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

  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate speech',
      details: error.message 
    }, { status: 500 });
  }
}
