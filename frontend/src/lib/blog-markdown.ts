import { toString } from 'hast-util-to-string';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import {
  isMarkdownContent,
  normalizeMarkdownTables,
  renderContent,
  renderHtmlContent,
  type ContentHeading,
  type RenderedBlogContent,
} from './markdown';

interface HastElement {
  type: 'element';
  tagName: string;
  properties: Record<string, unknown>;
  children: HastContent[];
}

interface HastText {
  type: 'text';
  value: string;
}

type HastContent = HastElement | HastText | { type: string; value?: string; children?: HastContent[] };

interface HastParent {
  children: HastContent[];
}

const MOVIE_HEADING = /^\d+\.\s+\S/;
const FAQ_HEADING = /frequently asked|\bfaq\b/i;
const FAQ_QUESTION = /^q\d+\b/i;
const CTA_HEADING = /credits are rolling|time to book|book the real/i;
const LEAD_HEADING = /quick answer/i;
const AUTHOR_HEADING = /about the author/i;

function isElement(node: HastContent | undefined): node is HastElement {
  return !!node && node.type === 'element';
}

function classList(node: HastElement): string[] {
  const current = node.properties.className;
  if (Array.isArray(current)) return current.map(String);
  if (typeof current === 'string' && current) return current.split(/\s+/);
  return [];
}

function hasClass(node: HastElement, name: string): boolean {
  return classList(node).includes(name);
}

function addClass(node: HastElement, ...names: string[]): void {
  const list = classList(node);
  for (const name of names) {
    if (!list.includes(name)) list.push(name);
  }
  node.properties.className = list;
}

function textOf(node: HastContent): string {
  return toString(node as never).replace(/\s+/g, ' ').trim();
}

function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return slug || 'section';
}

function element(tagName: string, properties: Record<string, unknown>, children: HastContent[]): HastElement {
  return { type: 'element', tagName, properties, children };
}

function isFilenameAlt(alt: string): boolean {
  return /chatgpt image/i.test(alt) || /\.(png|jpe?g|webp|gif|svg)$/i.test(alt.trim());
}

function isInfographicAlt(alt: string): boolean {
  return /infographic|chart|graph|diagram|pipeline|growth|how travelers choose/i.test(alt);
}

function meaningfulChildren(node: HastElement): HastContent[] {
  return node.children.filter((child) => {
    if (child.type !== 'text') return true;
    return typeof child.value === 'string' && child.value.trim() !== '';
  });
}

function onlyChild(node: HastElement, tagName: string): HastElement | null {
  const children = meaningfulChildren(node);
  if (children.length !== 1 || !isElement(children[0]) || children[0].tagName !== tagName) return null;
  return children[0];
}

function enhanceImages(parent: HastParent, state: { leadUsed: boolean }): void {
  const next: HastContent[] = [];

  for (const child of parent.children) {
    if (!isElement(child)) {
      next.push(child);
      continue;
    }

    if (child.tagName === 'img') {
      next.push(figureFromImage(child, state));
      continue;
    }

    enhanceImages(child, state);
    const figure = onlyChild(child, 'figure');
    if (figure && (child.tagName === 'p' || /^h[1-6]$/.test(child.tagName))) {
      next.push(figure);
      continue;
    }
    next.push(child);
  }

  parent.children = next;
}

function figureFromImage(img: HastElement, state: { leadUsed: boolean }): HastElement {
  const alt = String(img.properties.alt ?? '');
  const variant = isInfographicAlt(alt) ? 'infographic' : !state.leadUsed ? 'lead' : 'editorial';
  if (variant === 'lead') state.leadUsed = true;

  img.properties.loading = 'lazy';
  img.properties.decoding = 'async';
  img.properties.sizes = '(min-width: 1100px) 800px, 100vw';
  addClass(img, 'article-img', `article-img--${variant}`);

  const children: HastContent[] = [img];
  if (alt.trim() && !isFilenameAlt(alt)) {
    children.push(
      element('figcaption', { className: ['article-caption'], ariaHidden: 'true' }, [
        { type: 'text', value: alt },
      ])
    );
  }

  return element('figure', { className: ['article-figure', `article-figure--${variant}`] }, children);
}

function headerLabels(table: HastElement): string[] {
  const thead = table.children.find((child) => isElement(child) && child.tagName === 'thead');
  if (!thead || !isElement(thead)) return [];
  const row = thead.children.find((child) => isElement(child) && child.tagName === 'tr');
  if (!row || !isElement(row)) return [];
  return row.children.filter(isElement).map((cell) => textOf(cell));
}

function enhanceTables(parent: HastParent): void {
  parent.children = parent.children.map((child) => {
    if (!isElement(child)) return child;
    if (child.tagName === 'table') return wrapTable(child);
    enhanceTables(child);
    return child;
  });
}

