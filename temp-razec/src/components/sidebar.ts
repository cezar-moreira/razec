import { COR_PROJETO_MAP } from '../types';
import type { ViewName } from '../types';
import { listarProjetos } from '../services/projects';
import { todasTags, storageInfo } from '../services/search';
import { t, getIdioma, setIdioma, proximoIdioma } from '../i18n/index';
import type { Idioma } from '../types';

export interface SidebarCallbacks {
  onViewChange: (view: ViewName) => void;
  onFiltrarProjeto: (id: string) => void;
  onTagClick: (tag: string) => void;
  onNewNote: () => void;
  onNewProject: () => void;
  onSync: () => void;
}

export function renderSidebar(currentView: ViewName): string {
  const projetos = listarProjetos();
  const tags = todasTags();
  const storage = storageInfo();

  const navItems: { view: ViewName; icon: string; label: string }[] = [
    { view: 'dashboard', icon: '🏠', label: t('nav.dashboard') },
    { view: 'editor', icon: '✏️', label: t('nav.editor') },
    { view: 'files', icon: '📁', label: t('nav.files') },
    { view: 'graph', icon: '🕸️', label: t('nav.graph') },
    { view: 'search', icon: '🔍', label: t('nav.search') },
  ];

  return `
    <div class="sidebar">
      <div class="sidebar-section">
        ${navItems.map(item => `
          <div class="nav-item ${currentView === item.view ? 'active' : ''}" data-view="${item.view}">
            <span class="icon">${item.icon}</span> ${item.label}
          </div>
        `).join('')}
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">${t('section.projects')}</div>
        <div id="sidebarProjects">
          ${projetos.map(p => `
            <div class="project-item" data-projeto-id="${p.id}">
              <div class="dot" style="background:${COR_PROJETO_MAP[p.cor] || '#58a6ff'}"></div>
              ${p.icon} ${p.nome.split('—')[0].trim()}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">${t('section.tags')}</div>
        <div id="sidebarTags" style="padding:4px 12px;display:flex;flex-wrap:wrap;gap:4px">
          ${tags.map(tag => `<span class="tag" style="cursor:pointer" data-tag="${tag}">${tag}</span>`).join('')}
        </div>
      </div>
      <div style="margin-top:auto;padding:12px;border-top:1px solid var(--border)">
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t('storage.label')}</div>
        <div style="height:4px;background:var(--border);border-radius:2px">
          <div id="storageBar" style="height:100%;background:var(--primary);border-radius:2px;width:${storage.pct}%"></div>
        </div>
        <div id="storageTxt" style="font-size:10px;color:var(--muted);margin-top:4px">${storage.usedKB}KB / 5MB (${storage.pct}%)</div>
      </div>
    </div>
  `;
}

export function setupSidebarEvents(callbacks: SidebarCallbacks): void {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => callbacks.onViewChange((el as HTMLElement).dataset.view as ViewName));
  });
  document.querySelectorAll('.project-item').forEach(el => {
    el.addEventListener('click', () => callbacks.onFiltrarProjeto((el as HTMLElement).dataset.projetoId!));
  });
  document.querySelectorAll('#sidebarTags .tag').forEach(el => {
    el.addEventListener('click', () => callbacks.onTagClick((el as HTMLElement).dataset.tag!));
  });
}
