import { prisma } from '../src/lib/prisma';

async function main() {
  const file = await prisma.userFile.findUnique({
    where: { id: 'cmtvjb0q90009jz04pfox6d5s' },
  });

  console.log('RECORD cmtvjb0q90009jz04pfox6d5s:');
  console.log(JSON.stringify(file, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
