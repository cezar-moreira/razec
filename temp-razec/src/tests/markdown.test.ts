import { describe, it, expect } from 'vitest';

describe('Markdown Renderer', () => {
  it('should render basic markdown', async () => {
    const { renderMarkdown } = await import('../markdown');
    const html = renderMarkdown('# Hello\n\nThis is **bold**');
    expect(html).toContain('<h1');
    expect(html).toContain('Hello');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('should render code blocks', async () => {
    const { renderMarkdown } = await import('../markdown');
    const html = renderMarkdown('```python\nprint("hello")\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('print');
  });

  it('should convert [[wikilinks]] to anchor tags', async () => {
    const { renderMarkdown } = await import('../markdown');
    const html = renderMarkdown('See [[Nota Importante]] for details');
    expect(html).toContain('class="wikilink"');
    expect(html).toContain('data-nota="Nota Importante"');
  });

  it('should convert task lists', async () => {
    const { renderMarkdown } = await import('../markdown');
    const html = renderMarkdown('- [x] Done\n- [ ] Todo');
    expect(html).toContain('✅');
    expect(html).toContain('⬜');
  });

  it('should render tables', async () => {
    const { renderMarkdown } = await import('../markdown');
    const html = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |');
    expect(html).toContain('<table');
    expect(html).toContain('<th');
    expect(html).toContain('<td');
  });
});
