import { describe, expect, it } from 'vitest';

import { buildSitemapEntries } from '@/lib/sitemap';

import { heroImageAttrs } from './images';
import { indexDirectiveForUrl, resolveRobots } from './indexing';
import { findMentionedTreks, selectRelatedGuides, trekSearchQuery } from './mentions';
import { notFoundResponse } from './not-found';
import {
  KEDARKANTHA_DEAL_REDIRECT_TARGET,
  LEGACY_EXACT_REDIRECTS,
  REDIRECTED_BLOG_SLUGS,
  TREK_ALIAS_REDIRECTS,
  TREK_ALIAS_TARGET_SLUGS,
  productTrekRedirect,
  resolveRedirect,
} from './redirects';
import { renderRobotsTxt } from './robots';
import {
  expeditionStructuredData,
  siteGraphJsonLd,
  trekDocumentTitle,
  trekMetaDescription,
  trekStructuredData,
} from './trek-structured-data';

const THIN_KEDARKANTHA_DEAL_SLUGS = [
  'unbelievable-kedarkantha-trek-deals-you-cant-resist',
  'book-your-ultimate-winter-escape-kedarkantha-trek-discounts',
  'ready-for-adventure-kedarkantha-trek-packages-on-sale-now',
  'score-big-savings-on-kedarkantha-trek-gear-today',
  'last-minute-kedarkantha-booking-tips-tricks',
  'kedarkantha-trek-made-affordable-best-budget-options',
  'discover-hidden-discounts-on-kedarkantha-trek-tours',
  'exclusive-offers-on-guided-kedarkantha-expeditions',
  'secure-your-spot-highest-rated-kedarkantha-trek-packages',
  'book-kedarkantha-trek-now-and-receive-surprise-perks',
  'ultimate-kedarkantha-trek-bundle-deals-just-for-you',
  'kedarkantha-trekking-essentials-buy-now-save-big',
];

const publishedTreks = [
  { name: 'Kedarkantha Trek', slug: 'kedarkantha', price: 5499 },
  { name: 'Kuari Pass Trek', slug: 'kuari-pass-trek', price: 6999 },
  { name: 'Sar Pass Trek', slug: 'sar-pass-trek', price: 7999 },
  { name: 'Kasol with Kheerganga Trek', slug: 'kasol-with-kheerganga-trek', price: 2999 },
  { name: 'Buni Buni + Kheerganga Trek', slug: 'buni-buni-kheerganga-trek', price: 4000 },
];

