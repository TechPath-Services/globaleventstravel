"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { leadService, type LeadListParams } from "@/services/lead.service";
import type { LeadListItem, LeadStatus } from "@/types/api";
import { useUIStore } from "@/store/ui.store";
import { formatDate } from "@/lib/utils";
import {
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

const STATUS_OPTIONS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const SOURCE_SUGGESTIONS = [
  "website",
  "hero_form",
  "trek_page",
  "mobile_sticky",
  "expedition_page",
  "quiz_winter",
  "budget_calculator",
  "student_discount",
  "city_delhi",
  "city_dehradun",
  "city_chandigarh",
  "city_lucknow",
];

export default function LeadListPage() {
  const { addToast } = useUIStore();

  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const limit = 10;

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: LeadListParams = {
        skip: (page - 1) * limit,
        limit,
        status: statusFilter,
        source: sourceFilter.trim() || undefined,
      };
      const data = await leadService.list(params);
      let items = data.items;
      if (search) {
        const s = search.toLowerCase();
        items = items.filter(
          (l) =>
            l.name.toLowerCase().includes(s) ||
            (l.email || "").toLowerCase().includes(s) ||
            (l.trek_name || "").toLowerCase().includes(s) ||
            (l.notes || "").toLowerCase().includes(s)
        );
      }
      setLeads(items);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      addToast({ type: "error", message: "Failed to load leads" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, search, sourceFilter]);

  const totalPages = Math.ceil(total / limit) || 1;

  const statusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return "warning";
      case "contacted":
        return "info";
      case "converted":
        return "success";
      case "lost":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description="View and manage leads from your trek and expedition forms."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Leads" },
        ]}
      />

      <Card className="mb-6">
        <CardContent className="py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or trek..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              list="lead-source-suggestions"
              placeholder="All sources"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-44 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Filter by source"
            />
            <datalist id="lead-source-suggestions">
              {SOURCE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as LeadStatus | "all");
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSourceFilter("");
                setPage(1);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Lead
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Trek
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Flags
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium text-gray-900">
                            {lead.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.whatsapp}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-gray-800">
                            {lead.trek_name || "Custom / Not specified"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lead.trek_slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{lead.source || "website"}</div>
                        {lead.notes && (
                          <div
                            className="mt-1 max-w-xs truncate text-xs text-gray-500"
                            title={lead.notes}
                          >
                            {lead.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          {lead.itinerary_sent && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                              title="Itinerary sent"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Sent
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, total)} of {total} leads
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

