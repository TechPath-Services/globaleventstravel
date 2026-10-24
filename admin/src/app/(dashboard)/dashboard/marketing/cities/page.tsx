"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/store/ui.store";
import {
  marketingService,
  PUBLIC_SITE_URL,
  type DepartureCitySummary,
} from "@/services/marketing.service";

function statusBadge(city: DepartureCitySummary) {
  if (city.is_published && city.is_stale) return <Badge variant="warning">Live · needs re-verify</Badge>;
  if (city.is_published) return <Badge variant="success">Live</Badge>;
  if (city.quality_issues.length === 0) return <Badge variant="info">Ready to publish</Badge>;
  return <Badge>Draft</Badge>;
}

export default function DepartureCitiesPage() {
  const { addToast } = useUIStore();
  const [cities, setCities] = useState<DepartureCitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    marketingService
      .listCities()
      .then((list) => !cancelled && setCities(list))
      .catch((e) => addToast({ type: "error", message: e.message || "Failed to load cities" }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const remove = async (city: DepartureCitySummary) => {
    if (!confirm(`Delete "${city.name}" and all its routes? This cannot be undone.`)) return;
    try {
      await marketingService.deleteCity(city.id);
      setCities((prev) => prev.filter((c) => c.id !== city.id));
      addToast({ type: "success", message: "City deleted" });
    } catch (e: any) {
      addToast({ type: "error", message: e.message || "Failed to delete" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Departure Cities"
        description='"Treks from [city]" pages. Each page needs real, verified routes before it can go live.'
        breadcrumbs={[{ label: "Marketing" }, { label: "Departure Cities" }]}
        actions={
          <Link href="/dashboard/marketing/cities/create">
            <Button>
              <Plus className="h-4 w-4" /> Add city
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Routes</th>
                  <th className="px-4 py-3 font-medium">Pickup bases</th>
                  <th className="px-4 py-3 font-medium">Last verified</th>
                  <th className="px-4 py-3 font-medium">Quality</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading…</td></tr>
                ) : cities.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No cities yet.</td></tr>
                ) : (
                  cities.map((city) => (
                    <Fragment key={city.id}>
                      <tr className="border-t border-gray-100 align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{city.name}</div>
                          <div className="text-xs text-gray-500">/treks-from/{city.slug}/</div>
                        </td>
                        <td className="px-4 py-3">{statusBadge(city)}</td>
                        <td className="px-4 py-3 text-gray-700">{city.route_count}</td>
                        <td className="px-4 py-3 text-gray-700">{city.bases.join(", ") || "—"}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {city.last_verified ?? "—"}
                          {city.verified_by && <div className="text-xs text-gray-500">by {city.verified_by}</div>}
                        </td>
                        <td className="px-4 py-3">
                          {city.quality_issues.length === 0 ? (
                            <span className="text-green-700">All checks pass</span>
                          ) : (
                            <button
                              type="button"
                              className="text-amber-700 underline"
                              onClick={() => setExpanded(expanded === city.id ? null : city.id)}
                            >
                              {city.quality_issues.length} issue{city.quality_issues.length > 1 ? "s" : ""}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            {city.is_published && (
                              <a
                                href={`${PUBLIC_SITE_URL}/treks-from/${city.slug}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                                title="View live page"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <Link href={`/dashboard/marketing/cities/${city.id}`} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button type="button" onClick={() => remove(city)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded === city.id && (
                        <tr className="bg-amber-50/50">
                          <td colSpan={7} className="px-4 pb-4">
                            <ul className="list-disc space-y-1 pl-6 text-sm text-amber-900">
                              {city.quality_issues.map((issue) => <li key={issue}>{issue}</li>)}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
