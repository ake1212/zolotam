/** The sixteen pillars. Order is fixed — the index is the icon index. */
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

/** Directory-wide listing totals shown in the admin pillar table. */
export const PILLAR_COUNTS = [186, 142, 121, 98, 164, 87, 76, 64, 133, 91, 108, 52, 47, 39, 58, 74];

export function pillarName(idx: number): string {
  return PILLARS[idx] ?? PILLARS[0];
}

/** Resolve a pillar name (case-insensitive) back to its index, or -1. */
export function pillarIndexOf(name: string): number {
  const needle = name.trim().toLowerCase();
  return PILLARS.findIndex((p) => p.toLowerCase() === needle);
}
