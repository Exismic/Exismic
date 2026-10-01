import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Profile decoration must never prevent the static journal content from rendering.
export const getBlogAuthor = cache(async () => {
  try {
    return await prisma.user.findFirst({
      where: { email: { equals: "syedrayangames@Gmail.com", mode: "insensitive" } },
      select: {
        id: true, name: true, username: true, image: true, customAvatarUrl: true,
        plan: true, avatarFrame: true, nameGradient: true,
      },
    });
  } catch {
    console.warn("Blog author profile unavailable; using the article's saved author details.");
    return null;
  }
});
