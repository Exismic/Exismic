export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;

  const admins = getAdminEmails();
  return admins.includes(normalized);
}

export function getAdminAccessMode() {
  const admins = getAdminEmails();
  if (admins.length > 0) return "restricted";
  return "locked";
}

export function isAdminConfigured() {
  return getAdminEmails().length > 0;
}
