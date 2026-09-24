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
    /^(?: {0,3}#{1,6}\s| {0,3}(?:[-+*]|\d+\.)\s| {0,3}>\s| {0,3}```|\|)/m.test(content);

  return !hasHtmlBlocks && hasMarkdownBlocks;
}

function fixMarkdownTables(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inTable = false;
  let tableHeaderProcessed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableRow = line.startsWith('|') && line.endsWith('|');

    if (isTableRow) {
      if (!inTable) {
        inTable = true;
        tableHeaderProcessed = false;
        result.push(lines[i]); 
      } else {
        if (!tableHeaderProcessed) {
          const isDelimiter = /^\|\s*[-:]+\s*(?:\|\s*[-:]+\s*)*\|$/.test(line);
          if (!isDelimiter) {
            const prevCols = result[result.length - 1].split('|').length - 2;
            const delimiter = '|' + Array(Math.max(1, prevCols)).fill('---').join('|') + '|';
            result.push(delimiter);
          } else {
            tableHeaderProcessed = true;
            result.push(lines[i]);
            continue;
          }
          tableHeaderProcessed = true;
        }
        result.push(lines[i]);
      }
    } else {
      if (inTable && line === '') {
        continue;
      }
      inTable = false;
      result.push(lines[i]);
    }
  }

  return result.join('\n');
}

export function renderMarkdown(content: string): string {
  const processedContent = fixMarkdownTables(content);
  return markdown.render(processedContent);
}
