import './style.css';
import { inicializarDados } from './data';
import { render, showView, showModal, hideModal } from './components/render';
import { abrirNota, handleSalvarNota, novoScript, togglePreview, fmt, handleExcluirNota, setupEditorAutoPreview } from './components/editor';
import { handleCriarProjeto, handleCriarNota, selecionarFonte, handleUpload, handleSalvarGithubConfig } from './components/modals';
import { buscarAvancado, buscarGlobal } from './services/search';
import { renderFiles, filtrarFiles } from './components/render';
import { fazerSync } from './services/sync';
import { setIdioma, getIdioma, proximoIdioma } from './i18n/index';
import { StorageAdapter } from './storage';
import { excluirNota } from './services/notes';
import { excluirProjeto } from './services/projects';
import type { ViewName } from './types';

// Estado da confirmação de exclusão
let _confirmCallback: (() => void) | null = null;

// Auto-sync debounced — dispara 2s após a última mudança se token estiver configurado
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function autoSync(): void {
  if (!StorageAdapter.getGhToken()) return;
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => fazerSyncWithFeedback(), 2000);
}

function init(): void {
  inicializarDados();
  setIdioma(getIdioma());
  render();
  setupEditorAutoPreview();
  setupEventDelegation();
  setupDragAndDrop();
}

// ─── Event delegation — um único listener para toda a UI ─────────────────────
function setupEventDelegation(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const t = e.target as HTMLElement;

    // Fechar FAB se clicar fora
    if (!t.closest('#fabBtn') && !t.closest('#fabMenu')) {
      closeFab();
    }

    // Fechar modal ao clicar no overlay
    if (t.classList.contains('modal-overlay')) {
      t.classList.remove('show');
      return;
    }

    // Navegação via [data-view]
    const navEl = t.closest('[data-view]') as HTMLElement | null;
    if (navEl) {
      const view = navEl.dataset.view as ViewName;
      if (view === 'github') {
        e.stopPropagation();
        if (!StorageAdapter.getGhToken()) showModal('modalGithub');
        else fazerSyncWithFeedback();
        return;
      }
      e.stopPropagation();
      // Atualiza estado ativo da bottom nav mobile
      if (navEl.classList.contains('bn-item')) {
        document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
        navEl.classList.add('active');
      }
      showView(view);
      return;
    }

    // Botões [data-action]
    const actionEl = t.closest('[data-action]') as HTMLElement | null;
    if (actionEl) {
      e.stopPropagation();
      switch (actionEl.dataset.action) {
        case 'new-note':    showModal('modalNota'); break;
        case 'new-project': showModal('modalProjeto'); break;
        case 'sync':
          if (!StorageAdapter.getGhToken()) showModal('modalGithub');
          else fazerSyncWithFeedback();
          break;
        case 'new-script':   novoScript(); break;
        case 'upload':       showModal('modalUpload'); break;
        case 'preview':      togglePreview(); break;
        case 'save':         handleSalvarNota(); autoSync(); break;
        case 'criar-projeto': handleCriarProjeto(); autoSync(); break;
        case 'criar-nota':   handleCriarNota(); autoSync(); break;
        case 'fazer-upload': handleUpload(); autoSync(); break;
        case 'salvar-github': handleSalvarGithubConfig(); break;
        case 'confirmar-excluir':
          if (_confirmCallback) { _confirmCallback(); _confirmCallback = null; }
          hideModal('modalConfirm');
          autoSync();
          break;
        case 'excluir-projeto': {
          const id   = actionEl.dataset.projetoId!;
          const nome = actionEl.dataset.nome || 'este projeto';
          pedirConfirmacao(
            `Excluir o projeto "${nome}"? Todas as notas vinculadas também serão excluídas.`,
            () => { excluirProjeto(id); render(); setStatus('Projeto excluído'); }
          );
          break;
        }
        case 'excluir-nota': {
          const id   = actionEl.dataset.notaId!;
          const nome = actionEl.dataset.nome || 'esta nota';
          pedirConfirmacao(
            `Excluir a nota "${nome}"?`,
            () => { excluirNota(id); render(); setStatus('Nota excluída'); }
          );
          break;
        }
        case 'excluir-nota-editor':
          handleExcluirNota(); autoSync();
          break;
      }
      return;
    }

    // Botão FAB principal
    if (t.closest('#fabBtn')) {
      e.stopPropagation();
      toggleFab();
      return;
    }

    // Opções do FAB menu
    const fabOpt = t.closest('.fab-opt') as HTMLElement | null;
    if (fabOpt) {
      e.stopPropagation();
      const action = fabOpt.dataset.action;
      if (action === 'nota')    showModal('modalNota');
      if (action === 'projeto') showModal('modalProjeto');
      if (action === 'script')  novoScript();
      if (action === 'upload')  showModal('modalUpload');
      closeFab();
      return;
    }

    // Filtros da view de arquivos
    const filterBtn = t.closest('#filterTabs [data-filter]') as HTMLElement | null;
    if (filterBtn) {
      filtrarFiles(filterBtn.dataset.filter || 'todos', filterBtn);
      return;
    }

    // Botões de formatação do editor
    const fmtBtn = t.closest('.tb-btn[data-fmt]') as HTMLElement | null;
    if (fmtBtn) {
      const [before, after] = fmtBtn.dataset.fmt!.split('|');
      fmt(before, after);
      return;
    }

    // Hints de busca avançada
    const hintBtn = t.closest('[data-search-hint]') as HTMLElement | null;
    if (hintBtn) {
      const hint = hintBtn.dataset.searchHint!;
      const input = document.getElementById('advSearch') as HTMLInputElement;
      if (input) { input.value = hint; input.focus(); }
      return;
    }

    // Fonte IA
    const fonteBtn = t.closest('.fonte-btn') as HTMLElement | null;
    if (fonteBtn) {
      selecionarFonte(fonteBtn, (fonteBtn.dataset.fonte as any) || 'nenhuma');
      return;
    }
  });

  // Inputs
  document.addEventListener('input', (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.id === 'globalSearch') buscarGlobal(t.value);
    if (t.id === 'advSearch')    buscarAvancado(t.value);
  });

  // Atalhos de teclado
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
      closeFab();
      return;
    }
    if (!ctrl) return;
    switch (e.key) {
      case 'n': e.preventDefault(); showModal('modalNota'); break;
      case 's': e.preventDefault(); handleSalvarNota(); break;
      case 'f': e.preventDefault(); (document.getElementById('globalSearch') as HTMLInputElement)?.focus(); break;
      case 'p': e.preventDefault(); togglePreview(); break;
      case 'u': e.preventDefault(); showModal('modalUpload'); break;
      case 'g': e.preventDefault(); fazerSyncWithFeedback(); break;
      case 'l': e.preventDefault(); { const next = proximoIdioma(); setIdioma(next); render(); break; }
      case 'w': e.preventDefault(); fecharEditor(); break;
      case '1': e.preventDefault(); showView('dashboard'); break;
      case '2': e.preventDefault(); showView('editor'); break;
      case '3': e.preventDefault(); showView('files'); break;
      case '4': e.preventDefault(); showView('graph'); break;
      case '5': e.preventDefault(); showView('search'); break;
      case '/': e.preventDefault(); showView('ajuda'); break;
    }
    if (e.shiftKey && e.key === 'P') { e.preventDefault(); showModal('modalProjeto'); }
  });
}

