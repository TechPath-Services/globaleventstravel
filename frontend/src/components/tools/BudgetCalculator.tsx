import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CalculatorSettings,
  CityRoute,
  MarketingTrek,
  StudentDiscountSettings,
} from '@/lib/types';
import {
  computeBudget,
  gearRowsFor,
  inputsToParams,
  paramsToInputs,
  routeFare,
  routesForTrek,
  type BudgetInputs,
  type GearChoice,
  type HotelTier,
} from '@/lib/marketing/budget';
import { studentDiscountAmount } from '@/lib/marketing/discount';
import { formatDate, formatHours, formatInr, routeModeLabel } from '@/lib/marketing/format';
import { track } from '@/lib/marketing/analytics';
import MarketingLeadForm from './MarketingLeadForm';
import ShareButtons from './ShareButtons';

export interface CalculatorCity {
  slug: string;
  name: string;
  routes: CityRoute[];
}

interface BudgetCalculatorProps {
  treks: MarketingTrek[];
  cities: CalculatorCity[];
  calculator: CalculatorSettings;
  student: StudentDiscountSettings;
  initialQuery: string;
  /** Absolute URL of the full calculator page (used for share links and embeds). */
  fullUrl: string;
  embed?: boolean;
}

const HOTEL_LABELS: Record<HotelTier, string> = { budget: 'Budget', mid: 'Mid-range', comfort: 'Comfort' };
const field = 'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const label = 'mb-1 block text-sm font-medium text-neutral-800';
const card = 'rounded-xl border border-neutral-200 bg-white p-5';

function Stepper({ value, min, max, onChange, id }: { value: number; min: number; max: number; onChange: (v: number) => void; id: string }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Decrease" className="h-9 w-9 rounded-lg border border-neutral-300 text-lg hover:bg-neutral-50 disabled:opacity-40"
        onClick={() => onChange(value - 1)} disabled={value <= min}>−</button>
      <input id={id} type="number" min={min} max={max} value={value} className={`${field} w-16 text-center`}
        onChange={(e) => onChange(Number(e.target.value))} />
      <button type="button" aria-label="Increase" className="h-9 w-9 rounded-lg border border-neutral-300 text-lg hover:bg-neutral-50 disabled:opacity-40"
        onClick={() => onChange(value + 1)} disabled={value >= max}>+</button>
    </div>
  );
}

