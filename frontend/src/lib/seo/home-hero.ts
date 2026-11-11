import { api } from '@/lib/api';

const FALLBACK = '/images/home/hero-bg.webp';

/** CMS hero image, or the local WebP fallback. Does not rewrite stored content. */
export async function resolveHomeHeroImage(): Promise<string> {
  try {
    const sections = await api.get<{ key: string; image_url?: string | null }[]>('/content/home');
    const hero = sections.find((section) => section.key === 'hero');
    if (hero?.image_url) return hero.image_url;
  } catch (error) {
    console.error('Failed to resolve home hero image:', error);
  }
  return FALLBACK;
}
