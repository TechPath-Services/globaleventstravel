import { formatInr } from '@/lib/marketing/format';

import type { TrekRef } from './mentions';

export interface TrekFaq {
  question?: string | null;
  answer?: string | null;
}

export interface TrekReview {
  rating?: number | null;
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
  /** Individual reviews. Denormalized rating/review_count fields are not reviews. */
  reviews?: TrekReview[] | null;
  itinerary?: { day?: number; title?: string | null }[] | null;
}

export interface TrekStructuredOptions {
  origin: string;
  providerName: string;
  price: number;
  soldOut?: boolean;
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

function realAggregate(reviews: TrekReview[] | null | undefined) {
  const ratings = (reviews ?? [])
    .map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === 'number' && rating > 0 && rating <= 5);
  if (ratings.length === 0) return null;
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return {
    '@type': 'AggregateRating',
    ratingValue: average.toFixed(1),
    reviewCount: ratings.length,
    bestRating: 5,
    worstRating: 1,
  };
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
 * TouristTrip + Product, BreadcrumbList, and FAQPage when FAQs are on the page.
 * aggregateRating is included only from a non-empty list of review ratings.
 */
export function trekStructuredData(trek: TrekSeoSource, options: TrekStructuredOptions) {
  const origin = options.origin.replace(/\/$/, '');
  const pagePath = `/treks/${trek.slug}`;
  const pageUrl = new URL(pagePath, origin).href;
  const description = trekMetaDescription(trek, options.price);
  const image = absoluteUrl(origin, trek.featured_image);
  const aggregate = realAggregate(trek.reviews);
  const days = (trek.itinerary ?? []).filter((day) => day.title?.trim());

  const trip: Record<string, unknown> = {
    '@type': ['TouristTrip', 'Product'],
    name: nameWithTrek(trek.name),
    description,
    url: pageUrl,
    touristType: 'Himalayan trekker',
    provider: {
      '@type': 'Organization',
      name: options.providerName,
      url: origin,
    },
    brand: {
      '@type': 'Brand',
      name: options.providerName,
    },
  };
  if (image) trip.image = image;
  if (trek.location) trip.areaServed = trek.location;
  if (days.length > 0) {
    trip.itinerary = {
      '@type': 'ItemList',
      numberOfItems: days.length,
      itemListElement: days.slice(0, 14).map((day, index) => ({
        '@type': 'ListItem',
        position: day.day ?? index + 1,
        name: day.title?.trim(),
      })),
    };
  }
  if (options.price > 0) {
    trip.offers = {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Math.round(options.price),
      availability: options.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: pageUrl,
    };
  }
  if (aggregate) trip.aggregateRating = aggregate;

  const faqs = visibleFaqs(trek.faqs);
  const graph: Record<string, unknown>[] = [
    trip,
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', origin).href },
        { '@type': 'ListItem', position: 2, name: 'Treks', item: new URL('/treks', origin).href },
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
