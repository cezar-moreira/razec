import './style.css';
import { inicializarDados } from './data';
import { render, showView, showModal, hideModal, formatDate } from './components/render';
import { renderGraph } from './components/graph';
import { abrirNota, handleSalvarNota, novoScript, togglePreview, fmt, handleExcluirNota, setupEditorAutoPreview } from './components/editor';
import { handleCriarProjeto, handleCriarNota, selecionarFonte, handleUpload, handleSalvarGithubConfig } from './components/modals';
import { buscarAvancado, buscarGlobal } from './services/search';
import { renderFiles, filtrarFiles, filtrarPorProjeto } from './components/render';
import { fazerSync } from './services/sync';
import { setIdioma, getIdioma, t, proximoIdioma } from './i18n/index';
import { StorageAdapter } from './storage';
import type { ViewName, Idioma } from './types';

function init(): void {
  inicializarDados();

  const savedLang = getIdioma();
  setIdioma(savedLang);

  render();
  setupEditorAutoPreview();

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-dashboard')?.classList.add('active');

  document.getElementById('logoHome')?.addEventListener('click', () => showView('dashboard'));
  setupKeyboardShortcuts();
  setupGlobalEvents();
  setupDragAndDrop();
  setupFecharFabFora();
}

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
      return;
    }

    if (!ctrl) return;

    switch (e.key) {
      case 'n': e.preventDefault(); showModal('modalNota'); break;
      case 's': e.preventDefault(); handleSalvarNota(); break;
      case 'f': e.preventDefault(); document.getElementById('globalSearch')?.focus(); break;
      case 'p': e.preventDefault(); togglePreview(); break;
      case 'u': e.preventDefault(); showModal('modalUpload'); break;
      case 'g': e.preventDefault(); fazerSyncWithFeedback(); break;
      case 'l': e.preventDefault(); const next = proximoIdioma(); setIdioma(next); render(); break;
      case 'w': e.preventDefault(); fecharEditor(); break;
      case '1': e.preventDefault(); showView('dashboard'); break;
      case '2': e.preventDefault(); showView('editor'); break;
      case '3': e.preventDefault(); showView('files'); break;
      case '4': e.preventDefault(); showView('graph'); setTimeout(renderGraph, 100); break;
      case '5': e.preventDefault(); showView('search'); break;
    }

    if (e.shiftKey && e.key === 'P') { e.preventDefault(); showModal('modalProjeto'); }
    if (e.key === '/') { e.preventDefault(); showView('ajuda'); }
  });
}

function setupGlobalEvents(): void {
  // Global search
  document.getElementById('globalSearch')?.addEventListener('input', (e) => {
    buscarGlobal((e.target as HTMLInputElement).value);
  });

  // Topbar buttons
  document.querySelectorAll('[data-action="new-note"]').forEach(el => {
    el.addEventListener('click', () => showModal('modalNota'));
  });
  document.querySelectorAll('[data-action="new-project"]').forEach(el => {
    el.addEventListener('click', () => showModal('modalProjeto'));
  });

  // Filter files buttons
  document.querySelectorAll('#filterTabs .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtro = (btn as HTMLElement).dataset.filter || 'todos';
      filtrarFiles(filtro, btn as HTMLElement);
    });
  });

  // Modal overlay clicks to close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
  });

  // Toolbar formatting
  document.querySelectorAll('.tb-btn[data-fmt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = (btn as HTMLElement).dataset.fmt!;
      const [before, after] = data.split('|');
      fmt(before, after);
    });
  });

  // Preview toggle
  document.querySelector('[data-action="preview"]')?.addEventListener('click', togglePreview);

  // Save button
  document.querySelector('[data-action="save"]')?.addEventListener('click', handleSalvarNota);

  // Advanced search
  document.getElementById('advSearch')?.addEventListener('input', (e) => {
    buscarAvancado((e.target as HTMLInputElement).value);
  });

  // Search hint buttons
  document.querySelectorAll('[data-search-hint]').forEach(btn => {
    btn.addEventListener('click', () => {
      const hint = (btn as HTMLElement).dataset.searchHint!;
      const input = document.getElementById('advSearch') as HTMLInputElement;
      if (input) { input.value = hint; input.focus(); buscarAvancado(hint); }
    });
  });

  // GitHub sync
  document.querySelector('[data-action="sync"]')?.addEventListener('click', () => {
    const token = StorageAdapter.getGhToken();
    if (!token) showModal('modalGithub');
    else fazerSyncWithFeedback();
  });

  // New script
  document.querySelectorAll('[data-action="new-script"]').forEach(el => {
    el.addEventListener('click', novoScript);
  });

  // Upload
  document.querySelectorAll('[data-action="upload"]').forEach(el => {
    el.addEventListener('click', () => showModal('modalUpload'));
  });

  // Modal buttons
  document.querySelector('[data-action="criar-projeto"]')?.addEventListener('click', handleCriarProjeto);
  document.querySelector('[data-action="criar-nota"]')?.addEventListener('click', handleCriarNota);
  document.querySelector('[data-action="fazer-upload"]')?.addEventListener('click', handleUpload);
  document.querySelector('[data-action="salvar-github"]')?.addEventListener('click', handleSalvarGithubConfig);

  // Fonte IA buttons
  document.querySelectorAll('.fonte-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const fonte = (btn as HTMLElement).dataset.fonte as any || 'nenhuma';
      selecionarFonte(btn as HTMLElement, fonte);
    });
  });

  // Mobile nav
  document.querySelectorAll('.bn-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = (btn as HTMLElement).dataset.view as ViewName;
      if (view === 'github') {
        const token = StorageAdapter.getGhToken();
        if (!token) showModal('modalGithub');
        else fazerSyncWithFeedback();
        return;
      }
      document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (view === 'graph') { showView(view); setTimeout(renderGraph, 100); }
      else showView(view);
    });
  });

  // FAB
  const fab = document.getElementById('fabBtn');
  fab?.addEventListener('click', toggleFab);
  document.querySelectorAll('.fab-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const action = (opt as HTMLElement).dataset.action;
      if (action === 'nota') showModal('modalNota');
      else if (action === 'projeto') showModal('modalProjeto');
      else if (action === 'script') novoScript();
      else if (action === 'upload') showModal('modalUpload');
      toggleFab();
    });
  });
}

