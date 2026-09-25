import React from 'react';
import {
  Clock, Tag, Folder, Hash, FolderOpen,
  LayoutGrid
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import type { Category } from '../types';
import { Search } from 'lucide-react';

const CATEGORIES: (Category | 'All')[] = ['All', 'Programming', 'Education', 'Project', 'Design', 'Website', 'Error', 'Other'];

interface SidebarProps {
  allTagsList: string[];
}

export function Sidebar({ allTagsList }: SidebarProps) {
  const {
    activeCategory, setActiveCategory,
    activeTag, setActiveTag,
    screenshots, settings,
    setView, isSearchActive, setIsSearchActive,
    setSearchQuery, setSearchResults,
  } = useAppStore();

  const recentCount = screenshots.filter(
    s => Date.now() - s.createdAt < 7 * 24 * 60 * 60 * 1000
  ).length;

  const clearFilters = () => {
    setActiveCategory('All');
    setActiveTag(null);
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const topTags = allTagsList.slice(0, 12);

  return (
    <aside className="w-56 min-w-[13rem] bg-surface border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
          <Search size={14} className="text-white" />
        </div>
        <span className="font-semibold text-text-primary text-sm tracking-tight">PixelFind</span>
      </div>

      {/* Folder info & Quality badge */}
      {settings.folderName && (
        <div className="mx-3 mt-3 mb-1 p-2.5 bg-accent-light/50 border border-accent/20 rounded-xl space-y-1">
          <div className="flex items-center gap-2">
            <Folder size={13} className="text-accent flex-shrink-0" />
            <p className="text-xs text-text-primary font-semibold truncate" title={settings.folderName}>{settings.folderName}</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
            <span>OCR Quality:</span>
            <span className="font-semibold text-accent uppercase tracking-wider text-[10px] bg-white px-2 py-0.5 rounded shadow-2xs border border-accent/10">
              {settings.qualityMode || 'mid'}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-2 py-1 mb-1">Browse</p>

        <SidebarItem
          icon={<LayoutGrid size={15} />}
          label="All Screenshots"
          count={screenshots.length}
          active={activeCategory === 'All' && !activeTag && !isSearchActive}
          onClick={clearFilters}
        />
        <SidebarItem
          icon={<Clock size={15} />}
          label="Recent (7 days)"
          count={recentCount}
          active={false}
          onClick={() => {
            clearFilters();
            setActiveTag('__recent__');
          }}
        />

        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-2 py-1 mt-4 mb-1">Categories</p>
        {CATEGORIES.filter(c => c !== 'All').map(cat => {
          const count = screenshots.filter(s => s.category === cat).length;
          if (count === 0) return null;
          return (
            <SidebarItem
              key={cat}
              icon={<Hash size={15} />}
              label={cat}
              count={count}
              active={activeCategory === cat && !activeTag}
              onClick={() => {
                setActiveTag(null);
                setActiveCategory(cat as Category);
                setIsSearchActive(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            />
          );
        })}

        {topTags.length > 0 && (
          <>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-2 py-1 mt-4 mb-1">Tags</p>
            {topTags.map(tag => {
              const count = screenshots.filter(s => s.tags.includes(tag)).length;
              return (
                <SidebarItem
                  key={tag}
                  icon={<Tag size={14} />}
                  label={tag}
                  count={count}
                  active={activeTag === tag}
                  onClick={() => {
                    setActiveTag(tag);
                    setActiveCategory('All');
                    setIsSearchActive(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                />
              );
            })}
          </>
        )}
      </nav>

      {/* Footer: change folder */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => setView('welcome')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-bg hover:text-text-primary transition-colors"
        >
          <FolderOpen size={14} />
          Change Folder
        </button>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, count, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-100 text-left',
        active
          ? 'bg-accent-light text-accent font-medium'
          : 'text-text-secondary hover:bg-bg hover:text-text-primary'
      )}
    >
      <span className={cn('flex-shrink-0', active ? 'text-accent' : '')}>{icon}</span>
      <span className="flex-1 truncate text-xs">{label}</span>
      {count !== undefined && (
        <span className={cn(
          'text-xs rounded-full px-1.5 py-0.5 font-medium',
          active ? 'bg-accent/10 text-accent' : 'text-text-secondary'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
