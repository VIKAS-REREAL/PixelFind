import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { searchScreenshots } from '../lib/search';
import { cn } from '../lib/utils';

interface SearchBarProps {
  allTags: string[];
}

export function SearchBar({ allTags }: SearchBarProps) {
  const {
    searchQuery, setSearchQuery,
    screenshots,
    setSearchResults, setIsSearchActive,
    settings, updateSettings,
    sortOrder, setSortOrder,
  } = useAppStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setIsSearchActive(false);
      setSearchResults([]);
      return;
    }
    const results = searchScreenshots(screenshots, trimmed, settings.smartSearchEnabled);
    setSearchResults(results);
    setIsSearchActive(true);
  }, [screenshots, settings.smartSearchEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    setIsSearchActive(false);
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const handleTagClick = (tag: string) => {
    const newQ = `${localQuery} ${tag}`.trim();
    setLocalQuery(newQ);
    runSearch(newQ);
  };

  const suggestedTags = allTags.slice(0, 8);

  return (
    <div className="bg-surface border-b border-border px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Search input */}
        <div className="flex-1 relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-text-secondary pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            placeholder='Search screenshots… e.g. "C++ vector error" or "python error last week"'
            className="w-full pl-10 pr-10 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-text-secondary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Smart Search toggle */}
        <button
          type="button"
          onClick={() => updateSettings({ smartSearchEnabled: !settings.smartSearchEnabled })}
          title="Smart Search: interprets natural language like 'python error last week'"
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all',
            settings.smartSearchEnabled
              ? 'bg-accent text-white border-accent shadow-sm'
              : 'bg-bg border-border text-text-secondary hover:text-text-primary'
          )}
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Smart</span>
        </button>

        {/* Sort */}
        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border border-border bg-bg text-text-secondary hover:text-text-primary transition-all"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline capitalize">{sortOrder}</span>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-lg py-1 z-20 min-w-[130px]">
              {(['relevance', 'newest', 'oldest'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => { setSortOrder(opt); setShowSortMenu(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-xs capitalize transition-colors',
                    sortOrder === opt
                      ? 'text-accent font-medium bg-accent-light'
                      : 'text-text-secondary hover:bg-bg'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Suggested tags */}
      {suggestedTags.length > 0 && !localQuery && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-xs text-text-secondary self-center">Try:</span>
          {suggestedTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="text-xs px-2 py-0.5 rounded-full border border-border bg-bg text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Smart search hint */}
      {settings.smartSearchEnabled && (
        <p className="text-xs text-accent mt-2">
          ✦ Smart Search active — try "python error last week" or "react code yesterday"
        </p>
      )}
    </div>
  );
}
