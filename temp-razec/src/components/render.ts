import { StorageAdapter } from '../storage';
import { listarNotas } from '../services/notes';
import { listarProjetos, criarProjeto } from '../services/projects';
import { filtrarPorTipo, todasTags, storageInfo, notasPorProjeto } from '../services/search';
import { COR_PROJETO_MAP, TIPO_ICON, FONTE_ICON, type Projeto, type Nota, type CorProjeto, type ViewName } from '../types';
import { renderGraph } from './graph';
import { buscarAvancado } from '../services/search';
import { abrirNota } from './editor';

export function render(): void {
  const notas = listarNotas();
  const projetos = listarProjetos();
  const scripts = notas.filter(n => n.tipo === 'script');
  const conversas = notas.filter(n => n.tipo === 'conversa');

  setText('statNotas', notas.length);
  setText('statProjetos', projetos.length);
  setText('statScripts', scripts.length);
  setText('statConversas', conversas.length);
  setText('badgeNotas', notas.length);

  renderStorage();
  renderSidebarProjetos(projetos);
  renderSidebarTags();
  renderProjectsGrid(projetos, notas);
  renderRecentList(notas, projetos);
  renderFiles(StorageAdapter.getRaw<string>('_fileFilter', 'todos'));
  renderModalSelects(projetos);
}

function setText(id: string, v: string | number): void {
  const el = document.getElementById(id);
  if (el) el.textContent = String(v);
}

function renderStorage(): void {
  const info = storageInfo();
  const bar = document.getElementById('storageBar');
  const txt = document.getElementById('storageTxt');
  if (bar) bar.style.width = info.pct + '%';
  if (txt) txt.textContent = `${info.usedKB}KB / 5MB (${info.pct}%)`;
}

function renderSidebarProjetos(projetos: Projeto[]): void {
  const el = document.getElementById('sidebarProjects');
  if (!el) return;
  el.innerHTML = projetos.map(p => `
    <div class="project-item" data-projeto="${p.id}">
      <div class="dot" style="background:${COR_PROJETO_MAP[p.cor] || '#58a6ff'}"></div>
      ${p.icon} ${p.nome.split('—')[0].trim()}
    </div>
  `).join('');

  el.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = (item as HTMLElement).dataset.projeto!;
      filtrarPorProjeto(id);
    });
  });
}

function renderSidebarTags(): void {
  const el = document.getElementById('sidebarTags');
  if (!el) return;
  const tags = todasTags();
  el.innerHTML = tags.map(t =>
    `<span class="tag" style="cursor:pointer">${t}</span>`
  ).join('');

  el.querySelectorAll('.tag').forEach(tagEl => {
    tagEl.addEventListener('click', () => {
      const tag = tagEl.textContent || '';
      const searchInput = document.getElementById('advSearch') as HTMLInputElement;
      if (searchInput) { searchInput.value = tag; buscarAvancado(tag); }
      showView('search');
    });
  });
}

function renderProjectsGrid(projetos: Projeto[], notas: Nota[]): void {
  const el = document.getElementById('projectsGrid');
  if (!el) return;
  const tagClassMap: Record<string, string> = { blue: '', green: 'green', purple: 'purple', orange: 'orange' };
  el.innerHTML = projetos.map(p => {
    const pNotas = notas.filter(n => n.projeto === p.id);
    return `
      <div class="proj-card" data-projeto="${p.id}">
        <div class="proj-header">
          <div class="proj-icon" style="background:rgba(88,166,255,.1)">${p.icon}</div>
          <div style="flex:1">
            <div class="proj-name">${p.nome}</div>
            <div style="font-size:11px;color:var(--muted)">${pNotas.length} itens</div>
          </div>
          <button class="btn-delete-proj" data-action="excluir-projeto" data-projeto-id="${p.id}" data-nome="${p.nome}" title="Excluir projeto" style="background:none;border:none;cursor:pointer;color:var(--danger);font-size:13px;padding:2px 6px;border-radius:4px;flex-shrink:0;opacity:0;transition:opacity .15s">🗑 Excluir</button>
        </div>
        <div class="proj-desc">${p.desc}</div>
        <div class="proj-tags">
          <span class="tag ${tagClassMap[p.cor] || ''}">${p.cor}</span>
          ${pNotas.slice(0, 2).map(n => `<span class="tag">${n.tipo}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  el.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const btn = card.querySelector('.btn-delete-proj') as HTMLElement;
      if (btn) btn.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      const btn = card.querySelector('.btn-delete-proj') as HTMLElement;
      if (btn) btn.style.opacity = '0';
    });
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-action]')) return;
      const id = (card as HTMLElement).dataset.projeto!;
      filtrarPorProjeto(id);
    });
  });
}

