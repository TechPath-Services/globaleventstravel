import { useEffect, useState } from 'react';
import type { Trek } from '@/lib/types';
import { DIFFICULTY_LABELS } from '@/lib/constants';

interface Props {
  treks: Trek[];
  annotation?: string;
  autoPlayMs?: number;
}

function formatReviewCount(count: number): string {
  if (count >= 1000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return String(count);
}

export default function FeaturedTrekSlider({
  treks,
  annotation = 'Breathtaking Views Await',
  autoPlayMs = 5500,
}: Props) {
  const [index, setIndex] = useState(0);
  const slides = treks.length > 0 ? treks : [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [slides.length, autoPlayMs]);

  if (slides.length === 0) return null;

  const trek = slides[index];
  const difficulty = DIFFICULTY_LABELS[trek.difficulty]?.label || trek.difficulty;
  const image = trek.featured_image || '/images/treks/placeholder.jpg';
  const rating = trek.rating ? trek.rating.toFixed(1) : '4.8';
  const reviewLabel =
    trek.review_count > 0
      ? `${formatReviewCount(trek.review_count)} trekkers`
      : 'featured trek';

  const goNext = () => setIndex((prev) => (prev + 1) % slides.length);

  return (
    <div className="featured-trek-slider relative w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
      {annotation && (
        <p
          className="hidden lg:block absolute -top-10 right-2 text-primary-300 text-xl xl:text-2xl font-display rotate-[-6deg] pointer-events-none drop-shadow-md"
          aria-hidden="true"
        >
          {annotation}
          <svg
            className="absolute -bottom-5 left-1/2 w-10 h-8 text-primary-300/90 -rotate-12"
            viewBox="0 0 40 32"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 2c8 4 18 18 28 26M30 20c4 4 6 8 6 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </p>
      )}

      <article
        className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/15 backdrop-blur-xl shadow-2xl shadow-black/25"
        aria-live="polite"
        aria-roledescription="carousel"
        aria-label="Featured treks"
      >
        <div className="flex gap-3.5 p-3.5 sm:p-4">
          <a
            href={`/treks/${trek.slug}`}
            className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/20"
          >
            <img
              src={image}
              alt={trek.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              width="96"
              height="96"
              loading="lazy"
            />
          </a>

          <div className="min-w-0 flex-1 flex flex-col justify-center pr-10">
            <a
              href={`/treks/${trek.slug}`}
              className="text-base sm:text-lg font-bold text-white hover:text-primary-300 transition-colors line-clamp-1"
            >
              {trek.name}
            </a>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-white/80">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.8" />
                  <path d="M8 3v4m8-4v4M7 11h10" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {trek.duration} Days
              </span>
              <span className="inline-flex items-center gap-1 capitalize">
                <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m3 20 7-12 3 5 2.5-4L21 20H3Z" />
                </svg>
                {difficulty}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-white/85">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-white">{rating}</span>
              <span className="text-white/60">({reviewLabel})</span>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/40 hover:bg-primary-600 transition-colors"
            aria-label="Next featured trek"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {slides.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-3" role="tablist" aria-label="Featured trek slides">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${slide.name}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-primary-400' : 'w-1.5 bg-white/35 hover:bg-white/55'
                }`}
              />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
