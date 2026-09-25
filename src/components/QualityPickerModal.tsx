import React, { useState } from 'react';
import type { QualityMode } from '../types';
import { QUALITY_PRESETS } from '../types';
import { formatEstimatedTime } from '../lib/imageUtils';
import { Zap, Sparkles, CheckCircle2, Clock, Shield, Sliders } from 'lucide-react';

interface QualityPickerModalProps {
  isOpen: boolean;
  filesCount: number;
  folderName: string;
  initialMode?: QualityMode;
  onConfirm: (mode: QualityMode) => void;
  onCancel: () => void;
}

export function QualityPickerModal({
  isOpen,
  filesCount,
  folderName,
  initialMode = 'mid',
  onConfirm,
  onCancel,
}: QualityPickerModalProps) {
  const [selectedMode, setSelectedMode] = useState<QualityMode>(initialMode);

  if (!isOpen) return null;

  const preset = QUALITY_PRESETS[selectedMode];
  const totalEstimatedSec = Math.max(1, Math.round(filesCount * preset.secPerImage));
  const formattedTotalTime = formatEstimatedTime(totalEstimatedSec);

  const modes: QualityMode[] = ['low', 'mid', 'high'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quality-modal-title"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center shadow-sm">
              <Sliders size={20} />
            </div>
            <div>
              <h2 id="quality-modal-title" className="text-lg font-bold text-text-primary tracking-tight">
                Select Processing Quality
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Found <span className="font-semibold text-text-primary">{filesCount} screenshots</span> in{' '}
                <span className="font-medium text-text-primary">"{folderName || 'Selected Folder'}"</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content / Options */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
            Choose quality mode to optimize speed vs. OCR accuracy:
          </p>

          <div className="grid gap-3">
            {modes.map((mode) => {
              const p = QUALITY_PRESETS[mode];
              const isSelected = selectedMode === mode;
              const estTime = formatEstimatedTime(filesCount * p.secPerImage);

              return (
                <div
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col gap-2 ${
                    isSelected
                      ? 'border-accent bg-accent-light/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="font-semibold text-sm text-text-primary">
                        {p.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {mode === 'mid' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide uppercase">
                          Recommended
                        </span>
                      )}
                      {mode === 'high' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 tracking-wide uppercase">
                          Best Accuracy
                        </span>
                      )}
                      {mode === 'low' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 tracking-wide uppercase">
                          Fastest
                        </span>
                      )}

                      <span className="text-xs font-semibold text-text-primary px-2 py-0.5 bg-slate-100 rounded-md">
                        {estTime}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary pl-7">
                    {p.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-text-secondary pl-7 pt-1 font-mono">
                    <span>Rate: {p.timeLabel}</span>
                    <span>•</span>
                    <span>
                      OCR: {p.ocrMaxPx === 0 ? 'Full original resolution' : `Max ${p.ocrMaxPx}px`}
                    </span>
                    <span>•</span>
                    <span>Batch: {p.batchSize} parallel</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Estimate & Privacy info banner */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-text-primary">
              <Clock size={16} className="text-accent flex-shrink-0" />
              <span>
                Estimated Total Time:{' '}
                <strong className="text-accent font-semibold">{formattedTotalTime}</strong>{' '}
                for {filesCount} files
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary text-[11px]">
              <Shield size={13} className="text-emerald-600" />
              <span>100% On-device</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(selectedMode)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent-hover shadow-sm transition-all hover:shadow active:scale-[0.99]"
          >
            <Zap size={15} />
            Start Indexing ({preset.label}) • {formattedTotalTime}
          </button>
        </div>
      </div>
    </div>
  );
}