function wrapTable(table: HastElement): HastElement {
  const headers = headerLabels(table);
  const keyValue = headers.length > 0 && headers.length <= 2;
  addClass(table, 'article-table__table');

  if (!keyValue) {
    const tbody = table.children.find((child) => isElement(child) && child.tagName === 'tbody');
    if (tbody && isElement(tbody)) {
      for (const row of tbody.children) {
        if (!isElement(row) || row.tagName !== 'tr') continue;
        let index = 0;
        for (const cell of row.children) {
          if (!isElement(cell) || (cell.tagName !== 'td' && cell.tagName !== 'th')) continue;
          const label = headers[index] ?? '';
          index += 1;
          cell.children = [
            element('span', { className: ['cell-label'] }, [{ type: 'text', value: label }]),
            element('span', { className: ['cell-value'] }, cell.children),
          ];
        }
      }
    }
  }

  return element(
    'div',
    { className: ['article-table', keyValue ? 'article-table--kv' : 'article-table--data'] },
    [table]
  );
}

function enhanceQuotes(parent: HastParent): void {
  for (const child of parent.children) {
    if (!isElement(child)) continue;
    if (child.tagName === 'blockquote') {
      addClass(child, 'article-callout');
      if (/whatsapp|call|book|guide|☎|🔥/i.test(textOf(child))) {
        addClass(child, 'article-callout--cta');
      }
    }
    enhanceQuotes(child);
  }
}

function isMovieHeading(node: HastContent): node is HastElement {
  return isElement(node) && node.tagName === 'h3' && MOVIE_HEADING.test(textOf(node));
}

function hasFollowingTable(nodes: HastContent[], start: number): boolean {
  for (let index = start + 1; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!isElement(node)) continue;
    if (node.tagName === 'h2' || node.tagName === 'h3') return false;
    if (hasClass(node, 'article-table') || node.tagName === 'table') return true;
  }
  return false;
}

function markTrekCta(nodes: HastContent[]): void {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node.tagName === 'p' && /trek it after watching/i.test(textOf(node))) {
      addClass(node, 'trek-cta-line');
      markTrekLinks(node);
    }
    if (node.tagName === 'p' && /^\s*step\s+\d+/i.test(textOf(node))) {
      addClass(node, 'article-step');
    }
  }
}

function markTrekLinks(node: HastElement): void {
  for (const child of node.children) {
    if (!isElement(child)) continue;
    if (child.tagName === 'a') {
      const href = String(child.properties.href ?? '');
      if (href.startsWith('/') || href.includes('/treks') || href.includes('/about')) {
        addClass(child, 'trek-cta');
      }
    }
    markTrekLinks(child);
  }
}

function transformFlow(nodes: HastContent[]): HastContent[] {
  const output: HastContent[] = [];
  let index = 0;

  while (index < nodes.length) {
    const node = nodes[index];
    if (isMovieHeading(node) && hasFollowingTable(nodes, index)) {
      const body: HastContent[] = [];
      index += 1;
      while (index < nodes.length) {
        const next = nodes[index];
        if (isElement(next) && (next.tagName === 'h2' || next.tagName === 'h3' || next.tagName === 'hr')) {
          break;
        }
        body.push(next);
        index += 1;
      }
      markTrekCta(body);
      addClass(node, 'movie-card__title');
      output.push(element('section', { className: ['movie-card'] }, [node, element('div', { className: ['movie-card__body'] }, body)]));
      continue;
    }

    if (isElement(node) && node.tagName === 'h3' && MOVIE_HEADING.test(textOf(node)) && !hasClass(node, 'movie-card__title')) {
      addClass(node, 'article-point');
    }
    if (isElement(node) && node.tagName === 'p' && /^\s*step\s+\d+/i.test(textOf(node))) {
      addClass(node, 'article-step');
    }
    output.push(node);
    index += 1;
  }

  return output;
}

function wrapFaq(nodes: HastContent[]): HastContent[] {
  const items: HastElement[] = [];
  const before: HastContent[] = [];
  let index = 0;
  let opened = false;

  while (index < nodes.length) {
    const node = nodes[index];
    if (isElement(node) && node.tagName === 'h3' && FAQ_QUESTION.test(textOf(node))) {
      const answer: HastContent[] = [];
      index += 1;
      while (index < nodes.length) {
        const next = nodes[index];
        if (isElement(next) && next.tagName === 'h3') break;
        if (!(isElement(next) && next.tagName === 'hr')) answer.push(next);
        index += 1;
      }
      const properties: Record<string, unknown> = { className: ['faq-item'], name: 'article-faq' };
      if (!opened) {
        properties.open = true;
        opened = true;
      }
      items.push(
        element('details', properties, [
          element('summary', { className: ['faq-item__summary'] }, node.children),
          element('div', { className: ['faq-item__answer'] }, answer),
        ])
      );
      continue;
    }
    if (!(isElement(node) && node.tagName === 'hr')) before.push(node);
    index += 1;
  }

  if (!items.length) return nodes;
  return [...before, element('div', { className: ['faq-list'] }, items)];
}

