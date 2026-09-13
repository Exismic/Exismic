import { prisma } from '../src/lib/prisma';

async function main() {
  const files = await prisma.userFile.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  console.log(`Found ${files.length} records:`);
  for (const f of files) {
    console.log('==================================================');
    console.log('ID:', f.id);
    console.log('CreatedAt:', f.createdAt);
    console.log('OriginalName:', f.originalName);
    console.log('OriginalUrl (Prompt):', f.originalUrl);
    console.log('Metadata:', JSON.stringify(f.metadata, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
