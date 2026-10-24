type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: AnalyticsProps }) => void;
    dataLayer?: unknown[];
  }
}

/** Fire-and-forget event; no-op until an analytics script is added via the admin widget field. */
export function track(event: string, props: AnalyticsProps = {}): void {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', event, props);
    window.plausible?.(event, { props });
  } catch {
    // analytics must never break the page
  }
}
