"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(toolId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to favorite tools." };
  }

  const userId = user.id;

  try {
    // Ensure the user exists in Prisma db
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      await prisma.user.create({
        data: {
          id: userId,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
          plan: "free"
        }
      });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId
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
        data: { userId, toolId }
      });
    }

    revalidatePath('/favorites');
    revalidatePath('/'); // Revalidate dashboard
    return { success: true, isFavorited: !existing };
  } catch (error: any) {
    console.error("Favorites Action Error:", error);
    return { error: error.message };
  }
}

export async function getFavorites() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const data = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { toolId: true }
    });
    return data.map(f => f.toolId);
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
}
