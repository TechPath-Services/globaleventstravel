import { describe, expect, it } from 'vitest';
import {
  answersToParams,
  buildQuestions,
  parseAnswers,
  personaFor,
  rankTreks,
  shareLineFor,
  trekTags,
  type QuizAnswers,
} from './quiz';
import { trek } from './__fixtures__';

const kedarkantha = trek();
const brahmatal = trek({
  id: 2,
  name: 'Brahmatal Trek',
  slug: 'brahmatal',
  difficulty: 'moderate',
  max_altitude: 3425,
  price: 11000,
  quiz_tags: ['frozen_lake', 'views'],
});
const nagTibba = trek({
  id: 3,
  name: 'Nag Tibba Trek',
  slug: 'nag-tibba',
  duration: 2,
  max_altitude: 3022,
  price: 4500,
  quiz_tags: ['weekend', 'summit'],
});
const chadar = trek({
  id: 4,
  name: 'Chadar Trek',
  slug: 'chadar',
  difficulty: 'challenging',
  duration: 9,
  max_altitude: 3400,
  price: 30000,
  quiz_tags: ['extreme'],
});
const all = [kedarkantha, brahmatal, nagTibba, chadar];

const base: QuizAnswers = {
  experience: 'none',
  fitness: 'medium',
  days: 'week',
  moment: 'summit',
  cold: 'cold',
  from: 'delhi',
  company: 'friends',
  budget: 'low',
};

describe('rankTreks', () => {
  it('recommends a summit trek that fits a first-timer week', () => {
    const result = rankTreks(all, base)!;
    expect(result.primary.trek.slug).toBe('kedarkantha');
    expect(result.alternates.length).toBeGreaterThan(0);
    expect(result.primary.reasons.length).toBeGreaterThan(0);
  });

  it('follows the moment the user wants', () => {
    expect(rankTreks(all, { ...base, moment: 'frozen_lake', budget: 'mid' })!.primary.trek.slug).toBe(
      'brahmatal',
    );
  });

  it('never recommends an extreme trek to a first-timer', () => {
    const result = rankTreks(all, { ...base, moment: 'extreme', budget: 'any' })!;
    expect(result.ranked.map((s) => s.trek.slug)).not.toContain('chadar');
  });

  it('recommends extreme treks to fit, experienced trekkers', () => {
    const result = rankTreks(all, {
      ...base,
      experience: 'experienced',
      fitness: 'high',
      days: 'long',
      moment: 'extreme',
      cold: 'extreme',
      budget: 'any',
    })!;
    expect(result.primary.trek.slug).toBe('chadar');
  });

  it('keeps weekend users on short treks when one exists', () => {
    const result = rankTreks(all, { ...base, days: 'weekend' })!;
    expect(result.ranked.every((s) => s.trek.duration <= 4)).toBe(true);
    expect(result.primary.trek.slug).toBe('nag-tibba');
  });

  it('falls back to longer treks for weekend users when nothing short exists', () => {
    const result = rankTreks([kedarkantha, brahmatal], { ...base, days: 'weekend' })!;
    expect(result.primary).toBeDefined();
  });

  it('prefers bookable treks on a tie', () => {
    const a = trek({ id: 10, slug: 'a', name: 'A' });
    const b = trek({
      id: 11,
      slug: 'b',
      name: 'B',
      upcoming_batches: [
        { id: 1, start_date: '2027-01-10', end_date: '2027-01-15', price: 10000, available_seats: 5, is_sold_out: false },
      ],
    });
    expect(rankTreks([a, b], base)!.primary.trek.slug).toBe('b');
  });

  it('returns null with no treks', () => {
    expect(rankTreks([], base)).toBeNull();
  });
});

describe('trek metadata helpers', () => {
  it('infers tags when admin has not set any', () => {
    const tags = trekTags(trek({ name: 'Prashar Lake Trek', quiz_tags: [], duration: 2 }));
    expect(tags).toContain('frozen_lake');
    expect(tags).toContain('weekend');
  });

  it('builds default persona and share lines', () => {
    expect(personaFor(trek({ quiz_persona: null }))).toBe('The Kedarkantha Trekker');
    expect(personaFor(trek({ quiz_persona: 'The Sunrise Summiteer' }))).toBe('The Sunrise Summiteer');
    expect(shareLineFor(trek())).toContain('Kedarkantha');
  });
});

describe('answers in the URL', () => {
  it('round-trips', () => {
    expect(parseAnswers(answersToParams(base))).toEqual(base);
  });

  it('rejects incomplete or tampered answers', () => {
    const params = answersToParams(base);
    params.set('moment', 'lava');
    expect(parseAnswers(params)).toBeNull();
    params.delete('moment');
    expect(parseAnswers(params)).toBeNull();
    const evil = answersToParams(base);
    evil.set('from', '<script>');
    expect(parseAnswers(evil)).toBeNull();
  });

  it('puts the from-city question after the cold question', () => {
    const ids = buildQuestions([{ slug: 'delhi', name: 'Delhi' }]).map((q) => q.id);
    expect(ids.indexOf('from')).toBe(ids.indexOf('cold') + 1);
    expect(ids).toHaveLength(8);
  });
});