describe('redirects', () => {
  it('sends trailing slashes to the non-slash canonical in one hop', () => {
    expect(resolveRedirect('/treks/')).toBe('/treks');
    expect(resolveRedirect('/treks/kuari-pass-trek/')).toBe('/treks/kuari-pass-trek');
    expect(resolveRedirect('/blog/')).toBe('/blog');
    expect(resolveRedirect('/')).toBeNull();
    expect(resolveRedirect('/treks')).toBeNull();
  });

  it('301-maps short and mistyped trek aliases onto published slugs', () => {
    expect(resolveRedirect('/treks/kuari-pass')).toBe('/treks/kuari-pass-trek');
    expect(resolveRedirect('/treks/kuari-pass/')).toBe('/treks/kuari-pass-trek');
    expect(resolveRedirect('/treks/sar-pass')).toBe('/treks/sar-pass-trek');
    expect(resolveRedirect('/treks/sar-pass/')).toBe('/treks/sar-pass-trek');
    expect(resolveRedirect('/treks/kedarkantha-trek')).toBe('/treks/kedarkantha');
    expect(resolveRedirect('/treks/kuari-pass-trekt')).toBe('/treks/kuari-pass-trek');
    expect(resolveRedirect('/treks/not-a-real-trek')).toBeNull();
  });

  it('points every trek alias at a slug the sitemap would publish', () => {
    const entries = buildSitemapEntries({
      treks: TREK_ALIAS_TARGET_SLUGS.map((slug) => ({ slug })),
      expeditions: [],
      posts: [],
      cities: [],
      quizTreks: [],
    });
    const paths = new Set(entries.map((entry) => entry.path));
    for (const target of Object.values(TREK_ALIAS_REDIRECTS)) {
      expect(paths.has(target)).toBe(true);
    }
    for (const source of Object.keys(TREK_ALIAS_REDIRECTS)) {
      expect(paths.has(source)).toBe(false);
    }
  });

  it('redirects known WordPress URLs and leaves unmatched ones alone', () => {
    expect(resolveRedirect('/wp-content/uploads/2024/10/KEDARKANTHA-GET.pdf')).toBe('/treks/kedarkantha');
    expect(resolveRedirect('/guides/')).toBe('/blog');
    expect(resolveRedirect('/author/utkarsh-saxena/')).toBe('/blog');
    expect(resolveRedirect('/tag/kheerganga-lodging-tips/')).toBe(
      '/blog/unlock-the-ultimate-hiking-experience-with-these-kheerganga-lodging-tips',
    );
    expect(resolveRedirect('/tag/some-other-tag')).toBe('/blog');
    expect(resolveRedirect('/blog/best-budget-himalayan-treks-under-10000-in-2026')).toBe(
      '/blog/budget-himalayan-treks-under-10000-2026',
    );
    expect(
      resolveRedirect('/blog/13-best-summer-treks-in-india-for-2025-perfect-for-nature-lovers-thrill-seekers/'),
    ).toBe('/blog/best-summer-treks-india-2025');
    expect(resolveRedirect('/blog/winter-treks-for-students')).toBeNull();
    expect(resolveRedirect('/blog/bunbuni-kheerganga-trek-vs-basic-kheerganga-2026')).toBeNull();
    expect(resolveRedirect('/blog/bunbuni-kheerganga-trek-vs-basic-kheerganga-2026/')).toBe(
      '/blog/bunbuni-kheerganga-trek-vs-basic-kheerganga-2026',
    );
    expect(resolveRedirect('/wp-content/uploads/2024/10/KEADARNATH-YATRA-GET.pdf')).toBeNull();
    expect(resolveRedirect('/product/dayara-bugyal-trek/')).toBe('/product/dayara-bugyal-trek');
  });

  it('301s thin Kedarkantha deal posts to the trek even when the posts still exist', () => {
    expect(REDIRECTED_BLOG_SLUGS).toEqual(THIN_KEDARKANTHA_DEAL_SLUGS);
    for (const slug of THIN_KEDARKANTHA_DEAL_SLUGS) {
      expect(resolveRedirect(`/blog/${slug}`)).toBe(KEDARKANTHA_DEAL_REDIRECT_TARGET);
      expect(resolveRedirect(`/blog/${slug}/`)).toBe(KEDARKANTHA_DEAL_REDIRECT_TARGET);
      expect(resolveRedirect(`/BLOG/${slug.toUpperCase()}`)).toBe(KEDARKANTHA_DEAL_REDIRECT_TARGET);
      expect(resolveRedirect(`/blog/${slug}`, '?utm_source=old')).toBe(
        `${KEDARKANTHA_DEAL_REDIRECT_TARGET}?utm_source=old`,
      );
      expect(LEGACY_EXACT_REDIRECTS[`/blog/${slug}`]).toBe(KEDARKANTHA_DEAL_REDIRECT_TARGET);
    }
    expect(resolveRedirect('/blog/kedarkantha-trek-cost-202627-full-line-by-line-breakdown')).toBeNull();
    expect(resolveRedirect('/blog/best-time-to-trek-kedarkantha')).toBeNull();
  });

  it('preserves the query string on trailing-slash redirects', () => {
    expect(resolveRedirect('/treks/', '?location=Uttarakhand')).toBe('/treks?location=Uttarakhand');
  });

  it('redirects a product URL only when the trek exists', () => {
    expect(productTrekRedirect('dayara-bugyal-trek', true)).toBe('/treks/dayara-bugyal-trek');
    expect(productTrekRedirect('Dayara-Bugyal-Trek', true)).toBe('/treks/dayara-bugyal-trek');
    expect(productTrekRedirect('missing-trek', false)).toBeNull();
    expect(productTrekRedirect('../admin', true)).toBeNull();
  });
});

