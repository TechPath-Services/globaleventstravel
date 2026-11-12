import { formatInr } from '@/lib/marketing/format';

import type { TrekRef } from './mentions';

export interface TrekFaq {
  question?: string | null;
  answer?: string | null;
}

export interface TrekReview {
  rating?: number | null;
  user_name?: string | null;
  author_name?: string | null;
  title?: string | null;
  comment?: string | null;
  text?: string | null;
  created_at?: string | null;
}

export interface TrekSeoSource extends TrekRef {
  short_description?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  duration?: number | null;
  location?: string | null;
  featured_image?: string | null;
  faqs?: TrekFaq[] | null;
  /** Stored manual average. Used only together with a positive review count. */
  rating?: number | null;
  review_count?: number | null;
  reviewCount?: number | null;
  /** Individual reviews. These take precedence over the stored average. */
  reviews?: TrekReview[] | null;
  itinerary?: { day?: number; title?: string | null }[] | null;
}

export interface TrekStructuredOptions {
  origin: string;
  providerName: string;
  price: number;
  soldOut?: boolean;
  /** Next departure date (YYYY-MM-DD) when a batch exists. */
  validFrom?: string | null;
  kind?: 'trek' | 'expedition';
}

function plainText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameWithTrek(name: string): string {
  const trimmed = name.trim();
  return /\btrek\b/i.test(trimmed) ? trimmed : `${trimmed} Trek`;
}

export function trekDocumentTitle(trek: TrekSeoSource, price: number): string {
  const custom = trek.meta_title?.trim();
  if (custom) return custom;
  const days = trek.duration && trek.duration > 0 ? trek.duration : null;
  const name = nameWithTrek(trek.name);
  if (days && price > 0) return `${name} | ${days} Days from ${formatInr(price)}`;
  if (days) return `${name} | ${days} Days`;
  if (price > 0) return `${name} | From ${formatInr(price)}`;
  return name;
}

export function trekMetaDescription(trek: TrekSeoSource, price: number): string {
  const custom = trek.meta_description?.trim();
  if (custom) return custom;
  const name = nameWithTrek(trek.name);
  const days = trek.duration && trek.duration > 0 ? `${trek.duration}-day ` : '';
  const cost = price > 0 ? ` from ${formatInr(price)}` : '';
  const lead = `Book the ${name}: a ${days}Himalayan trek${cost}.`.replace(/\s+/g, ' ');
  const extra = plainText(trek.short_description || trek.description || '');
  const combined = extra ? `${lead} ${extra}` : lead;
  if (combined.length <= 160) return combined;
  const cut = combined.slice(0, 157);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function absoluteUrl(origin: string, value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, origin).href;
  } catch {
    return undefined;
  }
}

function positiveRating(rating: unknown): rating is number {
  return typeof rating === 'number' && Number.isFinite(rating) && rating > 0 && rating <= 5;
}

