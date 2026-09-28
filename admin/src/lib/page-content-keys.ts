/**
 * Hardcoded page + section keys that the frontend actually reads.
 * Admin only allows selecting these — no free-typed keys.
 * Defaults match seed / frontend fallbacks and pre-fill the create form.
 */

export const CONTENT_PAGES = [
  { value: "home", label: "Home" },
  { value: "treks", label: "Treks" },
  { value: "expeditions", label: "Expeditions" },
  { value: "about", label: "About" },
] as const;

export type ContentPage = (typeof CONTENT_PAGES)[number]["value"];

export interface SectionDefaults {
  title?: string;
  subtitle?: string;
  badge_text?: string;
  body_html?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
  display_order?: number;
}

export interface SectionKeyOption {
  value: string;
  label: string;
  hint?: string;
  defaults?: SectionDefaults;
}

/** Section slots per page — must match frontend lookups. */
export const SECTION_KEYS_BY_PAGE: Record<ContentPage, SectionKeyOption[]> = {
  home: [
    {
      value: "hero",
      label: "Hero",
      hint: "Badge, title, subtitle, background image",
      defaults: {
        title: "Plan Your Perfect Himalayan Trek",
        subtitle:
          "Book trusted treks across the Himalayas with expert guides, personalized itineraries and unforgettable experiences.",
        badge_text: "Now booking for 2026 season",
        body_html: JSON.stringify({ highlight_word: "Himalayan" }, null, 2),
        image_url: "/images/home/hero-bg.webp",
        display_order: 0,
      },
    },
    {
      value: "hero_primary_cta",
      label: "Hero primary CTA",
      hint: "Explore Treks button",
      defaults: {
        cta_label: "Explore Treks",
        cta_url: "/treks",
        display_order: 0,
      },
    },
    {
      value: "hero_secondary_cta",
      label: "Hero secondary CTA",
      hint: "WhatsApp button",
      defaults: {
        cta_label: "Get Free Itinerary on WhatsApp",
        cta_url: "#whatsapp-form",
        display_order: 0,
      },
    },
    {
      value: "hero_stats",
      label: "Hero stats",
      hint: "JSON array in Body HTML",
      defaults: {
        body_html: JSON.stringify(
          [
            { value: "10,000+", label: "Happy Trekkers", icon: "users" },
            { value: "4.8★", label: "Average Rating", icon: "star" },
            { value: "100+", label: "Trek Destinations", icon: "mountain" },
          ],
          null,
          2
        ),
        display_order: 1,
      },
    },
    {
      value: "lead_form",
      label: "Lead form",
      hint: "Form title, subtitle, CTA, privacy",
      defaults: {
        title: "Get Your Free Trek Guide",
        subtitle: "Personalized itinerary sent to WhatsApp",
        cta_label: "Get Free Itinerary on WhatsApp",
        body_html: JSON.stringify(
          {
            privacy_text: "Your data is 100% safe. We never share your information.",
            success_message:
              "Your personalized trek itinerary will be sent to your WhatsApp shortly.",
          },
          null,
          2
        ),
        display_order: 0,
      },
    },
    {
      value: "featured_defaults",
      label: "Featured trek urgency",
      hint: "JSON: next_batch, seats_text",
      defaults: {
        body_html: JSON.stringify(
          { next_batch: "14 Jan 2026", seats_text: "Only 6 seats left" },
          null,
          2
        ),
        display_order: 0,
      },
    },
    {
      value: "why_choose_us",
      label: "Why choose us",
      hint: "JSON trust stats",
      defaults: {
        body_html: JSON.stringify(
          [
            { value: "10,000+", label: "Happy Trekkers" },
            { value: "4.8", label: "Average Rating" },
            { value: "8+", label: "Years Experience" },
            { value: "✓", label: "No Hidden Costs" },
          ],
          null,
          2
        ),
        display_order: 0,
      },
    },
    {
      value: "budget_treks",
      label: "Budget treks",
      hint: "Section title / subtitle",
      defaults: {
        title: "Budget Friendly Treks",
        subtitle: "Amazing treks under ₹10,000",
        display_order: 0,
      },
    },
    {
      value: "destinations",
      label: "Destinations",
      hint: "JSON destination cards",
      defaults: {
        body_html: JSON.stringify(
          [
            {
              name: "Uttarakhand",
              slug: "uttarakhand",
              image:
                "https://media3.thrillophilia.com/filestore/efftugji6q4448bt7s45z1js5tp5_1600680960_shutterstock_562139776.jpg?w=400&dpr=2",
              trek_count: 9,
            },
            {
              name: "Himachal Pradesh",
              slug: "himachal-pradesh",
              image:
                "https://res.cloudinary.com/dyiffrkzh/image/upload/c_fill,f_auto,fl_progressive.strip_profile,g_center,h_400,q_auto,w_700/v1728899306/banbanjara/vtbgtzdxrbbyjjo2s1wc.webp",
              trek_count: 10,
            },
            {
              name: "Uttarkashi",
              slug: "uttarkashi",
              image:
                "https://media1.thrillophilia.com/filestore/ylm7jv5cf5sf8nzp45db2rdh20om_shutterstock_1151786492.jpg?w=400&dpr=2",
              trek_count: 1,
            },
            {
              name: "Srinagar",
              slug: "srinagar",
              image:
                "https://d26dp53kz39178.cloudfront.net/media/uploads/products/5_result_3-1683719790067.webp",
              trek_count: 1,
            },
          ],
          null,
          2
        ),
        display_order: 0,
      },
    },
    {
      value: "expeditions",
      label: "Expeditions block",
      hint: "Homepage expeditions title",
      defaults: {
        title: "Himalayan Expeditions",
        subtitle:
          "Push your limits with our expertly guided mountaineering expeditions. Conquer legendary peaks with safety and expertise.",
        display_order: 0,
      },
    },
    {
      value: "whatsapp_cta",
      label: "Sticky WhatsApp CTA",
      hint: "Floating button label",
      defaults: {
        cta_label: "Chat for Itinerary",
        display_order: 0,
      },
    },
    {
      value: "stats",
      label: "Statistics strip",
      hint: "JSON stats with descriptions",
      defaults: {
        body_html: JSON.stringify(
          [
            { value: "50+", label: "Trek Routes", description: "Across the Himalayas" },
            { value: "10,000+", label: "Happy Trekkers", description: "And counting" },
            { value: "15+", label: "Expert Guides", description: "Certified professionals" },
            { value: "8+", label: "Years Experience", description: "In adventure tourism" },
          ],
          null,
          2
        ),
        display_order: 2,
      },
    },
    {
      value: "cta",
      label: "Bottom CTA",
      hint: "Ready for adventure section",
      defaults: {
        title: "Ready for Your Next Adventure?",
        subtitle:
          "Join thousands of happy trekkers who have discovered the magic of the Himalayas with us. Your adventure of a lifetime awaits.",
        cta_label: "Explore Treks",
        cta_url: "/treks",
        display_order: 3,
      },
    },
  ],
  treks: [
    {
      value: "hero",
      label: "Hero",
      hint: "Badge, title, subtitle, background, highlight + annotation JSON in Body",
      defaults: {
        title: "Find Your Next Himalayan Trek",
        subtitle:
          "From beginner-friendly trails to challenging high-altitude adventures, discover your perfect trek in the Himalayas.",
        badge_text: "TREK · EXPLORE · EXPERIENCE",
        body_html: JSON.stringify(
          {
            highlight_word: "Himalayan Trek",
            annotation: "Breathtaking Views Await",
          },
          null,
          2
        ),
        image_url: "/images/home/hero-bg.webp",
        display_order: 0,
      },
    },
    {
      value: "hero_primary_cta",
      label: "Hero primary CTA",
      hint: "Explore All Treks button",
      defaults: {
        cta_label: "Explore All Treks",
        cta_url: "#popular-treks",
        display_order: 0,
      },
    },
    {
      value: "hero_secondary_cta",
      label: "Hero secondary CTA",
      hint: "Watch Our Story button",
      defaults: {
        cta_label: "Watch Our Story",
        cta_url: "https://www.youtube.com/@globaleventstravels6010",
        display_order: 0,
      },
    },
    {
      value: "search",
      label: "Search bar",
      hint: "Labels / placeholders / Find CTA (JSON in Body)",
      defaults: {
        title: "Where do you want to trek?",
        cta_label: "Find My Trek",
        body_html: JSON.stringify(
          {
            search_placeholder: "Search Kedarkantha, Hampta Pass...",
            difficulty_label: "Difficulty",
            difficulty_placeholder: "Any Level",
            duration_label: "Duration",
            duration_placeholder: "Any Duration",
            budget_label: "Budget",
            budget_placeholder: "Any Budget",
            popular_label: "Popular Treks:",
          },
          null,
          2
        ),
        display_order: 1,
      },
    },
    {
      value: "popular_treks",
      label: "Popular trek chips",
      hint: "JSON array: { label, slug }",
      defaults: {
        body_html: JSON.stringify(
          [
            { label: "Kedarkantha", slug: "kedarkantha" },
            { label: "Hampta Pass", slug: "hampta-pass-trek" },
            { label: "Brahmatal", slug: "brahmatal-trek" },
            { label: "Valley of Flowers", slug: "valley-of-flowers-trek" },
            { label: "Kashmir Great Lakes", slug: "kashmir-great-lakes-trek" },
          ],
          null,
          2
        ),
        display_order: 1,
      },
    },
    {
      value: "popular_collection",
      label: "Popular treks section",
      hint: "Section eyebrow, title, View All CTA",
      defaults: {
        badge_text: "TREK COLLECTION",
        title: "Popular Himalayan Treks",
        cta_label: "View All Treks",
        cta_url: "#trek-catalog",
        display_order: 2,
      },
    },
    {
      value: "regions",
      label: "Regions section",
      hint: "Title / CTA; optional JSON region cards in Body",
      defaults: {
        title: "Explore by Himalayan Region",
        cta_label: "Explore All Regions",
        cta_url: "#trek-catalog",
        body_html: JSON.stringify(
          [
            {
              name: "Uttarakhand",
              slug: "Uttarakhand",
              image: "/images/destinations/uttarakhand.jpg",
              count: 12,
            },
            {
              name: "Himachal Pradesh",
              slug: "Himachal",
              image: "/images/destinations/himachal.jpg",
              count: 10,
            },
            {
              name: "Jammu & Kashmir",
              slug: "Kashmir",
              image: "/images/destinations/uttarkashi.jpg",
              count: 6,
            },
            {
              name: "Sikkim",
              slug: "Sikkim",
              image: "/images/destinations/himachal.jpg",
              count: 5,
            },
          ],
          null,
          2
        ),
        display_order: 3,
      },
    },
    {
      value: "stats",
      label: "Stats strip",
      hint: "JSON array after regions: { value, label, icon }",
      defaults: {
        body_html: JSON.stringify(
          [
            { value: "10,000+", label: "Happy Trekkers", icon: "users" },
            { value: "4.8", label: "Average Rating", icon: "star" },
            { value: "8+", label: "Years Experience", icon: "award" },
            { value: "100%", label: "Safety Focused", icon: "shield" },
          ],
          null,
          2
        ),
        display_order: 4,
      },
    },
  ],
  expeditions: [
    {
      value: "hero",
      label: "Hero",
      hint: "Expeditions page title / subtitle",
      defaults: {
        title: "Himalayan Expeditions",
        subtitle:
          "Push your limits with expertly guided mountaineering expeditions. From technical climbing to summit glory, experience the Himalayas like never before.",
        badge_text: "High Altitude Adventures",
        display_order: 0,
      },
    },
    {
      value: "safety",
      label: "Safety",
      hint: "Safety-first copy",
      defaults: {
        title: "Safety First Approach",
        body_html:
          "All our expeditions are led by certified mountaineers with emergency protocols, satellite communication, and insurance coverage. Previous high-altitude experience is required for most expeditions.",
        display_order: 1,
      },
    },
  ],
  about: [
    {
      value: "hero",
      label: "Hero",
      hint: "About page title / subtitle",
      defaults: {
        title: "About Us",
        subtitle:
          "Passionate about mountains, committed to your safety, dedicated to creating unforgettable experiences.",
        display_order: 0,
      },
    },
    {
      value: "story",
      label: "Our story",
      hint: "Story HTML in Body",
      defaults: {
        title: "Born in the Mountains, Built for Adventure",
        badge_text: "Our Story",
        body_html:
          "<p>Global Events Travels was founded in 2016 by a group of passionate mountaineers who believed that everyone deserves to experience the magic of the Himalayas. What started as a small team of friends leading treks has grown into one of the most trusted adventure travel companies in India.</p><p>Our founders grew up in the mountains of Uttarakhand and Himachal Pradesh. They know every trail, every peak, and every hidden gem. This deep local knowledge, combined with international safety standards, is what sets us apart.</p><p>Today, we've helped over 10,000 trekkers from around the world discover the beauty of the Indian Himalayas. But our mission remains the same: to provide safe, sustainable, and unforgettable mountain experiences.</p>",
        display_order: 1,
      },
    },
  ],
};

