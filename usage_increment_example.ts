/**
 * EXAMPLE: Incrementing AI Usage in Toolverse
 * 
 * You should call this logic whenever a user successfully runs an AI-powered tool.
 * Since we are using Prisma for the backend and Supabase for realtime UI updates,
 * updating the record via Prisma will automatically trigger the Postgres realtime 
 * event that our UserMenu component is listening to.
 */

import { prisma } from "@/lib/prisma"; // Assuming you have a prisma client instance

export async function incrementAiUsage(userId: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        aiGenerationsUsed: {
          increment: 1,
        },
      },
      select: {
        aiGenerationsUsed: true,
        aiGenerationsLimit: true,
      }
    });

    // Check if user has exceeded limit
    if (updatedUser.aiGenerationsUsed > updatedUser.aiGenerationsLimit) {
      console.warn(`User ${userId} has exceeded their AI generation limit.`);
      // You might want to handle this (e.g., return an error or block the tool)
    }

    return updatedUser;
  } catch (error) {
    console.error("Failed to increment AI usage:", error);
    throw error;
  }
}

/**
 * USAGE IN AN API ROUTE (Next.js App Router)
 */
/*
export async function POST(req: Request) {
  const session = await auth(); // Get current session
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  // 1. Run the AI Tool logic...
  // ...

  // 2. Increment usage
  await incrementAiUsage(session.user.id);

  return Response.json({ success: true });
}
*/
