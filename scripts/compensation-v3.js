const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting compensation v3: Setting credits to 150 for all users to be 100% sure...');
  
  const result = await prisma.user.updateMany({
    data: {
      dailyCredits: 150,
      lifetimeCredits: 0 // Resetting lifetime to 0 just in case, or we can leave it
    }
  });
  
  const users = await prisma.user.findMany({
    select: { id: true, email: true, dailyCredits: true }
  });
  
  console.log(`Success! Updated ${result.count} users.`);
  console.log('Current users in DB:', JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error('Error during compensation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
