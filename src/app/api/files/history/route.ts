import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET recent history
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const history = await prisma.userFile.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[HISTORY_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST new history record
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      toolType, 
      originalName, 
      originalUrl, 
      resultUrl, 
      fileType, 
      status, 
      metadata 
    } = body;

    if (!toolType || !originalName || !fileType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newFile = await prisma.userFile.create({
      data: {
        userId: session.user.id,
        toolType,
        originalName,
        originalUrl,
        resultUrl,
        fileType,
        status: status || "completed",
        metadata: metadata || null,
      },
    });

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("[HISTORY_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
