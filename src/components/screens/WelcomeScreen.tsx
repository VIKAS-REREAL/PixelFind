import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { indexFolder } from '../../lib/indexer';
import { isSupportedImage } from '../../lib/imageUtils';
import { FolderOpen, Shield, Zap, Search, ArrowRight } from 'lucide-react';
import { QualityPickerModal } from '../QualityPickerModal';
import type { QualityMode } from '../../types';

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

export function WelcomeScreen() {
  const {
    setView,
    setFolderHandle,
    setIsIndexing,
    setIndexingProgress,
    loadScreenshots,
    showToast,
    updateSettings,
    settings,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');

  const handleSelectFolder = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      showToast('Your browser does not support folder selection. Please use Chrome or Edge.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'read' });
      setFolderHandle(handle);
      await updateSettings({ folderName: handle.name });

      // Collect files
      const files = await collectFilesFromHandle(handle);
      if (files.length === 0) {
        showToast('No supported images found in this folder.', 'error');
        setIsLoading(false);
        return;
      }

      // Instead of starting immediately, prompt user for Quality Mode
      setSelectedFiles(files);
      setSelectedFolderName(handle.name);
      setShowQualityModal(true);
      setIsLoading(false);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        showToast('Failed to access folder. Please try again.', 'error');
      }
      setIsLoading(false);
    }
  }, [setFolderHandle, updateSettings, showToast]);

  const handleConfirmQuality = useCallback(
    async (mode: QualityMode) => {
      setShowQualityModal(false);
      await updateSettings({ qualityMode: mode });

      showToast(`Starting indexing with ${mode.toUpperCase()} quality...`, 'info');
      setView('indexing');
      setIsIndexing(true);

      const abortController = new AbortController();
      useAppStore.getState().setAbortController(abortController);

      try {
        await indexFolder(
          selectedFiles,
          (progress) => setIndexingProgress(progress),
          abortController.signal,
          mode
        );

        await loadScreenshots();
        await updateSettings({ lastScanAt: Date.now() });
        setIsIndexing(false);
        setView('library');
        showToast('Indexing complete! Your screenshots are ready.', 'success');
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          showToast('Indexing stopped or encountered an issue.', 'error');
        }
        setIsIndexing(false);
      }
    },
    [selectedFiles, updateSettings, showToast, setView, setIsIndexing, setIndexingProgress, loadScreenshots]
  );

  const handleCancelQuality = useCallback(() => {
    setShowQualityModal(false);
    setIsLoading(false);
  }, []);

  const handleContinue = useCallback(async () => {
    // Try to continue with existing indexed data
    await loadScreenshots();
    setView('library');
  }, [loadScreenshots, setView]);

  const hasExistingData = settings.folderName !== null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <Search size={14} className="text-white" />
          </div>
          <span className="font-semibold text-text-primary text-base tracking-tight">PixelFind</span>
        </div>
        <span className="text-xs text-text-secondary font-medium px-2 py-1 bg-accent-light text-accent rounded-full">
          Local • Private
        </span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Search size={36} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-3">
            PixelFind
          </h1>
          <p className="text-lg text-text-secondary mb-2">
            Find screenshots by what you <em>remember</em>.
          </p>
          <p className="text-sm text-text-secondary mb-10">
            Not by filename — by content. Search your screenshots like you think.
          </p>

          {/* Main CTA */}
          <button
            onClick={handleSelectFolder}
            disabled={isLoading}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            <FolderOpen size={18} />
            {isLoading ? 'Opening…' : 'Select Screenshot Folder'}
          </button>

          {hasExistingData && (
            <button
              onClick={handleContinue}
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 text-accent border border-accent/30 bg-accent-light/50 hover:bg-accent-light font-medium py-2.5 px-5 rounded-xl transition-all duration-150 text-sm"
            >
              <ArrowRight size={16} />
              Continue with "{settings.folderName}"
            </button>
          )}

          {/* Privacy note */}
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-text-secondary">
            <Shield size={13} className="text-accent" />
            <span>Your screenshots stay on your device. Nothing is uploaded.</span>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 max-w-lg w-full mt-14">
          {[
            { icon: <Search size={16} />, title: 'Content Search', desc: 'Search by what was in the screenshot' },
            { icon: <Zap size={16} />, title: 'OCR Powered', desc: 'Reads text from every image locally' },
            { icon: <Shield size={16} />, title: '100% Private', desc: 'All processing happens on your device' },
          ].map(f => (
            <div key={f.title} className="bg-surface border border-border rounded-xl p-4 text-left">
              <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center text-accent mb-3">
                {f.icon}
              </div>
              <p className="text-xs font-semibold text-text-primary mb-1">{f.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <QualityPickerModal
        isOpen={showQualityModal}
        filesCount={selectedFiles.length}
        folderName={selectedFolderName}
        initialMode={settings.qualityMode || 'mid'}
        onConfirm={handleConfirmQuality}
        onCancel={handleCancelQuality}
      />
    </div>
  );
}
