import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  category_id: z.number({ message: "Category is required" }).optional().nullable(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  content_type: z.enum(["html", "markdown"]).optional(),
  excerpt: z
    .string()
    .max(500, "Excerpt is too long")
    .optional()
    .or(z.literal("")),
  featured_image: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
  reading_time: z.number().optional(),
  meta_title: z
    .string()
    .max(70, "Meta title should be under 70 characters")
    .optional()
    .or(z.literal("")),
  meta_description: z
    .string()
    .max(160, "Meta description should be under 160 characters")
    .optional()
    .or(z.literal("")),
  meta_keywords: z.string().optional().or(z.literal("")),
  structured_data: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value || !value.trim()) return true;
        try {
          const parsed = JSON.parse(value);
          return parsed !== null && typeof parsed === "object";
        } catch {
          return false;
        }
      },
      { message: "Structured data must be valid JSON (object or array)" }
    ),
  tag_ids: z.array(z.number()).optional(),
  author_id: z.coerce
    .number({ message: "Author is required" })
    .int()
    .positive("Author is required"),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

export const blogCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().optional().or(z.literal("")),
  parent_id: z.number().optional().nullable(),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

export type BlogCategoryFormData = z.infer<typeof blogCategorySchema>;

export const blogTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
});

export type BlogTagFormData = z.infer<typeof blogTagSchema>;

// ============================================
// Trek Validation Schemas
// ============================================

