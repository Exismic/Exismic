const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'public/exismic-app-icon.png';
const tempPath = 'public/exismic-app-icon-temp.png';

fs.createReadStream(imgPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        
        // If pixel is black or very dark
        if (r < 18 && g < 18 && b < 18) {
          // make it completely transparent
          this.data[idx+3] = 0; 
        }
      }
    }
    
    this.pack().pipe(fs.createWriteStream(tempPath))
      .on('finish', () => {
        fs.renameSync(tempPath, imgPath);
        console.log('Background removed!');
      });
  })
  .on('error', (err) => {
    console.error(err);
  });
