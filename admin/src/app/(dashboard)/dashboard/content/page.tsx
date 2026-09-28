"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { contentService, type PageSection } from "@/services/content.service";
import { useUIStore } from "@/store/ui.store";
import {
  CONTENT_PAGES,
  applySectionDefaults,
  getAvailableSectionKeys,
  getSectionKeysForPage,
  getSectionLabel,
} from "@/lib/page-content-keys";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  LayoutTemplate,
} from "lucide-react";

interface EditingState {
  id?: number;
  page: string;
  key: string;
  title?: string;
  subtitle?: string;
  badge_text?: string;
  body_html?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
  display_order: number;
  is_active: boolean;
}

export default function ContentPage() {
  const searchParams = useSearchParams();
  const initialPage = searchParams.get("page") || "home";

  const { addToast } = useUIStore();

  const [page, setPage] = useState(initialPage);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const existingKeys = useMemo(() => sections.map((s) => s.key), [sections]);

  const availableKeysForCreate = useMemo(
    () => getAvailableSectionKeys(page, existingKeys),
    [page, existingKeys]
  );

  const keyOptionsWhileEditing = useMemo(() => {
    if (!editing) return [];
    // When editing, keep current key selectable; exclude other existing keys
    return getAvailableSectionKeys(editing.page, existingKeys, editing.key);
  }, [editing, existingKeys]);

  const selectedKeyMeta = useMemo(() => {
    if (!editing?.key) return null;
    return getSectionKeysForPage(editing.page).find((o) => o.value === editing.key) || null;
  }, [editing]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await contentService.listByPage(page, false);
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch page sections:", error);
      addToast({ type: "error", message: "Failed to load page content" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    setEditing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const startCreate = () => {
    if (availableKeysForCreate.length === 0) {
      addToast({
        type: "info",
        message: `All sections for ${currentPageLabel} already exist. Edit an existing one instead.`,
      });
      return;
    }

    const first = availableKeysForCreate[0];
    const filled = applySectionDefaults(page, first.value, {
      display_order: sections.length,
      is_active: true,
    });
    setEditing({
      page,
      key: first.value,
      ...filled,
    });
  };

  const startEdit = (section: PageSection) => {
    setEditing({
      id: section.id,
      page: section.page,
      key: section.key,
      title: section.title || "",
      subtitle: section.subtitle || "",
      badge_text: section.badge_text || "",
      body_html: section.body_html || "",
      image_url: section.image_url || "",
      cta_label: section.cta_label || "",
      cta_url: section.cta_url || "",
      display_order: section.display_order,
      is_active: section.is_active,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;

    if (!editing.page || !editing.key) {
      addToast({ type: "error", message: "Page and section are required" });
      return;
    }

    const allowed = getSectionKeysForPage(editing.page).some((o) => o.value === editing.key);
    if (!allowed) {
      addToast({ type: "error", message: "Invalid section for this page" });
      return;
    }

    try {
      if (editing.id) {
        await contentService.update(editing.id, {
          page: editing.page,
          key: editing.key,
          title: editing.title,
          subtitle: editing.subtitle,
          badge_text: editing.badge_text,
          body_html: editing.body_html,
          image_url: editing.image_url,
          cta_label: editing.cta_label,
          cta_url: editing.cta_url,
          display_order: editing.display_order,
          is_active: editing.is_active,
        });
        addToast({ type: "success", message: "Section updated" });
      } else {
        await contentService.create({
          page: editing.page,
          key: editing.key,
          title: editing.title,
          subtitle: editing.subtitle,
          badge_text: editing.badge_text,
          body_html: editing.body_html,
          image_url: editing.image_url,
          cta_label: editing.cta_label,
          cta_url: editing.cta_url,
          display_order: editing.display_order,
          is_active: editing.is_active,
        });
        addToast({ type: "success", message: "Section created" });
      }

      setEditing(null);
      fetchSections();
    } catch (error: any) {
      addToast({
        type: "error",
        message: error?.message || "Failed to save section",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await contentService.delete(id);
      addToast({ type: "success", message: "Section deleted" });
      fetchSections();
    } catch (error) {
      addToast({ type: "error", message: "Failed to delete section" });
    }
  };

  const currentPageLabel =
    CONTENT_PAGES.find((p) => p.value === page)?.label || page;

  return (
    <div>
      <PageHeader
        title="Site Content"
        description="Manage hero and marketing sections for key pages."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Site Content" },
        ]}
        actions={
          <Button onClick={startCreate} disabled={availableKeysForCreate.length === 0}>
            <Plus className="h-4 w-4" />
            New Section
            {availableKeysForCreate.length > 0 && (
              <span className="ml-1 text-xs opacity-80">
                ({availableKeysForCreate.length} left)
              </span>
            )}
          </Button>
        }
      />

      {/* Page filter */}
      <Card className="mb-6">
        <CardContent className="py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">Page:</span>
          <div className="flex flex-wrap gap-2">
            {CONTENT_PAGES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPage(p.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  page === p.value
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-auto">
            {sections.length}/{getSectionKeysForPage(page).length} sections
          </span>
        </CardContent>
      </Card>

      {/* Sections list */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Badge
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    CTA
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading sections...
                    </td>
                  </tr>
                ) : sections.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No sections configured for {currentPageLabel} yet. Click
                      New Section to add one.
                    </td>
                  </tr>
                ) : (
                  sections.map((section) => (
                    <tr
                      key={section.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">
                          {getSectionLabel(section.page, section.key)}
                        </div>
                        <div className="font-mono text-xs text-gray-500">
                          {section.key}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {section.title || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {section.badge_text || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {section.cta_label || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {section.display_order}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={section.is_active ? "success" : "default"}
                        >
                          {section.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(section)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(section.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit / Create form */}
      {editing && (
        <Card className="mt-6 border-primary-200 shadow-md">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  {editing.id ? "Edit Section" : "New Section"}
                </h2>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Page
                </label>
                <Select value={editing.page} disabled>
                  {CONTENT_PAGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Switch page using the tabs above, then click New Section.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Section
                </label>
                <Select
                  value={editing.key}
                  disabled={!!editing.id}
                  onChange={(e) => {
                    const nextKey = e.target.value;
                    // Only pre-fill defaults when creating (not when editing existing)
                    if (editing.id) {
                      setEditing({ ...editing, key: nextKey });
                      return;
                    }
                    const filled = applySectionDefaults(editing.page, nextKey, {
                      display_order: editing.display_order,
                      is_active: editing.is_active,
                    });
                    setEditing({
                      ...editing,
                      key: nextKey,
                      ...filled,
                    });
                  }}
                >
                  {keyOptionsWhileEditing.length === 0 ? (
                    <option value="">No sections available</option>
                  ) : (
                    keyOptionsWhileEditing.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))
                  )}
                </Select>
                {selectedKeyMeta?.hint && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedKeyMeta.hint}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Title
                </label>
                <Input
                  value={editing.title || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Subtitle
                </label>
                <Input
                  value={editing.subtitle || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, subtitle: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Badge Text
                </label>
                <Input
                  value={editing.badge_text || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, badge_text: e.target.value })
                  }
                  placeholder="e.g. Now booking for 2026"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Image URL
                </label>
                <Input
                  value={editing.image_url || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, image_url: e.target.value })
                  }
                  placeholder="Paste image URL from media library"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  CTA Label
                </label>
                <Input
                  value={editing.cta_label || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, cta_label: e.target.value })
                  }
                  placeholder="e.g. Plan My Trek"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  CTA URL
                </label>
                <Input
                  value={editing.cta_url || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, cta_url: e.target.value })
                  }
                  placeholder="e.g. /contact or WhatsApp link"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={editing.display_order}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      display_order: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) =>
                    setEditing({ ...editing, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="is_active"
                  className="text-xs font-medium text-gray-700"
                >
                  Active (visible on site)
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Body HTML / JSON (optional)
              </label>
              <Textarea
                value={editing.body_html || ""}
                onChange={(e) =>
                  setEditing({ ...editing, body_html: e.target.value })
                }
                rows={6}
                placeholder='HTML or JSON depending on section. Example for hero: {"highlight_word":"Himalayan"}'
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editing.key}>
                <Save className="h-4 w-4" />
                Save Section
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
