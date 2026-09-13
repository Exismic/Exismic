import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../src/lib/prisma';

async function main() {
  const file = await prisma.userFile.findUnique({
    where: { id: 'cmtvjb0q90009jz04pfox6d5s' },
  });

  if (!file || !file.resultUrl) {
    console.error('File not found or no resultUrl');
    return;
  }

  console.log('Fetching PNG from:', file.resultUrl);
  const res = await fetch(file.resultUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const outDir = path.join(process.cwd(), 'v17-diagnosis-artifact');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const rawPath = path.join(outDir, 'real-user-test-raw.png');
  fs.writeFileSync(rawPath, buffer);
  console.log('Saved raw PNG to:', rawPath);

  // Upscale for human inspection
  const zoomPath = path.join(outDir, 'real-user-test-8x.png');
  await sharp(buffer)
    .resize(512, 512, { kernel: sharp.kernel.nearest })
    .png()
    .toFile(zoomPath);
  console.log('Saved 8x zoom PNG to:', zoomPath);

  // Also inspect metadata
  fs.writeFileSync(
    path.join(outDir, 'real-user-test-metadata.json'),
    JSON.stringify(file, null, 2)
  );
  console.log('Metadata saved.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
