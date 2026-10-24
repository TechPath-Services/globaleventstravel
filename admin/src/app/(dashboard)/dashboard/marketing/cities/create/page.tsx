"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { DepartureCityForm } from "@/components/forms/DepartureCityForm";
import { useUIStore } from "@/store/ui.store";
import {
  marketingService,
  type CityPageRules,
  type DepartureCityPayload,
} from "@/services/marketing.service";

export default function CreateDepartureCityPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<CityPageRules | undefined>();

  useEffect(() => {
    marketingService.getSettings().then((s) => setRules(s.city_pages)).catch(() => undefined);
  }, []);

  const handleSubmit = async (payload: DepartureCityPayload) => {
    setSaving(true);
    try {
      const city = await marketingService.createCity(payload);
      addToast({ type: "success", message: "City created" });
      router.push(`/dashboard/marketing/cities/${city.id}`);
    } catch (e: any) {
      addToast({ type: "error", message: e.message || "Failed to create city" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Departure City"
        description="Start as a draft. Publish once every route is verified."
        breadcrumbs={[
          { label: "Marketing" },
          { label: "Departure Cities", href: "/dashboard/marketing/cities" },
          { label: "Add" },
        ]}
      />
      <DepartureCityForm mode="create" rules={rules} onSubmit={handleSubmit} isLoading={saving} />
    </div>
  );
}