function aggregateRating(ratingValue: number, reviewCount: number) {
  return {
    '@type': 'AggregateRating',
    ratingValue: ratingValue.toFixed(1),
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

function reviewAuthor(review: TrekReview): string {
  return (review.user_name || review.author_name || '').trim();
}

function reviewBody(review: TrekReview): string {
  return plainText(review.comment || review.text || '');
}

/** Ratings of 0, missing averages, and reviews with no author are left out. */
function ratingMarkup(trek: TrekSeoSource): {
  aggregate: ReturnType<typeof aggregateRating> | null;
  reviews: Record<string, unknown>[];
} {
  const rated = (trek.reviews ?? []).filter((review) => positiveRating(review.rating));
  const named = rated.filter((review) => reviewAuthor(review));
  const source = named.length > 0 ? named : rated;
  if (source.length > 0) {
    const average = source.reduce((sum, review) => sum + (review.rating as number), 0) / source.length;
    const reviews = named.map((review) => {
      const node: Record<string, unknown> = {
        '@type': 'Review',
        author: { '@type': 'Person', name: reviewAuthor(review) },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      };
      const title = review.title?.trim();
      const body = reviewBody(review);
      const published = review.created_at?.slice(0, 10);
      if (title) node.name = title;
      if (body) node.reviewBody = body;
      if (published && /^\d{4}-\d{2}-\d{2}$/.test(published)) node.datePublished = published;
      return node;
    });
    return { aggregate: aggregateRating(average, source.length), reviews };
  }

  const count = trek.review_count ?? trek.reviewCount;
  if (positiveRating(trek.rating) && typeof count === 'number' && Number.isFinite(count) && count > 0) {
    return { aggregate: aggregateRating(trek.rating, Math.round(count)), reviews: [] };
  }
  return { aggregate: null, reviews: [] };
}

function departureDate(value?: string | null): string | undefined {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value?.trim() || '');
  return match?.[1];
}

function clipText(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function visibleFaqs(faqs: TrekFaq[] | null | undefined) {
  return (faqs ?? [])
    .map((faq) => ({
      question: plainText(faq.question || ''),
      answer: plainText(faq.answer || ''),
    }))
    .filter((faq) => faq.question && faq.answer);
}

/**
 * TouristTrip (not Product), BreadcrumbList, and FAQPage when FAQs are on the page.
 * aggregateRating and review are included only when a real average and a positive
 * review count are stored. Zero, missing, and unnamed placeholder ratings are omitted.
 */
export function trekStructuredData(trek: TrekSeoSource, options: TrekStructuredOptions) {
  const origin = options.origin.replace(/\/$/, '');
  const kind = options.kind ?? 'trek';
  const sectionPath = kind === 'expedition' ? '/expeditions' : '/treks';
  const sectionName = kind === 'expedition' ? 'Expeditions' : 'Treks';
  const pagePath = `${sectionPath}/${trek.slug}`;
  const pageUrl = new URL(pagePath, origin).href;
  const description =
    kind === 'expedition'
      ? clipText(plainText(trek.short_description || trek.description || trek.name), 300)
      : trekMetaDescription(trek, options.price);
  const image = absoluteUrl(origin, trek.featured_image);
  const { aggregate, reviews } = ratingMarkup(trek);
  const days = (trek.itinerary ?? []).filter((day) => day.title?.trim());
  const validFrom = departureDate(options.validFrom);

  const trip: Record<string, unknown> = {
    '@type': 'TouristTrip',
    name: kind === 'expedition' ? trek.name.trim() : nameWithTrek(trek.name),
    description,
    url: pageUrl,
    touristType: kind === 'expedition' ? 'Mountaineer' : 'Himalayan trekker',
    provider: {
      '@type': 'Organization',
      name: options.providerName,
      url: origin,
    },
  };
  if (image) trip.image = image;
  if (trek.location) trip.areaServed = trek.location;
  if (days.length > 0) {
    trip.itinerary = {
      '@type': 'ItemList',
      numberOfItems: days.length,
      itemListElement: days.map((day, index) => ({
        '@type': 'ListItem',
        position: day.day ?? index + 1,
        name: day.title?.trim(),
      })),
    };
  }
  if (options.price > 0) {
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Math.round(options.price),
      availability: options.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: pageUrl,
    };
    if (validFrom) offer.validFrom = validFrom;
    trip.offers = offer;
  }
  if (aggregate) trip.aggregateRating = aggregate;
  if (reviews.length > 0) trip.review = reviews;

  const faqs = visibleFaqs(trek.faqs);
  const graph: Record<string, unknown>[] = [
    trip,
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', origin).href },
        { '@type': 'ListItem', position: 2, name: sectionName, item: new URL(sectionPath, origin).href },
        { '@type': 'ListItem', position: 3, name: trek.name, item: pageUrl },
      ],
    },
  ];
  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function expeditionStructuredData(
  expedition: {
    name: string;
    slug: string;
    shortDescription?: string | null;
    description?: string | null;
    image?: string | null;
    location?: string | null;
    itinerary?: { day?: number; title?: string | null }[] | null;
    rating?: number | null;
    reviewCount?: number | null;
  },
  options: Omit<TrekStructuredOptions, 'kind'>,
) {
  return trekStructuredData(
    {
      name: expedition.name,
      slug: expedition.slug,
      short_description: expedition.shortDescription,
      description: expedition.description,
      featured_image: expedition.image,
      location: expedition.location,
      itinerary: expedition.itinerary,
      rating: expedition.rating,
      reviewCount: expedition.reviewCount,
    },
    { ...options, kind: 'expedition' },
  );
}

export function siteGraphJsonLd(input: {
  name: string;
  description: string;
  foundingDate: string;
  origin: string;
  logo: string;
  telephone?: string;
  email?: string;
  streetAddress?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: input.name,
        description: input.description,
        foundingDate: input.foundingDate,
        url: input.origin,
        logo: input.logo,
        telephone: input.telephone,
        email: input.email,
        address: { '@type': 'PostalAddress', streetAddress: input.streetAddress },
      },
      {
        '@type': 'WebSite',
        name: input.name,
        url: input.origin,
        description: input.description,
      },
    ],
  };
}
