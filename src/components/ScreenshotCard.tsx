import React, { useState } from 'react';
import type { ScreenshotRecord } from '../types';
import type { SearchResult } from '../types';
import { TagBadge } from './ui/TagBadge';
import { CategoryChip } from './ui/CategoryChip';
import { formatDate, truncate, cn } from '../lib/utils';
import { getRelevanceLabel } from '../lib/search';
import { useAppStore } from '../store/useAppStore';
import { Calendar, FileImage, ChevronRight } from 'lucide-react';

interface ScreenshotCardProps {
  record: ScreenshotRecord;
  searchResult?: SearchResult;
}

export function ScreenshotCard({ record, searchResult }: ScreenshotCardProps) {
  const { setSelectedScreenshot, setView } = useAppStore();
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    setSelectedScreenshot(record);
    setView('detail');
  };

  const relevance = searchResult ? getRelevanceLabel(searchResult.score) : null;
  const ocrPreview = truncate(record.ocrText, 100);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group bg-surface border border-border rounded-xl overflow-hidden',
        'cursor-pointer transition-all duration-150',
        'hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5',
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] bg-slate-50 overflow-hidden">
        {record.thumbnail && !imgError ? (
          <img
            src={record.thumbnail}
            alt={record.filename}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileImage size={32} className="text-slate-300" />
          </div>
        )}

        {/* Relevance badge */}
        {relevance && (
          <div className={cn(
            'absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full',
            relevance.color
          )}>
            {relevance.label}
          </div>
        )}

        {/* Failed badge */}
        {record.status === 'failed' && (
          <div className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
            OCR failed
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        {/* Category + date */}
        <div className="flex items-center justify-between mb-2">
          <CategoryChip category={record.category} />
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Calendar size={11} />
            {formatDate(record.createdAt)}
          </div>
        </div>

        {/* Filename */}
        <p className="text-sm font-medium text-text-primary truncate mb-1.5" title={record.filename}>
          {record.filename}
        </p>

        {/* OCR preview */}
        {ocrPreview && (
          <p className="text-xs text-text-secondary leading-relaxed mb-2 font-mono">
            {ocrPreview}
          </p>
        )}

        {/* Tags */}
        {record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {record.tags.slice(0, 4).map((tag: string) => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {record.tags.length > 4 && (
              <span className="text-xs text-text-secondary">+{record.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Hover arrow */}
      <div className="px-3 pb-2.5 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-accent flex items-center gap-1">
          View <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
}
