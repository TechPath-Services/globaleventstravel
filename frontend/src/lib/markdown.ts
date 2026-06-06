import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

export interface ContentHeading {
  id: string;
  label: string;
}

export interface RenderedBlogContent {
  html: string;
  headings: ContentHeading[];
}

function getInlineText(token: Token | undefined): string {
  if (!token) return '';

  if (!token.children) {
    return token.content;
  }

  return token.children
    .filter((child) => ['text', 'code_inline', 'image'].includes(child.type))
    .map((child) => child.content)
    .join('')
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );
}

function renderMarkdown(content: string): RenderedBlogContent {
  const headings: ContentHeading[] = [];
  const markdown = new MarkdownIt({
    breaks: true,
    html: true,
    linkify: true,
    typographer: true,
  });

  markdown.renderer.rules.heading_open = (tokens, index, options, _env, renderer) => {
    const token = tokens[index];

    if (token.tag === 'h2') {
      const id = `section-${headings.length}`;
      token.attrSet('id', id);
      headings.push({
        id,
        label: getInlineText(tokens[index + 1]),
      });
    }

    return renderer.renderToken(tokens, index, options);
  };

  return {
    html: markdown.render(content),
    headings,
  };
}

function renderHtml(content: string): RenderedBlogContent {
  const headings: ContentHeading[] = [];
  const html = content.replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (_match, attributes = '', innerHtml: string) => {
      const id = `section-${headings.length}`;
      const label = decodeHtmlEntities(innerHtml.replace(/<[^>]*>/g, '').trim());
      const attributesWithoutId = attributes.replace(/\s+id=(?:"[^"]*"|'[^']*')/i, '');

      headings.push({ id, label });
      return `<h2${attributesWithoutId} id="${id}">${innerHtml}</h2>`;
    }
  );

  return { html, headings };
}

export function renderContent(
  content: string | undefined | null,
  contentType?: 'html' | 'markdown'
): RenderedBlogContent {
  if (!content) return { html: '', headings: [] };

  // If explicitly HTML, or if it contains block-level HTML tags, treat as HTML.
  // Otherwise, default to Markdown to properly handle raw text, newlines, and markdown syntax.
  const hasHtmlBlocks = /<(?:p|h[1-6]|div|ul|ol|table|blockquote|pre)\b/i.test(content);
  const shouldRenderMarkdown = contentType === 'markdown' || (contentType !== 'html' && !hasHtmlBlocks);

  return shouldRenderMarkdown ? renderMarkdown(content) : renderHtml(content);
}
