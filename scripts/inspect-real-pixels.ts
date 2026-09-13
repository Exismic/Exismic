import sharp from 'sharp';

async function main() {
  const { data, info } = await sharp('v17-diagnosis-artifact/real-user-test-raw.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  function getPixel(x: number, y: number) {
    const idx = (y * 64 + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3],
      hex: '#' + [data[idx], data[idx + 1], data[idx + 2]].map(v => v.toString(16).padStart(2, '0')).join(''),
    };
  }

  console.log('--- Head Overlay (Right / Left ears where headphones should be) ---');
  // Minecraft Head Overlay Right: (32, 8) to (39, 15)
  // Front: (40, 8) to (47, 15)
  // Left: (48, 8) to (55, 15)
  let cyanHeadCount = 0;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 64; x++) {
      const p = getPixel(x, y);
      if (p.a > 0 && p.g > 150 && p.b > 150 && p.r < 100) {
        cyanHeadCount++;
        console.log(`Cyan pixel at (${x}, ${y}): ${p.hex}`);
      }
    }
  }
  console.log(`Total cyan pixels in top 16 rows: ${cyanHeadCount}`);

  console.log('\n--- Torso Base (20, 20) to (27, 31) ---');
  for (let y = 20; y < 32; y++) {
    let row = `y=${y}: `;
    for (let x = 20; x < 28; x++) {
      const p = getPixel(x, y);
      row += p.hex + ' ';
    }
    console.log(row);
  }

  console.log('\n--- Torso Overlay (20, 36) to (27, 47) ---');
  for (let y = 36; y < 48; y++) {
    let row = `y=${y}: `;
    for (let x = 20; x < 28; x++) {
      const p = getPixel(x, y);
      row += (p.a === 0 ? '  trans   ' : p.hex) + ' ';
    }
    console.log(row);
  }

  console.log('\n--- Right Leg Lateral Overlay (0, 36) to (3, 47) ---');
  for (let y = 36; y < 48; y++) {
    let row = `y=${y}: `;
    for (let x = 0; x < 4; x++) {
      const p = getPixel(x, y);
      row += (p.a === 0 ? 'trans ' : p.hex) + ' ';
    }
    console.log(row);
  }
}

main().catch(console.error);
