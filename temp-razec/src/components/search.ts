import { buscarAvancado, buscarSimples, notasPorProjeto } from '../services/search';
import { listarProjetos } from '../services/projects';
import { t } from '../i18n/index';

export function renderSearch(container: HTMLElement, query: string, onOpenNota: (id: string) => void): void {
  const results = query.length >= 2 ? buscarAvancado(query) : buscarSimples('');

  container.innerHTML = `
    <div style="margin-bottom:1rem">
      <input style="width:100%;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:14px"
        placeholder="${t('search.advanced')}" id="advSearch" value="${escapeHtml(query)}">
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap" id="searchFilters">
        <button class="btn" data-search-hint="projeto:">📁 ${t('search.by_project')}</button>
        <button class="btn" data-search-hint="tag:">🏷️ ${t('search.by_tag')}</button>
        <button class="btn" data-search-hint="tipo:">📄 ${t('search.by_type')}</button>
        <button class="btn" data-search-hint="data:">📅 ${t('search.by_date')}</button>
      </div>
    </div>
    <div class="search-results" id="searchResults">
      ${results.length === 0
        ? `<div style="color:var(--muted);font-size:13px">${t('search.no_results', query)}</div>`
        : results.map(r => {
            const proj = listarProjetos().find(p => p.id === r.nota.projeto);
            return `
              <div class="sr-item" data-nota-id="${r.nota.id}">
                <div class="sr-title">${highlight(r.nota.titulo, query)}</div>
                <div class="sr-excerpt">${highlight(r.nota.conteudo.slice(0, 150).replace(/[#*`]/g, ''), query)}...</div>
                <div class="sr-path">📁 ${proj?.nome || 'sem projeto'} · ${r.nota.tipo} · ${(r.nota.tags || []).join(', ')}</div>
              </div>
            `;
          }).join('')}
    </div>
  `;

  setupSearchEvents(onOpenNota);
}

function setupSearchEvents(onOpenNota: (id: string) => void): void {
  document.getElementById('advSearch')?.addEventListener('input', (e) => {
    const q = (e.target as HTMLInputElement).value;
    const container = document.getElementById('view-search')!;
    renderSearch(container, q, onOpenNota);
  });

  document.querySelectorAll('[data-search-hint]').forEach(btn => {
    btn.addEventListener('click', () => {
      const hint = (btn as HTMLElement).dataset.searchHint!;
      const input = document.getElementById('advSearch') as HTMLInputElement;
      input.value = hint;
      input.focus();
      const container = document.getElementById('view-search')!;
      renderSearch(container, hint, onOpenNota);
    });
  });

  document.querySelectorAll('#searchResults .sr-item').forEach(el => {
    el.addEventListener('click', () => onOpenNota((el as HTMLElement).dataset.notaId!));
  });
}

export function renderSearchByProject(container: HTMLElement, projetoId: string, onOpenNota: (id: string) => void): void {
  const notas = notasPorProjeto(projetoId);
  const proj = listarProjetos().find(p => p.id === projetoId);

  container.innerHTML = `
    <div class="search-results">
      <div style="margin-bottom:12px;font-size:14px;font-weight:600;color:var(--text)">${proj?.icon || '📁'} ${proj?.nome}</div>
      ${notas.map(n => `
        <div class="sr-item" data-nota-id="${n.id}">
          <div class="sr-title">${n.titulo}</div>
          <div class="sr-excerpt">${n.conteudo.slice(0, 120).replace(/[#*`]/g, '')}...</div>
          <div class="sr-path">${n.tipo} · ${(n.tags || []).join(', ')}</div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.sr-item').forEach(el => {
    el.addEventListener('click', () => onOpenNota((el as HTMLElement).dataset.notaId!));
  });
}

function highlight(text: string, query: string): string {
  if (!query || query.length < 2) return escapeHtml(text);
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
  } catch {
    return escapeHtml(text);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
