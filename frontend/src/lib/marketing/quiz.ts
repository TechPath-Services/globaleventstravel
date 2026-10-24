import type { Difficulty, MarketingTrek } from '@/lib/types';

export type Experience = 'none' | 'some' | 'experienced';
export type Fitness = 'low' | 'medium' | 'high';
export type DaysAvailable = 'weekend' | 'week' | 'long';
export type Moment = 'summit' | 'frozen_lake' | 'snow_walk' | 'offbeat' | 'extreme';
export type ColdTolerance = 'mild' | 'cold' | 'extreme';
export type Company = 'solo' | 'friends' | 'partner' | 'family';
export type Budget = 'low' | 'mid' | 'any';

export interface QuizAnswers {
  experience: Experience;
  fitness: Fitness;
  days: DaysAvailable;
  moment: Moment;
  cold: ColdTolerance;
  from: string;
  company: Company;
  budget: Budget;
}

export type QuizAnswerKey = keyof QuizAnswers;

export interface QuizOption {
  value: string;
  label: string;
  hint?: string;
}

export interface QuizQuestion {
  id: QuizAnswerKey;
  prompt: string;
  options: QuizOption[];
}

export const BASE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'experience',
    prompt: 'Have you trekked in the Himalayas before?',
    options: [
      { value: 'none', label: 'Never — this would be my first trek' },
      { value: 'some', label: 'Once or twice, nothing above ~4,000 m' },
      { value: 'experienced', label: 'Yes, several, including high passes or summits' },
    ],
  },
  {
    id: 'fitness',
    prompt: 'How would you describe your fitness right now?',
    options: [
      { value: 'low', label: 'I can walk 5 km comfortably but rarely exercise' },
      { value: 'medium', label: 'I can jog 5 km without stopping' },
      { value: 'high', label: 'I train regularly and jog 5 km in under 35 minutes' },
    ],
  },
  {
    id: 'days',
    prompt: 'How many days can you take, including travel?',
    options: [
      { value: 'weekend', label: 'A long weekend (2–4 days)' },
      { value: 'week', label: 'About a week (5–7 days)' },
      { value: 'long', label: '8 days or more' },
    ],
  },
  {
    id: 'moment',
    prompt: "What's the moment you're trekking for?",
    options: [
      { value: 'summit', label: 'Standing on a summit at sunrise' },
      { value: 'frozen_lake', label: 'Camping beside a frozen lake' },
      { value: 'snow_walk', label: 'Walking through silent snowy forests and meadows' },
      { value: 'offbeat', label: 'A quiet trail with villages, temples or hot springs' },
      { value: 'extreme', label: 'The hardest, most extreme experience I can get' },
    ],
  },
  {
    id: 'cold',
    prompt: 'How do you feel about cold?',
    options: [
      { value: 'mild', label: "Fine down to about 0 °C, beyond that I'm miserable" },
      { value: 'cold', label: 'I can handle −10 °C at night with good gear' },
      { value: 'extreme', label: 'Bring on −20 °C' },
    ],
  },
  {
    id: 'company',
    prompt: "Who's coming with you?",
    options: [
      { value: 'solo', label: 'Just me' },
      { value: 'friends', label: 'Friends / college group' },
      { value: 'partner', label: 'My partner' },
      { value: 'family', label: 'Family with teenagers' },
    ],
  },
  {
    id: 'budget',
    prompt: 'Rough budget for the trek package itself (per person)?',
    options: [
      { value: 'low', label: 'Under ₹10,000' },
      { value: 'mid', label: '₹10,000 – ₹15,000' },
      { value: 'any', label: 'No fixed budget — the experience matters more' },
    ],
  },
];

export function fromCityQuestion(cities: { slug: string; name: string }[]): QuizQuestion {
  return {
    id: 'from',
    prompt: 'Where will you start your journey from?',
    options: [
      ...cities.map((c) => ({ value: c.slug, label: c.name })),
      { value: 'other', label: 'Somewhere else' },
    ],
  };
}

/** Question order: the "from" question sits after "cold" so it feels like logistics, not scoring. */
export function buildQuestions(cities: { slug: string; name: string }[]): QuizQuestion[] {
  const questions = [...BASE_QUESTIONS];
  questions.splice(5, 0, fromCityQuestion(cities));
  return questions;
}

