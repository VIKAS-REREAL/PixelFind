import type { Category } from '../types';

const PROGRAMMING_KEYWORDS = [
  'python', 'javascript', 'typescript', 'java', 'c++', 'cpp', 'c#', 'csharp',
  'react', 'vue', 'angular', 'node', 'nodejs', 'express', 'django', 'flask',
  'sql', 'mysql', 'postgres', 'mongodb', 'redis', 'html', 'css', 'scss',
  'swift', 'kotlin', 'rust', 'go', 'golang', 'ruby', 'php', 'scala',
  'function', 'class', 'import', 'export', 'const', 'let', 'var', 'def',
  'return', 'async', 'await', 'promise', 'interface', 'type', 'enum',
  'vector', 'array', 'map', 'list', 'struct', 'pointer', 'null', 'undefined',
  'compiler', 'runtime', 'debug', 'breakpoint', 'stack', 'heap', 'malloc',
  'github', 'git', 'commit', 'branch', 'merge', 'pull', 'push', 'clone',
  'api', 'endpoint', 'request', 'response', 'json', 'xml', 'http', 'https',
  'npm', 'yarn', 'pip', 'cargo', 'maven', 'gradle',
];

const ERROR_KEYWORDS = [
  'error', 'exception', 'traceback', 'segfault', 'crash', 'fatal', 'failed',
  'undefined is not', 'cannot read', 'null pointer', 'index out of bounds',
  'compilation error', 'syntax error', 'type error', 'runtime error',
  'warning', 'stderr', 'stacktrace', 'uncaught', '404', '500', '403',
];

const EDUCATION_KEYWORDS = [
  'lecture', 'notes', 'study', 'assignment', 'homework', 'exam', 'quiz',
  'university', 'college', 'class', 'course', 'subject', 'professor',
  'slide', 'presentation', 'textbook', 'chapter', 'module', 'tutorial',
  'bca', 'btech', 'mca', 'mtech', 'engineering', 'mathematics', 'physics',
  'chemistry', 'biology', 'history', 'economics',
];

const DESIGN_KEYWORDS = [
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'xd', 'canva',
  'design', 'ui', 'ux', 'wireframe', 'prototype', 'mockup', 'typography',
  'color', 'palette', 'layout', 'component', 'icon', 'logo', 'brand',
];

const WEBSITE_KEYWORDS = [
  'homepage', 'landing', 'browser', 'chrome', 'firefox', 'safari', 'edge',
  'website', 'webpage', 'url', 'www', 'http', 'login', 'signup', 'dashboard',
  'menu', 'navbar', 'footer', 'sidebar', 'scroll',
];

const PROJECT_KEYWORDS = [
  'project', 'architecture', 'diagram', 'flowchart', 'schema', 'database',
  'system design', 'uml', 'erd', 'gantt', 'sprint', 'agile', 'kanban',
  'trello', 'jira', 'notion', 'documentation', 'readme',
];

function countMatches(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter(k => lower.includes(k)).length;
}

export function extractTags(ocrText: string, filename: string): string[] {
  const combined = `${ocrText} ${filename}`.toLowerCase();
  const tags = new Set<string>();

  // Language tags
  const langMap: Record<string, string> = {
    python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript',
    'c++': 'C++', cpp: 'C++', java: 'Java', react: 'React', vue: 'Vue',
    angular: 'Angular', sql: 'SQL', html: 'HTML', css: 'CSS', rust: 'Rust',
    go: 'Golang', swift: 'Swift', kotlin: 'Kotlin', php: 'PHP',
    nodejs: 'Node.js', node: 'Node.js', 'c#': 'C#',
  };

  for (const [kw, tag] of Object.entries(langMap)) {
    if (combined.includes(kw)) tags.add(tag);
  }

  // Topic tags
  if (countMatches(combined, ERROR_KEYWORDS) > 0) tags.add('Error');
  if (combined.includes('github') || combined.includes('git')) tags.add('GitHub');
  if (combined.includes('figma')) tags.add('Figma');
  if (combined.includes('sql') || combined.includes('query') || combined.includes('select')) tags.add('SQL');
  if (combined.includes('network') || combined.includes('tcp') || combined.includes('ip') || combined.includes('subnet')) tags.add('Networking');
  if (countMatches(combined, EDUCATION_KEYWORDS) > 0) tags.add('Notes');
  if (combined.includes('assignment') || combined.includes('homework')) tags.add('Assignment');
  if (combined.includes('project') || combined.includes('architecture')) tags.add('Project');

  return Array.from(tags).slice(0, 8);
}

export function detectCategory(ocrText: string, filename: string, tags: string[]): Category {
  const combined = `${ocrText} ${filename}`.toLowerCase();

  const scores: Record<Category, number> = {
    Programming: countMatches(combined, PROGRAMMING_KEYWORDS),
    Error: countMatches(combined, ERROR_KEYWORDS) * 2,
    Education: countMatches(combined, EDUCATION_KEYWORDS),
    Design: countMatches(combined, DESIGN_KEYWORDS),
    Website: countMatches(combined, WEBSITE_KEYWORDS),
    Project: countMatches(combined, PROJECT_KEYWORDS),
    Other: 0,
  };

  // Tag-based boosts
  if (tags.includes('Error')) scores.Error += 5;
  if (tags.includes('GitHub') || tags.includes('Python') || tags.includes('C++')) scores.Programming += 3;
  if (tags.includes('Figma')) scores.Design += 5;
  if (tags.includes('Notes') || tags.includes('Assignment')) scores.Education += 5;
  if (tags.includes('Networking')) scores.Programming += 2;

  const best = (Object.entries(scores) as [Category, number][]).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ['Other', 0] as [Category, number]
  );

  return best[1] > 0 ? best[0] : 'Other';
}

export function cleanOcrText(raw: string): string {
  return raw
    .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '') // control chars
    .replace(/[ \t]{3,}/g, '  ')  // collapse spaces
    .replace(/\n{4,}/g, '\n\n\n') // collapse blank lines
    .trim();
}
