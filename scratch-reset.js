const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetClaims() {
  await prisma.creditShopClaim.deleteMany({});
  console.log('All shop claims deleted.');
}

resetClaims().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
