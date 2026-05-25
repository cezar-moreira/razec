import { TIPO_ICON, FONTE_ICON } from '../types';
import { listarProjetos } from '../services/projects';
import { filtrarPorTipo } from '../services/search';
import { t } from '../i18n/index';

let currentFilter = 'todos';

export function renderFiles(container: HTMLElement, onOpenNota: (id: string) => void): void {
  const projetos = listarProjetos();
  const items = filtrarPorTipo(currentFilter);

  const filterTabs = [
    { id: 'todos', label: t('filter.all') },
    { id: 'python', label: '🐍 ' + t('filter.python') },
    { id: 'html', label: '🌐 ' + t('filter.html') },
    { id: 'js', label: '⚡ ' + t('filter.js') },
    { id: 'sql', label: '🗄️ ' + t('filter.sql') },
    { id: 'conversa', label: '💬 ' + t('filter.conversas') },
    { id: 'ia_claude', label: '🟠 Claude' },
    { id: 'ia_chatgpt', label: '🟢 ChatGPT' },
    { id: 'ia_gemini', label: '🔵 Gemini' },
    { id: 'ia_grok', label: '⚫ Grok' },
  ];

  container.innerHTML = `
    <div class="files-header">
      <h2 style="font-size:1.1rem;flex:1">📁 ${t('nav.files')}</h2>
      <button class="btn" data-action="upload">${t('btn.upload')}</button>
      <button class="btn btn-primary" data-action="new-script">${t('btn.new_script')}</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap" id="filterTabs">
      ${filterTabs.map(ft => `
        <button class="btn ${currentFilter === ft.id ? 'active' : ''}" data-filter="${ft.id}">${ft.label}</button>
      `).join('')}
    </div>
    <div class="files-grid" id="filesGrid">
      ${items.length === 0
        ? '<div style="color:var(--muted);font-size:13px;grid-column:1/-1">' + t('files.none') + '</div>'
        : items.map(n => {
            const proj = projetos.find(p => p.id === n.projeto);
            const fi = FONTE_ICON[n.fonteIA] || '';
            return `
              <div class="file-card" data-nota-id="${n.id}">
                <div class="file-icon">${TIPO_ICON[n.tipo] || '📄'} ${fi}</div>
                <div class="file-name">${n.titulo}</div>
                <div class="file-meta">${proj?.nome || 'Sem projeto'}</div>
                ${n.fonteIA && n.fonteIA !== 'nenhuma' ? `<div class="file-meta" style="color:var(--primary)">${fi} ${n.fonteIA}</div>` : ''}
                <div class="file-meta">${formatDate(n.atualizado)}</div>
              </div>
            `;
          }).join('')}
    </div>
  `;

  setupFilesEvents(onOpenNota);
}

function setupFilesEvents(onOpenNota: (id: string) => void): void {
  document.querySelectorAll('#filterTabs .btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = (btn as HTMLElement).dataset.filter!;
      document.querySelectorAll('#filterTabs .btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFiles(document.getElementById('view-files')!, onOpenNota);
    });
  });
  document.querySelectorAll('#filesGrid .file-card').forEach(el => {
    el.addEventListener('click', () => onOpenNota((el as HTMLElement).dataset.notaId!));
  });
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'agora';
  if (diff < 3600000) return Math.round(diff / 60000) + 'min';
  if (diff < 86400000) return Math.round(diff / 3600000) + 'h';
  return new Date(iso).toLocaleDateString('pt-BR');
}