describe('indexing', () => {
  it('noindexes faceted listings and points the canonical at the clean URL', () => {
    const treks = indexDirectiveForUrl(
      new URL('https://globaleventstravels.com/treks?page=1&difficulty=challenging&season=June&location=Uttarkashi&sort=price_desc'),
    );
    expect(treks).toEqual({ robots: 'noindex,follow', canonicalPath: '/treks' });

    const blog = indexDirectiveForUrl(new URL('https://globaleventstravels.com/blog?category=technology'));
    expect(blog).toEqual({ robots: 'noindex,follow', canonicalPath: '/blog' });

    const calculator = indexDirectiveForUrl(
      new URL('https://globaleventstravels.com/tools/trek-budget-calculator/?trek=kedarkantha&people=1'),
    );
    expect(calculator).toEqual({
      robots: 'noindex,follow',
      canonicalPath: '/tools/trek-budget-calculator',
    });

    const search = indexDirectiveForUrl(new URL('https://globaleventstravels.com/?s={search_term_string}'));
    expect(search).toEqual({ robots: 'noindex,follow', canonicalPath: '/' });
  });

  it('keeps clean listing pages and real trek URLs indexable', () => {
    expect(indexDirectiveForUrl(new URL('https://globaleventstravels.com/treks'))).toEqual({
      canonicalPath: '/treks',
    });
    expect(indexDirectiveForUrl(new URL('https://globaleventstravels.com/blog'))).toEqual({
      canonicalPath: '/blog',
    });
    expect(indexDirectiveForUrl(new URL('https://globaleventstravels.com/treks/kedarkantha'))).toEqual({
      canonicalPath: '/treks/kedarkantha',
    });
    expect(indexDirectiveForUrl(new URL('https://globaleventstravels.com/treks?utm_source=google'))).toEqual({
      canonicalPath: '/treks',
    });
  });

  it('lets staging noindex override a page-level index directive', () => {
    expect(resolveRobots('noindex,nofollow', 'noindex,follow')).toBe('noindex,nofollow');
    expect(resolveRobots('index,follow', 'noindex,follow')).toBe('noindex,follow');
    expect(resolveRobots(undefined, undefined)).toBe('index,follow');
  });

  it('does not disallow faceted URLs in robots.txt', () => {
    const production = renderRobotsTxt(true);
    expect(production).toContain('Allow: /');
    expect(production).not.toContain('Disallow: /treks');
    expect(production).not.toContain('Disallow: /blog');
    expect(production).not.toContain('?');
  });
});

