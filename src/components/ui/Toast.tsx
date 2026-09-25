import React, { useEffect } from 'react';
import { CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

const icons = {
  info: <Info size={16} className="text-blue-500" />,
  success: <CheckCircle size={16} className="text-green-600" />,
  error: <XCircle size={16} className="text-red-500" />,
};

const styles = {
  info: 'border-blue-100 bg-white',
  success: 'border-green-100 bg-white',
  error: 'border-red-100 bg-white',
};

export function Toast() {
  const { toast, clearToast } = useAppStore();

  if (!toast) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3',
        'rounded-lg border shadow-lg min-w-[280px] max-w-sm',
        'animate-in slide-in-from-bottom-2 fade-in duration-200',
        styles[toast.type]
      )}
    >
      {icons[toast.type]}
      <p className="text-sm text-text-primary flex-1">{toast.message}</p>
      <button onClick={clearToast} className="text-text-secondary hover:text-text-primary">
        <X size={14} />
      </button>
    </div>
  );
}
