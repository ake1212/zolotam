/** The sixteen pillars. Order is fixed — the index is stored on every listing. */
export const PILLARS = [
  'Building Materials',
  'Electronics',
  'Automobiles',
  'Fashion & Beauty',
  'Food & Catering',
  'Real Estate',
  'Home Services',
  'Health & Wellness',
  'Agriculture',
  'Transport & Logistics',
  'Professional Services',
  'Education',
  'Events & Entertainment',
  'Finance',
  'Arts & Crafts',
  'Tourism & Hospitality',
] as const;

export function pillarName(idx: number): string {
  return PILLARS[idx] ?? PILLARS[0];
}

/** Resolve a pillar name (case-insensitive) back to its index, or -1. */
export function pillarIndexOf(name: string): number {
  const needle = name.trim().toLowerCase();
  return PILLARS.findIndex((p) => p.toLowerCase() === needle);
}
