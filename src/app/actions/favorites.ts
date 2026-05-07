"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(toolId: string) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: "You must be logged in to favorite tools." };
  }

  const userId = session.user.id;

  // Check if already favorited
  const { data: existing } = await supabase
    .from('Favorite')
    .select('id')
    .eq('userId', userId)
    .eq('toolId', toolId)
    .single();

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('Favorite')
      .delete()
      .eq('userId', userId)
      .eq('toolId', toolId);
    
    if (error) return { error: error.message };
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('Favorite')
      .insert([{ userId, toolId }]);
    
    if (error) return { error: error.message };
  }

  revalidatePath('/favorites');
  revalidatePath('/'); // Revalidate dashboard
  return { success: true, isFavorited: !existing };
}

export async function getFavorites() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data } = await supabase
    .from('Favorite')
    .select('toolId')
    .eq('userId', session.user.id);

  return data?.map(f => f.toolId) || [];
}
