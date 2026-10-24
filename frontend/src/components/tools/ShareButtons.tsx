import { useState } from 'react';
import { track } from '@/lib/marketing/analytics';

interface ShareButtonsProps {
  url: string;
  text: string;
  event: string;
  eventProps?: Record<string, string>;
  className?: string;
}

function withRef(url: string, ref: string): string {
  const u = new URL(url);
  u.searchParams.set('ref', ref);
  return u.toString();
}

export default function ShareButtons({ url, text, event, eventProps = {}, className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const share = (channel: string) => track(event, { ...eventProps, channel });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(withRef(url, 'copy'));
      setCopied(true);
      share('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', withRef(url, 'copy'));
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: document.title, text, url: withRef(url, 'native') });
      share('native');
    } catch {
      // user cancelled
    }
  };

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${withRef(url, 'wa')}`)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(withRef(url, 'x'))}`;

  const btn =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors';

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => share('whatsapp')}
        className={`${btn} bg-green-500 text-white hover:bg-green-600 hover:text-white`}
      >
        WhatsApp
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => share('x')}
        className={`${btn} bg-neutral-900 text-white hover:bg-neutral-700 hover:text-white`}
      >
        Post on X
      </a>
      <button type="button" onClick={nativeShare} className={`${btn} border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50`}>
        Share…
      </button>
      <button type="button" onClick={copy} className={`${btn} border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50`}>
        {copied ? 'Link copied ✓' : 'Copy link'}
      </button>
    </div>
  );
}
