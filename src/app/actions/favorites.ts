"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeFavoriteToolId } from "@/lib/favorites";
import { listFavoriteToolIds, resolveFavoriteOwner } from "@/lib/server/favorites";

export async function toggleFavorite(toolId: string) {
  const canonicalToolId = normalizeFavoriteToolId(toolId);
  if (!canonicalToolId) {
    return { error: "This tool cannot be added to favorites." };
  }

  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to favorite tools." };
  }

  try {
    const owner = await resolveFavoriteOwner(user, { create: true });

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_toolId: {
          userId: owner.id,
          toolId: canonicalToolId,
        }
      }
    });

    if (existing) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: { userId: owner.id, toolId: canonicalToolId }
      });
    }

    revalidatePath('/favorites');
    revalidatePath('/'); // Revalidate dashboard
    return {
      success: true,
      isFavorited: !existing,
      favorites: await listFavoriteToolIds(owner.id),
    };
  } catch (error: unknown) {
    console.error("Favorites Action Error:", error);
    return { error: "Could not update favorites. Please try again." };
  }
}

export async function getFavorites() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const owner = await resolveFavoriteOwner(user);
    if (!owner) return [];
    return listFavoriteToolIds(owner.id);
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
}
