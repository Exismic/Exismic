const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'User'
  `;
  console.log('Policies for User table:', result);
  
  const rlsStatus = await prisma.$queryRaw`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
    WHERE relname = 'User' AND nspname = 'public'
  `;
  console.log('RLS Status:', rlsStatus);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
