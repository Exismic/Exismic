import sharp from 'sharp';

async function main() {
  const { data } = await sharp('v17-diagnosis-artifact/real-user-test-raw.png')
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

  console.log('--- Right Arm Front Base (44, 20) to (47, 31) ---');
  for (let y = 20; y < 32; y++) {
    let row = `y=${y}: `;
    for (let x = 44; x < 48; x++) {
      row += getPixel(x, y).hex + ' ';
    }
    console.log(row);
  }

  console.log('\n--- Right Arm Front Overlay (44, 36) to (47, 47) ---');
  for (let y = 36; y < 48; y++) {
    let row = `y=${y}: `;
    for (let x = 44; x < 48; x++) {
      const p = getPixel(x, y);
      row += (p.a === 0 ? 'trans   ' : p.hex) + ' ';
    }
    console.log(row);
  }
}

main().catch(console.error);
