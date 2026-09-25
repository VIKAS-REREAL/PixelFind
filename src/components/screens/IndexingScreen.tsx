import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function IndexingScreen() {
  const { indexingProgress, abortController, setIsIndexing, setView, loadScreenshots, showToast } = useAppStore();

  const { total, processed, currentFile, alreadyIndexed, failed, phase } = indexingProgress;

  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

  const handleCancel = () => {
    abortController?.abort();
    setIsIndexing(false);
    loadScreenshots().then(() => {
      setView('library');
      showToast('Indexing cancelled. Showing partial results.', 'info');
    });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Indexing Screenshots</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              {phase === 'scanning' && 'Scanning folder…'}
              {phase === 'ocr' && 'Extracting text with OCR…'}
              {phase === 'done' && 'All done!'}
            </p>
          </div>
          {phase !== 'done' && (
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary transition-colors"
              title="Cancel indexing"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Total" value={alreadyIndexed + total} />
          <StatCard label="New" value={total} accent />
          <StatCard label="Already indexed" value={alreadyIndexed} />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>{processed} / {total} processed</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Current file */}
        {currentFile && phase !== 'done' && (
          <div className="bg-bg rounded-lg px-3 py-2 border border-border mt-4">
            <p className="text-xs text-text-secondary mb-0.5">Processing</p>
            <p className="text-xs font-mono text-text-primary truncate">{currentFile}</p>
          </div>
        )}

        {/* Failed */}
        {failed > 0 && (
          <p className="text-xs text-red-500 mt-3">
            {failed} file{failed > 1 ? 's' : ''} failed (OCR error — skipped)
          </p>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-accent font-medium">
            <span className="w-2 h-2 bg-accent rounded-full inline-block" />
            Indexing complete. Redirecting to library…
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl p-3 text-center border', accent ? 'bg-accent-light border-accent/20' : 'bg-bg border-border')}>
      <p className={cn('text-2xl font-bold', accent ? 'text-accent' : 'text-text-primary')}>{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}
