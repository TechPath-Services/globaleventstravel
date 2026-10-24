import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INPUTS,
  computeBudget,
  gearRowsFor,
  inputsToParams,
  paramsToInputs,
  routeFare,
  type BudgetInputs,
} from './budget';
import { calculatorSettings, route, studentSettings, trek } from './__fixtures__';

const kedarkantha = trek({
  upcoming_batches: [
    { id: 7, start_date: '2027-01-10', end_date: '2027-01-15', price: 9000, available_seats: 4, is_sold_out: false },
    { id: 8, start_date: '2027-02-10', end_date: '2027-02-15', price: 8500, available_seats: 0, is_sold_out: true },
  ],
});
const volvo = route({ id: 1 });
const ordinary = route({ id: 2, mode: 'ordinary_bus', fare_min: 400, fare_max: 500 });
const rishikesh = route({ id: 3, to_base: 'Rishikesh' });

const inputs = (overrides: Partial<BudgetInputs> = {}): BudgetInputs => ({
  ...DEFAULT_INPUTS,
  trek: 'kedarkantha',
  ...overrides,
});

const run = (overrides: Partial<BudgetInputs> = {}, extra: Partial<Parameters<typeof computeBudget>[0]> = {}) =>
  computeBudget({
    inputs: inputs(overrides),
    trek: kedarkantha,
    routes: [volvo, ordinary, rishikesh],
    calculator: calculatorSettings,
    student: studentSettings,
    ...extra,
  });

const line = (result: ReturnType<typeof run>, key: string) => result.lines.find((l) => l.key === key);

describe('computeBudget', () => {
  it('uses the base price with no batch and adds the default buffer', () => {
    const result = run({ nightsBefore: 0 });
    expect(line(result, 'package')!.group).toBe(10000);
    expect(line(result, 'buffer')!.group).toBe(1000);
    expect(result.groupTotal).toBe(11000);
    expect(result.perPerson).toBe(11000);
  });

  it('uses the selected batch price and suggests a cheaper open batch only', () => {
    const result = run({ batch: 7, nightsBefore: 0, buffer: 0 });
    expect(line(result, 'package')!.group).toBe(9000);
    expect(result.tips.find((t) => t.key === 'batch')).toBeUndefined();
    const base = run({ nightsBefore: 0, buffer: 0 });
    expect(base.tips.find((t) => t.key === 'batch')!.saving).toBe(1000);
  });

  it('applies student discounts per student plus the organiser bonus', () => {
    const result = run({ people: 8, students: 8, nightsBefore: 0, buffer: 0 });
    expect(line(result, 'student')!.group).toBe(-8000);
    expect(line(result, 'group_bonus')!.group).toBe(-1000);
    expect(result.groupTotal).toBe(80000 - 9000);
  });

  it('clamps students to the group size', () => {
    const result = run({ people: 2, students: 5, nightsBefore: 0, buffer: 0 });
    expect(line(result, 'student')!.group).toBe(-2000);
  });

  it('adds GST only when prices exclude it', () => {
    expect(line(run(), 'gst')).toBeUndefined();
    const result = run({ nightsBefore: 0, buffer: 0 }, {
      calculator: { ...calculatorSettings, price_includes_gst: false },
    });
    expect(line(result, 'gst')!.group).toBe(500);
  });

  it('prices a round trip on a route to the trek pickup and suggests the cheaper one', () => {
    const result = run({ route: 1, people: 2, nightsBefore: 0, buffer: 0 });
    expect(line(result, 'travel')!.group).toBe(900 * 2 * 2);
    expect(line(result, 'food')!.group).toBe(500 * 2 * 2);
    expect(result.tips.find((t) => t.key === 'cheaper_route')!.saving).toBe((900 - 450) * 2 * 2);
  });

  it('ignores routes to a different base and falls back to a custom travel estimate', () => {
    expect(line(run({ route: 3 }), 'travel')).toBeUndefined();
    const custom = run({ route: 3, customTravel: 2000, people: 2 });
    expect(line(custom, 'travel')!.group).toBe(4000);
  });

  it('prices hotel nights and reports missing rates instead of guessing', () => {
    const mid = run({ nightsBefore: 1, nightsAfter: 1, people: 2 });
    expect(line(mid, 'hotel')!.group).toBe(1500 * 2 * 2);
    expect(mid.tips.find((t) => t.key === 'hotel_budget')!.saving).toBe(700 * 2 * 2);
    const comfort = run({ hotel: 'comfort' });
    expect(line(comfort, 'hotel')).toBeUndefined();
    expect(comfort.unpriced).toContain('Hotel nights');
  });

  it('prices gear, skips included items and suggests renting', () => {
    const result = run({
      nightsBefore: 0,
      buffer: 0,
      gear: { down_jacket: 'buy', trek_poles: 'rent', microspikes: 'buy' },
    });
    expect(line(result, 'gear')!.group).toBe(3000 + 150);
    expect(result.tips.find((t) => t.key === 'gear_rent')!.saving).toBe(2600);
  });

  it('prices offloading per trek day and flags unpriced insurance', () => {
    const result = run({ offloading: true, insurance: true, nightsBefore: 0 });
    expect(line(result, 'offloading')!.group).toBe(300 * 6);
    expect(result.unpriced).toContain('Travel insurance');
  });

  it('never returns a negative total', () => {
    const result = run(
      { students: 1, nightsBefore: 0, buffer: 0 },
      { student: { ...studentSettings, percent: 100, cap_inr: null } },
    );
    expect(result.groupTotal).toBe(0);
  });
});

describe('gear rows and fares', () => {
  it('shows only priced items relevant to the trek and marks included ones', () => {
    const rows = gearRowsFor(kedarkantha, calculatorSettings.gear_items);
    expect(rows.map((r) => r.item.key)).toEqual(['down_jacket', 'trek_poles', 'microspikes']);
    expect(rows.find((r) => r.item.key === 'microspikes')!.included).toBe(true);
  });

  it('uses the fare midpoint', () => {
    expect(routeFare(route({ fare_min: 700, fare_max: 900 }))).toBe(800);
    expect(routeFare(route({ fare_min: null, fare_max: 900 }))).toBe(900);
    expect(routeFare(route({ fare_min: null, fare_max: null }))).toBeNull();
  });
});

describe('URL state', () => {
  it('round-trips inputs', () => {
    const original = inputs({
      batch: 7,
      people: 4,
      students: 2,
      from: 'delhi',
      route: 1,
      nightsAfter: 1,
      hotel: 'budget',
      gear: { down_jacket: 'rent', trek_poles: 'buy', gaiters: 'own' },
      offloading: true,
      buffer: 15,
    });
    const restored = paramsToInputs(inputsToParams(original), 'x');
    expect(restored).toEqual({ ...original, gear: { down_jacket: 'rent', trek_poles: 'buy' } });
  });

  it('sanitises hostile or out-of-range params', () => {
    const p = new URLSearchParams('trek=../../etc&people=999&students=-3&hotel=palace&gear=x:z,ok:r&buf=abc');
    const parsed = paramsToInputs(p, 'kedarkantha');
    expect(parsed.trek).toBe('kedarkantha');
    expect(parsed.people).toBe(50);
    expect(parsed.students).toBe(0);
    expect(parsed.hotel).toBe('mid');
    expect(parsed.gear).toEqual({ ok: 'rent' });
    expect(parsed.buffer).toBe(10);
  });
});
