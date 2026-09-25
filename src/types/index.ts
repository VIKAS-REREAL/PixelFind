export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

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
}

export interface IndexingProgress {
  total: number;
  processed: number;
  currentFile: string;
  alreadyIndexed: number;
  failed: number;
  phase: 'scanning' | 'ocr' | 'done' | 'idle';
}
