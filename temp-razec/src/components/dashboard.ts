import type { Nota, Projeto } from '../types';
import { TIPO_ICON, COR_PROJETO_MAP } from '../types';
import { listarProjetos } from '../services/projects';
import { listarNotas } from '../services/notes';
import { t } from '../i18n/index';

export function renderDashboard(container: HTMLElement, onOpenNota: (id: string) => void, onFiltrarProjeto: (id: string) => void): void {
  const projetos = listarProjetos();
  const notas = listarNotas();
  const scripts = notas.filter(n => n.tipo === 'script');
  const conversas = notas.filter(n => n.tipo === 'conversa');

  const recentes = [...notas].sort((a, b) => new Date(b.atualizado).getTime() - new Date(a.atualizado).getTime()).slice(0, 6);

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">${t('stats.notes')}</div><div class="stat-val">${notas.length}</div><div class="stat-sub">total criadas</div></div>
      <div class="stat-card"><div class="stat-label">${t('stats.projects')}</div><div class="stat-val">${projetos.length}</div><div class="stat-sub">ativos</div></div>
      <div class="stat-card"><div class="stat-label">${t('stats.scripts')}</div><div class="stat-val">${scripts.length}</div><div class="stat-sub">arquivos de código</div></div>
      <div class="stat-card"><div class="stat-label">${t('stats.conversas')}</div><div class="stat-val">${conversas.length}</div><div class="stat-sub">salvas</div></div>
    </div>

    <div class="section-title">${t('section.projects')}</div>
    <div class="projects-grid" id="projectsGrid">${renderProjetos(projetos, notas, onFiltrarProjeto)}</div>

    <div class="section-title">${t('section.recent')}</div>
    <div class="recent-list">${renderRecentes(recentes, projetos, onOpenNota)}</div>
  `;
}

function renderProjetos(projetos: Projeto[], notas: Nota[], onFiltrarProjeto: (id: string) => void): string {
  const tagClassMap: Record<string, string> = { blue: '', green: 'green', purple: 'purple', orange: 'orange' };
  return projetos.map(p => {
    const pNotas = notas.filter(n => n.projeto === p.id);
    const tagClass = tagClassMap[p.cor] || '';
    return `
      <div class="proj-card" data-projeto-id="${p.id}">
        <div class="proj-header">
          <div class="proj-icon" style="background:rgba(88,166,255,.1)">${p.icon}</div>
          <div>
            <div class="proj-name">${p.nome}</div>
            <div style="font-size:11px;color:var(--muted)">${pNotas.length} itens</div>
          </div>
        </div>
        <div class="proj-desc">${p.desc}</div>
        <div class="proj-tags">
          <span class="tag ${tagClass}">${p.cor}</span>
          ${pNotas.slice(0, 2).map(n => `<span class="tag">${n.tipo}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentes(recentes: Nota[], projetos: Projeto[], onOpenNota: (id: string) => void): string {
  return recentes.map(n => {
    const proj = projetos.find(p => p.id === n.projeto);
    const days = formatRelativo(n.atualizado);
    return `
      <div class="recent-item" data-nota-id="${n.id}">
        <div class="ri-icon">${TIPO_ICON[n.tipo] || '📝'}</div>
        <div class="ri-body">
          <div class="ri-title">${n.titulo}</div>
          <div class="ri-meta">${proj?.icon || ''} ${proj?.nome || 'Sem projeto'} · ${(n.tags || []).join(', ')}</div>
        </div>
        <div class="ri-date">${days}</div>
      </div>
    `;
  }).join('');
}

function formatRelativo(iso: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'agora';
  if (diff < 3600000) return Math.round(diff / 60000) + 'min';
  if (diff < 86400000) return Math.round(diff / 3600000) + 'h';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function setupDashboardEvents(container: HTMLElement, onOpenNota: (id: string) => void, onFiltrarProjeto: (id: string) => void): void {
  container.querySelectorAll('.proj-card').forEach(el => {
    el.addEventListener('click', () => onFiltrarProjeto((el as HTMLElement).dataset.projetoId!));
  });
  container.querySelectorAll('.recent-item').forEach(el => {
    el.addEventListener('click', () => onOpenNota((el as HTMLElement).dataset.notaId!));
  });
}
