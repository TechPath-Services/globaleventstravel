"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";
import {
  departureCitySchema,
  numberOrNull,
  type DepartureCityFormData,
} from "@/lib/validations";
import { slugify, cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { trekService } from "@/services/trek.service";
import {
  ROUTE_MODE_LABELS,
  type CityPageRules,
  type DepartureCity,
  type DepartureCityPayload,
  type RouteMode,
} from "@/services/marketing.service";

interface DepartureCityFormProps {
  city?: DepartureCity;
  rules?: CityPageRules;
  onSubmit: (payload: DepartureCityPayload) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const blank = (v?: string | null) => (v && v.trim() ? v.trim() : null);
const today = () => new Date().toISOString().slice(0, 10);
const textLength = (html?: string) =>
  (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;

function emptyRoute(): DepartureCityFormData["routes"][number] {
  return {
    to_base: "",
    mode: "volvo_bus",
    operator: "",
    departure_point: "",
    departure_time: "",
    duration_hours: null,
    fare_min: null,
    fare_max: null,
    notes: "",
    source: "",
  };
}

export function toPayload(data: DepartureCityFormData): DepartureCityPayload {
  return {
    name: data.name.trim(),
    slug: data.slug,
    state: blank(data.state),
    display_order: data.display_order,
    hero_image: blank(data.hero_image),
    intro_html: blank(data.intro_html),
    local_tips: data.local_tips.map((t) => t.value.trim()).filter(Boolean),
    faqs: data.faqs.map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
    meta_title: blank(data.meta_title),
    meta_description: blank(data.meta_description),
    last_verified: blank(data.last_verified),
    verified_by: blank(data.verified_by),
    is_published: data.is_published,
    routes: data.routes.map((r) => ({
      to_base: r.to_base.trim(),
      mode: r.mode as RouteMode,
      operator: blank(r.operator),
      departure_point: blank(r.departure_point),
      departure_time: blank(r.departure_time),
      duration_hours: r.duration_hours,
      fare_min: r.fare_min,
      fare_max: r.fare_max,
      notes: blank(r.notes),
      source: blank(r.source),
    })),
  };
}

export function DepartureCityForm({ city, rules, onSubmit, isLoading, mode }: DepartureCityFormProps) {
  const [pickupCities, setPickupCities] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DepartureCityFormData>({
    resolver: zodResolver(departureCitySchema),
    defaultValues: {
      name: city?.name ?? "",
      slug: city?.slug ?? "",
      state: city?.state ?? "",
      display_order: city?.display_order ?? 0,
      hero_image: city?.hero_image ?? "",
      intro_html: city?.intro_html ?? "",
      local_tips: (city?.local_tips ?? []).map((value) => ({ value })),
      faqs: city?.faqs ?? [],
      meta_title: city?.meta_title ?? "",
      meta_description: city?.meta_description ?? "",
      last_verified: city?.last_verified ?? "",
      verified_by: city?.verified_by ?? "",
      is_published: city?.is_published ?? false,
      routes: (city?.routes ?? []).map((r) => ({
        to_base: r.to_base,
        mode: r.mode,
        operator: r.operator ?? "",
        departure_point: r.departure_point ?? "",
        departure_time: r.departure_time ?? "",
        duration_hours: r.duration_hours,
        fare_min: r.fare_min,
        fare_max: r.fare_max,
        notes: r.notes ?? "",
        source: r.source ?? "",
      })),
    },
  });

  const routes = useFieldArray({ control, name: "routes" });
  const tips = useFieldArray({ control, name: "local_tips" });
  const faqs = useFieldArray({ control, name: "faqs" });

  const name = watch("name");
  const intro = watch("intro_html");
  const metaTitle = watch("meta_title") || "";
  const metaDescription = watch("meta_description") || "";
  const routeBases = watch("routes").map((r) => r.to_base.trim().toLowerCase());

  useEffect(() => {
    if (mode === "create" && name) setValue("slug", slugify(name));
  }, [name, mode, setValue]);

  useEffect(() => {
    trekService
      .list({ limit: 100 })
      .then((res) => {
        const cities = res.items
          .map((t) => (t as { pickup_city?: string | null }).pickup_city)
          .filter((c): c is string => !!c);
        setPickupCities(Array.from(new Set(cities)).sort());
      })
      .catch(() => setPickupCities([]));
  }, []);

  const unmatchedBases = useMemo(() => {
    if (pickupCities.length === 0) return [];
    const known = new Set(pickupCities.map((c) => c.toLowerCase()));
    return Array.from(new Set(routeBases.filter((b) => b && !known.has(b))));
  }, [routeBases, pickupCities]);

  const introLength = textLength(intro);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(toPayload(data)))} className="space-y-6">
      {city && (
        <Card className={city.quality_issues.length ? "border-amber-300" : "border-green-300"}>
          <CardContent className="py-4">
            {city.quality_issues.length === 0 ? (
              <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" /> Passes all quality checks{city.is_published ? " and is live." : ". You can publish it."}
              </p>
            ) : (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> Fix these before publishing (as of last save):
                </p>
                <ul className="list-disc space-y-1 pl-6 text-sm text-amber-900">
                  {city.quality_issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {city.reachable_treks.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Treks shown on this page: {city.reachable_treks.map((t) => t.name).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">City</h3>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <FormField label="City name" required error={errors.name?.message}>
            <Input {...register("name")} placeholder="Delhi" />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message} hint="/treks-from/[slug]/">
            <Input {...register("slug")} placeholder="delhi" />
          </FormField>
          <FormField label="State / region" error={errors.state?.message}>
            <Input {...register("state")} placeholder="Delhi NCR" />
          </FormField>
          <FormField label="Display order" error={errors.display_order?.message}>
            <Input type="number" min={0} {...register("display_order", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Hero image" className="md:col-span-4" error={errors.hero_image?.message}>
            <Controller
              control={control}
              name="hero_image"
              render={({ field }) => <ImageUpload value={field.value || ""} onChange={field.onChange} folder="cities" />}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">City-specific introduction</h3>
          <p className="text-sm text-gray-600">
            Write advice only someone who knows this city would give. Copy-pasted text across cities is treated as spam by Google.
          </p>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name="intro_html"
            render={({ field }) => <RichTextEditor value={field.value || ""} onChange={field.onChange} />}
          />
          {rules && (
            <p className={cn("mt-2 text-sm", introLength >= rules.min_intro_chars ? "text-green-700" : "text-amber-700")}>
              {introLength} / {rules.min_intro_chars} characters minimum
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Routes</h3>
            <p className="text-sm text-gray-600">
              One row per way of getting there. &quot;Destination&quot; must match a trek&apos;s pickup city. Fares are one-way per person.
              {rules && ` At least ${rules.min_routes} complete routes are required to publish.`}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => routes.append(emptyRoute())}>
            <Plus className="h-4 w-4" /> Add route
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <datalist id="pickup-cities">
            {pickupCities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {unmatchedBases.length > 0 && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              No trek has these pickup cities yet: {unmatchedBases.join(", ")}. Set the pickup city on the trek (Marketing tab) or fix the spelling.
            </p>
          )}
          {routes.fields.length === 0 && <p className="text-sm text-gray-500">No routes yet.</p>}
          {routes.fields.map((field, index) => {
            const err = errors.routes?.[index];
            return (
              <div key={field.id} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Route {index + 1}</span>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => routes.move(index, index - 1)}>↑</Button>
                    <Button type="button" variant="ghost" size="sm" disabled={index === routes.fields.length - 1} onClick={() => routes.move(index, index + 1)}>↓</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => routes.remove(index)} aria-label="Remove route">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <FormField label="Destination (pickup city)" required error={err?.to_base?.message}>
                    <Input {...register(`routes.${index}.to_base`)} list="pickup-cities" placeholder="Dehradun" />
                  </FormField>
                  <FormField label="Mode" error={err?.mode?.message}>
                    <select {...register(`routes.${index}.mode`)} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm">
                      {(Object.keys(ROUTE_MODE_LABELS) as RouteMode[]).map((m) => (
                        <option key={m} value={m}>{ROUTE_MODE_LABELS[m]}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Operator / train" error={err?.operator?.message}>
                    <Input {...register(`routes.${index}.operator`)} placeholder="e.g. UTC Volvo, 12017 Shatabdi" />
                  </FormField>
                  <FormField label="Departs from" error={err?.departure_point?.message}>
                    <Input {...register(`routes.${index}.departure_point`)} placeholder="e.g. ISBT Kashmere Gate" />
                  </FormField>
                  <FormField label="Departure time(s)" error={err?.departure_time?.message}>
                    <Input {...register(`routes.${index}.departure_time`)} placeholder="e.g. 9:30 PM – 11:00 PM" />
                  </FormField>
                  <FormField label="Duration (hours)" error={err?.duration_hours?.message}>
                    <Input type="number" step="0.25" min={0} {...register(`routes.${index}.duration_hours`, { setValueAs: numberOrNull })} />
                  </FormField>
                  <FormField label="Fare min (₹)" error={err?.fare_min?.message}>
                    <Input type="number" min={0} {...register(`routes.${index}.fare_min`, { setValueAs: numberOrNull })} />
                  </FormField>
                  <FormField label="Fare max (₹)" error={err?.fare_max?.message}>
                    <Input type="number" min={0} {...register(`routes.${index}.fare_max`, { setValueAs: numberOrNull })} />
                  </FormField>
                  <FormField label="Notes for trekkers" className="md:col-span-2" error={err?.notes?.message}>
                    <Input {...register(`routes.${index}.notes`)} placeholder="e.g. Book 2 weeks ahead in December" />
                  </FormField>
                  <FormField label="Source (internal proof)" className="md:col-span-2" error={err?.source?.message} hint="URL or 'Called operator on <date>'. Optional for our group departures.">
                    <Input {...register(`routes.${index}.source`)} />
                  </FormField>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Local tips</h3>
              {rules && <p className="text-sm text-gray-600">At least {rules.min_tips} to publish.</p>}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => tips.append({ value: "" })}>
              <Plus className="h-4 w-4" /> Add tip
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {tips.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Textarea rows={2} {...register(`local_tips.${index}.value`)} placeholder="Real advice for trekkers from this city" />
                <Button type="button" variant="ghost" size="sm" onClick={() => tips.remove(index)} aria-label="Remove tip">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">FAQs</h3>
              {rules && <p className="text-sm text-gray-600">At least {rules.min_faqs} to publish. Use real questions from leads.</p>}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => faqs.append({ question: "", answer: "" })}>
              <Plus className="h-4 w-4" /> Add FAQ
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqs.fields.map((field, index) => (
              <div key={field.id} className="space-y-2 rounded-lg border border-gray-200 p-3">
                <Input {...register(`faqs.${index}.question`)} placeholder="Question" />
                {errors.faqs?.[index]?.question && <p className="text-sm text-red-600">{errors.faqs[index]?.question?.message}</p>}
                <Textarea rows={2} {...register(`faqs.${index}.answer`)} placeholder="Answer" />
                {errors.faqs?.[index]?.answer && <p className="text-sm text-red-600">{errors.faqs[index]?.answer?.message}</p>}
                <Button type="button" variant="ghost" size="sm" onClick={() => faqs.remove(index)}>
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">SEO</h3>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Meta title" error={errors.meta_title?.message} hint={`${metaTitle.length}/70`}>
            <Input {...register("meta_title")} maxLength={70} />
          </FormField>
          <FormField label="Meta description" error={errors.meta_description?.message} hint={`${metaDescription.length}/160`}>
            <Textarea rows={2} {...register("meta_description")} maxLength={160} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Verification &amp; publishing</h3>
          <p className="text-sm text-gray-600">
            Set the date only after checking every route.{rules && ` Pages must be re-verified every ${rules.max_age_days} days.`}
          </p>
        </CardHeader>
        <CardContent className="grid items-end gap-4 md:grid-cols-3">
          <FormField label="Last verified" error={errors.last_verified?.message}>
            <div className="flex gap-2">
              <Input type="date" max={today()} {...register("last_verified")} />
              <Button type="button" variant="outline" size="sm" onClick={() => setValue("last_verified", today(), { shouldDirty: true })}>
                Today
              </Button>
            </div>
          </FormField>
          <FormField label="Verified by" error={errors.verified_by?.message}>
            <Input {...register("verified_by")} placeholder="Name of the person who checked" />
          </FormField>
          <FormField label="Published">
            <Controller
              control={control}
              name="is_published"
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} label={field.value ? "Live on the website" : "Draft"} />
              )}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end border-t pt-6">
        <Button type="submit" loading={isLoading} className="min-w-[140px]">
          <Save className="h-4 w-4" />
          {mode === "create" ? "Create city" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
