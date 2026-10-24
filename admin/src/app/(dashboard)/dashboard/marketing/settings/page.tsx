"use client";

import { useEffect, useState } from "react";
import { ExternalLink, GraduationCap, Calculator, HelpCircle, MapPinned, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useUIStore } from "@/store/ui.store";
import {
  marketingService,
  PUBLIC_SITE_URL,
  type GearItem,
  type MarketingSettingsData,
} from "@/services/marketing.service";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

const numOrNull = (value: string): number | null => (value.trim() === "" ? null : Number(value));
const toKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 50) || "item";

function Section({
  icon: Icon,
  title,
  description,
  link,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
            <Icon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
            View page <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <textarea
            rows={2}
            value={item}
            onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
            className={inputClass}
            placeholder={placeholder}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}

export default function MarketingSettingsPage() {
  const { addToast } = useUIStore();
  const [data, setData] = useState<MarketingSettingsData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    marketingService
      .getSettings()
      .then((s) => {
        setData({ student_discount: s.student_discount, quiz: s.quiz, calculator: s.calculator, city_pages: s.city_pages });
        setUpdatedAt(s.updated_at);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading marketing settings…</div>;
  if (!data) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error || "Could not load settings."}</div>;

  const sd = data.student_discount;
  const quiz = data.quiz;
  const calc = data.calculator;
  const rules = data.city_pages;

  const setStudent = (patch: Partial<typeof sd>) => setData({ ...data, student_discount: { ...sd, ...patch } });
  const setQuiz = (patch: Partial<typeof quiz>) => setData({ ...data, quiz: { ...quiz, ...patch } });
  const setCalc = (patch: Partial<typeof calc>) => setData({ ...data, calculator: { ...calc, ...patch } });
  const setRules = (patch: Partial<typeof rules>) => setData({ ...data, city_pages: { ...rules, ...patch } });
  const setGear = (index: number, patch: Partial<GearItem>) =>
    setCalc({ gear_items: calc.gear_items.map((g, i) => (i === index ? { ...g, ...patch } : g)) });

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const cleaned: MarketingSettingsData = {
        ...data,
        student_discount: {
          ...sd,
          terms: sd.terms.map((t) => t.trim()).filter(Boolean),
          faqs: sd.faqs.filter((f) => f.question.trim() && f.answer.trim()),
        },
        calculator: {
          ...calc,
          gear_items: calc.gear_items.filter((g) => g.label.trim()),
        },
      };
      const saved = await marketingService.updateSettings(cleaned);
      setData({ student_discount: saved.student_discount, quiz: saved.quiz, calculator: saved.calculator, city_pages: saved.city_pages });
      setUpdatedAt(saved.updated_at);
      addToast({ type: "success", message: "Marketing settings saved" });
    } catch (e: any) {
      setError(e.message || "Failed to save");
      addToast({ type: "error", message: "Failed to save marketing settings" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Growth Tool Settings"
        description="Student discount, trek finder quiz, budget calculator and city page rules. Changes go live immediately."
        breadcrumbs={[{ label: "Marketing" }, { label: "Tool Settings" }]}
        actions={
          <Button onClick={save} loading={saving}>
            Save settings
          </Button>
        }
      />
      {updatedAt && <p className="-mt-6 text-xs text-gray-500">Last saved {new Date(updatedAt).toLocaleString()}</p>}
      {error && <div className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Section icon={GraduationCap} title="Student discount" description="Shown on /student-discount, trek pages, city pages and the calculator." link={`${PUBLIC_SITE_URL}/student-discount/`}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Offer status" className="md:col-span-3">
            <Switch checked={sd.enabled} onChange={(v) => setStudent({ enabled: v })} label={sd.enabled ? "Live" : "Paused"} />
          </Field>
          <Field label="Discount (%)">
            <input type="number" min={0} max={100} step={0.5} className={inputClass} value={sd.percent}
              onChange={(e) => setStudent({ percent: Number(e.target.value) })} />
          </Field>
          <Field label="Max discount per student (₹)" hint="Leave empty for no cap">
            <input type="number" min={0} className={inputClass} value={sd.cap_inr ?? ""}
              onChange={(e) => setStudent({ cap_inr: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Verification promise" hint='e.g. "within 24 hours"'>
            <input className={inputClass} value={sd.verification_time_text}
              onChange={(e) => setStudent({ verification_time_text: e.target.value })} />
          </Field>
          <Field label="Group organiser bonus">
            <Switch checked={sd.group_bonus_enabled} onChange={(v) => setStudent({ group_bonus_enabled: v })} label={sd.group_bonus_enabled ? "On" : "Off"} />
          </Field>
          <Field label="Minimum students in group">
            <input type="number" min={2} className={inputClass} value={sd.group_min_size}
              onChange={(e) => setStudent({ group_min_size: Number(e.target.value) })} />
          </Field>
          <Field label="Organiser bonus (₹)">
            <input type="number" min={0} className={inputClass} value={sd.group_bonus_inr}
              onChange={(e) => setStudent({ group_bonus_inr: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Field label="Terms">
            <StringListEditor items={sd.terms} onChange={(terms) => setStudent({ terms })} placeholder="One condition per line" />
          </Field>
          <Field label="FAQs">
            <div className="space-y-3">
              {sd.faqs.map((faq, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-gray-200 p-3">
                  <input className={inputClass} placeholder="Question" value={faq.question}
                    onChange={(e) => setStudent({ faqs: sd.faqs.map((f, i) => (i === index ? { ...f, question: e.target.value } : f)) })} />
                  <textarea rows={2} className={inputClass} placeholder="Answer" value={faq.answer}
                    onChange={(e) => setStudent({ faqs: sd.faqs.map((f, i) => (i === index ? { ...f, answer: e.target.value } : f)) })} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStudent({ faqs: sd.faqs.filter((_, i) => i !== index) })}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setStudent({ faqs: [...sd.faqs, { question: "", answer: "" }] })}>
                <Plus className="h-4 w-4" /> Add FAQ
              </Button>
            </div>
          </Field>
        </div>
      </Section>

      <Section icon={HelpCircle} title="Trek finder quiz" description="Recommends published treks whose best season overlaps these months. Per-trek tags and personas live on each trek's Marketing tab." link={`${PUBLIC_SITE_URL}/tools/winter-trek-quiz/`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Quiz status" className="md:col-span-2">
            <Switch checked={quiz.enabled} onChange={(v) => setQuiz({ enabled: v })} label={quiz.enabled ? "Live" : "Paused"} />
          </Field>
          <Field label="Title">
            <input className={inputClass} value={quiz.title} maxLength={120} onChange={(e) => setQuiz({ title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <input className={inputClass} value={quiz.subtitle} maxLength={300} onChange={(e) => setQuiz({ subtitle: e.target.value })} />
          </Field>
          <Field label="Season months" className="md:col-span-2" hint="Only treks with at least one of these months in their best season are recommended.">
            <div className="flex flex-wrap gap-2">
              {MONTHS.map((month) => {
                const selected = quiz.season_months.includes(month);
                return (
                  <button key={month} type="button"
                    onClick={() => setQuiz({
                      season_months: selected
                        ? quiz.season_months.filter((m) => m !== month)
                        : MONTHS.filter((m) => m === month || quiz.season_months.includes(m)),
                    })}
                    className={cn("rounded-full border px-3 py-1 text-xs", selected ? "border-primary-500 bg-primary-500 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-primary-500")}>
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </Section>

      <Section icon={Calculator} title="Budget calculator" description="Rates used for everything outside the package price. Empty rates are hidden from users instead of guessed." link={`${PUBLIC_SITE_URL}/tools/trek-budget-calculator/`}>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Calculator status" className="md:col-span-2">
            <Switch checked={calc.enabled} onChange={(v) => setCalc({ enabled: v })} label={calc.enabled ? "Live" : "Paused"} />
          </Field>
          <Field label="Trek prices include GST" className="md:col-span-1">
            <Switch checked={calc.price_includes_gst} onChange={(v) => setCalc({ price_includes_gst: v })} label={calc.price_includes_gst ? "Yes" : "No, add GST"} />
          </Field>
          <Field label="GST (%)">
            <input type="number" min={0} max={28} step={0.5} className={inputClass} value={calc.gst_percent}
              onChange={(e) => setCalc({ gst_percent: Number(e.target.value) })} />
          </Field>
          <Field label="Budget stay (₹/person/night)">
            <input type="number" min={0} className={inputClass} value={calc.hotel_budget_per_night ?? ""} onChange={(e) => setCalc({ hotel_budget_per_night: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Mid-range stay (₹/person/night)">
            <input type="number" min={0} className={inputClass} value={calc.hotel_mid_per_night ?? ""} onChange={(e) => setCalc({ hotel_mid_per_night: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Comfort stay (₹/person/night)">
            <input type="number" min={0} className={inputClass} value={calc.hotel_comfort_per_night ?? ""} onChange={(e) => setCalc({ hotel_comfort_per_night: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Food per travel day (₹)">
            <input type="number" min={0} className={inputClass} value={calc.food_per_travel_day ?? ""} onChange={(e) => setCalc({ food_per_travel_day: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Backpack offloading (₹/day)">
            <input type="number" min={0} className={inputClass} value={calc.offloading_per_day ?? ""} onChange={(e) => setCalc({ offloading_per_day: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Travel insurance (₹/person)">
            <input type="number" min={0} className={inputClass} value={calc.insurance_per_person ?? ""} onChange={(e) => setCalc({ insurance_per_person: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Default buffer (%)">
            <input type="number" min={0} max={50} className={inputClass} value={calc.buffer_percent} onChange={(e) => setCalc({ buffer_percent: Number(e.target.value) })} />
          </Field>
          <Field label="Rates last checked" hint="Shown to users under the total">
            <input type="date" className={inputClass} value={calc.prices_last_checked ?? ""} onChange={(e) => setCalc({ prices_last_checked: e.target.value || null })} />
          </Field>
        </div>

        <h3 className="mb-2 mt-6 text-sm font-semibold text-gray-900">Gear rental &amp; purchase prices</h3>
        <p className="mb-3 text-xs text-gray-500">
          Keywords are matched against each trek&apos;s equipment list (to show the item) and its &quot;includes&quot; list (to mark it as included). Items without any price are hidden.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2 pr-2 font-medium">Item</th>
                <th className="py-2 pr-2 font-medium">Rent (₹)</th>
                <th className="py-2 pr-2 font-medium">Buy (₹)</th>
                <th className="py-2 pr-2 font-medium">Keywords (comma separated)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {calc.gear_items.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-2 pr-2">
                    <input className={inputClass} value={item.label}
                      onChange={(e) => setGear(index, { label: e.target.value, key: item.key || toKey(e.target.value) })} />
                  </td>
                  <td className="w-28 py-2 pr-2">
                    <input type="number" min={0} className={inputClass} value={item.rent_price ?? ""} onChange={(e) => setGear(index, { rent_price: numOrNull(e.target.value) })} />
                  </td>
                  <td className="w-28 py-2 pr-2">
                    <input type="number" min={0} className={inputClass} value={item.buy_price ?? ""} onChange={(e) => setGear(index, { buy_price: numOrNull(e.target.value) })} />
                  </td>
                  <td className="py-2 pr-2">
                    <input className={inputClass} value={item.keywords.join(", ")}
                      onChange={(e) => setGear(index, { keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })} />
                  </td>
                  <td className="py-2">
                    <Button type="button" variant="ghost" size="sm" aria-label="Remove item"
                      onClick={() => setCalc({ gear_items: calc.gear_items.filter((_, i) => i !== index) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-3"
          onClick={() => {
            const used = new Set(calc.gear_items.map((g) => g.key));
            let key = "new_item";
            for (let n = 2; used.has(key); n++) key = `new_item_${n}`;
            setCalc({ gear_items: [...calc.gear_items, { key, label: "", rent_price: null, buy_price: null, keywords: [] }] });
          }}>
          <Plus className="h-4 w-4" /> Add gear item
        </Button>
      </Section>

      <Section icon={MapPinned} title="City page quality rules" description='A "Treks from [city]" page can only be published while it meets these rules.' link={`${PUBLIC_SITE_URL}/treks-from/`}>
        <div className="grid gap-4 md:grid-cols-5">
          <Field label="Re-verify every (days)">
            <input type="number" min={7} max={365} className={inputClass} value={rules.max_age_days} onChange={(e) => setRules({ max_age_days: Number(e.target.value) })} />
          </Field>
          <Field label="Min routes">
            <input type="number" min={1} max={20} className={inputClass} value={rules.min_routes} onChange={(e) => setRules({ min_routes: Number(e.target.value) })} />
          </Field>
          <Field label="Min local tips">
            <input type="number" min={0} max={20} className={inputClass} value={rules.min_tips} onChange={(e) => setRules({ min_tips: Number(e.target.value) })} />
          </Field>
          <Field label="Min FAQs">
            <input type="number" min={0} max={20} className={inputClass} value={rules.min_faqs} onChange={(e) => setRules({ min_faqs: Number(e.target.value) })} />
          </Field>
          <Field label="Min intro characters">
            <input type="number" min={0} max={5000} className={inputClass} value={rules.min_intro_chars} onChange={(e) => setRules({ min_intro_chars: Number(e.target.value) })} />
          </Field>
        </div>
      </Section>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur lg:left-64">
        <div className="flex justify-end">
          <Button onClick={save} loading={saving}>Save settings</Button>
        </div>
      </div>
    </div>
  );
}
