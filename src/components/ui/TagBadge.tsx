import React from 'react';
import { cn } from '../../lib/utils';

interface TagBadgeProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const TAG_COLORS: Record<string, string> = {
  'Python': 'bg-blue-50 text-blue-700 border-blue-200',
  'C++': 'bg-purple-50 text-purple-700 border-purple-200',
  'JavaScript': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'TypeScript': 'bg-blue-50 text-blue-700 border-blue-200',
  'React': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'SQL': 'bg-orange-50 text-orange-700 border-orange-200',
  'HTML': 'bg-red-50 text-red-700 border-red-200',
  'CSS': 'bg-pink-50 text-pink-700 border-pink-200',
  'Error': 'bg-red-50 text-red-700 border-red-200',
  'GitHub': 'bg-slate-50 text-slate-700 border-slate-200',
  'Figma': 'bg-purple-50 text-purple-700 border-purple-200',
  'Notes': 'bg-green-50 text-green-700 border-green-200',
  'Assignment': 'bg-amber-50 text-amber-700 border-amber-200',
  'Networking': 'bg-teal-50 text-teal-700 border-teal-200',
  'Project': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Golang': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Java': 'bg-orange-50 text-orange-700 border-orange-200',
};

export function TagBadge({ tag, active, onClick, className }: TagBadgeProps) {
  const colors = TAG_COLORS[tag] ?? 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        'transition-all duration-150',
        colors,
        onClick && 'cursor-pointer hover:opacity-80',
        active && 'ring-2 ring-accent ring-offset-1',
        className
      )}
    >
      {tag}
    </span>
  );
}
