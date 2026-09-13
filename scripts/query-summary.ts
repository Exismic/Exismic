import { prisma } from '../src/lib/prisma';

async function main() {
  const files = await prisma.userFile.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    select: {
      id: true,
      createdAt: true,
      originalUrl: true,
      resultUrl: true,
      metadata: true,
    }
  });

  console.log(`Top ${files.length} records:`);
  for (const f of files) {
    const meta: any = f.metadata || {};
    console.log(`${f.createdAt.toISOString()} | ID: ${f.id} | Prompt: "${f.originalUrl}" | Action: ${meta.action} | Renderer: ${meta.renderer} | Hair: ${meta.design?.hairSilhouette} | FacialHair: ${meta.design?.facialHair} | Garment: ${meta.design?.garmentType} | Top: ${meta.design?.palette?.top}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
