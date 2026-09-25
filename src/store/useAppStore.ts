import { create } from 'zustand';
import type { ScreenshotRecord, IndexingProgress, Category, AppSettings } from '../types';
import type { SearchResult } from '../types';
import { getAllScreenshots, getSettings, saveSettings } from '../lib/db';

type AppView = 'welcome' | 'indexing' | 'library' | 'detail';

interface AppState {
  // View
  currentView: AppView;
  setView: (view: AppView) => void;

  // Settings / folder
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;

  // Folder handle (stored in memory, restored via IndexedDB opaque handle)
  folderHandle: FileSystemDirectoryHandle | null;
  setFolderHandle: (handle: FileSystemDirectoryHandle | null) => void;

  // Screenshots
  screenshots: ScreenshotRecord[];
  loadScreenshots: () => Promise<void>;

  // Indexing
  indexingProgress: IndexingProgress;
  setIndexingProgress: (p: IndexingProgress) => void;
  isIndexing: boolean;
  setIsIndexing: (v: boolean) => void;
  abortController: AbortController | null;
  setAbortController: (c: AbortController | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (r: SearchResult[]) => void;
  isSearchActive: boolean;
  setIsSearchActive: (v: boolean) => void;

  // Filters
  activeCategory: Category | 'All';
  setActiveCategory: (c: Category | 'All') => void;
  activeTag: string | null;
  setActiveTag: (t: string | null) => void;
  sortOrder: 'relevance' | 'newest' | 'oldest';
  setSortOrder: (s: 'relevance' | 'newest' | 'oldest') => void;

  // Detail
  selectedScreenshot: ScreenshotRecord | null;
  setSelectedScreenshot: (s: ScreenshotRecord | null) => void;

  // Toast
  toast: { message: string; type: 'info' | 'success' | 'error' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  clearToast: () => void;

  // New files badge
  newFilesCount: number;
  setNewFilesCount: (n: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'welcome',
  setView: (view) => set({ currentView: view }),

  settings: { folderName: null, smartSearchEnabled: false, lastScanAt: null },
  loadSettings: async () => {
    const s = await getSettings();
    set({ settings: s });
  },
  updateSettings: async (partial) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    await saveSettings(partial);
    set({ settings: updated });
  },

  folderHandle: null,
  setFolderHandle: (handle) => set({ folderHandle: handle }),

  screenshots: [],
  loadScreenshots: async () => {
    const all = await getAllScreenshots();
    set({ screenshots: all });
  },

  indexingProgress: {
    total: 0,
    processed: 0,
    currentFile: '',
    alreadyIndexed: 0,
    failed: 0,
    phase: 'idle',
  },
  setIndexingProgress: (p) => set({ indexingProgress: p }),
  isIndexing: false,
  setIsIndexing: (v) => set({ isIndexing: v }),
  abortController: null,
  setAbortController: (c) => set({ abortController: c }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchResults: [],
  setSearchResults: (r) => set({ searchResults: r }),
  isSearchActive: false,
  setIsSearchActive: (v) => set({ isSearchActive: v }),

  activeCategory: 'All',
  setActiveCategory: (c) => set({ activeCategory: c }),
  activeTag: null,
  setActiveTag: (t) => set({ activeTag: t }),
  sortOrder: 'relevance',
  setSortOrder: (s) => set({ sortOrder: s }),

  selectedScreenshot: null,
  setSelectedScreenshot: (s) => set({ selectedScreenshot: s }),

  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => set({ toast: null }),

  newFilesCount: 0,
  setNewFilesCount: (n) => set({ newFilesCount: n }),
}));
