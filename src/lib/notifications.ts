import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: 'success' | 'info' | 'warning' = 'info'
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
