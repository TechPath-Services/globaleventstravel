/** Global Events Travels was founded in 2012. Code fallbacks derive years from this. */
export const FOUNDED_YEAR = 2012;

export function yearsSinceFounding(now: Date = new Date()): number {
  return Math.max(0, now.getFullYear() - FOUNDED_YEAR);
}

/** Fallback "years of experience" figure, e.g. "14+" in 2026. CMS values are not rewritten. */
export function yearsOfExperienceValue(now: Date = new Date()): string {
  return `${yearsSinceFounding(now)}+`;
}
