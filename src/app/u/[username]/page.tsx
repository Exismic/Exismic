import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { UserProfileClient } from "./UserProfileClient";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: username, mode: 'insensitive' } },
        { id: username }
      ]
    }
  });

  if (!user) {
    return { title: "User Not Found" };
  }

  return {
    title: `${user.name || user.username} | Profile`,
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: username, mode: 'insensitive' } },
        { id: username } // Fallback to ID if username is used as fallback
      ]
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      customAvatarUrl: true,
      plan: true,
      createdAt: true,
      avatarFrame: true,
      nameGradient: true,
      email: true,
    }
  });

  if (!user) {
    notFound();
  }

  return <UserProfileClient user={user} />;
}
