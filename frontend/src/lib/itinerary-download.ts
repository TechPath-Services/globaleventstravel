import { API_BASE_URL } from '@/lib/constants';
import { track } from '@/lib/marketing/analytics';

export type ItineraryKind = 'trek' | 'expedition';

/** How the browser was asked to deliver the PDF. `blocked` means a new tab was refused. */
export type ItineraryDownloadMethod = 'blob' | 'tab' | 'blocked';

export interface ItineraryDelivery {
  url: string;
  filename: string;
  method: ItineraryDownloadMethod | 'skipped';
}

/**
 * Turn a trek or expedition name into a download filename.
 * "Kedarkantha Trek" → "Kedarkantha-Trek-Itinerary.pdf"
 */
export function itineraryPdfFilename(name: string, kind: ItineraryKind = 'trek'): string {
  const label = kind === 'expedition' ? 'Expedition' : 'Trek';
  const tokens = (name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (tokens.length > 0 && tokens[tokens.length - 1].toLowerCase() === label.toLowerCase()) {
    tokens.pop();
  }

  const base = [...tokens, label].join('-') || label;
  return `${base}-Itinerary.pdf`;
}

/** Absolute http(s) URL, or '' when the trek has no usable PDF. */
export function resolveItineraryPdfUrl(
  raw: string | null | undefined,
  baseUrl: string = API_BASE_URL,
): string {
  const value = (raw ?? '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  // Reject protocol-relative and non-http schemes (javascript:, data:, mailto:).
  if (value.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(value)) return '';

  const path = value.startsWith('/') ? value : `/${value}`;
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function clickDownload(href: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Open a blank tab during the submit click, before any await.
 * Popup blockers allow window.open on that turn and reject it after the lead
 * request resolves. Callers must close the tab when the lead is not saved
 * or the trek has no PDF.
 */
export function reserveDownloadTab(): Window | null {
  if (typeof window === 'undefined' || typeof window.open !== 'function') return null;
  try {
    const opened = window.open('about:blank', '_blank');
    return opened || null;
  } catch {
    return null;
  }
}

export function releaseDownloadTab(tab: Window | null | undefined): void {
  if (!tab) return;
  try {
    tab.opener = null;
  } catch {
    // The tab may already be cross-origin.
  }
  try {
    tab.close();
  } catch {
    // The tab may already be gone.
  }
}

function navigateReserved(tab: Window | null | undefined, url: string): boolean {
  if (!tab) return false;
  try {
    if (tab.closed) return false;
    tab.location.href = url;
    try {
      tab.opener = null;
    } catch {
      // Navigation can make the document cross-origin immediately.
    }
    return true;
  } catch {
    return false;
  }
}

/** Last-resort open after the user gesture has ended. Often blocked. */
function openPdfTab(url: string): boolean {
  if (typeof window === 'undefined' || typeof window.open !== 'function') return false;
  let opened: Window | null = null;
  try {
    opened = window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    return false;
  }
  if (!opened) return false;
  try {
    opened.opener = null;
  } catch {
    // The new document may already be cross-origin.
  }
  return true;
}

function looksLikePdf(blob: Blob, contentType: string | null): boolean {
  const type = `${blob.type || ''} ${contentType || ''}`.toLowerCase();
  if (!type.trim()) return true;
  return type.includes('pdf') || type.includes('octet-stream') || type.includes('application/binary');
}

/**
 * Fetch a cross-origin itinerary PDF and save it with `filename`.
 * The HTML `download` attribute is ignored for cross-origin URLs, so the file
 * is read as a blob and saved from an object URL. When the blob host has no
 * CORS rule, fall back to opening the PDF URL in a new tab.
 */
export async function downloadItineraryPdf(
  rawUrl: string,
  filename: string,
  reserved?: Window | null,
): Promise<ItineraryDownloadMethod> {
  const url = resolveItineraryPdfUrl(rawUrl);
  if (!url || typeof document === 'undefined') {
    releaseDownloadTab(reserved);
    return 'blocked';
  }

  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) throw new Error(`PDF request failed (${response.status})`);
    const blob = await response.blob();
    if (!blob.size || !looksLikePdf(blob, response.headers.get('content-type'))) {
      throw new Error('Response was not a PDF');
    }
    const objectUrl = URL.createObjectURL(blob);
    try {
      clickDownload(objectUrl, filename);
    } finally {
      // Leave the object URL alive long enough for the browser to start the save.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }
    releaseDownloadTab(reserved);
    return 'blob';
  } catch {
    if (navigateReserved(reserved, url)) return 'tab';
    return openPdfTab(url) ? 'tab' : 'blocked';
  }
}

function trackDownload(
  method: ItineraryDownloadMethod,
  trekSlug: string,
  source: string | undefined,
  retry: boolean,
): void {
  if (method !== 'blob' && method !== 'tab') return;
  track('itinerary_download', {
    trek: trekSlug,
    ...(source ? { source } : {}),
    method,
    ...(retry ? { retry: true } : {}),
  });
}

/**
 * Download after a successful lead save. Empty URLs are a no-op so the
 * success message stays unchanged when a trek has no PDF.
 */
export async function deliverItineraryPdf(options: {
  url?: string | null;
  name: string;
  kind?: ItineraryKind;
  trekSlug: string;
  source?: string;
  /** Blank tab opened synchronously in the submit click. Closed when unused. */
  reserved?: Window | null;
}): Promise<ItineraryDelivery> {
  const filename = itineraryPdfFilename(options.name, options.kind ?? 'trek');
  const url = resolveItineraryPdfUrl(options.url);
  if (!url) {
    releaseDownloadTab(options.reserved);
    return { url: '', filename, method: 'skipped' };
  }

  const method = await downloadItineraryPdf(url, filename, options.reserved);
  trackDownload(method, options.trekSlug, options.source, false);
  return { url, filename, method };
}

/**
 * Retry from a click. Opens the fallback tab synchronously so a popup blocker
 * cannot drop it while the blob fetch is in flight.
 */
export function retryItineraryDownload(delivery: ItineraryDelivery, trekSlug: string, source?: string): void {
  if (!delivery.url || delivery.method === 'skipped') return;
  const reserved = reserveDownloadTab();
  void downloadItineraryPdf(delivery.url, delivery.filename, reserved).then((method) => {
    trackDownload(method, trekSlug, source, true);
  });
}
