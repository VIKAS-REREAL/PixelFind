import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TagBadge } from '../ui/TagBadge';
import { CategoryChip } from '../ui/CategoryChip';
import { ArrowLeft, Calendar, FileImage, Copy, ExternalLink, FileText, Hash } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

export function DetailScreen() {
  const { selectedScreenshot: s, setView, showToast } = useAppStore();
  const [imgError, setImgError] = useState(false);
  const [ocrExpanded, setOcrExpanded] = useState(false);

  if (!s) {
    setView('library');
    return null;
  }

  const handleCopyOCR = () => {
    navigator.clipboard.writeText(s.ocrText).then(() => {
      showToast('OCR text copied to clipboard!', 'success');
    });
  };

  const ocrPreview = ocrExpanded ? s.ocrText : s.ocrText.slice(0, 500);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => setView('library')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Library
        </button>
        <div className="h-4 w-px bg-border" />
        <p className="text-sm text-text-secondary truncate max-w-xs" title={s.filename}>
          {s.filename}
        </p>
        <div className="flex-1" />
        <CategoryChip category={s.category} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
        {/* Left: Image */}
        <div className="lg:flex-1 flex items-start justify-center p-6 bg-bg">
          <div className="w-full max-w-3xl">
            {s.thumbnail && !imgError ? (
              <div className="rounded-xl overflow-hidden border border-border shadow-sm bg-surface">
                <img
                  src={s.thumbnail}
                  alt={s.filename}
                  className="w-full object-contain"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="aspect-video bg-slate-100 rounded-xl border border-border flex items-center justify-center">
                <FileImage size={48} className="text-slate-300" />
              </div>
            )}

            {/* Privacy note */}
            <p className="text-xs text-text-secondary mt-3 text-center">
              This is a thumbnail preview. The original file stays on your device.
            </p>
          </div>
        </div>

        {/* Right: Details panel */}
        <div className="lg:w-96 xl:w-[420px] bg-surface border-l border-border flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-border">
            <h1 className="text-base font-semibold text-text-primary mb-1 break-all">{s.filename}</h1>
            <div className="flex items-center gap-3 text-xs text-text-secondary mt-2">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(s.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Hash size={12} />
                {Math.round(s.fileSize / 1024)} KB
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Indexed {formatRelativeTime(s.indexedAt)}
            </p>
          </div>

          {/* Tags */}
          <div className="p-6 border-b border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Tags</p>
            {s.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
              </div>
            ) : (
              <p className="text-xs text-text-secondary">No tags detected</p>
            )}
          </div>

          {/* OCR Text */}
          <div className="p-6 border-b border-border flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
                <FileText size={13} />
                Extracted Text (OCR)
              </p>
              {s.ocrText && (
                <button
                  onClick={handleCopyOCR}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Copy size={12} />
                  Copy
                </button>
              )}
            </div>

            {s.status === 'failed' ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-xs text-red-600">OCR failed for this screenshot.</p>
                {s.errorMessage && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{s.errorMessage}</p>
                )}
              </div>
            ) : s.ocrText ? (
              <div>
                <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono bg-bg rounded-lg p-3 border border-border leading-relaxed max-h-72 overflow-y-auto">
                  {ocrPreview}
                  {!ocrExpanded && s.ocrText.length > 500 && '…'}
                </pre>
                {s.ocrText.length > 500 && (
                  <button
                    onClick={() => setOcrExpanded(v => !v)}
                    className="mt-2 text-xs text-accent hover:underline"
                  >
                    {ocrExpanded ? 'Show less' : `Show all (${s.ocrText.length} chars)`}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">No text detected in this screenshot.</p>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 space-y-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Actions</p>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Open Original:</strong> Due to browser security, PixelFind can't directly open local files. 
                Find the original at: <span className="font-mono">{s.filename}</span> in your selected folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
