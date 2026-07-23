const { Jimp } = require('jimp');
const path = require('path');

const srcPath = path.join(__dirname, '../public/generations/sandbox_original.png');
const destPath = path.join(__dirname, '../public/generations/sandbox_cutout.png');

console.log("Reading:", srcPath);

Jimp.read(srcPath)
  .then(img => {
    const width = img.bitmap.width;
    const height = img.bitmap.height;

    // Helper to convert RGB to HSL
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      h = h * 360;
      if (h > 180) h -= 360; // Normalize hue to [-180, 180] around red (0)

      return { h, s: s * 100, l: l * 100 };
    }

    img.scan(0, 0, width, height, function (x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      
      const hsl = rgbToHsl(red, green, blue);
      
      // Saturated red chromakey filter
      if (hsl.h >= -15 && hsl.h <= 15 && hsl.s >= 55 && hsl.l >= 30 && hsl.l <= 70) {
        this.bitmap.data[idx + 3] = 0; // Transparent
      }
    });

    // Let's also do a tiny feather/edge softening around the cut boundary
    // by checking neighbors of transparent pixels and slightly reducing their alpha
    const data = img.bitmap.data;
    const getAlpha = (px, py) => {
      if (px < 0 || px >= width || py < 0 || py >= height) return 0;
      return data[(py * width + px) * 4 + 3];
    };

    img.scan(0, 0, width, height, function (x, y, idx) {
      if (this.bitmap.data[idx + 3] > 0) {
        // Check 4-neighborhood
        const a1 = getAlpha(x - 1, y);
        const a2 = getAlpha(x + 1, y);
        const a3 = getAlpha(x, y - 1);
        const a4 = getAlpha(x, y + 1);

        if (a1 === 0 || a2 === 0 || a3 === 0 || a4 === 0) {
          // It's a border pixel! Let's soften it.
          this.bitmap.data[idx + 3] = Math.floor(this.bitmap.data[idx + 3] * 0.4);
        }
      }
    });

    return img.write(destPath);
  })
  .then(() => {
    console.log("Successfully created cutout at:", destPath);
  })
  .catch(err => {
    console.error("Failed to key out green screen:", err);
  });