describe('trek structured data', () => {
  const kedarkantha = {
    name: 'Kedarkantha Trek',
    slug: 'kedarkantha',
    duration: 6,
    price: 5499,
    location: 'Uttarkashi, Uttarakhand',
    short_description: 'Snowy winter summit above Sankri.',
    featured_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    faqs: [
      { question: 'When does it snow in Kedarkantha?', answer: 'From late November through March.' },
    ],
    itinerary: [
      { day: 1, title: 'Dehradun to Sankri' },
      { day: 2, title: 'Sankri to Juda Ka Talab' },
    ],
    rating: 0,
    review_count: 0,
  };

  const provider = {
    origin: 'https://globaleventstravels.com',
    providerName: 'Global Events Travels',
    price: 5499,
  };

  function typesIn(data: { '@graph': unknown[] }): string[] {
    return (data['@graph'] as { '@type'?: string | string[] }[]).flatMap((node) => {
      const type = node['@type'];
      return Array.isArray(type) ? type : type ? [type] : [];
    });
  }

  it('builds TouristTrip, an INR offer, breadcrumbs, and FAQ without a Product type', () => {
    const data = trekStructuredData(kedarkantha, { ...provider, validFrom: '2026-11-14' });
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
    const graph = data['@graph'] as Record<string, unknown>[];
    const trip = graph.find((node) => node['@type'] === 'TouristTrip');
    expect(data['@context']).toBe('https://schema.org');
    expect(typesIn(data)).not.toContain('Product');
    expect(trip).toMatchObject({
      '@type': 'TouristTrip',
      name: 'Kedarkantha Trek',
      url: 'https://globaleventstravels.com/treks/kedarkantha',
      image: kedarkantha.featured_image,
      touristType: 'Himalayan trekker',
      provider: {
        '@type': 'Organization',
        name: 'Global Events Travels',
        url: 'https://globaleventstravels.com',
      },
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: 2,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Dehradun to Sankri' },
          { '@type': 'ListItem', position: 2, name: 'Sankri to Juda Ka Talab' },
        ],
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 5499,
        availability: 'https://schema.org/InStock',
        url: 'https://globaleventstravels.com/treks/kedarkantha',
        validFrom: '2026-11-14',
      },
    });
    expect(trip).not.toHaveProperty('aggregateRating');
    expect(trip).not.toHaveProperty('review');
    expect(JSON.stringify(data)).not.toContain('Product');
    expect(JSON.stringify(data)).not.toContain('aggregateRating');

    const crumbs = graph.find((node) => node['@type'] === 'BreadcrumbList') as {
      itemListElement: { name: string; item: string }[];
    };
    expect(crumbs.itemListElement.map((item) => item.item)).toEqual([
      'https://globaleventstravels.com/',
      'https://globaleventstravels.com/treks',
      'https://globaleventstravels.com/treks/kedarkantha',
    ]);

    const faq = graph.find((node) => node['@type'] === 'FAQPage') as {
      mainEntity: { name: string }[];
    };
    expect(faq.mainEntity[0].name).toBe('When does it snow in Kedarkantha?');
  });

  it('omits cleared, zero, and incomplete ratings and keeps FAQPage off empty pages', () => {
    const withoutFaq = trekStructuredData(
      { ...kedarkantha, faqs: [], rating: 4.9, review_count: 0 },
      { ...provider, soldOut: true, validFrom: 'not-a-date' },
    );
    expect(withoutFaq['@graph'].some((node) => (node as { '@type': string })['@type'] === 'FAQPage')).toBe(false);
    const soldOut = withoutFaq['@graph'][0] as { offers: { availability: string; validFrom?: string } };
    expect(soldOut.offers.availability).toBe('https://schema.org/SoldOut');
    expect(soldOut.offers.validFrom).toBeUndefined();
    expect(withoutFaq['@graph'][0]).not.toHaveProperty('aggregateRating');

    const zeroCount = trekStructuredData(
      { ...kedarkantha, rating: 0, review_count: 256 },
      provider,
    );
    expect(zeroCount['@graph'][0]).not.toHaveProperty('aggregateRating');
    expect(JSON.stringify(zeroCount)).not.toContain('256');

    const unnamed = trekStructuredData(
      { ...kedarkantha, rating: 0, review_count: 0, reviews: [{ rating: 5 }, { rating: 0 }, { rating: 4 }] },
      provider,
    );
    expect(unnamed['@graph'][0]).toMatchObject({
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.5', reviewCount: 2 },
    });
    expect(unnamed['@graph'][0]).not.toHaveProperty('review');
    expect(typesIn(unnamed)).not.toContain('Product');
  });

  it('adds aggregateRating and review only when stored reviews have a count and an average', () => {
    const stored = trekStructuredData(
      { ...kedarkantha, faqs: [], rating: 4.5, review_count: 12 },
      provider,
    );
    expect(stored['@graph'][0]).toMatchObject({
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.5', reviewCount: 12, bestRating: 5 },
    });
    expect(stored['@graph'][0]).not.toHaveProperty('review');
    expect(typesIn(stored)).toEqual(['TouristTrip', 'BreadcrumbList']);

    const withReviews = trekStructuredData(
      {
        ...kedarkantha,
        faqs: [],
        rating: 1,
        review_count: 99,
        reviews: [
          {
            rating: 5,
            user_name: 'Asha',
            title: 'Clear trail',
            comment: 'Well led.',
            created_at: '2026-01-04T10:00:00Z',
          },
          { rating: 4, user_name: 'Rohit', comment: 'Cold and worth it.' },
          { rating: 0, user_name: 'Placeholder' },
        ],
      },
      provider,
    );
    expect(withReviews['@graph'][0]).toMatchObject({
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.5', reviewCount: 2 },
      review: [
        {
          '@type': 'Review',
          name: 'Clear trail',
          author: { '@type': 'Person', name: 'Asha' },
          reviewBody: 'Well led.',
          datePublished: '2026-01-04',
          reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5, worstRating: 1 },
        },
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Rohit' },
          reviewBody: 'Cold and worth it.',
          reviewRating: { '@type': 'Rating', ratingValue: 4 },
        },
      ],
    });
    expect(JSON.stringify(withReviews)).not.toContain('Placeholder');
    expect(JSON.stringify(withReviews)).not.toContain('"reviewCount":99');
  });

  it('describes an expedition as a TouristTrip and rates it only when both figures are real', () => {
    const cleared = expeditionStructuredData(
      {
        name: 'Friendship Peak Expedition',
        slug: 'friendship-peak-expedition',
        shortDescription: 'A technical alpine ascent above Manali.',
        image: 'https://images.example/peak.jpg',
        location: 'Manali, Himachal Pradesh',
        itinerary: [{ day: 1, title: 'Arrival in Manali' }],
        rating: 0,
        reviewCount: 0,
      },
      { ...provider, price: 32000 },
    );
    const trip = cleared['@graph'][0] as Record<string, unknown>;
    expect(trip).toMatchObject({
      '@type': 'TouristTrip',
      name: 'Friendship Peak Expedition',
      description: 'A technical alpine ascent above Manali.',
      touristType: 'Mountaineer',
      url: 'https://globaleventstravels.com/expeditions/friendship-peak-expedition',
      offers: {
        '@type': 'Offer',
        price: 32000,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    });
    expect(trip).not.toHaveProperty('aggregateRating');
    expect(trip).not.toHaveProperty('validFrom');
    expect((trip.offers as { validFrom?: string }).validFrom).toBeUndefined();
    expect(typesIn(cleared)).not.toContain('Product');
    expect(typesIn(cleared)).toContain('BreadcrumbList');
    expect(JSON.stringify(cleared)).not.toContain('FAQPage');
    expect(JSON.stringify(cleared)).not.toContain('Trek');

    const rated = expeditionStructuredData(
      {
        name: 'Friendship Peak Expedition',
        slug: 'friendship-peak-expedition',
        shortDescription: 'A technical alpine ascent above Manali.',
        rating: 4.9,
        reviewCount: 67,
      },
      { ...provider, price: 32000 },
    );
    expect(rated['@graph'][0]).toMatchObject({
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: 67 },
    });
    expect(rated['@graph'][0]).not.toHaveProperty('review');
  });

  it('uses the custom SEO title when set, otherwise name, Trek, duration, and price', () => {
    expect(trekDocumentTitle(kedarkantha, 5499)).toBe('Kedarkantha Trek | 6 Days from ₹5,499');
    expect(trekDocumentTitle({ name: 'Har ki Dun', slug: 'har-ki-dun', duration: 7 }, 12999)).toContain('Trek');
    expect(trekDocumentTitle({ ...kedarkantha, meta_title: 'Kedarkantha Trek 2026 – Cost, Itinerary & Best Time' }, 5499)).toBe(
      'Kedarkantha Trek 2026 – Cost, Itinerary & Best Time',
    );
    const description = trekMetaDescription({ ...kedarkantha, meta_description: '' }, 5499);
    expect(description).toContain('Kedarkantha Trek');
    expect(description).toContain('₹5,499');
    expect(trekMetaDescription({ ...kedarkantha, meta_description: 'Custom description.' }, 5499)).toBe(
      'Custom description.',
    );
  });

  it('does not advertise a site search action', () => {
    const json = JSON.stringify(
      siteGraphJsonLd({
        name: 'Global Events Travels',
        description: 'Treks',
        foundingDate: '2012',
        origin: 'https://globaleventstravels.com',
        logo: 'https://globaleventstravels.com/logo.webp',
      }),
    );
    expect(json).not.toContain('SearchAction');
    expect(json).not.toContain('?s=');
  });
});

