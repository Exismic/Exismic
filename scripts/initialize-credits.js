const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Force-add 50 credits to all registered users.
 * This is a one-time compensation script.
 */
async function addCompensationCredits() {
  console.log('--- Adding Compensation Credits (+50) ---');
  
  try {
    // We'll increment dailyCredits by 50 for everyone
    const result = await prisma.user.updateMany({
      data: {
        dailyCredits: {
          increment: 50
        }
      }
    });

    console.log(`Successfully added 50 credits to ${result.count} users.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCompensationCredits();