export default function BudgetCalculator({
  treks,
  cities,
  calculator,
  student,
  initialQuery,
  fullUrl,
  embed = false,
}: BudgetCalculatorProps) {
  const [inputs, setInputs] = useState<BudgetInputs>(() => {
    const parsed = paramsToInputs(new URLSearchParams(initialQuery), treks[0]?.slug ?? '');
    return treks.some((t) => t.slug === parsed.trek) ? parsed : { ...parsed, trek: treks[0]?.slug ?? '' };
  });
  const interacted = useRef(false);

  const trek = treks.find((t) => t.slug === inputs.trek) ?? treks[0];
  const city = cities.find((c) => c.slug === inputs.from) ?? null;
  const tripRoutes = useMemo(() => (trek && city ? routesForTrek(city.routes, trek) : []), [trek, city]);
  const gearRows = useMemo(() => (trek ? gearRowsFor(trek, calculator.gear_items) : []), [trek, calculator.gear_items]);
  const hotelTiers = (['budget', 'mid', 'comfort'] as HotelTier[]).filter(
    (tier) => calculator[`hotel_${tier}_per_night` as keyof CalculatorSettings] != null,
  );

  const result = useMemo(
    () => (trek ? computeBudget({ inputs, trek, routes: city?.routes ?? [], calculator, student }) : null),
    [inputs, trek, city, calculator, student],
  );
  const shareQuery = inputsToParams(inputs).toString();
  const shareUrl = `${fullUrl}?${shareQuery}`;

  useEffect(() => {
    if (embed || typeof window === 'undefined') return;
    window.history.replaceState(null, '', `${window.location.pathname}?${shareQuery}`);
  }, [shareQuery, embed]);

  const update = (patch: Partial<BudgetInputs>) => {
    if (!interacted.current) {
      interacted.current = true;
      track('calculator_start', { trek: inputs.trek });
    }
    setInputs((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    if (!interacted.current || !result) return;
    const timer = setTimeout(() => {
      track('calculator_complete', {
        trek: inputs.trek,
        from_city: inputs.from ?? 'none',
        people: inputs.people,
        students: inputs.students,
        total: result.groupTotal,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [result, inputs.trek, inputs.from, inputs.people, inputs.students]);

  if (!trek || !result) {
    return <p className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">No treks are open for planning right now. Please check back soon.</p>;
  }

  const perStudent = studentDiscountAmount(inputs.batch != null
    ? (trek.upcoming_batches.find((b) => b.id === inputs.batch)?.price ?? trek.price)
    : trek.price, student);
  const openBatches = trek.upcoming_batches.filter((b) => !b.is_sold_out);
  const selectedRoute = tripRoutes.find((r) => r.id === inputs.route) ?? null;

  const changeTrek = (slug: string) => update({ trek: slug, batch: null, route: null, gear: {} });
  const changeCity = (slug: string) => update({ from: slug || null, route: null });
  const setGear = (key: string, choice: GearChoice) => update({ gear: { ...inputs.gear, [key]: choice } });

  const summary = `${trek.name} for ${inputs.people} ${inputs.people > 1 ? 'people' : 'person'}: about ${formatInr(result.groupTotal)} all-in (${formatInr(result.perPerson)} per person).`;

  return (
    <div className={`grid gap-6 ${embed ? '' : 'lg:grid-cols-5'}`}>
      <div className={`space-y-4 ${embed ? '' : 'lg:col-span-3'}`}>
        <section className={card}>
          <h2 className="mb-4 text-lg font-bold">1. Trek &amp; dates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="calc-trek">Trek</label>
              <select id="calc-trek" className={field} value={trek.slug} onChange={(e) => changeTrek(e.target.value)}>
                {treks.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.name} ({t.duration} days)</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="calc-batch">Batch</label>
              <select id="calc-batch" className={field} value={inputs.batch ?? ''}
                onChange={(e) => update({ batch: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Any date ({formatInr(trek.price)})</option>
                {openBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {formatDate(b.start_date, { year: undefined })} · {formatInr(b.price)} · {b.available_seats} seats left
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className={card}>
          <h2 className="mb-4 text-lg font-bold">2. Who's going</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="calc-people">People</label>
              <Stepper id="calc-people" value={inputs.people} min={1} max={50} onChange={(v) => update({ people: v })} />
            </div>
            {student.enabled && perStudent > 0 && (
              <div>
                <label className={label} htmlFor="calc-students">Students with valid ID</label>
                <Stepper id="calc-students" value={inputs.students} min={0} max={inputs.people} onChange={(v) => update({ students: v })} />
                <p className="mt-1 text-xs text-neutral-500">Each saves {formatInr(perStudent)}. <a href="/student-discount/" className="underline">How it works</a></p>
              </div>
            )}
          </div>
        </section>

        <section className={card}>
          <h2 className="mb-1 text-lg font-bold">3. Getting to {trek.pickup_city || 'the pickup point'}</h2>
          {trek.pickup_time && trek.pickup_city && (
            <p className="mb-4 text-sm text-neutral-600">Pickup is at {trek.pickup_time} in {trek.pickup_city}.</p>
          )}
          <div className="mb-4">
            <label className={label} htmlFor="calc-from">Starting from</label>
            <select id="calc-from" className={field} value={inputs.from ?? ''} onChange={(e) => changeCity(e.target.value)}>
              <option value="">Somewhere else / I'll enter my own cost</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {tripRoutes.length > 0 && (
            <div className="space-y-2" role="radiogroup" aria-label="Travel option">
              {tripRoutes.map((r) => {
                const fare = routeFare(r);
                const checked = inputs.route === r.id;
                return (
                  <label key={r.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${checked ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-300'}`}>
                    <input type="radio" name="calc-route" className="mt-1" checked={checked} onChange={() => update({ route: r.id, customTravel: null })} />
                    <span className="flex-1">
                      <span className="font-semibold text-neutral-900">{routeModeLabel(r.mode)}</span>
                      {r.operator && <span className="text-neutral-600"> · {r.operator}</span>}
                      <span className="block text-neutral-600">
                        {[r.departure_point, r.departure_time, formatHours(r.duration_hours)].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {fare != null && <span className="font-semibold text-neutral-900">~{formatInr(fare)}<span className="block text-xs font-normal text-neutral-500">each way</span></span>}
                  </label>
                );
              })}
              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${!selectedRoute ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'}`}>
                <input type="radio" name="calc-route" checked={!selectedRoute} onChange={() => update({ route: null })} />
                <span>I'll arrange my own travel</span>
              </label>
            </div>
          )}

          {inputs.from && tripRoutes.length === 0 && (
            <p className="mb-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
              We haven't verified routes from {city?.name} to {trek.pickup_city || 'this pickup'} yet. Enter your own estimate below.
            </p>
          )}

          {!selectedRoute && (
            <div className="mt-3">
              <label className={label} htmlFor="calc-travel">Your round-trip travel cost per person (optional)</label>
              <input id="calc-travel" type="number" min={0} step={100} className={field} placeholder="e.g. 2000"
                value={inputs.customTravel ?? ''} onChange={(e) => update({ customTravel: e.target.value === '' ? null : Number(e.target.value) })} />
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-4 text-lg font-bold">4. Stay &amp; extras</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label} htmlFor="calc-nb">Nights before</label>
              <Stepper id="calc-nb" value={inputs.nightsBefore} min={0} max={5} onChange={(v) => update({ nightsBefore: v })} />
            </div>
            <div>
              <label className={label} htmlFor="calc-na">Nights after</label>
              <Stepper id="calc-na" value={inputs.nightsAfter} min={0} max={5} onChange={(v) => update({ nightsAfter: v })} />
            </div>
            {hotelTiers.length > 0 && (
              <div>
                <label className={label} htmlFor="calc-hotel">Stay type</label>
                <select id="calc-hotel" className={field} value={inputs.hotel} onChange={(e) => update({ hotel: e.target.value as HotelTier })}>
                  {hotelTiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {HOTEL_LABELS[tier]} ({formatInr(calculator[`hotel_${tier}_per_night` as keyof CalculatorSettings] as number)}/night)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {calculator.offloading_per_day != null && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={inputs.offloading} onChange={(e) => update({ offloading: e.target.checked })} />
                Backpack offloading ({formatInr(calculator.offloading_per_day)}/day)
              </label>
            )}
            {calculator.insurance_per_person != null && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={inputs.insurance} onChange={(e) => update({ insurance: e.target.checked })} />
                Travel insurance ({formatInr(calculator.insurance_per_person)})
              </label>
            )}
          </div>

          <div className="mt-4">
            <label className={label} htmlFor="calc-buffer">Buffer for snacks, tips &amp; delays: {inputs.buffer}%</label>
            <input id="calc-buffer" type="range" min={0} max={30} step={5} value={inputs.buffer} className="w-full accent-primary-500"
              onChange={(e) => update({ buffer: Number(e.target.value) })} />
          </div>
        </section>

        {gearRows.length > 0 && (
          <section className={card}>
            <h2 className="mb-1 text-lg font-bold">5. Gear</h2>
            <p className="mb-4 text-sm text-neutral-600">Already own it? Leave it on "Own".</p>
            <div className="divide-y divide-neutral-100">
              {gearRows.map(({ item, included }) => (
                <div key={item.key} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <span className="font-medium text-neutral-900">{item.label}</span>
                  {included ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Included in package ✓</span>
                  ) : (
                    <div className="flex gap-1" role="radiogroup" aria-label={item.label}>
                      {(['own', 'rent', 'buy'] as GearChoice[]).map((choice) => {
                        const price = choice === 'rent' ? item.rent_price : choice === 'buy' ? item.buy_price : 0;
                        if (price == null) return null;
                        const active = (inputs.gear[item.key] ?? 'own') === choice;
                        return (
                          <button key={choice} type="button" aria-pressed={active} onClick={() => setGear(item.key, choice)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${active ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300'}`}>
                            {choice === 'own' ? 'Own' : `${choice === 'rent' ? 'Rent' : 'Buy'} ${formatInr(price)}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className={embed ? '' : 'lg:col-span-2'}>
        <div className={`space-y-4 ${embed ? '' : 'lg:sticky lg:top-24'}`}>
          <section className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-lg" aria-live="polite">
            <div className="bg-secondary-600 p-5 text-white">
              <p className="text-sm text-white/80">Estimated all-in cost</p>
              <p className="text-3xl font-bold text-white">{formatInr(result.groupTotal)}</p>
              <p className="text-sm text-white/80">
                {inputs.people > 1 ? `${formatInr(result.perPerson)} per person · ${inputs.people} people` : 'for 1 person'}
              </p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.key} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-2.5">
                      <span className="text-neutral-900">{line.label}</span>
                      {line.note && <span className="block text-xs text-neutral-500">{line.note}</span>}
                    </td>
                    <td className={`px-5 py-2.5 text-right font-medium ${line.group < 0 ? 'text-green-700' : 'text-neutral-900'}`}>
                      {line.group < 0 ? `− ${formatInr(-line.group)}` : formatInr(line.group)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.unpriced.length > 0 && (
              <p className="border-t border-neutral-100 px-5 py-3 text-xs text-amber-700">
                Not included yet (ask us for a quote): {result.unpriced.join(', ')}.
              </p>
            )}
            <p className="border-t border-neutral-100 bg-neutral-50 px-5 py-3 text-xs text-neutral-500">
              Package price is live from our booking system{calculator.prices_last_checked ? `; other rates last checked ${formatDate(calculator.prices_last_checked)}` : ''}. Travel fares are midpoints of verified ranges.
            </p>
          </section>

          {result.tips.length > 0 && (
            <section className={card}>
              <h3 className="mb-3 text-lg font-bold">Ways to bring this down</h3>
              <ul className="space-y-2 text-sm">
                {result.tips.map((tip) => (
                  <li key={tip.key} className="flex items-start justify-between gap-3">
                    <span className="text-neutral-700">
                      {tip.href ? <a href={tip.href} className="underline">{tip.text}</a> : tip.text}
                    </span>
                    <span className="whitespace-nowrap font-semibold text-green-700">save {formatInr(tip.saving)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {embed ? (
            <a href={shareUrl} target="_blank" rel="noopener" className="btn-primary w-full">
              Open the full calculator
            </a>
          ) : (
            <>
              <section className={card}>
                <h3 className="mb-3 text-lg font-bold">Share this breakdown</h3>
                <ShareButtons url={shareUrl} text={summary} event="calculator_share" eventProps={{ trek: trek.slug }} />
              </section>
              <MarketingLeadForm
                key={trek.slug}
                source="budget_calculator"
                title="Get an exact quote"
                subtitle="We'll confirm dates, seats and the final price on WhatsApp."
                ctaLabel="Get my quote on WhatsApp"
                successMessage="Thanks! Our team will WhatsApp you an exact quote shortly."
                trekSlug={trek.slug}
                trekName={trek.name}
                notes={`${summary} Breakdown: ${shareUrl}`.slice(0, 1500)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
