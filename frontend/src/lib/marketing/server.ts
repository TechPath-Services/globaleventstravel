import { citiesApi, marketingApi } from '@/lib/api';
import type {
  DepartureCity,
  DepartureCitySummary,
  MarketingSettings,
  MarketingTrek,
  Trek,
} from '@/lib/types';

export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('Marketing data fetch failed:', error);
    return fallback;
  }
}

export const loadSettings = () => safe<MarketingSettings | null>(marketingApi.getSettings(), null);
export const loadTreks = (scope: 'all' | 'quiz') => safe<MarketingTrek[]>(marketingApi.getTreks(scope), []);
export const loadCities = () => safe<DepartureCitySummary[]>(citiesApi.list(), []);

/** Published cities with routes (one request per city; the list is short by design). */
export async function loadCityDetails(cities: DepartureCitySummary[]): Promise<DepartureCity[]> {
  const details = await Promise.all(cities.map((c) => safe(citiesApi.getBySlug(c.slug), null)));
  return details.filter((d): d is DepartureCity => d !== null);
}

/** TrekCard expects the full Trek shape; the marketing projection has every field it reads. */
export function asTrekCard(trek: MarketingTrek): Trek {
  return { ...trek, featured: false, status: 'published', description: '' } as unknown as Trek;
}

export function breadcrumbJsonLd(origin: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, origin).href,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function graph(...nodes: (Record<string, unknown> | null | false)[]) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}