export function getSectionKeysForPage(page: string): SectionKeyOption[] {
  if (page in SECTION_KEYS_BY_PAGE) {
    return SECTION_KEYS_BY_PAGE[page as ContentPage];
  }
  return [];
}

/** Keys still available to create (excludes ones already present). */
export function getAvailableSectionKeys(
  page: string,
  existingKeys: string[],
  keepKey?: string
): SectionKeyOption[] {
  const existing = new Set(existingKeys);
  return getSectionKeysForPage(page).filter(
    (opt) => opt.value === keepKey || !existing.has(opt.value)
  );
}

export function getSectionLabel(page: string, key: string): string {
  const found = getSectionKeysForPage(page).find((o) => o.value === key);
  return found?.label || key;
}

export function getSectionOption(page: string, key: string): SectionKeyOption | undefined {
  return getSectionKeysForPage(page).find((o) => o.value === key);
}

/** Merge hardcoded defaults into form fields when creating a section. */
export function applySectionDefaults(
  page: string,
  key: string,
  base: {
    display_order: number;
    is_active: boolean;
  }
): {
  title: string;
  subtitle: string;
  badge_text: string;
  body_html: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  display_order: number;
  is_active: boolean;
} {
  const defaults = getSectionOption(page, key)?.defaults || {};
  return {
    title: defaults.title || "",
    subtitle: defaults.subtitle || "",
    badge_text: defaults.badge_text || "",
    body_html: defaults.body_html || "",
    image_url: defaults.image_url || "",
    cta_label: defaults.cta_label || "",
    cta_url: defaults.cta_url || "",
    display_order:
      typeof defaults.display_order === "number"
        ? defaults.display_order
        : base.display_order,
    is_active: base.is_active,
  };
}
