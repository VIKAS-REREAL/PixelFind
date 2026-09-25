import React from 'react';
import { cn } from '../../lib/utils';
import type { Category } from '../../types';

const CATEGORY_STYLES: Record<Category, string> = {
  Programming: 'bg-violet-50 text-violet-700',
  Education: 'bg-green-50 text-green-700',
  Project: 'bg-indigo-50 text-indigo-700',
  Design: 'bg-pink-50 text-pink-700',
  Website: 'bg-sky-50 text-sky-700',
  Error: 'bg-red-50 text-red-700',
  Other: 'bg-slate-50 text-slate-600',
};

interface CategoryChipProps {
  category: Category | 'All';
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({ category, active, onClick, className }: CategoryChipProps) {
  const style = category === 'All' ? 'bg-slate-100 text-slate-700' : CATEGORY_STYLES[category as Category];
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        'transition-all duration-150 border border-transparent',
        style,
        active && 'ring-2 ring-accent ring-offset-1 font-semibold',
        onClick && 'hover:opacity-80 cursor-pointer',
        className
      )}
    >
      {category}
    </button>
  );
}
