const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting daily refill: Resetting credits to 50 for free users and 5000 for pro users...');
  
  const now = new Date();
  
  // Update free users
  const freeResult = await prisma.user.updateMany({
    where: {
      plan: 'free'
    },
    data: {
      dailyCredits: 50,
      creditsLastReset: now,
      aiMessagesToday: 0
    }
  });
  
  // Update pro users
  const proResult = await prisma.user.updateMany({
    where: {
      plan: 'pro'
    },
    data: {
      dailyCredits: 1000,
      creditsLastReset: now,
      aiMessagesToday: 0
    }
  });
  
  console.log(`Success! Refilled ${freeResult.count} free users and ${proResult.count} pro users.`);
}

main()
  .catch((e) => {
    console.error('Error during refill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