function renderRecentList(notas: Nota[], projetos: Projeto[]): void {
  const el = document.getElementById('recentList');
  if (!el) return;
  const recentes = [...notas].sort((a, b) => new Date(b.atualizado).getTime() - new Date(a.atualizado).getTime()).slice(0, 6);
  el.innerHTML = recentes.map(n => {
    const proj = projetos.find(p => p.id === n.projeto);
    return `
      <div class="recent-item" data-nota="${n.id}">
        <div class="ri-icon">${TIPO_ICON[n.tipo] || '📝'}</div>
        <div class="ri-body">
          <div class="ri-title">${n.titulo}</div>
          <div class="ri-meta">${proj?.icon || ''} ${proj?.nome || 'Sem projeto'} · ${(n.tags || []).join(', ')}</div>
        </div>
        <div class="ri-date">${formatDate(n.atualizado)}</div>
      </div>
    `;
  }).join('');

  el.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = (item as HTMLElement).dataset.nota!;
      abrirNota(id);
    });
  });
}

export function renderFiles(filtro: string): void {
  StorageAdapter.setRaw('_fileFilter', filtro);
  const notas = filtrarPorTipo(filtro);
  const projetos = listarProjetos();

  const grid = document.getElementById('filesGrid');
  if (!grid) return;
  if (!notas.length) {
    grid.innerHTML = '<div style="color:var(--muted);font-size:13px;grid-column:1/-1">Nenhum arquivo encontrado</div>';
    return;
  }

  grid.innerHTML = notas.map(n => {
    const proj = projetos.find(p => p.id === n.projeto);
    const ext = n.tipo === 'script' ? (n.tags?.find(t => ['py', 'js', 'html', 'sql', 'python'].includes(t)) || 'txt') : 'md';
    const fi = FONTE_ICON[n.fonteIA] || '';
    return `
      <div class="file-card" data-nota="${n.id}" style="position:relative">
        <button data-action="excluir-nota" data-nota-id="${n.id}" data-nome="${n.titulo}" title="Excluir" style="position:absolute;top:6px;right:6px;background:none;border:none;cursor:pointer;color:var(--muted);font-size:13px;padding:2px 5px;border-radius:4px;opacity:0;transition:opacity .15s" class="btn-delete-nota">🗑</button>
        <div class="file-icon">${TIPO_ICON[n.tipo] || '📄'} ${fi}</div>
        <div class="file-name">${n.titulo}</div>
        <div class="file-meta">${proj?.nome || 'Sem projeto'} · .${ext}</div>
        ${n.fonteIA && n.fonteIA !== 'nenhuma' ? `<div class="file-meta" style="color:var(--primary)">${fi} ${n.fonteIA}</div>` : ''}
        <div class="file-meta">${formatDate(n.atualizado)}</div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.file-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const btn = card.querySelector('.btn-delete-nota') as HTMLElement;
      if (btn) btn.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      const btn = card.querySelector('.btn-delete-nota') as HTMLElement;
      if (btn) btn.style.opacity = '0';
    });
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-action]')) return;
      const id = (card as HTMLElement).dataset.nota!;
      abrirNota(id);
    });
  });
}

function renderModalSelects(projetos: Projeto[]): void {
  const opt = '<option value="">Sem projeto</option>' + projetos.map(p => `<option value="${p.id}">${p.icon} ${p.nome}</option>`).join('');
  ['novoProjetoNota', 'uploadProjeto'].forEach(id => {
    const el = document.getElementById(id) as HTMLSelectElement | null;
    if (el) { el.innerHTML = opt; }
  });
}

export function filtrarFiles(filtro: string, btn: HTMLElement): void {
  document.querySelectorAll('#filterTabs .btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFiles(filtro);
}

export function filtrarPorProjeto(projetoId: string): void {
  const notas = notasPorProjeto(projetoId);
  const proj = listarProjetos().find(p => p.id === projetoId);
  const searchInput = document.getElementById('advSearch') as HTMLInputElement;
  if (searchInput) searchInput.value = '';
  const results = document.getElementById('searchResults');
  if (!results) return;
  results.innerHTML = `<div style="margin-bottom:12px;font-size:14px;font-weight:600;color:var(--text)">${proj?.icon || '📁'} ${proj?.nome}</div>` +
    notas.map(n => `
      <div class="sr-item" data-nota="${n.id}">
        <div class="sr-title">${n.titulo}</div>
        <div class="sr-excerpt">${n.conteudo.slice(0, 120).replace(/[#*`]/g, '')}...</div>
        <div class="sr-path">${n.tipo} · ${(n.tags || []).join(', ')}</div>
      </div>
    `).join('');
  results.querySelectorAll('.sr-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = (item as HTMLElement).dataset.nota!;
      abrirNota(id);
    });
  });
  showView('search');
}

export function showView(name: ViewName): void {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navMap: Partial<Record<ViewName, number>> = { dashboard: 0, editor: 1, files: 2, graph: 3, search: 4, ajuda: 5 };
  const navItemIndex = navMap[name];
  if (navItemIndex !== undefined) {
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems[navItemIndex]) navItems[navItemIndex].classList.add('active');
  }

  if (name === 'graph') setTimeout(renderGraph, 100);
  render();
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'agora';
  if (diff < 3600000) return Math.round(diff / 60000) + 'min';
  if (diff < 86400000) return Math.round(diff / 3600000) + 'h';
  return d.toLocaleDateString('pt-BR');
}

export function showModal(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

export function hideModal(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
