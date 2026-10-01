"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";

export function FavoritesMigration() {
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const migrateFavorites = async () => {
      try {
        const raw1 = localStorage.getItem("exismic-favorites");
        const raw2 = localStorage.getItem("exismic_guest_favorites");
        if (!raw1 && !raw2) return;

        let favs: string[] = [];
        try {
          if (raw1) favs.push(...JSON.parse(raw1));
        } catch {}
        try {
          if (raw2) favs.push(...JSON.parse(raw2));
        } catch {}

        const uniqueFavs = Array.from(new Set(favs)).filter(Boolean);
        if (uniqueFavs.length === 0) return;

        // Check if user is authenticated first!
        const authCheck = await axios.get("/api/user/favorites", { validateStatus: () => true });
        if (!authCheck.data?.authenticated) {
          // Guest user: preserve guest favorites in localStorage, do not attempt server sync
          return;
        }

        if (isCancelled) return;
        setMigrating(true);

        const serverFavs: string[] = Array.isArray(authCheck.data?.favorites) ? authCheck.data.favorites : [];
        const toMigrate = uniqueFavs.filter((id) => !serverFavs.includes(id));

        for (const toolId of toMigrate) {
          try {
            await axios.post("/api/user/favorites", {
              toolId,
              action: "add",
            }, { validateStatus: () => true });
          } catch (e) {
            console.error(`Failed to migrate favorite ${toolId}:`, e);
          }
        }

        // Fetch refreshed server list
        const finalRes = await axios.get("/api/user/favorites", { validateStatus: () => true });
        const finalFavs = Array.isArray(finalRes.data?.favorites) ? finalRes.data.favorites : serverFavs;

        // Only clear migrated keys once user is authenticated and sync succeeded
        localStorage.removeItem("exismic-favorites");
        localStorage.removeItem("exismic_guest_favorites");

        // Broadcast to all listening components
        window.dispatchEvent(
          new CustomEvent(FAVORITES_CHANGED_EVENT, {
            detail: { favorites: finalFavs },
          })
        );
      } catch (err) {
        console.error("Migration error:", err);
      } finally {
        if (!isCancelled) {
          setMigrating(false);
        }
      }
    };

    void migrateFavorites();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!migrating) return null;

  return null;
}

