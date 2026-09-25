import type { QualitySettings } from '../types';

/**
 * Generate a thumbnail from a File object using quality settings.
 * Uses high-quality smoothing for sharp, readable thumbnails.
 */
export async function generateThumbnail(
  file: File,
  quality: Pick<QualitySettings, 'thumbnailPx' | 'thumbnailQuality'>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const maxSize = quality.thumbnailPx;
      const ratio = Math.min(maxSize / width, maxSize / height, 1);
      const w = Math.round(width * ratio);
      const h = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Always use high-quality smoothing for thumbnails
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality.thumbnailQuality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = url;
  });
}

/**
 * Prepare image blob for Tesseract OCR based on quality mode.
 *
 * Low  → resize to 1400px (fast, optimal for 100+ images)
 * Mid  → resize to 2560px (covers 1080p and 1440p fully without any loss)
 * High → original resolution, zero downsampling
 *
 * For dark mode screenshots (common in code editors, IDEs, terminals):
 * Tesseract accuracy jumps 3-5x on black text on white background.
 * We detect average background luminance and invert colors if dark (<115),
 * ensuring maximum extracted text accuracy.
 */
export async function prepareForOCR(
  file: File,
  quality: Pick<QualitySettings, 'ocrMaxPx'>
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;

      let w = width;
      let h = height;
      if (quality.ocrMaxPx > 0) {
        const ratio = Math.min(quality.ocrMaxPx / width, quality.ocrMaxPx / height, 1);
        w = Math.round(width * ratio);
        h = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      try {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const totalPixels = w * h;

        // Sample luminance across pixels efficiently
        let totalLuma = 0;
        const step = Math.max(1, Math.floor(totalPixels / 10000));
        let sampleCount = 0;

        for (let i = 0; i < data.length; i += 4 * step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalLuma += 0.299 * r + 0.587 * g + 0.114 * b;
          sampleCount++;
        }

        const avgLuma = sampleCount > 0 ? totalLuma / sampleCount : 128;

        // If screenshot is dark mode (dark background < 115), invert colors for Tesseract
        if (avgLuma < 115) {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];         // R
            data[i + 1] = 255 - data[i + 1]; // G
            data[i + 2] = 255 - data[i + 2]; // B
          }
          ctx.putImageData(imageData, 0, 0);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          'image/png',
          1.0
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
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
 * Generate a stable id from a file hash string (djb2).
 */
export function hashToId(hash: string): string {
  let h = 5381;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) + h) ^ hash.charCodeAt(i);
    h = h >>> 0;
  }
  return `ss_${h.toString(36)}_${hash.length.toString(36)}`;
}

export const SUPPORTED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

export function isSupportedImage(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return SUPPORTED_EXTENSIONS.has(ext);
}

/** Format seconds into human-readable time string */
export function formatEstimatedTime(totalSeconds: number): string {
  if (totalSeconds < 60) return `~${Math.round(totalSeconds)}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  if (secs === 0) return `~${mins}m`;
  return `~${mins}m ${secs}s`;
}