function setupDragAndDrop(): void {
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    const notas = StorageAdapter.getDados().notas;
    const projetos = StorageAdapter.getDados().projetos;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const tipoMap: Record<string, 'script' | 'nota'> = { py: 'script', js: 'script', html: 'script', css: 'script', sql: 'script', md: 'nota', txt: 'nota' };
        const isMd = ext === 'md';
        notas.push({
          id: 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          titulo: file.name,
          projeto: '',
          tipo: tipoMap[ext] || 'nota',
          tags: [ext],
          fonteIA: 'nenhuma',
          conteudo: isMd ? ev.target?.result as string : '```' + ext + '\n' + (ev.target?.result as string) + '\n```',
          criado: new Date().toISOString(),
          atualizado: new Date().toISOString(),
        });
        StorageAdapter.saveDados({ notas, projetos });
        render();
      };
      reader.readAsText(file);
    });
  });
}

function toggleFab(): void {
  const menu = document.getElementById('fabMenu');
  const btn = document.getElementById('fabBtn');
  if (!menu || !btn) return;
  const open = menu.classList.toggle('open');
  btn.textContent = open ? '✕' : '＋';
}

function setupFecharFabFora(): void {
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement)?.closest('.fab') && !(e.target as HTMLElement)?.closest('.fab-menu')) {
      const menu = document.getElementById('fabMenu');
      const btn = document.getElementById('fabBtn');
      if (menu) menu.classList.remove('open');
      if (btn) btn.textContent = '＋';
    }
  });
}

function fecharEditor(): void {
  const titleInput = document.getElementById('editorTitle') as HTMLInputElement;
  const bodyTextarea = document.getElementById('editorBody') as HTMLTextAreaElement;
  if (titleInput) titleInput.value = '';
  if (bodyTextarea) bodyTextarea.value = '';
  showView('dashboard');
}

async function fazerSyncWithFeedback(): Promise<void> {
  const statusBar = document.getElementById('statusBar');
  if (statusBar) statusBar.textContent = 'Sincronizando...';

  const result = await fazerSync((msg) => {
    if (statusBar) statusBar.textContent = msg;
  });

  if (result.success) {
    if (statusBar) statusBar.textContent = '✅ Sincronizado com GitHub! github.com/' + StorageAdapter.getGhUser() + '/' + StorageAdapter.getGhRepo();
    setTimeout(() => { if (statusBar) statusBar.textContent = ''; }, 5000);
  } else {
    if (statusBar) statusBar.textContent = '❌ Erro: ' + result.error;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});

export { init, abrirNota };
