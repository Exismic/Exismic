const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function readEnvFile(path) {
  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
      })
  );
}

async function main() {
  const env = readEnvFile(".env.local");
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { count, error } = await supabase.from("support_agents").select("id", { count: "exact", head: true });
  console.log(JSON.stringify({ ok: !error, count: count ?? 0, code: error?.code ?? null, message: error?.message ?? null }));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error.message }));
  process.exit(1);
});
