import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    let sbUser = session?.user;
    if (!sbUser && process.env.NODE_ENV === 'development') {
      sbUser = { id: "dev-user-id", email: "dev@lumora.ai", name: "Lumora Creator" };
    }
    if (!sbUser || !sbUser.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await prisma.user.findUnique({ where: { email: sbUser.email } });
    if (!user) return NextResponse.json({ context: null });

    const context = await prisma.userContext.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json({ context });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    let sbUser = session?.user;
    if (!sbUser && process.env.NODE_ENV === 'development') {
      sbUser = { id: "dev-user-id", email: "dev@lumora.ai", name: "Lumora Creator" };
    }
    if (!sbUser || !sbUser.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await prisma.user.findUnique({ where: { email: sbUser.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { activeProject, recentFiles, preferences, memories } = await req.json();

    const context = await prisma.userContext.upsert({
      where: { userId: user.id },
      update: {
        activeProject,
        recentFiles,
        preferences,
        memories,
        lastUpdated: new Date()
      },
      create: {
        userId: user.id,
        activeProject,
        recentFiles,
        preferences,
        memories
      }
    });

    return NextResponse.json({ context });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