export const itineraryDaySchema = z.object({
  day: z.number().min(1, "Day must be at least 1"),
  title: z.string().min(1, "Day title is required").max(255, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  elevation_gain: z.number().min(0, "Elevation gain cannot be negative").default(0),
  distance: z.number().min(0, "Distance cannot be negative").default(0),
  accommodation: z.string().optional().or(z.literal("")),
  meals: z.string().optional().or(z.literal("")),
  highlights: z.array(z.string()).optional(),
});

export type ItineraryDayFormData = z.infer<typeof itineraryDaySchema>;

export const trekFAQSchema = z.object({
  question: z.string().min(1, "Question is required").max(500, "Question is too long"),
  answer: z.string().min(1, "Answer is required"),
  display_order: z.number().min(0).default(0),
});

export type TrekFAQFormData = z.infer<typeof trekFAQSchema>;

export const trekSchema = z.object({
  name: z.string().min(1, "Trek name is required").max(255, "Name is too long"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  short_description: z
    .string()
    .max(300, "Short description is too long")
    .optional()
    .or(z.literal("")),
  description: z.string().min(50, "Description must be at least 50 characters"),
  difficulty: z.enum(["easy", "moderate", "difficult", "challenging", "extreme"], {
    message: "Please select a valid difficulty level",
  }),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  max_altitude: z.number().min(0, "Maximum altitude cannot be negative"),
  distance: z.number().min(0, "Distance cannot be negative").optional(),
  price: z.number().min(1, "Price must be greater than 0"),
  featured_image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  gallery: z.array(z.string().url("Invalid gallery image URL")).optional(),
  status: z.enum(["draft", "published", "archived", "seasonal"]),
  featured: z.boolean().default(false),
  location: z.string().min(1, "Location is required"),
  start_point: z.string().max(120, "Start point is too long").optional().or(z.literal("")),
  end_point: z.string().max(120, "End point is too long").optional().or(z.literal("")),
  best_season: z.array(z.string()).min(1, "At least one best season is required"),
  group_size_min: z.number().min(1, "Minimum group size must be at least 1"),
  group_size_max: z.number().min(1, "Maximum group size must be at least 1"),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  equipment_list: z.array(z.string()).optional(),
  fitness_level: z.string().optional().or(z.literal("")),
  experience_required: z.string().optional().or(z.literal("")),
  meta_title: z
    .string()
    .max(70, "Meta title should be under 70 characters")
    .optional()
    .or(z.literal("")),
  meta_description: z
    .string()
    .max(160, "Meta description should be under 160 characters")
    .optional()
    .or(z.literal("")),
  meta_keywords: z.array(z.string()).optional(),
  map_embed: z.string().optional().or(z.literal("")),
  itinerary_pdf_url: z.string().url("Invalid PDF URL").optional().or(z.literal("")),
  rating: z.number().min(0, "Rating cannot be less than 0").max(5, "Rating cannot exceed 5").optional().default(0),
  review_count: z.number().min(0, "Review count cannot be negative").optional().default(0),
  itinerary: z.array(itineraryDaySchema).optional(),
  faqs: z.array(trekFAQSchema).optional(),
}).refine(
  (data) => data.group_size_max >= data.group_size_min,
  {
    message: "Maximum group size must be greater than or equal to minimum group size",
    path: ["group_size_max"],
  }
);

export type TrekFormData = z.infer<typeof trekSchema>;

// Status transition validation
export const validateStatusTransition = (
  currentStatus: string,
  targetStatus: string
): { valid: boolean; error?: string } => {
  const allowedTransitions: Record<string, string[]> = {
    draft: ["published", "archived"],
    published: ["draft", "archived", "seasonal"],
    archived: ["draft", "published"],
    seasonal: ["published", "archived"],
  };

  const allowed = allowedTransitions[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${targetStatus}`,
    };
  }

  return { valid: true };
};

// ============================================
// Expedition Validation Schemas
// ============================================

export const expeditionDaySchema = z.object({
  day: z.number().min(1, "Day must be at least 1"),
  title: z.string().min(1, "Day title is required").max(255, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  altitude: z.number().min(0, "Altitude cannot be negative"),
  activities: z.array(z.string()).default([]),
});

export type ExpeditionDayFormData = z.infer<typeof expeditionDaySchema>;

export const expeditionRequirementsSchema = z.object({
  experience: z.string().min(1, "Experience requirement is required"),
  fitnessLevel: z.string().min(1, "Fitness level is required"),
  technicalSkills: z.array(z.string()).optional().default([]),
});

export type ExpeditionRequirementsFormData = z.infer<typeof expeditionRequirementsSchema>;

export const expeditionEquipmentSchema = z.object({
  provided: z.array(z.string()).min(1, "At least one provided equipment item is required"),
  personal: z.array(z.string()).min(1, "At least one personal equipment item is required"),
});

export type ExpeditionEquipmentFormData = z.infer<typeof expeditionEquipmentSchema>;

export const expeditionSchema = z.object({
  name: z.string().min(1, "Expedition name is required").max(255, "Name is too long"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  difficulty: z.enum(["advanced", "expert", "extreme"], {
    message: "Please select a valid difficulty level",
  }),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  summitAltitude: z.number().min(1, "Summit altitude is required"),
  baseAltitude: z.number().min(0, "Base altitude cannot be negative"),
  location: z.string().min(1, "Location is required"),
  region: z.string().min(1, "Region is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description is too long"),
  highlights: z.array(z.string()).min(1, "At least one highlight is required"),
  requirements: expeditionRequirementsSchema,
  equipment: expeditionEquipmentSchema,
  price: z.number().min(1, "Price must be greater than 0"),
  group_size_min: z.number().min(1, "Minimum group size must be at least 1"),
  group_size_max: z.number().min(1, "Maximum group size must be at least 1"),
  season: z.array(z.string()).min(1, "At least one season is required"),
  successRate: z.number().min(0).max(100).optional().default(0),
  image: z.string().url("Invalid image URL").or(z.literal("")),
  gallery: z.array(z.string().url("Invalid gallery image URL")).optional(),
  safetyInfo: z.string().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  itineraryPdfUrl: z.string().url("Invalid PDF URL").optional().or(z.literal("")),
  itinerary: z.array(expeditionDaySchema).optional(),
}).refine(
  (data) => data.group_size_max >= data.group_size_min,
  {
    message: "Maximum group size must be greater than or equal to minimum group size",
    path: ["group_size_max"],
  }
).refine(
  (data) => data.summitAltitude > data.baseAltitude,
  {
    message: "Summit altitude must be greater than base altitude",
    path: ["summitAltitude"],
  }
);

export type ExpeditionFormData = z.infer<typeof expeditionSchema>;

