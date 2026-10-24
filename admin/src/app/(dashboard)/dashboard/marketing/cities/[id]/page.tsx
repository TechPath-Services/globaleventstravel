"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DepartureCityForm } from "@/components/forms/DepartureCityForm";
import { useUIStore } from "@/store/ui.store";
import {
  marketingService,
  PUBLIC_SITE_URL,
  type CityPageRules,
  type DepartureCity,
  type DepartureCityPayload,
} from "@/services/marketing.service";

interface EditDepartureCityPageProps {
  params: Promise<{ id: string }>;
}

export default function EditDepartureCityPage({ params }: EditDepartureCityPageProps) {
  const { id } = use(params);
  const cityId = parseInt(id, 10);
  const router = useRouter();
  const { addToast } = useUIStore();
  const [city, setCity] = useState<DepartureCity | null>(null);
  const [rules, setRules] = useState<CityPageRules | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    Promise.all([marketingService.getCity(cityId), marketingService.getSettings()])
      .then(([c, s]) => {
        setCity(c);
        setRules(s.city_pages);
      })
      .catch(() => {
        addToast({ type: "error", message: "Failed to load city" });
        router.push("/dashboard/marketing/cities");
      })
      .finally(() => setLoading(false));
  }, [cityId, router, addToast]);

  const handleSubmit = async (payload: DepartureCityPayload) => {
    setSaving(true);
    try {
      const updated = await marketingService.updateCity(cityId, payload);
      setCity(updated);
      setFormKey((k) => k + 1);
      addToast({
        type: "success",
        message: updated.quality_issues.length
          ? `Saved as draft. ${updated.quality_issues.length} item(s) to fix before publishing.`
          : "Saved",
      });
    } catch (e: any) {
      addToast({ type: "error", message: e.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }
  if (!city) return null;

  return (
    <div>
      <PageHeader
        title={`Treks from ${city.name}`}
        description={city.is_published ? "Live on the website" : "Draft"}
        breadcrumbs={[
          { label: "Marketing" },
          { label: "Departure Cities", href: "/dashboard/marketing/cities" },
          { label: city.name },
        ]}
        actions={
          city.is_published ? (
            <a
              href={`${PUBLIC_SITE_URL}/treks-from/${city.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
            >
              View live page <ExternalLink className="h-4 w-4" />
            </a>
          ) : undefined
        }
      />
      <DepartureCityForm key={formKey} mode="edit" city={city} rules={rules} onSubmit={handleSubmit} isLoading={saving} />
    </div>
  );
}
