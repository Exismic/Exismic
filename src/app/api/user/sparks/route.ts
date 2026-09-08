import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserSparksData, redeemSparksShopItem } from "@/lib/sparks";
import { getOrCreateUser } from "@/lib/user-access";
import { SPARKS_SHOP_ITEMS } from "@/config/sparks-shop";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        profile: {
          sparks: 0,
          lifetimeSparks: 0,
          unlockedAvatarFrames: [],
          unlockedNameGradients: [],
          activeAvatarFrame: null,
          activeNameGradient: null,
          hasClaimedFreeSparks: false,
        },
        catalog: SPARKS_SHOP_ITEMS,
      });
    }

    const dbUser = await getOrCreateUser(user);
    const sparksProfile = await getUserSparksData(dbUser.id);

    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      profile: sparksProfile || {
        sparks: 0,
        lifetimeSparks: 0,
        unlockedAvatarFrames: [],
        unlockedNameGradients: [],
        activeAvatarFrame: null,
        activeNameGradient: null,
        hasClaimedFreeSparks: false,
      },
      catalog: SPARKS_SHOP_ITEMS,
    });
  } catch (err) {
    console.error("[API_SPARKS_GET]", err);
    return NextResponse.json({ error: "Failed to load Sparks profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const result = await redeemSparksShopItem(dbUser.id, itemId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Redemption failed" },
        { status: 400 }
      );
    }

    if (result.details?.equippedFrame) {
      await supabase.auth.updateUser({
        data: { avatar_frame: result.details.equippedFrame },
      });
    } else if (result.details?.equippedGradient) {
      await supabase.auth.updateUser({
        data: { name_gradient: result.details.equippedGradient },
      });
    } else if (result.item?.type === "pro_pass" && result.details?.newExpiresAt) {
      await supabase.auth.updateUser({
        data: {
          plan: "pro",
          plan_expires_at: result.details.newExpiresAt,
          subscription_status: "active_pass",
        },
      });
    }

    return NextResponse.json({
      success: true,
      item: result.item,
      remainingSparks: result.remainingSparks,
      details: result.details,
    });
  } catch (err) {
    console.error("[API_SPARKS_POST]", err);
    return NextResponse.json({ error: "Redemption error" }, { status: 500 });
  }
}