describe('hero images', () => {
  it('serves a responsive WebP srcset for the home hero and Unsplash', () => {
    const home = heroImageAttrs('/images/home/hero-bg.webp', { width: 1920, height: 1080 });
    expect(home.loading).toBe('eager');
    expect(home.fetchpriority).toBe('high');
    expect(home.src).toBe('/images/home/hero-bg-1280.webp');
    expect(home.srcset).toContain('/images/home/hero-bg-640.webp 640w');
    expect(home.srcset).not.toContain('/images/home/hero-bg.webp ');
    expect(home.width).toBe(1920);
    expect(home.height).toBe(1260);
    expect(home.type).toBe('image/webp');

    const remote = heroImageAttrs('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', {
      width: 1920,
      height: 600,
    });
    expect(remote.src).toContain('fm=webp');
    expect(remote.srcset).toContain('640w');
    expect(remote.srcset).toContain('1920w');
    expect(remote.fetchpriority).toBe('high');
  });
});

describe('internal links', () => {
  it('matches blog copy to the trek it names, not to every trek', () => {
    const matches = findMentionedTreks(
      {
        title: 'Kedarkantha Trek Cost 2026',
        slug: 'kedarkantha-trek-cost',
        content: '<p>The Kedarkantha package starts in Sankri. Sar Pass is a different trail.</p>',
      },
      publishedTreks,
    );
    expect(matches.map((trek) => trek.slug)).toEqual(['kedarkantha', 'sar-pass-trek']);
    expect(trekSearchQuery(publishedTreks[0])).toBe('kedarkantha');
    expect(trekSearchQuery(publishedTreks[1])).toBe('kuari pass');
  });

  it('does not treat the word trek alone as a mention', () => {
    expect(
      findMentionedTreks({ title: 'How to pack for a trek', content: 'Bring layers.' }, publishedTreks),
    ).toEqual([]);
    expect(selectRelatedGuides([
      { title: 'Best time to trek Kedarkantha', slug: 'best-time-to-trek-kedarkantha', excerpt: 'Winter.' },
      { title: 'Best time to trek Kedarkantha', slug: 'best-time-to-trek-kedarkantha', excerpt: 'dup' },
      {
        title: 'Unbelievable deals',
        slug: 'unbelievable-kedarkantha-trek-deals-you-cant-resist',
        excerpt: 'Sale.',
      },
      { title: 'Packing list', slug: 'kedarkantha-packing-list', excerpt: 'Layers.' },
    ]).map((post) => post.slug)).toEqual([
      'best-time-to-trek-kedarkantha',
      'kedarkantha-packing-list',
    ]);
  });
});

describe('not found', () => {
  it('returns a real 404 document', async () => {
    const response = notFoundResponse({ title: 'Trek not found' });
    expect(response.status).toBe(404);
    expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
    const body = await response.text();
    expect(body).toContain('noindex, follow');
    expect(body).toContain('Trek not found');
    expect(body).toContain('href="/treks"');
  });
});
