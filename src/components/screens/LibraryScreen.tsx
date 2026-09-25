import React, { useMemo, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sidebar } from '../Sidebar';
import { SearchBar } from '../SearchBar';
import { ScreenshotCard } from '../ScreenshotCard';
import { CategoryChip } from '../ui/CategoryChip';
import { RefreshCw, FolderSearch, Bell, Images } from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import type { Category, ScreenshotRecord, SearchResult } from '../../types';
import { indexFolder } from '../../lib/indexer';
import { isSupportedImage } from '../../lib/imageUtils';

const CATEGORIES: (Category | 'All')[] = ['All', 'Programming', 'Education', 'Project', 'Design', 'Website', 'Error', 'Other'];

async function collectFilesFromHandle(handle: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];
  for await (const entry of (handle as any).values()) {
    if (entry.kind === 'file') {
      const file = await (entry as FileSystemFileHandle).getFile();
      if (isSupportedImage(file.name)) files.push(file);
    }
  }
  return files;
}

export function LibraryScreen() {
  const {
    screenshots,
    searchResults, isSearchActive,
    activeCategory,
    activeTag,
    sortOrder,
    settings,
    isIndexing, setIsIndexing,
    setIndexingProgress,
    loadScreenshots,
    showToast,
    updateSettings,
    folderHandle,
    newFilesCount,
    setView,
  } = useAppStore();

  // All tags sorted by frequency
  const allTagsList = useMemo(() => {
    const freq = new Map<string, number>();
    screenshots.forEach(s => s.tags.forEach(t => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [screenshots]);

  // Apply filters
  const filteredScreenshots = useMemo<ScreenshotRecord[]>(() => {
    let list = screenshots;

    if (activeTag === '__recent__') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter(s => s.createdAt >= cutoff);
    } else if (activeTag) {
      list = list.filter(s => s.tags.includes(activeTag));
    } else if (activeCategory !== 'All') {
      list = list.filter(s => s.category === activeCategory);
    }

    // Sort
    if (sortOrder === 'newest') list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    else if (sortOrder === 'oldest') list = [...list].sort((a, b) => a.createdAt - b.createdAt);

    return list;
  }, [screenshots, activeCategory, activeTag, sortOrder]);

  // Merge search results with filter
  const displayItems = useMemo(() => {
    if (!isSearchActive) return filteredScreenshots.map(r => ({ record: r, sr: undefined }));

    let results = searchResults;
    // Apply category/tag filter on top of search
    if (activeTag && activeTag !== '__recent__') {
      results = results.filter(r => r.record.tags.includes(activeTag!));
    } else if (activeCategory !== 'All') {
      results = results.filter(r => r.record.category === activeCategory);
    }

    // Sort
    if (sortOrder === 'newest') results = [...results].sort((a, b) => b.record.createdAt - a.record.createdAt);
    else if (sortOrder === 'oldest') results = [...results].sort((a, b) => a.record.createdAt - b.record.createdAt);
    // Default: relevance (Fuse already sorted by score)

    return results.map(r => ({ record: r.record, sr: r }));
  }, [isSearchActive, searchResults, filteredScreenshots, activeCategory, activeTag, sortOrder]);

  const handleRefresh = useCallback(async () => {
    if (!folderHandle) {
      showToast('No folder selected. Please select a folder first.', 'error');
      return;
    }
    if (isIndexing) return;

    // Re-request permission if needed
    let perm: PermissionState;
    try {
      perm = await (folderHandle as any).requestPermission({ mode: 'read' });
    } catch {
      perm = 'denied';
    }

    if (perm !== 'granted') {
      showToast('Permission denied. Please select the folder again.', 'error');
      setView('welcome');
      return;
    }

    setIsIndexing(true);
    showToast('Scanning for new screenshots…', 'info');

    try {
      const files = await collectFilesFromHandle(folderHandle);
      const abortController = new AbortController();
      useAppStore.getState().setAbortController(abortController);

      await indexFolder(
        files,
        (progress) => setIndexingProgress(progress),
        abortController.signal
      );
      await loadScreenshots();
      await updateSettings({ lastScanAt: Date.now() });
      showToast('Scan complete!', 'success');
    } catch {
      showToast('Refresh failed. Please try again.', 'error');
    } finally {
      setIsIndexing(false);
    }
  }, [folderHandle, isIndexing]);

  const hasResults = displayItems.length > 0;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar allTagsList={allTagsList} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <SearchBar allTags={allTagsList} />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
            <div className="flex items-center gap-3">
              <p className="text-sm text-text-secondary">
                {isSearchActive
                  ? <><span className="font-medium text-text-primary">{displayItems.length}</span> results for "<span className="font-medium text-accent">{useAppStore.getState().searchQuery}</span>"</>
                  : <><span className="font-medium text-text-primary">{displayItems.length}</span> screenshots</>
                }
              </p>

              {/* New files pill */}
              {newFilesCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700 font-medium">
                  <Bell size={11} />
                  {newFilesCount} new
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Last scan time */}
              {settings.lastScanAt && (
                <span className="text-xs text-text-secondary hidden md:inline">
                  Scanned {formatRelativeTime(settings.lastScanAt)}
                </span>
              )}

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isIndexing || !folderHandle}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  isIndexing
                    ? 'bg-accent-light text-accent border-accent/20 cursor-not-allowed'
                    : 'bg-bg border-border text-text-secondary hover:text-text-primary hover:border-accent/30'
                )}
              >
                <RefreshCw size={13} className={isIndexing ? 'animate-spin' : ''} />
                {isIndexing ? 'Scanning…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Category filter chips */}
          {!isSearchActive && (
            <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-border bg-surface/50">
              {CATEGORIES.map(cat => (
                <CategoryChip
                  key={cat}
                  category={cat}
                  active={activeCategory === cat && !activeTag}
                  onClick={() => {
                    useAppStore.getState().setActiveCategory(cat as Category | 'All');
                    useAppStore.getState().setActiveTag(null);
                  }}
                />
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="p-6">
            {!hasResults ? (
              <EmptyState isSearch={isSearchActive} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayItems.map(({ record, sr }) => (
                  <ScreenshotCard
                    key={record.id}
                    record={record}
                    searchResult={sr}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ isSearch }: { isSearch: boolean }) {
  const { setIsSearchActive, setSearchQuery, setSearchResults } = useAppStore();

  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <FolderSearch size={24} className="text-text-secondary" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-2">No screenshots matched</h3>
        <p className="text-sm text-text-secondary mb-6 max-w-xs">
          Try fewer words, remove filters, or check spelling.
        </p>
        <button
          onClick={() => { setIsSearchActive(false); setSearchQuery(''); setSearchResults([]); }}
          className="text-sm text-accent hover:underline"
        >
          Browse all screenshots
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Images size={24} className="text-text-secondary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">No screenshots here</h3>
      <p className="text-sm text-text-secondary max-w-xs">
        No screenshots match this filter. Try a different category or tag.
      </p>
    </div>
  );
}
