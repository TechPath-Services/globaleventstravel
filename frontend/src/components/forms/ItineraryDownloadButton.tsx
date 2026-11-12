import type { ItineraryDelivery } from '@/lib/itinerary-download';
import { retryItineraryDownload } from '@/lib/itinerary-download';

interface ItineraryDownloadButtonProps {
  delivery: ItineraryDelivery;
  trekSlug: string;
  source?: string;
}

/**
 * Visible retry for the automatic download. Render only when a PDF URL exists.
 * The click runs in a user gesture, so a popup blocker that stopped the
 * post-submit tab can still be bypassed here.
 */
export default function ItineraryDownloadButton({
  delivery,
  trekSlug,
  source,
}: ItineraryDownloadButtonProps) {
  if (!delivery.url || delivery.method === 'skipped') return null;

  const showPopupHint = delivery.method !== 'blob';

  return (
    <div className="mt-4">
      <a
        href={delivery.url}
        download={delivery.filename}
        onClick={(event) => {
          event.preventDefault();
          retryItineraryDownload(delivery, trekSlug, source);
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M4 16V6a2 2 0 012-2h8.5L20 9.5V16a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
        </svg>
        Download itinerary PDF
      </a>
      {showPopupHint && (
        <p className="mt-2 text-xs text-gray-500">
          If the PDF did not open, a popup blocker may have stopped the new tab. Use the button above.
        </p>
      )}
    </div>
  );
}
