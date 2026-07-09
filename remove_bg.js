const Jimp = require('jimp');

Jimp.read('public/exismic-app-icon.png')
  .then(img => {
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      
      // If color is close to black
      if (red < 20 && green < 20 && blue < 20) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });
    return img.writeAsync('public/exismic-app-icon.png');
  })
  .then(() => {
    console.log("Background removed successfully.");
  })
  .catch(err => {
    console.error("Error processing image:", err);
  });
