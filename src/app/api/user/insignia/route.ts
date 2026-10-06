import { publicJson } from "@/lib/public-json";
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { ALLOWED_INSIGNIAS, canUserUseInsignia } from '@/config/cosmetics-access';
import { getOrCreateUser } from '@/lib/user-access';

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.id || !user.email) {
      return publicJson({ error: 'Unauthorized' }, { status: 401 });
    }

    const { insigniaId } = await req.json();
    if (insigniaId !== null && insigniaId !== undefined && !ALLOWED_INSIGNIAS.has(insigniaId)) {
      return publicJson({ error: 'Invalid creator insignia.' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(user);
    if (insigniaId && !canUserUseInsignia(dbUser, insigniaId)) {
      return publicJson({ error: 'This Insignia is locked. Unlock it permanently with Sparks in Rewards, or access included Pro insignias.' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { insignia: insigniaId || null },
    });

    const { error: authError } = await supabaseServer.auth.updateUser({
      data: { insignia: insigniaId || null },
    });

    if (authError) {
      console.error('Insignia metadata update failed:', authError.message);
    }

    return publicJson({ success: true, insigniaId: insigniaId || null });
  } catch (error: unknown) {
    console.error('Insignia Update Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update insignia';
    return publicJson({ error: message }, { status: 500 });
  }
}
