// tesseract.js v7 is CommonJS. Vite will pre-bundle it with CJS->ESM interop.
// After pre-bundling, the default export contains all named exports.
// We use dynamic import to handle this gracefully.

import type { Worker } from 'tesseract.js';
import type { ScreenshotRecord, IndexingProgress } from '../types';
import { generateThumbnail, computeFileHash, hashToId, isSupportedImage, downscaleForOCR } from './imageUtils';
import { extractTags, detectCategory, cleanOcrText } from './tagger';
import {
  upsertScreenshot,
  deleteScreenshotById,
  getAllScreenshots,
} from './db';

const BATCH_SIZE = 2; // Process 2 images in parallel

export type ProgressCallback = (progress: IndexingProgress) => void;

let ocrWorker: Worker | null = null;

async function getTesseractCreateWorker() {
  // Dynamic import ensures Vite pre-bundles tesseract.js first
  const mod = await import('tesseract.js');
  // Vite CJS interop: named exports available on default or directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createWorker = (mod as any).createWorker ?? (mod as any).default?.createWorker;
  if (!createWorker) throw new Error('tesseract.js createWorker not found');
  return createWorker;
}

async function getOCRWorker(): Promise<Worker> {
  if (!ocrWorker) {
    const createWorker = await getTesseractCreateWorker();
    ocrWorker = await createWorker('eng', 1, {
      logger: () => {}, // suppress verbose logs
    });
  }
  return ocrWorker!;
}

export async function terminateOCRWorker(): Promise<void> {
  if (ocrWorker) {
    await ocrWorker.terminate();
    ocrWorker = null;
  }
}

async function processOneFile(
  file: File,
  worker: Worker
): Promise<ScreenshotRecord> {
  const fileHash = computeFileHash(file);
  const id = hashToId(fileHash);

  // Generate thumbnail
  const thumbnail = await generateThumbnail(file, 400);

  // Downscale for OCR
  let ocrText = '';
  try {
    const blob = await downscaleForOCR(file, 1200);
    const { data } = await worker.recognize(blob as Blob);
    ocrText = cleanOcrText(data.text);
  } catch (_e) {
    ocrText = '';
  }

  const tags = extractTags(ocrText, file.name);
  const category = detectCategory(ocrText, file.name, tags);

  const record: ScreenshotRecord = {
    id,
    filename: file.name,
    ocrText,
    tags,
    category,
    createdAt: file.lastModified || Date.now(),
    indexedAt: Date.now(),
    thumbnail,
    status: 'completed',
    fileSize: file.size,
    fileHash,
  };

  return record;
}

export async function indexFolder(
  files: File[],
  onProgress: ProgressCallback,
  signal?: AbortSignal
): Promise<{ indexed: number; skipped: number; failed: number }> {
  const supported = files.filter(f => isSupportedImage(f.name));

  const existingRecords = await getAllScreenshots();
  const existingHashes = new Map(existingRecords.map(r => [r.fileHash, r]));
  const seenHashes = new Set<string>();

  const newFiles: File[] = [];
  let alreadyIndexed = 0;

  for (const file of supported) {
    const hash = computeFileHash(file);
    seenHashes.add(hash);
    if (existingHashes.has(hash)) {
      alreadyIndexed++;
    } else {
      newFiles.push(file);
    }
  }

  // Remove stale records
  for (const [hash, record] of existingHashes) {
    if (!seenHashes.has(hash)) {
      await deleteScreenshotById(record.id);
    }
  }

  const total = newFiles.length;
  let processed = 0;
  let failed = 0;

  onProgress({
    total,
    processed: 0,
    currentFile: '',
    alreadyIndexed,
    failed: 0,
    phase: total === 0 ? 'done' : 'scanning',
  });

  if (total === 0) {
    return { indexed: 0, skipped: alreadyIndexed, failed: 0 };
  }

  const worker = await getOCRWorker();

  onProgress({
    total,
    processed: 0,
    currentFile: newFiles[0]?.name ?? '',
    alreadyIndexed,
    failed: 0,
    phase: 'ocr',
  });

  for (let i = 0; i < newFiles.length; i += BATCH_SIZE) {
    if (signal?.aborted) break;

    const batch = newFiles.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(file => processOneFile(file, worker))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === 'fulfilled') {
        await upsertScreenshot(result.value);
        processed++;
      } else {
        failed++;
        processed++;
        const file = batch[j];
        const hash = computeFileHash(file);
        const id = hashToId(hash);
        await upsertScreenshot({
          id,
          filename: file.name,
          ocrText: '',
          tags: [],
          category: 'Other',
          createdAt: file.lastModified || Date.now(),
          indexedAt: Date.now(),
          thumbnail: '',
          status: 'failed',
          fileSize: file.size,
          fileHash: hash,
          errorMessage: String(result.reason),
        });
      }

      const nextIdx = i + j + 1;
      onProgress({
        total,
        processed,
        currentFile: newFiles[nextIdx]?.name ?? '',
        alreadyIndexed,
        failed,
        phase: processed >= total ? 'done' : 'ocr',
      });

      await new Promise(r => setTimeout(r, 0));
    }
  }

  return { indexed: processed - failed, skipped: alreadyIndexed, failed };
}

export async function detectNewFiles(files: File[]): Promise<File[]> {
  const supported = files.filter(f => isSupportedImage(f.name));
  const existing = await getAllScreenshots();
  const existingHashes = new Set(existing.map(r => r.fileHash));
  return supported.filter(f => !existingHashes.has(computeFileHash(f)));
}