function groupSections(nodes: HastContent[], headings: ContentHeading[]): HastContent[] {
  const output: HastContent[] = [];
  const used = new Set<string>();
  let index = 0;
  const intro: HastContent[] = [];

  while (index < nodes.length) {
    const node = nodes[index];
    if (isElement(node) && node.tagName === 'h2') break;
    intro.push(node);
    index += 1;
  }
  if (intro.length) {
    output.push(element('div', { className: ['article-intro'] }, transformFlow(intro)));
  }

  while (index < nodes.length) {
    const heading = nodes[index];
    if (!isElement(heading) || heading.tagName !== 'h2') {
      output.push(nodes[index]);
      index += 1;
      continue;
    }

    const body: HastContent[] = [];
    index += 1;
    while (index < nodes.length) {
      const next = nodes[index];
      if (isElement(next) && next.tagName === 'h2') break;
      body.push(next);
      index += 1;
    }

    const label = textOf(heading);
    let id = slugify(label);
    let suffix = 2;
    while (used.has(id)) {
      id = `${slugify(label)}-${suffix}`;
      suffix += 1;
    }
    used.add(id);
    heading.properties.id = `${id}-title`;
    headings.push({ id, label });

    let flow = body;
    const classes = ['article-section'];
    if (FAQ_HEADING.test(label)) {
      classes.push('article-section--faq');
      flow = wrapFaq(body);
    } else if (CTA_HEADING.test(label)) {
      classes.push('article-section--cta');
      flow = transformFlow(body);
    } else if (LEAD_HEADING.test(label)) {
      classes.push('article-section--lead');
      flow = transformFlow(body);
    } else if (AUTHOR_HEADING.test(label)) {
      classes.push('article-section--author');
      flow = transformFlow(body);
    } else {
      flow = transformFlow(body);
    }

    if (flow.some((node) => isElement(node) && hasClass(node, 'movie-card'))) {
      classes.push('article-section--films');
    }

    output.push(
      element('section', { id, className: classes, ariaLabelledby: `${id}-title` }, [heading, ...flow])
    );
  }

  return output;
}

function styleLinks(parent: HastParent): void {
  for (const child of parent.children) {
    if (!isElement(child)) continue;
    if (child.tagName === 'a' && !hasClass(child, 'trek-cta')) {
      const href = String(child.properties.href ?? '');
      if (href.startsWith('tel:')) addClass(child, 'cta-button', 'cta-button--call');
      else if (/wa\.me|whatsapp/i.test(href)) addClass(child, 'cta-button', 'cta-button--whatsapp');
      else addClass(child, 'article-link');
    }
    styleLinks(child);
    if (child.tagName === 'p' && containsClass(child, 'cta-button')) {
      addClass(child, 'cta-actions');
      stripLooseMarkers(child);
    }
  }
}

function stripLooseMarkers(node: HastElement): void {
  for (const child of node.children) {
    if (child.type === 'text' && typeof child.value === 'string') {
      child.value = child.value.replace(/\*/g, '');
    } else if (isElement(child) && child.tagName !== 'a') {
      stripLooseMarkers(child);
    }
  }
}

function containsClass(node: HastElement, name: string): boolean {
  if (hasClass(node, name)) return true;
  return node.children.some((child) => isElement(child) && containsClass(child, name));
}

function enhanceBlogTree(tree: HastParent, headings: ContentHeading[]): void {
  const state = { leadUsed: false };
  enhanceImages(tree, state);
  enhanceTables(tree);
  enhanceQuotes(tree);
  tree.children = groupSections(tree.children, headings);
  styleLinks(tree);
}

function renderBlogMarkdown(content: string): RenderedBlogContent {
  const headings: ContentHeading[] = [];
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(() => (tree: unknown) => {
      enhanceBlogTree(tree as HastParent, headings);
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(normalizeMarkdownTables(content));

  return { html: String(file), headings };
}

export function renderBlogContent(
  content: string | undefined | null,
  contentType?: 'html' | 'markdown'
): RenderedBlogContent {
  if (!content) return { html: '', headings: [] };
  if (!isMarkdownContent(content, contentType)) return renderHtmlContent(content);

  try {
    return renderBlogMarkdown(content);
  } catch (error) {
    console.error('Blog markdown render failed', error);
    return renderContent(content, 'markdown');
  }
}
