import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(md: string): string {
  let html = md;

  // [[wikilinks]] -> links internos
  html = html.replace(/\[\[(.+?)\]\]/g, '<a href="#" class="wikilink" data-nota="$1">$1</a>');

  // task lists
  html = html.replace(/\[x\]/gi, '✅').replace(/\[ \]/g, '⬜');

  // Use synchronous marked parser
  const result = marked.parse(html, { async: false });
  return typeof result === 'string' ? result : '';
}
