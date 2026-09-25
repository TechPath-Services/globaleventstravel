"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trekSchema, type TrekFormData } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { MarkdownEditor } from "@/components/editors/MarkdownEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { GalleryUpload } from "@/components/ui/GalleryUpload";
import { PdfItineraryUpload } from "@/components/ui/PdfItineraryUpload";
import type { Trek, TrekDifficulty, TrekStatus } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Mountain,
  Clock,
  Users,
  MapPin,
  Camera,
  Save,
  Eye,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  GripVertical,
  HelpCircle,
  Map,
  CalendarDays,
} from "lucide-react";
import BatchManager from "@/components/forms/BatchManager";

interface TrekFormProps {
  trek?: Trek;
  onSubmit: (data: TrekFormData) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const difficultyOptions: { value: TrekDifficulty; label: string; description: string }[] = [
  { value: "easy", label: "Easy", description: "Suitable for beginners with basic fitness" },
  { value: "moderate", label: "Moderate", description: "Requires good fitness and some experience" },
  { value: "difficult", label: "Difficult", description: "Demanding trek for experienced hikers" },
  { value: "challenging", label: "Challenging", description: "Very demanding, requires excellent fitness" },
  { value: "extreme", label: "Extreme", description: "Only for expert mountaineers" },
];

const seasonOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const statusOptions: { value: TrekStatus; label: string; description: string }[] = [
  { value: "draft", label: "Draft", description: "Not visible to public" },
  { value: "published", label: "Published", description: "Live and bookable" },
  { value: "seasonal", label: "Seasonal", description: "Available during specific seasons" },
  { value: "archived", label: "Archived", description: "Hidden from public view" },
];

export function TrekForm({ trek, onSubmit, isLoading, mode }: TrekFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [contentType, setContentType] = useState<"html" | "markdown">("html");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "itinerary"])
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TrekFormData>({
    resolver: zodResolver(trekSchema),
    defaultValues: {
      name: trek?.name || "",
      slug: trek?.slug || "",
      short_description: trek?.short_description || "",
      description: trek?.description || "",
      difficulty: trek?.difficulty || "easy",
      duration: trek?.duration || 1,
      max_altitude: trek?.max_altitude || 0,
      distance: trek?.distance || 0,
      price: trek?.price || 0,
      featured_image: trek?.featured_image || "",
      gallery: trek?.gallery || [],
      status: trek?.status || "draft",
      featured: trek?.featured || false,
      location: trek?.location || "",
      best_season: trek?.best_season || [],
      group_size_min: trek?.group_size_min || 1,
      group_size_max: trek?.group_size_max || 10,
      includes: (trek?.includes ?? []) as string[],
      excludes: (trek?.excludes ?? []) as string[],
      equipment_list: (trek?.equipment_list ?? []) as string[],
      fitness_level: trek?.fitness_level || "",
      experience_required: trek?.experience_required || "",
      meta_title: trek?.meta_title || "",
      meta_description: trek?.meta_description || "",
      meta_keywords: trek?.meta_keywords || [],
      map_embed: trek?.map_embed || "",
      itinerary_pdf_url: trek?.itinerary_pdf_url || "",
      rating: trek?.rating || 0,
      review_count: trek?.review_count || 0,
      itinerary: trek?.itinerary?.map(day => ({
        day: day.day,
        title: day.title,
        description: day.description,
        elevation_gain: day.elevation_gain || 0,
        distance: day.distance || 0,
        accommodation: day.accommodation || "",
        meals: day.meals || "",
        highlights: day.highlights || [],
      })) || [],
      faqs: trek?.faqs?.map(faq => ({
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order || 0,
      })) || [],
    },
  });

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary, move: moveItinerary } = useFieldArray({
    control,
    name: "itinerary" as const,
  });

  const { fields: includesFields, append: appendInclude, remove: removeInclude } = useFieldArray({
    control: control as any,
    name: "includes" as any,
  });

  const { fields: excludesFields, append: appendExclude, remove: removeExclude } = useFieldArray({
    control: control as any,
    name: "excludes" as any,
  });

  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({
    control: control as any,
    name: "equipment_list" as any,
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq, move: moveFaq } = useFieldArray({
    control,
    name: "faqs" as const,
  });

  const name = watch("name");
  const difficulty = watch("difficulty");
  const duration = watch("duration");

  // Auto-generate slug from name
  useEffect(() => {
    if (!trek && name) {
      setValue("slug", slugify(name));
    }
  }, [name, trek, setValue]);

  // Update FAQ display_order values when they are reordered
  useEffect(() => {
    faqFields.forEach((_, index) => {
      setValue(`faqs.${index}.display_order`, index);
    });
  }, [faqFields, setValue]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const addItineraryDay = () => {
    const newDay = itineraryFields.length + 1;
    appendItinerary({
      day: newDay,
      title: `Day ${newDay}`,
      description: "",
      elevation_gain: 0,
      distance: 0,
      accommodation: "",
      meals: "",
      highlights: [],
    });
  };

  const addFaq = () => {
    appendFaq({
      question: "",
      answer: "",
      display_order: faqFields.length,
    });
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Mountain },
    { id: "itinerary", label: "Itinerary", icon: Clock },
    { id: "details", label: "Details", icon: Users },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "batches", label: "Batches", icon: CalendarDays },
    { id: "map", label: "Map", icon: Map },
    { id: "media", label: "Media", icon: Camera },
    { id: "seo", label: "SEO", icon: Eye },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const hasErrors = Object.keys(errors).some(key => {
              if (tab.id === "basic") return ["name", "slug", "description", "difficulty", "location"].includes(key);
              if (tab.id === "itinerary") return key.startsWith("itinerary");
              if (tab.id === "details") return ["duration", "price", "group_size_min", "group_size_max"].includes(key);
              if (tab.id === "seo") return ["meta_title", "meta_description"].includes(key);
              return false;
            });

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {hasErrors && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Trek Name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    {...register("name")}
                    placeholder="Enter trek name"
                  />
                </FormField>

                <FormField
                  label="Slug"
                  required
                  error={errors.slug?.message}
                  hint="URL-friendly version of the name"
                >
                  <Input
                    {...register("slug")}
                    placeholder="trek-name"
                  />
                </FormField>
              </div>

              <FormField
                label="Short Description"
                error={errors.short_description?.message}
                hint="Brief summary for listings (max 300 characters)"
              >
                <Textarea
                  {...register("short_description")}
                  rows={3}
                  placeholder="A brief, compelling description of the trek..."
                  maxLength={300}
                />
              </FormField>

              {/* Content Editor */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Full Description</h4>
                    <div className="flex rounded-lg bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => setContentType("html")}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          contentType === "html"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        Rich Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentType("markdown")}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          contentType === "markdown"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        Markdown
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) =>
                      contentType === "html" ? (
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          error={!!errors.description}
                        />
                      ) : (
                        <MarkdownEditor
                          content={field.value}
                          onChange={field.onChange}
                          error={!!errors.description}
                        />
                      )
                    }
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Difficulty Level"
                  required
                  error={errors.difficulty?.message}
                >
                  <Controller
                    control={control}
                    name="difficulty"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {difficultyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {difficultyOptions.find(d => d.value === difficulty)?.description}
                  </p>
                </FormField>

                <FormField
                  label="Duration (Days)"
                  required
                  error={errors.duration?.message}
                >
                  <Input
                    type="number"
                    min="1"
                    {...register("duration", { valueAsNumber: true })}
                  />
                </FormField>

                <FormField
                  label="Location"
                  required
                  error={errors.location?.message}
                >
                  <Input
                    {...register("location")}
                    placeholder="e.g., Himalayas, Nepal"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Status"
                  required
                  error={errors.status?.message}
                >
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {statusOptions.find(s => s.value === watch("status"))?.description}
                  </p>
                </FormField>
              </div>

              <div className="flex items-center space-x-4">
                <FormField
                  label="Featured Trek"
                  hint="Highlight this trek in featured sections"
                >
                  <Controller
                    control={control}
                    name="featured"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Itinerary Tab */}
      {activeTab === "itinerary" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Daily Itinerary</h3>
                <p className="text-sm text-gray-600">Plan each day of the trek</p>
              </div>
              <Button
                type="button"
                onClick={addItineraryDay}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </CardHeader>
            <CardContent>
              {itineraryFields.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No itinerary yet</h4>
                  <p className="text-gray-600 mb-4">Start planning your trek day by day</p>
                  <Button type="button" onClick={addItineraryDay}>
                    Add First Day
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {itineraryFields.map((field, index) => (
                    <Card key={field.id} className="border-l-4 border-l-primary-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <Badge variant="default">Day {index + 1}</Badge>
                            <Input
                              {...register(`itinerary.${index}.title`)}
                              placeholder="Day title"
                              className="font-medium"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveItinerary(index, Math.max(0, index - 1))}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveItinerary(index, Math.min(itineraryFields.length - 1, index + 1))}
                              disabled={index === itineraryFields.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItinerary(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <FormField
                            label="Description"
                            error={errors.itinerary?.[index]?.description?.message}
                          >
                            <Controller
                              control={control}
                              name={`itinerary.${index}.description`}
                              render={({ field }) => (
                                <div className="border rounded-lg">
                                  <div className="border-b px-3 py-2 bg-gray-50">
                                    <div className="flex space-x-2">
                                      <span className="text-xs text-gray-500">Format:</span>
                                      <button
                                        type="button"
                                        className="px-2 py-1 text-xs bg-white rounded border text-gray-600 hover:text-gray-900"
                                      >
                                        Rich Text
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <RichTextEditor
                                      content={field.value || ""}
                                      onChange={field.onChange}
                                      error={!!errors.itinerary?.[index]?.description}
                                    />
                                  </div>
                                </div>
                              )}
                            />
                          </FormField>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField
                              label="Elevation Gain (m)"
                              error={errors.itinerary?.[index]?.elevation_gain?.message}
                            >
                              <Input
                                type="number"
                                min="0"
                                {...register(`itinerary.${index}.elevation_gain`, { valueAsNumber: true })}
                                placeholder="0"
                              />
                            </FormField>

                            <FormField
                              label="Distance (km)"
                              error={errors.itinerary?.[index]?.distance?.message}
                            >
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                {...register(`itinerary.${index}.distance`, { valueAsNumber: true })}
                                placeholder="0"
                              />
                            </FormField>

                            <FormField
                              label="Accommodation"
                              error={errors.itinerary?.[index]?.accommodation?.message}
                            >
                              <Input
                                {...register(`itinerary.${index}.accommodation`)}
                                placeholder="Hotel, tent, etc."
                              />
                            </FormField>

                            <FormField
                              label="Meals"
                              error={errors.itinerary?.[index]?.meals?.message}
                            >
                              <Input
                                {...register(`itinerary.${index}.meals`)}
                                placeholder="B,L,D"
                              />
                            </FormField>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Pricing & Group Size */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Pricing & Group Size</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Price (INR)"
                  required
                  error={errors.price?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="25000"
                  />
                </FormField>

                <FormField
                  label="Minimum Group Size"
                  required
                  error={errors.group_size_min?.message}
                >
                  <Input
                    type="number"
                    min="1"
                    {...register("group_size_min", { valueAsNumber: true })}
                  />
                </FormField>

                <FormField
                  label="Maximum Group Size"
                  required
                  error={errors.group_size_max?.message}
                >
                  <Input
                    type="number"
                    min="1"
                    {...register("group_size_max", { valueAsNumber: true })}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Maximum Altitude (m)"
                  required
                  error={errors.max_altitude?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    {...register("max_altitude", { valueAsNumber: true })}
                    placeholder="5500"
                  />
                </FormField>

                <FormField
                  label="Total Distance (km)"
                  error={errors.distance?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    {...register("distance", { valueAsNumber: true })}
                    placeholder="120"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <FormField
                  label="Manual Rating (0-5)"
                  error={errors.rating?.message}
                  hint="Manual override for average rating"
                >
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    {...register("rating", { valueAsNumber: true })}
                    placeholder="4.5"
                  />
                </FormField>

                <FormField
                  label="Total Review Count"
                  error={errors.review_count?.message}
                  hint="Manual override for number of reviews"
                >
                  <Input
                    type="number"
                    min="0"
                    {...register("review_count", { valueAsNumber: true })}
                    placeholder="120"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Best Season */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Best Season</h3>
            </CardHeader>
            <CardContent>
              <FormField
                label="Best Seasons"
                error={errors.best_season?.message}
                hint="Select the best months for this trek"
                required
              >
                <Controller
                  control={control}
                  name="best_season"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {seasonOptions.map((month) => (
                        <button
                          key={month}
                          type="button"
                          onClick={() => {
                            const current = field.value || [];
                            if (current.includes(month)) {
                              field.onChange(current.filter((m: string) => m !== month));
                            } else {
                              field.onChange([...current, month]);
                            }
                          }}
                          className={cn(
                            "px-3 py-1 text-xs rounded-full border transition-colors",
                            (field.value || []).includes(month)
                              ? "bg-primary-500 text-white border-primary-500"
                              : "bg-white text-gray-700 border-gray-300 hover:border-primary-500"
                          )}
                        >
                          {month.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* PDF Itinerary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">PDF Itinerary</h3>
            </CardHeader>
            <CardContent>
              <FormField
                label="Itinerary PDF"
                error={errors.itinerary_pdf_url?.message}
                hint="Upload a PDF or paste URL. Used for automated emails when leads request itinerary."
              >
                <Controller
                  control={control}
                  name="itinerary_pdf_url"
                  render={({ field }) => (
                    <PdfItineraryUpload
                      value={field.value || ""}
                      onChange={field.onChange}
                      error={!!errors.itinerary_pdf_url}
                    />
                  )}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Requirements</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                label="Fitness Level Required"
                error={errors.fitness_level?.message}
              >
                <Controller
                  control={control}
                  name="fitness_level"
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value || ""}
                      onChange={field.onChange}
                      error={!!errors.fitness_level}
                      placeholder="Describe the fitness level required for this trek..."
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Experience Required"
                error={errors.experience_required?.message}
              >
                <Controller
                  control={control}
                  name="experience_required"
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value || ""}
                      onChange={field.onChange}
                      error={!!errors.experience_required}
                      placeholder="Describe any previous trekking or mountaineering experience required..."
                    />
                  )}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Dynamic Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Includes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Includes</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => appendInclude("")}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {includesFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      {...register(`includes.${index}`)}
                      placeholder="What's included"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeInclude(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {includesFields.length === 0 && (
                  <p className="text-sm text-gray-500">No items added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Excludes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Excludes</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => appendExclude("")}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {excludesFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      {...register(`excludes.${index}`)}
                      placeholder="What's not included"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeExclude(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {excludesFields.length === 0 && (
                  <p className="text-sm text-gray-500">No items added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Equipment List</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => appendEquipment("")}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {equipmentFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      {...register(`equipment_list.${index}`)}
                      placeholder="Required equipment"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeEquipment(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {equipmentFields.length === 0 && (
                  <p className="text-sm text-gray-500">No items added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-600">Add common questions and answers about this trek</p>
              </div>
              <Button
                type="button"
                onClick={addFaq}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </CardHeader>
            <CardContent>
              {faqFields.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h4>
                  <p className="text-gray-600 mb-4">Add frequently asked questions to help trekkers</p>
                  <Button type="button" onClick={addFaq}>
                    Add First FAQ
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqFields.map((field, index) => (
                    <Card key={field.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <Badge variant="info">FAQ #{index + 1}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveFaq(index, Math.max(0, index - 1))}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveFaq(index, Math.min(faqFields.length - 1, index + 1))}
                              disabled={index === faqFields.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFaq(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <FormField
                            label="Question"
                            required
                            error={errors.faqs?.[index]?.question?.message}
                          >
                            <Input
                              {...register(`faqs.${index}.question`)}
                              placeholder="e.g., What is the best time to do this trek?"
                            />
                          </FormField>

                          <FormField
                            label="Answer"
                            required
                            error={errors.faqs?.[index]?.answer?.message}
                          >
                            <Textarea
                              {...register(`faqs.${index}.answer`)}
                              rows={3}
                              placeholder="Provide a detailed answer to the question..."
                            />
                          </FormField>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batches Tab */}
      {activeTab === "batches" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Date Batches & Seat Availability</h3>
              <p className="text-sm text-gray-600">
                Configure departure dates and seat limits. Each batch is an independent departure window shown on the frontend.
              </p>
            </CardHeader>
            <CardContent>
              {trek ? (
                <BatchManager trekId={trek.id} />
              ) : (
                <p className="text-amber-600 text-sm">Save the trek first to manage batches.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Tab */}
      {activeTab === "map" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Trek Map</h3>
              <p className="text-sm text-gray-600">
                Paste the Google Maps embed code to show the trek route on the frontend
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Google Maps Embed Code"
                error={errors.map_embed?.message}
                hint="Go to Google Maps → Share → Embed a map → Copy the iframe code"
              >
                <Textarea
                  {...register("map_embed")}
                  rows={6}
                  placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                  className="font-mono text-sm"
                />
              </FormField>

              {watch("map_embed") && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                  <div 
                    className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: watch("map_embed") || "" }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Images</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                label="Featured Image"
                error={errors.featured_image?.message}
                hint="Main image that represents this trek"
              >
                <Controller
                  control={control}
                  name="featured_image"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="treks"
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Gallery Images"
                error={errors.gallery?.message}
                hint="Additional images showcasing the trek"
              >
                <GalleryUpload
                  value={watch("gallery") || []}
                  onChange={(urls) => setValue("gallery", urls)}
                  folder="treks"
                  maxImages={20}
                  error={errors.gallery?.message}
                />
              </FormField>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">SEO Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Meta Title"
                error={errors.meta_title?.message}
                hint="Title tag for search engines (recommended: under 70 characters)"
              >
                <Input
                  {...register("meta_title")}
                  placeholder="Amazing Trek Through the Himalayas"
                  maxLength={70}
                />
                <div className="text-sm text-gray-500 mt-1">
                  {(watch("meta_title") || "").length}/70 characters
                </div>
              </FormField>

              <FormField
                label="Meta Description"
                error={errors.meta_description?.message}
                hint="Description for search results (recommended: under 160 characters)"
              >
                <Textarea
                  {...register("meta_description")}
                  rows={3}
                  placeholder="Join us on an unforgettable trekking adventure through pristine mountain landscapes..."
                  maxLength={160}
                />
                <div className="text-sm text-gray-500 mt-1">
                  {(watch("meta_description") || "").length}/160 characters
                </div>
              </FormField>

              <FormField
                label="Meta Keywords"
                error={errors.meta_keywords?.message}
                hint="Keywords related to this trek (one per line)"
              >
                <Controller
                  control={control}
                  name="meta_keywords"
                  render={({ field }) => (
                    <Textarea
                      value={field.value?.join("\n") || ""}
                      onChange={(e) => field.onChange(
                        e.target.value.split("\n").filter(k => k.trim())
                      )}
                      rows={4}
                      placeholder="himalaya trekking&#10;mountain adventure&#10;nepal trek"
                    />
                  )}
                />
              </FormField>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submit Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center space-x-4">
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please fix the errors above</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>{mode === "create" ? "Create Trek" : "Update Trek"}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}