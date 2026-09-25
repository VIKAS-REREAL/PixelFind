export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type QualityMode = 'low' | 'mid' | 'high';

export interface QualitySettings {
  mode: QualityMode;
  /** Max px on longest side sent to Tesseract (0 = original full res) */
  ocrMaxPx: number;
  /** Max px for thumbnail */
  thumbnailPx: number;
  /** JPEG quality 0-1 for thumbnail */
  thumbnailQuality: number;
  /** Number of images processed in parallel */
  batchSize: number;
  /** Approx seconds per image for time estimate */
  secPerImage: number;
  label: string;
  description: string;
  timeLabel: string;
}

export const QUALITY_PRESETS: Record<QualityMode, QualitySettings> = {
  low: {
    mode: 'low',
    ocrMaxPx: 1400,
    thumbnailPx: 800,
    thumbnailQuality: 0.85,
    batchSize: 3,
    secPerImage: 2,
    label: 'Fast',
    description: 'Fast indexing with standard OCR. Best for large collections (100+ images).',
    timeLabel: '~2s per image',
  },
  mid: {
    mode: 'mid',
    ocrMaxPx: 2560,
    thumbnailPx: 1200,
    thumbnailQuality: 0.90,
    batchSize: 2,
    secPerImage: 4.5,
    label: 'Balanced',
    description: 'Crisp previews & sharp text recognition. Recommended for most collections.',
    timeLabel: '~4-5s per image',
  },
  high: {
    mode: 'high',
    ocrMaxPx: 0,   // 0 = full resolution original bytes, zero downsampling
    thumbnailPx: 1600,
    thumbnailQuality: 0.95,
    batchSize: 1,
    secPerImage: 9,
    label: 'Maximum Quality',
    description: 'Full-resolution OCR — reads every character, small code, and faint text with peak accuracy.',
    timeLabel: '~8-10s per image',
  },
};

export type Category =
  | 'Programming'
  | 'Education'
  | 'Project'
  | 'Design'
  | 'Website'
  | 'Error'
  | 'Other';

export interface ScreenshotRecord {
  id: string;
  filename: string;
  ocrText: string;
  tags: string[];
  category: Category;
  createdAt: number;      // file last modified timestamp (ms)
  indexedAt: number;      // when we indexed it (ms)
  thumbnail: string;      // base64 data URL
  status: ProcessingStatus;
  fileSize: number;
  fileHash: string;       // size+lastModified combo (fast pseudo-hash)
  errorMessage?: string;
}

export interface ScanStats {
  total: number;
  newFiles: number;
  alreadyIndexed: number;
  failed: number;
  lastScanAt: number | null;
}

export interface SearchResult {
  record: ScreenshotRecord;
  score: number;
  matchedFields: string[];
}

export interface AppSettings {
  folderName: string | null;
  smartSearchEnabled: boolean;
  lastScanAt: number | null;
  qualityMode: QualityMode;
}

export interface IndexingProgress {
  total: number;
  processed: number;
  currentFile: string;
  alreadyIndexed: number;
  failed: number;
  phase: 'scanning' | 'ocr' | 'done' | 'idle';
}
