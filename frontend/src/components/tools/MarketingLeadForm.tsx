import { useState, type FormEvent } from 'react';
import { leadsApi } from '@/lib/api';
import { track } from '@/lib/marketing/analytics';

interface TrekChoice {
  slug: string;
  name: string;
}

interface ExtraField {
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface MarketingLeadFormProps {
  source: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  successTitle?: string;
  successMessage: string;
  /** Fixed trek for this form; otherwise the user picks from `trekChoices`. */
  trekSlug?: string;
  trekName?: string;
  trekChoices?: TrekChoice[];
  extraField?: ExtraField;
  /** Context for the sales team, stored in lead notes (e.g. quiz answers, calculator total). */
  notes?: string;
  askEmail?: boolean;
  className?: string;
}

interface Errors {
  name?: string;
  whatsapp?: string;
  email?: string;
  extra?: string;
  trek?: string;
}

const input =
  'w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20';

function refFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const ref = new URLSearchParams(window.location.search).get('ref');
  return ref && /^[\w-]{1,40}$/.test(ref) ? ref : null;
}

export default function MarketingLeadForm({
  source,
  title,
  subtitle,
  ctaLabel,
  successTitle = 'Thank you!',
  successMessage,
  trekSlug,
  trekName,
  trekChoices = [],
  extraField,
  notes,
  askEmail = true,
  className = '',
}: MarketingLeadFormProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [extra, setExtra] = useState('');
  const [selectedTrek, setSelectedTrek] = useState(trekSlug ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(whatsapp)) next.whatsapp = 'Enter a valid 10-digit Indian mobile number';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email';
    if (extraField?.required && extra.trim().length < 2) next.extra = `${extraField.label} is required`;
    if (!trekSlug && trekChoices.length > 0 && !selectedTrek) next.trek = 'Pick a trek (or "Not sure yet")';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const slug = trekSlug || selectedTrek || 'custom';
    const chosen = trekChoices.find((t) => t.slug === slug);
    const ref = refFromUrl();
    const noteParts = [
      notes,
      extraField && extra.trim() ? `${extraField.label}: ${extra.trim()}` : null,
      ref ? `ref: ${ref}` : null,
    ].filter(Boolean);

    try {
      await leadsApi.create({
        name: name.trim(),
        whatsapp,
        email: email.trim() || undefined,
        trek_slug: slug,
        trek_name: trekName || chosen?.name,
        source,
        notes: noteParts.length ? noteParts.join(' | ').slice(0, 2000) : undefined,
      });
      track('lead_submit', { source, trek: slug });
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={`rounded-xl border border-green-200 bg-green-50 p-6 text-center ${className}`}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
          ✓
        </div>
        <h3 className="mb-1 text-lg font-bold text-neutral-900">{successTitle}</h3>
        <p className="text-sm text-neutral-700">{successMessage}</p>
      </div>
    );
  }

  const border = (bad?: string) => (bad ? 'border-red-400 bg-red-50' : 'border-neutral-200 focus:border-primary-500');

  return (
    <form onSubmit={onSubmit} noValidate className={`rounded-xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>}

      <div className="mt-4 space-y-3">
        <div>
          <label className="sr-only" htmlFor={`${source}-name`}>Your name</label>
          <input id={`${source}-name`} className={`${input} ${border(errors.name)}`} placeholder="Your name"
            value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="sr-only" htmlFor={`${source}-wa`}>WhatsApp number</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">+91</span>
            <input id={`${source}-wa`} type="tel" inputMode="numeric" className={`${input} pl-11 ${border(errors.whatsapp)}`}
              placeholder="WhatsApp number" value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))} autoComplete="tel-national" />
          </div>
          {errors.whatsapp && <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>}
        </div>

        {askEmail && (
          <div>
            <label className="sr-only" htmlFor={`${source}-email`}>Email (optional)</label>
            <input id={`${source}-email`} type="email" className={`${input} ${border(errors.email)}`}
              placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        )}

        {extraField && (
          <div>
            <label className="sr-only" htmlFor={`${source}-extra`}>{extraField.label}</label>
            <input id={`${source}-extra`} className={`${input} ${border(errors.extra)}`}
              placeholder={extraField.placeholder ?? extraField.label} value={extra} onChange={(e) => setExtra(e.target.value)} />
            {errors.extra && <p className="mt-1 text-xs text-red-600">{errors.extra}</p>}
          </div>
        )}

        {!trekSlug && trekChoices.length > 0 && (
          <div>
            <label className="sr-only" htmlFor={`${source}-trek`}>Trek</label>
            <select id={`${source}-trek`} className={`${input} bg-white ${border(errors.trek)}`} value={selectedTrek}
              onChange={(e) => setSelectedTrek(e.target.value)}>
              <option value="">Which trek are you interested in?</option>
              {trekChoices.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
              <option value="custom">Not sure yet</option>
            </select>
            {errors.trek && <p className="mt-1 text-xs text-red-600">{errors.trek}</p>}
          </div>
        )}

        {trekSlug && trekName && (
          <p className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700">
            {trekName}
          </p>
        )}

        <button type="submit" disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 font-semibold text-white shadow-md shadow-orange-500/25 transition-all hover:from-orange-700 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? 'Sending…' : ctaLabel}
        </button>
        {submitError && <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">{submitError}</p>}
        <p className="text-center text-xs text-neutral-500">We reply on WhatsApp. No spam, ever.</p>
      </div>
    </form>
  );
}
