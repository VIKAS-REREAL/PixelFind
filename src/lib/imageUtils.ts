/**
 * Generate a thumbnail from a File object.
 * Downscales the image to maxSize on the longest side, returns base64 JPEG.
 */
export async function generateThumbnail(
  file: File,
  maxSize = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxSize / width, maxSize / height, 1);
      const w = Math.round(width * ratio);
      const h = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = url;
  });
}

/**
 * Compute a lightweight pseudo-hash from file metadata.
 * Fast — no need to read full file bytes.
 */
export function computeFileHash(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

/**
 * Generate a stable UUID-like id from a file hash string.
 */
export function hashToId(hash: string): string {
  // Simple djb2-based hash
  let h = 5381;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) + h) ^ hash.charCodeAt(i);
    h = h >>> 0; // ensure unsigned 32-bit
  }
  return `ss_${h.toString(36)}_${hash.length.toString(36)}`;
}

/**
 * Downscale image File for faster OCR (max 1200px on longest side).
 * Returns a Blob suitable for Tesseract.
 */
export async function downscaleForOCR(file: File, maxPx = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxPx / width, maxPx / height, 1);

      if (ratio >= 1) {
        // No scaling needed
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }

      const w = Math.round(width * ratio);
      const h = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      URL.revokeObjectURL(url);
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob returned null'));
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export const SUPPORTED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

export function isSupportedImage(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return SUPPORTED_EXTENSIONS.has(ext);
}
