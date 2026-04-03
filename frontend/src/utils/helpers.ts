// ── Formatting helpers ─────────────────────────────────────────────

/** Format a decimal score (0–100) as "72.5%" */
export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`;
}

/** Skill → display label */
export const SKILL_LABELS: Record<string, string> = {
  react:   'React',
  node:    'Node.js',
  python:  'Python',
  ml:      'Machine Learning',
  mongodb: 'MongoDB',
  uiux:    'UI/UX Design',
  java:    'Java',
  cpp:     'C++',
};

/** Interest → display label */
export const INTEREST_LABELS: Record<string, string> = {
  hackathon: 'Hackathon',
  placement: 'Placement',
  startup:   'Startup',
  research:  'Research',
};

export const AVAILABILITY_OPTIONS = [
  { value: 'weekdays',  label: 'Weekdays' },
  { value: 'weekends',  label: 'Weekends' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'flexible',  label: 'Flexible' },
];

export const WORK_STYLE_OPTIONS = [
  { value: 'remote',    label: 'Remote' },
  { value: 'in-person', label: 'In-person' },
  { value: 'hybrid',    label: 'Hybrid' },
];

export const ALL_SKILLS = ['react', 'node', 'python', 'ml', 'mongodb', 'uiux', 'java', 'cpp'];
export const ALL_INTERESTS = ['hackathon', 'placement', 'startup', 'research'];

/** Score → color class */
export function scoreColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 45) return '#f59e0b';
  return '#6366f1';
}

/** Extract a readable API error message */
export function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { detail?: string } } };
    return axiosErr.response?.data?.detail ?? 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}
