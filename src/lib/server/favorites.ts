import "server-only";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User as DatabaseUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function resolveFavoriteOwner(
  authUser: SupabaseUser,
  options: { create: true },
): Promise<DatabaseUser>;
export function resolveFavoriteOwner(
  authUser: SupabaseUser,
  options?: { create?: false },
): Promise<DatabaseUser | null>;
export async function resolveFavoriteOwner(
  authUser: SupabaseUser,
  options: { create?: boolean } = {},
): Promise<DatabaseUser | null> {
  const byId = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (byId) return byId;

  const email = authUser.email?.trim();
  if (email) {
    const byEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (byEmail) return byEmail;
  }

  if (!options.create) return null;

  return prisma.user.create({
    data: {
      id: authUser.id,
      email: email || null,
      name:
        typeof authUser.user_metadata?.full_name === "string"
          ? authUser.user_metadata.full_name
          : email?.split("@")[0] || "Exismic user",
      plan: "free",
    },
  });
}

export async function listFavoriteToolIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { toolId: true },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((favorite) => favorite.toolId);
}
