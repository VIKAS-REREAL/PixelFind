import Dexie, { type Table } from 'dexie';
import type { ScreenshotRecord, AppSettings } from '../types';

export class PixelFindDB extends Dexie {
  screenshots!: Table<ScreenshotRecord, string>;
  settings!: Table<AppSettings & { id: number }, number>;

  constructor() {
    super('PixelFindDB');
    this.version(1).stores({
      screenshots: 'id, filename, category, createdAt, indexedAt, status, fileHash, *tags',
      settings: 'id',
    });
  }
}

export const db = new PixelFindDB();

// Settings helpers
export async function getSettings(): Promise<AppSettings> {
  const s = await db.settings.get(1);
  return s ?? { folderName: null, smartSearchEnabled: false, lastScanAt: null };
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<void> {
  const existing = await getSettings();
  await db.settings.put({ ...existing, ...partial, id: 1 });
}

// Screenshot helpers
export async function getAllScreenshots(): Promise<ScreenshotRecord[]> {
  return db.screenshots.orderBy('createdAt').reverse().toArray();
}

export async function getScreenshotById(id: string): Promise<ScreenshotRecord | undefined> {
  return db.screenshots.get(id);
}

export async function upsertScreenshot(record: ScreenshotRecord): Promise<void> {
  await db.screenshots.put(record);
}

export async function deleteScreenshotById(id: string): Promise<void> {
  await db.screenshots.delete(id);
}

export async function getScreenshotByHash(fileHash: string): Promise<ScreenshotRecord | undefined> {
  return db.screenshots.where('fileHash').equals(fileHash).first();
}

export async function clearAllScreenshots(): Promise<void> {
  await db.screenshots.clear();
}
