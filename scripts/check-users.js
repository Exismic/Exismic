const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countUsers() {
  try {
    const count = await prisma.user.count();
    const users = await prisma.user.findMany({
        take: 5,
        select: { email: true, dailyCredits: true, plan: true }
    });
    console.log(`Total users: ${count}`);
    console.log('Sample users:', users);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countUsers();
