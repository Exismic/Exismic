import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || "").trim();

    if (!username || !/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
      return NextResponse.json(
        { success: false, error: "Invalid Minecraft username. Please enter 1-16 letters, numbers, or underscores." },
        { status: 400 }
      );
    }

    let skinUrl: string | null = null;
    let armModel: "classic" | "slim" = "classic";
    let uuid: string | null = null;

    // 1. Try Mojang official Session API for full precision & model type
    try {
      const mojangProfileRes = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
        { signal: AbortSignal.timeout(4000) }
      );

      if (mojangProfileRes.ok) {
        const profileData = await mojangProfileRes.json();
        uuid = profileData.id;

        if (uuid) {
          const sessionRes = await fetch(
            `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
            { signal: AbortSignal.timeout(4000) }
          );

          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            const textureProp = sessionData.properties?.find(
              (p: { name: string; value: string }) => p.name === "textures"
            );

            if (textureProp?.value) {
              const decodedJson = Buffer.from(textureProp.value, "base64").toString("utf-8");
              const parsedTextures = JSON.parse(decodedJson);
              if (parsedTextures.textures?.SKIN?.url) {
                skinUrl = parsedTextures.textures.SKIN.url;
                if (parsedTextures.textures.SKIN.metadata?.model === "slim") {
                  armModel = "slim";
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("[Minecraft Skin Importer] Mojang API fallback triggered:", err);
    }

    // 2. High-speed Fallback via Minotar CDN if Mojang was rate-limited or unreachable
    if (!skinUrl) {
      skinUrl = `https://minotar.net/skin/${encodeURIComponent(username)}`;
    }

    // 3. Fetch image buffer to return as base64 dataUrl (guaranteeing instant client rendering without CORS)
    const imgRes = await fetch(skinUrl, { signal: AbortSignal.timeout(6000) });
    if (!imgRes.ok) {
      return NextResponse.json(
        { success: false, error: `Could not find a Minecraft skin for player "${username}".` },
        { status: 404 }
      );
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      username,
      uuid,
      skinUrl,
      dataUrl,
      armModel,
    });
  } catch (error) {
    console.error("[Minecraft Skin Fetch Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Minecraft player skin. Please try again." },
      { status: 500 }
    );
  }
}
