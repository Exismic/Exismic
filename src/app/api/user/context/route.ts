import { publicJson } from "@/lib/public-json";
import { createClient } from "@/utils/supabase/server";
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user-access';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser) return publicJson({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser(sbUser);
    if (!user) return publicJson({ context: null });

    const context = await prisma.userContext.findUnique({
      where: { userId: user.id }
    });

    return publicJson({
      context: context,
      activeProject: context?.activeProject || "Untitled"
    });
  } catch (error) {
    return publicJson({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser) return publicJson({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { preferences, memories, activeProject, recentFiles } = body;

    const user = await getOrCreateUser(sbUser);

    const context = await prisma.userContext.upsert({
      where: { userId: user.id },
      update: {
        preferences,
        memories,
        activeProject,
        recentFiles,
        lastUpdated: new Date()
      },
      create: {
        userId: user.id,
        preferences,
        memories,
        activeProject,
        recentFiles
      }
    });

    return publicJson({ success: true, context });
  } catch (error) {
    return publicJson({ error: "Failed" }, { status: 500 });
  }
}
