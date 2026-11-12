import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  deliverItineraryPdf,
  downloadItineraryPdf,
  itineraryPdfFilename,
  resolveItineraryPdfUrl,
} from './itinerary-download';

const PDF_URL = 'https://techpath.blob.core.windows.net/global-events-travels/itineraries/kedar.pdf';

interface ClickRecord {
  href: string;
  download: string;
  target: string;
}

function installBrowser() {
  const clicks: ClickRecord[] = [];
  const opened: string[] = [];
  const gtag = vi.fn();

  vi.stubGlobal('document', {
    createElement: () => {
      const anchor = {
        href: '',
        download: '',
        rel: '',
        target: '',
        style: { display: '' },
        click() {
          clicks.push({ href: anchor.href, download: anchor.download, target: anchor.target });
        },
        remove() {},
      };
      return anchor;
    },
    body: {
      appendChild() {},
    },
  });

  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:itinerary',
    revokeObjectURL: () => {},
  });

  vi.stubGlobal('window', {
    gtag,
    open: (url: string) => {
      opened.push(url);
      return { opener: window };
    },
    setTimeout: (fn: () => void) => {
      fn();
      return 0;
    },
  });

  return { clicks, opened, gtag };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('itineraryPdfFilename', () => {
  it('names a trek without doubling the Trek suffix', () => {
    expect(itineraryPdfFilename('Kedarkantha Trek')).toBe('Kedarkantha-Trek-Itinerary.pdf');
    expect(itineraryPdfFilename('Kuari Pass Trek')).toBe('Kuari-Pass-Trek-Itinerary.pdf');
  });

  it('uses Expedition for expedition pages', () => {
    expect(itineraryPdfFilename('Friendship Peak', 'expedition')).toBe(
      'Friendship-Peak-Expedition-Itinerary.pdf',
    );
    expect(itineraryPdfFilename('Friendship Peak Expedition', 'expedition')).toBe(
      'Friendship-Peak-Expedition-Itinerary.pdf',
    );
  });

  it('falls back when the name is empty', () => {
    expect(itineraryPdfFilename('   ')).toBe('Trek-Itinerary.pdf');
  });
});

describe('resolveItineraryPdfUrl', () => {
  it('keeps absolute blob URLs and resolves relative paths', () => {
    expect(resolveItineraryPdfUrl(PDF_URL)).toBe(PDF_URL);
    expect(resolveItineraryPdfUrl('/uploads/kedar.pdf', 'http://localhost:8000')).toBe(
      'http://localhost:8000/uploads/kedar.pdf',
    );
    expect(resolveItineraryPdfUrl('uploads/kedar.pdf', 'http://localhost:8000/')).toBe(
      'http://localhost:8000/uploads/kedar.pdf',
    );
  });

  it('treats a missing or unsafe URL as no PDF', () => {
    expect(resolveItineraryPdfUrl(null)).toBe('');
    expect(resolveItineraryPdfUrl('  ')).toBe('');
    expect(resolveItineraryPdfUrl('javascript:alert(1)')).toBe('');
  });
});

describe('downloadItineraryPdf', () => {
  it('saves a fetched PDF under the trek filename', async () => {
    const browser = installBrowser();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        headers: { get: () => 'application/pdf' },
        blob: async () => ({ size: 12, type: 'application/pdf' }),
      })),
    );

    await expect(downloadItineraryPdf(PDF_URL, 'Kedarkantha-Trek-Itinerary.pdf')).resolves.toBe('blob');
    expect(browser.clicks).toEqual([
      { href: 'blob:itinerary', download: 'Kedarkantha-Trek-Itinerary.pdf', target: '' },
    ]);
    expect(browser.opened).toEqual([]);
  });

  it('opens a new tab when the blob fetch fails', async () => {
    const browser = installBrowser();
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));

    await expect(downloadItineraryPdf(PDF_URL, 'Kedarkantha-Trek-Itinerary.pdf')).resolves.toBe('tab');
    expect(browser.clicks).toEqual([]);
    expect(browser.opened).toEqual([PDF_URL]);
  });

  it('reports a blocked tab when the browser refuses window.open', async () => {
    installBrowser();
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));
    window.open = () => null;

    await expect(downloadItineraryPdf(PDF_URL, 'Kedarkantha-Trek-Itinerary.pdf')).resolves.toBe('blocked');
  });

  it('closes a reserved tab after the file downloads', async () => {
    installBrowser();
    const reserved = { closed: false, location: { href: 'about:blank' }, close() { this.closed = true; } };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        headers: { get: () => 'application/pdf' },
        blob: async () => ({ size: 8, type: 'application/pdf' }),
      })),
    );

    await expect(
      downloadItineraryPdf(PDF_URL, 'Kedarkantha-Trek-Itinerary.pdf', reserved as unknown as Window),
    ).resolves.toBe('blob');
    expect(reserved.closed).toBe(true);
    expect(reserved.location.href).toBe('about:blank');
  });

  it('sends a reserved tab to the PDF when the fetch fails', async () => {
    installBrowser();
    const reserved = { closed: false, location: { href: 'about:blank' }, close() { this.closed = true; } };
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));

    await expect(
      downloadItineraryPdf(PDF_URL, 'Kedarkantha-Trek-Itinerary.pdf', reserved as unknown as Window),
    ).resolves.toBe('tab');
    expect(reserved.closed).toBe(false);
    expect(reserved.location.href).toBe(PDF_URL);
  });
});

describe('deliverItineraryPdf', () => {
  it('does not fetch or track when the trek has no PDF', async () => {
    const browser = installBrowser();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const delivery = await deliverItineraryPdf({
      url: '',
      name: 'Black Peak',
      kind: 'expedition',
      trekSlug: 'black-peak',
      source: 'expedition_page',
    });

    expect(delivery.method).toBe('skipped');
    expect(delivery.url).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(browser.gtag).not.toHaveBeenCalled();
  });

  it('closes a reserved tab instead of navigating when there is no PDF', async () => {
    installBrowser();
    const reserved = { closed: false, location: { href: 'about:blank' }, close() { this.closed = true; } };

    const delivery = await deliverItineraryPdf({
      url: '   ',
      name: 'Black Peak',
      kind: 'expedition',
      trekSlug: 'black-peak',
      reserved: reserved as unknown as Window,
    });

    expect(delivery.method).toBe('skipped');
    expect(reserved.closed).toBe(true);
    expect(reserved.location.href).toBe('about:blank');
  });

  it('tracks itinerary_download only after a successful fetch', async () => {
    const browser = installBrowser();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        headers: { get: () => 'application/pdf' },
        blob: async () => ({ size: 4, type: 'application/pdf' }),
      })),
    );

    const delivery = await deliverItineraryPdf({
      url: PDF_URL,
      name: 'Kedarkantha Trek',
      trekSlug: 'kedarkantha',
      source: 'trek_page',
    });

    expect(delivery).toMatchObject({
      url: PDF_URL,
      filename: 'Kedarkantha-Trek-Itinerary.pdf',
      method: 'blob',
    });
    expect(browser.gtag).toHaveBeenCalledWith('event', 'itinerary_download', {
      trek: 'kedarkantha',
      source: 'trek_page',
      method: 'blob',
    });
  });

  it('does not track a download when the tab is blocked', async () => {
    const browser = installBrowser();
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));
    window.open = () => null;

    const delivery = await deliverItineraryPdf({
      url: PDF_URL,
      name: 'Kedarkantha Trek',
      trekSlug: 'kedarkantha',
      source: 'trek_page',
    });

    expect(delivery.method).toBe('blocked');
    expect(browser.gtag).not.toHaveBeenCalled();
  });
});
