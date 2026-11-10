/** Global Events Travels was founded in 2012. Derived figures use this year. */
export const FOUNDED_YEAR = 2012;

export function yearsSinceFounding(now: Date = new Date()): number {
  return Math.max(0, now.getFullYear() - FOUNDED_YEAR);
}

/** Public "years of experience" figure, e.g. "14+" in 2026. */
export function yearsOfExperienceValue(now: Date = new Date()): string {
  return `${yearsSinceFounding(now)}+`;
}

/**
 * Keep any stat labelled as years of experience aligned with FOUNDED_YEAR.
 * Other stats (ratings, trek counts) are left untouched.
 */
export function withComputedYears<T extends { label: string; value: string }>(
  stats: T[],
  now: Date = new Date(),
): T[] {
  const value = yearsOfExperienceValue(now);
  return stats.map((stat) => (/year/i.test(stat.label) ? { ...stat, value } : stat));
}

/** Rewrite the known pre-correction founding phrases. Leaves other years alone. */
export function correctFoundingCopy(text: string): string {
  return text
    .replace(/\bfounded in 2016\b/gi, `founded in ${FOUNDED_YEAR}`)
    .replace(/\bsince 2016\b/gi, `since ${FOUNDED_YEAR}`);
}
