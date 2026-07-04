const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

for (const file of [".env", ".env.local"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index <= 0 || line.startsWith("#")) continue;
    const key = line.slice(0, index);
    const value = line.slice(index + 1).replace(/^"|"$/g, "");
    process.env[key] ||= value;
  }
}

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    update public.support_agents
    set name = business_name || ' Support',
        updated_at = now()
    where name = 'Lumora Support'
    and coalesce(business_name, '') <> ''
    returning id, name, business_name
  `);
  console.log(JSON.stringify({ updated: rows.length, rows }));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