function pedirConfirmacao(mensagem: string, callback: () => void): void {
  _confirmCallback = callback;
  const msg = document.getElementById('confirmMessage');
  if (msg) msg.textContent = mensagem;
  showModal('modalConfirm');
}

function setStatus(msg: string): void {
  const bar = document.getElementById('statusBar');
  if (!bar) return;
  bar.textContent = msg;
  setTimeout(() => { bar.textContent = ''; }, 3000);
}

function toggleFab(): void {
  const menu = document.getElementById('fabMenu');
  const btn  = document.getElementById('fabBtn');
  if (!menu || !btn) return;
  const open = menu.classList.toggle('open');
  btn.textContent = open ? '✕' : '＋';
}

function closeFab(): void {
  const menu = document.getElementById('fabMenu');
  const btn  = document.getElementById('fabBtn');
  if (menu) menu.classList.remove('open');
  if (btn)  btn.textContent = '＋';
}

function fecharEditor(): void {
  (document.getElementById('editorTitle') as HTMLInputElement).value = '';
  (document.getElementById('editorBody') as HTMLTextAreaElement).value = '';
  showView('dashboard');
}

async function fazerSyncWithFeedback(): Promise<void> {
  const bar = document.getElementById('statusBar');
  if (bar) bar.textContent = 'Sincronizando...';
  const result = await fazerSync(msg => { if (bar) bar.textContent = msg; });
  if (result.success) {
    if (bar) bar.textContent = `✅ Sincronizado! github.com/${StorageAdapter.getGhUser()}/${StorageAdapter.getGhRepo()}`;
    setTimeout(() => { if (bar) bar.textContent = ''; }, 5000);
  } else {
    if (bar) bar.textContent = '❌ Erro: ' + result.error;
  }
}

function setupDragAndDrop(): void {
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    const { notas, projetos } = StorageAdapter.getDados();
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const tipoMap: Record<string, 'script' | 'nota'> = { py: 'script', js: 'script', html: 'script', css: 'script', sql: 'script', md: 'nota', txt: 'nota' };
        const isMd = ext === 'md';
        const conteudo = isMd ? (ev.target?.result as string) : '```' + ext + '\n' + (ev.target?.result as string) + '\n```';
        notas.push({ id: 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), titulo: file.name, projeto: '', tipo: tipoMap[ext] || 'nota', tags: [ext], fonteIA: 'nenhuma', conteudo, criado: new Date().toISOString(), atualizado: new Date().toISOString() });
        StorageAdapter.saveDados({ notas, projetos });
        render();
      };
      reader.readAsText(file);
    });
  });
}

// Módulo inicializa direto (type="module" já garante DOM pronto)
init();

export { init, abrirNota, hideModal, handleExcluirNota, renderFiles };
