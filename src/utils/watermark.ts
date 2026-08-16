/**
 * Exismic Watermark & Export Quality Engine
 * Applies sleek brand watermarks to free user exports while granting clean, 
 * unbranded, commercial exports to Pro Studio subscribers.
 */

export interface WatermarkOptions {
  brandText?: string;
  brandSubtext?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  opacity?: number;
}

/**
 * Loads an image URL/blob into an HTMLImageElement safely
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for watermarking'));
    img.src = src;
  });
}

/**
 * Applies a subtle, high-end glassmorphic Exismic badge to an image canvas
 */
export async function stampWatermarkOnImage(
  imageSource: string | Blob,
  options: WatermarkOptions = {}
): Promise<Blob> {
  let sourceUrl = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);

  try {
    const img = await loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');

    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Responsive badge sizing based on image dimensions
    const minDimension = Math.min(canvas.width, canvas.height);
    const scale = Math.max(0.6, Math.min(minDimension / 1000, 1.8));

    const badgeWidth = 175 * scale;
    const badgeHeight = 44 * scale;
    const margin = 24 * scale;
    const borderRadius = 12 * scale;

    // Calculate badge position (default: bottom-right)
    const badgeX = canvas.width - badgeWidth - margin;
    const badgeY = canvas.height - badgeHeight - margin;

    // Draw glassmorphic badge background
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, borderRadius);
    ctx.fillStyle = 'rgba(10, 12, 20, 0.82)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12 * scale;
    ctx.fill();

    // Draw subtle glowing border
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.stroke();

    // Draw Brand Icon (Lightning Hexagon)
    const iconSize = 22 * scale;
    const iconX = badgeX + 14 * scale;
    const iconY = badgeY + (badgeHeight - iconSize) / 2;

    ctx.beginPath();
    ctx.roundRect(iconX, iconY, iconSize, iconSize, 6 * scale);
    const grad = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
    grad.addColorStop(0, '#8B5CF6');
    grad.addColorStop(1, '#06B6D4');
    ctx.fillStyle = grad;
    ctx.fill();

    // Icon glyph (⚡)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${13 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', iconX + iconSize / 2, iconY + iconSize / 2 + 1);

    // Brand Name Text
    const textX = iconX + iconSize + 10 * scale;
    const textY = badgeY + badgeHeight / 2 - 2 * scale;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${13 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('exismic.xyz', textX, textY);

    // Subtext Tag
    ctx.fillStyle = '#A78BFA';
    ctx.font = `700 ${8 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('AI STUDIO', textX, textY + 12 * scale);

    ctx.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/png',
        0.95
      );
    });
  } finally {
    if (typeof imageSource !== 'string') {
      URL.revokeObjectURL(sourceUrl);
    }
  }
}

/**
 * Universal safe downloader that honors Pro status
 */
export async function downloadWithBrandPolicy({
  imageUrl,
  imageBlob,
  fileName,
  isPro,
}: {
  imageUrl?: string;
  imageBlob?: Blob;
  fileName?: string;
  isPro: boolean;
}): Promise<void> {
  let finalBlob: Blob;

  if (imageBlob) {
    finalBlob = isPro ? imageBlob : await stampWatermarkOnImage(imageBlob);
  } else if (imageUrl) {
    if (isPro) {
      // Direct clean download
      const res = await fetch(imageUrl);
      finalBlob = await res.blob();
    } else {
      // Watermarked export for free tier
      finalBlob = await stampWatermarkOnImage(imageUrl);
    }
  } else {
    throw new Error('No image provided for download');
  }

  const cleanName = fileName || `exismic-${Date.now()}.png`;
  const blobUrl = window.URL.createObjectURL(finalBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = cleanName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
