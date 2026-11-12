"use client";

import { useEffect, useState, useCallback } from "react";
import { getGoogleReviews, type GoogleReviewItem } from "@/lib/api";

const PLACE_ID = "ChIJGQi8B8FdBDkROs-J97u89T0";

function ReviewCard({ review }: { review: GoogleReviewItem }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col flex-shrink-0 w-[85vw] min-w-[280px] max-w-[400px] md:w-[calc(33.333%-1rem)]">
      {/* Header: Rating & Verified Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i <= review.rating ? "text-yellow-400" : "text-neutral-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-2 text-sm font-semibold text-neutral-800">
            {review.rating.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Verified
        </div>
      </div>

      {/* Quote Icon */}
      <div className="mb-4">
        <svg className="w-8 h-8 text-primary-200" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Review Text */}
      <blockquote className="text-neutral-700 leading-relaxed mb-4 flex-grow line-clamp-4">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      {/* Google Source Badge */}
      <div className="flex items-center gap-2 mb-4 py-2 px-3 bg-secondary-50 rounded-lg">
        <svg className="w-4 h-4 text-secondary-500" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-sm font-medium text-secondary-600">Google Review</span>
      </div>

      {/* Author Info */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-primary-600 font-semibold text-lg">
            {review.author_name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-secondary-600 text-sm">{review.author_name}</div>
            {review.relative_time_description && (
              <div className="text-xs text-neutral-500">{review.relative_time_description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleReviews() {
  const [data, setData] = useState<{
    reviews: GoogleReviewItem[];
    place_name: string;
    rating: number | null;
    user_ratings_total: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getGoogleReviews();
      setData({
        reviews: result.reviews,
        place_name: result.place_name,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not fetch reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Auto-slide carousel
  useEffect(() => {
    if (!data?.reviews || data.reviews.length <= 1) return;
    const count = data.reviews.length;
    const timer = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [data?.reviews]);

  if (loading) {
    return (
      <section className="section bg-neutral-50">
        <div className="container-custom">
          <div className="text-center py-16">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
            <p className="mt-4 text-neutral-500">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data?.reviews?.length) {
    return null;
  }

  const reviews = data.reviews;
  const place = data;
  const stepPercent = reviews.length > 0 ? 100 / reviews.length : 0;

  return (
    <section className="section bg-neutral-50">
      <div className="container-custom">
        {/* Header - matches TestimonialSection */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Traveler Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-600 mb-4">
            What Our Trekkers Say
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-4">
            Real experiences from real adventurers. Join thousands of happy trekkers who&apos;ve explored the Himalayas with us.
          </p>
          <div className="flex items-center justify-center gap-3 text-neutral-600">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className={`w-5 h-5 ${i <= Math.round(place.rating || 0) ? "text-yellow-400" : "text-neutral-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-semibold">{place.rating?.toFixed(1)}</span>
            <span>•</span>
            <span>{place.user_ratings_total || 0} Google reviews</span>
          </div>
        </div>

        {/* Sliding cards - 3 visible at a time */}
        <div className="relative min-w-0 max-w-full overflow-hidden px-1">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translateX(-${scrollIndex * stepPercent}%)`,
            }}
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Dots */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setScrollIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === scrollIndex ? "w-8 bg-primary-500" : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-secondary-600">
                {place.rating?.toFixed(1) || "—"}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className={`w-4 h-4 ${i <= Math.round(place.rating || 0) ? "text-yellow-400" : "text-yellow-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-neutral-500 mt-1">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600">{place.user_ratings_total || 0}</div>
              <div className="text-sm text-neutral-500 mt-2">Total Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600">98%</div>
              <div className="text-sm text-neutral-500 mt-2">Would Recommend</div>
            </div>
            <div>
              <a
                href={`https://search.google.com/local/writereview?placeid=${PLACE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-semibold"
              >
                Write a Review
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <div className="text-sm text-neutral-500 mt-1">on Google</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
