import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../src/lib/prisma';

async function main() {
  const file = await prisma.userFile.findUnique({
    where: { id: 'cmtvj8ilq0003jz04bjbqn4nb' },
  });

  if (!file || !file.resultUrl) {
    console.error('File not found or no resultUrl');
    return;
  }

  console.log('Record cmtvj8ilq0003jz04bjbqn4nb:');
  console.log('Prompt:', file.originalUrl);
  console.log('Metadata:', JSON.stringify(file.metadata, null, 2));

  const res = await fetch(file.resultUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const outDir = path.join(process.cwd(), 'v17-diagnosis-artifact');
  const rawPath = path.join(outDir, 'cyberpunk-test-raw.png');
  fs.writeFileSync(rawPath, buffer);

  const zoomPath = path.join(outDir, 'cyberpunk-test-8x.png');
  await sharp(buffer)
    .resize(512, 512, { kernel: sharp.kernel.nearest })
    .png()
    .toFile(zoomPath);
  console.log('Saved cyberpunk 8x zoom to:', zoomPath);
}

main().catch(console.error).finally(() => prisma.$disconnect());
