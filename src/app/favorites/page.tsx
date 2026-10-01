import { createClient } from "@/utils/supabase/server";
import { isFavoriteToolId } from "@/lib/favorites";
import { listFavoriteToolIds, resolveFavoriteOwner } from "@/lib/server/favorites";
import { FavoritesClient } from "./FavoritesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your Favorites | Exismic Studio",
  description: "Quick access to your saved creative and productivity tools in Exismic Studio.",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialServerFavorites: string[] = [];

  if (user) {
    try {
      const owner = await resolveFavoriteOwner(user);
      if (owner) {
        initialServerFavorites = (await listFavoriteToolIds(owner.id)).filter(isFavoriteToolId);
      }
    } catch (e) {
      console.error("Favorites page server error:", e);
    }
  }

  return (
    <FavoritesClient
      initialServerFavorites={initialServerFavorites}
      isAuthenticated={Boolean(user)}
    />
  );
}
