import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "Unauthorized", status: 401, user: null };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, role: true, email: true, name: true },
  });

  if (!dbUser || dbUser.role !== "admin") {
    return { error: "Forbidden", status: 403, user: null };
  }

  return { error: null, status: 200, user: dbUser };
}
