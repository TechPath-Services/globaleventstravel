import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  breaks: true,
  html: true,
  linkify: true,
  typographer: true,
});

export function isLikelyMarkdown(content: string): boolean {
  const hasHtmlBlocks = /<(?:p|h[1-6]|div|ul|ol|table|blockquote|pre)\b/i.test(content);
  const hasMarkdownBlocks =
    /^(?: {0,3}#{1,6}\s| {0,3}(?:[-+*]|\d+\.)\s| {0,3}>\s| {0,3}```)/m.test(content);

  return !hasHtmlBlocks && hasMarkdownBlocks;
}

export function renderMarkdown(content: string): string {
  return markdown.render(content);
}
