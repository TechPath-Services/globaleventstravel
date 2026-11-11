const STOP_WORDS = new Set([
  'trek',
  'treks',
  'from',
  'with',
  'the',
  'and',
  'of',
  'a',
  'to',
  'in',
  'on',
  'for',
  'day',
  'days',
]);

export interface TrekRef {
  name: string;
  slug: string;
  price?: number;
}

export interface GuideRef {
  title: string;
  slug: string;
  excerpt?: string | null;
}

export function trekPhrase(trek: TrekRef): { phrase: string; tokens: string[] } {
  const withoutFrom = trek.slug.toLowerCase().replace(/-from-[a-z0-9-]+$/i, '');
  const tokens = withoutFrom.split('-').filter((token) => token && !STOP_WORDS.has(token));
  return { phrase: tokens.join(' '), tokens };
}

/** Search query that is specific enough to look up blog posts for this trek. */
export function trekSearchQuery(trek: TrekRef): string | null {
  const { phrase, tokens } = trekPhrase(trek);
  const long = tokens.filter((token) => token.length >= 6).sort((a, b) => b.length - a.length)[0];
  if (long) return long;
  if (phrase.replace(/\s/g, '').length >= 6) return phrase;
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function includesTerm(haystack: string, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (needle.length < 3) return false;
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(needle)}(?:$|[^a-z0-9])`, 'i').test(haystack);
}

export function postPlainText(post: {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
}): string {
  return [post.title, post.slug?.replace(/-/g, ' '), post.excerpt, post.content]
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .toLowerCase();
}

export function trekMentionedInText(trek: TrekRef, text: string): boolean {
  const haystack = text.toLowerCase();
  const { phrase, tokens } = trekPhrase(trek);
  if (phrase.length >= 6 && includesTerm(haystack, phrase)) return true;
  return tokens.some((token) => token.length >= 6 && includesTerm(haystack, token));
}

function mentionScore(trek: TrekRef, text: string): number {
  if (!trekMentionedInText(trek, text)) return 0;
  const { phrase, tokens } = trekPhrase(trek);
  const phraseHit = phrase.length >= 6 && includesTerm(text, phrase) ? 100 + phrase.length : 0;
  const longest = tokens.reduce((max, token) => Math.max(max, token.length), 0);
  return phraseHit + longest;
}

/** Published treks whose name/slug is actually written in the post. Most specific first. */
export function findMentionedTreks<T extends TrekRef>(
  post: { title?: string | null; slug?: string | null; excerpt?: string | null; content?: string | null },
  treks: T[],
  limit = 3,
): T[] {
  const text = postPlainText(post);
  const ranked = treks
    .map((trek) => ({ trek, score: mentionScore(trek, text) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.trek.slug.localeCompare(b.trek.slug));

  const seen = new Set<string>();
  const matches: T[] = [];
  for (const entry of ranked) {
    if (seen.has(entry.trek.slug)) continue;
    seen.add(entry.trek.slug);
    matches.push(entry.trek);
    if (matches.length >= limit) break;
  }
  return matches;
}

/** Posts already returned by a trek-specific search, de-duplicated. */
export function selectRelatedGuides<T extends GuideRef>(posts: T[], limit = 4): T[] {
  const seen = new Set<string>();
  const guides: T[] = [];
  for (const post of posts) {
    const slug = (post.slug || '').trim();
    const title = (post.title || '').trim();
    if (!slug || !title || seen.has(slug)) continue;
    seen.add(slug);
    guides.push(post);
    if (guides.length >= limit) break;
  }
  return guides;
}
