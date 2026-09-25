import Fuse from 'fuse.js';
import type { ScreenshotRecord, SearchResult } from '../types';

// Keywords for time-related smart search
const TIME_PATTERNS: { regex: RegExp; daysAgo: number }[] = [
  { regex: /\b(today)\b/i, daysAgo: 0 },
  { regex: /\b(yesterday)\b/i, daysAgo: 1 },
  { regex: /\blast\s*(week)\b/i, daysAgo: 7 },
  { regex: /\blast\s*(month)\b/i, daysAgo: 30 },
  { regex: /\blast\s*(2\s*days?)\b/i, daysAgo: 2 },
  { regex: /\blast\s*(3\s*days?)\b/i, daysAgo: 3 },
];

export interface ParsedQuery {
  keywords: string[];
  dateFilter: Date | null;
  raw: string;
}

export function parseSmartQuery(query: string): ParsedQuery {
  let remaining = query;
  let dateFilter: Date | null = null;

  for (const { regex, daysAgo } of TIME_PATTERNS) {
    if (regex.test(remaining)) {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      d.setHours(0, 0, 0, 0);
      dateFilter = d;
      remaining = remaining.replace(regex, ' ');
      break;
    }
  }

  const keywords = remaining
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z0-9#+.]/g, '').toLowerCase())
    .filter(w => w.length > 1);

  return { keywords, dateFilter, raw: query };
}

export function searchScreenshots(
  records: ScreenshotRecord[],
  query: string,
  useSmartSearch: boolean
): SearchResult[] {
  if (!query.trim()) return [];

  const parsed = useSmartSearch ? parseSmartQuery(query) : { keywords: [query.toLowerCase()], dateFilter: null, raw: query };
  const effectiveQuery = parsed.keywords.join(' ');

  // Date filter
  let filtered = records;
  if (parsed.dateFilter) {
    const cutoff = parsed.dateFilter.getTime();
    filtered = records.filter(r => r.createdAt >= cutoff);
  }

  if (!effectiveQuery.trim()) {
    // Only date filter active
    return filtered.map(r => ({ record: r, score: 1, matchedFields: ['date'] }));
  }

  // Build Fuse index
  const fuse = new Fuse(filtered, {
    keys: [
      { name: 'ocrText', weight: 0.6 },
      { name: 'tags', weight: 0.25 },
      { name: 'category', weight: 0.1 },
      { name: 'filename', weight: 0.05 },
    ],
    threshold: 0.45,
    includeScore: true,
    includeMatches: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const fuseResults = fuse.search(effectiveQuery);

  // Convert fuse score (0 = perfect, 1 = no match) to relevance (1 = perfect)
  return fuseResults.map(r => {
    const matchedFields: string[] = (r.matches ?? []).map(m => m.key ?? '').filter(Boolean);
    return {
      record: r.item,
      score: 1 - (r.score ?? 0),
      matchedFields,
    };
  });
}

export function getRelevanceLabel(score: number): { label: string; color: string } {
  if (score >= 0.8) return { label: 'Best match', color: 'text-green-700 bg-green-50' };
  if (score >= 0.6) return { label: 'High match', color: 'text-emerald-700 bg-emerald-50' };
  if (score >= 0.4) return { label: 'Good match', color: 'text-blue-700 bg-blue-50' };
  return { label: 'Partial match', color: 'text-slate-600 bg-slate-100' };
}
