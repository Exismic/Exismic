import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

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

  const hasAdminRole = dbUser?.role === "admin";
  const hasAdminEmail = isAdminEmail(authUser.email) || isAdminEmail(dbUser?.email);

  if (!hasAdminRole && !hasAdminEmail) {
    return { error: "Forbidden", status: 403, user: null };
  }

  return { error: null, status: 200, user: dbUser || { id: authUser.id, role: "admin", email: authUser.email, name: authUser.user_metadata?.full_name || null } };
}