const ANSWER_VALUES: { [K in Exclude<QuizAnswerKey, 'from'>]: readonly QuizAnswers[K][] } = {
  experience: ['none', 'some', 'experienced'],
  fitness: ['low', 'medium', 'high'],
  days: ['weekend', 'week', 'long'],
  moment: ['summit', 'frozen_lake', 'snow_walk', 'offbeat', 'extreme'],
  cold: ['mild', 'cold', 'extreme'],
  company: ['solo', 'friends', 'partner', 'family'],
  budget: ['low', 'mid', 'any'],
};

export function answersToParams(answers: QuizAnswers): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(answers) as QuizAnswerKey[]).forEach((key) => params.set(key, answers[key]));
  return params;
}

/** Parse answers from a URL; returns null unless every answer is present and valid. */
export function parseAnswers(params: URLSearchParams): QuizAnswers | null {
  const from = params.get('from');
  if (!from || !/^[a-z0-9-]{1,120}$/.test(from)) return null;
  const parsed: Partial<QuizAnswers> = { from };
  for (const key of Object.keys(ANSWER_VALUES) as (keyof typeof ANSWER_VALUES)[]) {
    const value = params.get(key);
    if (!value || !(ANSWER_VALUES[key] as readonly string[]).includes(value)) return null;
    (parsed as Record<string, string>)[key] = value;
  }
  return parsed as QuizAnswers;
}

// ============================================
// Scoring
// ============================================

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  easy: 1,
  moderate: 2,
  difficult: 3,
  challenging: 4,
  extreme: 5,
};

const MAX_DIFFICULTY: Record<Experience, Record<Fitness, number>> = {
  none: { low: 1, medium: 2, high: 2 },
  some: { low: 2, medium: 3, high: 3 },
  experienced: { low: 3, medium: 4, high: 5 },
};

const MOMENT_TAGS: Record<Moment, { primary: string[]; secondary: string[] }> = {
  summit: { primary: ['summit'], secondary: ['views'] },
  frozen_lake: { primary: ['frozen_lake'], secondary: ['solitude', 'views'] },
  snow_walk: { primary: ['snow_forest', 'meadow'], secondary: ['weekend', 'views'] },
  offbeat: { primary: ['solitude', 'culture', 'hot_springs'], secondary: ['snow_forest'] },
  extreme: { primary: ['extreme', 'pass_crossing'], secondary: ['views'] },
};

const COLD_TOLERANCE: Record<ColdTolerance, number> = { mild: 1, cold: 2, extreme: 3 };

const WEIGHTS = {
  moment: 3,
  days: 2,
  difficulty: 2,
  cold: 1,
  budget: 1,
  company: 0.5,
  bookable: 0.5,
};

const KEYWORD_TAGS: [RegExp, string][] = [
  [/summit|peak|\btop\b|tibba|kantha|chandrashila/i, 'summit'],
  [/lake|\btal\b|taal|\bkund\b|\btal$/i, 'frozen_lake'],
  [/bugyal|meadow/i, 'meadow'],
  [/\bpass\b/i, 'pass_crossing'],
  [/hot spring|kheerganga/i, 'hot_springs'],
  [/temple|village|monaster/i, 'culture'],
  [/forest|snow/i, 'snow_forest'],
  [/view|panoram/i, 'views'],
];

/** Admin-set quiz tags, or tags inferred from the trek's name/summary when none are set. */
export function trekTags(trek: MarketingTrek): string[] {
  if (trek.quiz_tags && trek.quiz_tags.length > 0) return trek.quiz_tags;
  const text = `${trek.name} ${trek.short_description ?? ''}`;
  const tags = new Set<string>();
  for (const [re, tag] of KEYWORD_TAGS) if (re.test(text)) tags.add(tag);
  if (trek.duration <= 3) tags.add('weekend');
  if (DIFFICULTY_RANK[trek.difficulty] >= 4 || trek.max_altitude >= 5000) tags.add('extreme');
  return [...tags];
}

export function personaFor(trek: MarketingTrek): string {
  if (trek.quiz_persona?.trim()) return trek.quiz_persona.trim();
  return `The ${trek.name.replace(/\s+trek$/i, '').trim()} Trekker`;
}

export function shareLineFor(trek: MarketingTrek): string {
  if (trek.quiz_share_line?.trim()) return trek.quiz_share_line.trim();
  return `I got "${personaFor(trek)}" — ${trek.name}.`;
}

export function trekColdLevel(trek: MarketingTrek): number {
  if (trekTags(trek).includes('extreme')) return 3;
  if (trek.max_altitude >= 4000) return 3;
  if (trek.max_altitude >= 3000) return 2;
  return 1;
}

export function lowestPrice(trek: MarketingTrek): number {
  const open = trek.upcoming_batches.filter((b) => !b.is_sold_out).map((b) => b.price);
  return open.length ? Math.min(...open) : trek.price;
}

export function hasOpenBatch(trek: MarketingTrek): boolean {
  return trek.upcoming_batches.some((b) => !b.is_sold_out);
}

function daysFit(duration: number, days: DaysAvailable): number {
  if (days === 'weekend') return duration <= 3 ? 1 : duration <= 4 ? 0.6 : 0;
  if (days === 'week') return duration >= 4 && duration <= 7 ? 1 : duration <= 3 ? 0.5 : 0.2;
  return duration >= 5 ? 1 : 0.6;
}

function budgetFit(price: number, budget: Budget): number {
  if (budget === 'any') return 1;
  if (budget === 'low') return price <= 10000 ? 1 : price <= 13000 ? 0.5 : 0;
  return price <= 15000 ? 1 : price <= 20000 ? 0.4 : 0;
}

function momentFit(tags: string[], moment: Moment): number {
  const { primary, secondary } = MOMENT_TAGS[moment];
  if (tags.some((t) => primary.includes(t))) return 1;
  if (tags.some((t) => secondary.includes(t))) return 0.4;
  return 0;
}

export interface ScoredTrek {
  trek: MarketingTrek;
  score: number;
  reasons: string[];
}

export interface QuizResult {
  primary: ScoredTrek;
  alternates: ScoredTrek[];
  ranked: ScoredTrek[];
}

function scoreTrek(trek: MarketingTrek, a: QuizAnswers): ScoredTrek | null {
  const rank = DIFFICULTY_RANK[trek.difficulty] ?? 2;
  const allowed = MAX_DIFFICULTY[a.experience][a.fitness];
  if (rank > allowed + 1) return null;

  const tags = trekTags(trek);
  const price = lowestPrice(trek);
  const reasons: string[] = [];

  const moment = momentFit(tags, a.moment);
  const days = daysFit(trek.duration, a.days);
  const difficulty = rank <= allowed ? Math.max(0.4, 1 - 0.15 * (allowed - rank)) : 0;
  const coldGap = trekColdLevel(trek) - COLD_TOLERANCE[a.cold];
  const cold = coldGap <= 0 ? 1 : coldGap === 1 ? 0.3 : 0;
  const budget = budgetFit(price, a.budget);
  const company = a.company === 'family' ? (rank === 1 ? 1 : rank === 2 ? 0.5 : 0) : 0;
  const bookable = hasOpenBatch(trek) ? 1 : 0;

  if (moment === 1) reasons.push('It delivers exactly the moment you are trekking for.');
  if (days === 1) reasons.push(`At ${trek.duration} days it fits the time you have.`);
  if (difficulty >= 0.85) reasons.push('The difficulty matches your experience and fitness.');
  if (rank > allowed) reasons.push('It will stretch you — train well for it.');
  if (cold === 1 && trekColdLevel(trek) >= 2) reasons.push('You can handle the cold it brings.');
  if (budget === 1 && a.budget !== 'any') reasons.push('It sits within your package budget.');
  if (company === 1) reasons.push('It is gentle enough for a family group.');

  const score =
    WEIGHTS.moment * moment +
    WEIGHTS.days * days +
    WEIGHTS.difficulty * difficulty +
    WEIGHTS.cold * cold +
    WEIGHTS.budget * budget +
    WEIGHTS.company * company +
    WEIGHTS.bookable * bookable;

  return { trek, score: Math.round(score * 100) / 100, reasons };
}

/**
 * Rank treks for a set of answers. Treks far above the user's level are removed; weekend users
 * only see treks of 4 days or less unless nothing else remains. Ties go to the easier trek.
 */
export function rankTreks(treks: MarketingTrek[], answers: QuizAnswers): QuizResult | null {
  let scored = treks.map((t) => scoreTrek(t, answers)).filter((s): s is ScoredTrek => !!s);
  if (answers.days === 'weekend') {
    const short = scored.filter((s) => s.trek.duration <= 4);
    if (short.length) scored = short;
  }
  if (!scored.length) return null;
  scored.sort(
    (x, y) =>
      y.score - x.score ||
      (DIFFICULTY_RANK[x.trek.difficulty] ?? 2) - (DIFFICULTY_RANK[y.trek.difficulty] ?? 2) ||
      y.trek.rating - x.trek.rating ||
      x.trek.name.localeCompare(y.trek.name),
  );
  return { primary: scored[0], alternates: scored.slice(1, 3), ranked: scored };
}
