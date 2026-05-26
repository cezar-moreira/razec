import './style.css';
import { inicializarDados } from './data';
import { render, showView, showModal, hideModal } from './components/render';
import { abrirNota, handleSalvarNota, novoScript, togglePreview, fmt, handleExcluirNota, setupEditorAutoPreview } from './components/editor';
import { handleCriarProjeto, handleCriarNota, selecionarFonte, handleUpload } from './components/modals';
import { buscarAvancado, buscarGlobal } from './services/search';
import { renderFiles, filtrarFiles } from './components/render';
import { setIdioma, getIdioma, proximoIdioma } from './i18n/index';
import { StorageAdapter } from './storage';
import { excluirNota } from './services/notes';
import { excluirProjeto } from './services/projects';
import { initAuth, login, signup, logout, carregarDoSupabase, setupRealtime, isLoggedIn } from './services/supabase';
import type { ViewName } from './types';

// Estado da confirmação de exclusão
let _confirmCallback: (() => void) | null = null;

// ─── Auth helpers (expostos ao window para os handlers inline do HTML) ────────
(window as any).setAuthMode = setAuthMode;
(window as any).submitAuth  = submitAuth;

let _authMode: 'login' | 'signup' = 'login';

function setAuthMode(mode: 'login' | 'signup'): void {
  _authMode = mode;
  const btnLogin  = document.getElementById('tabLogin')!;
  const btnSignup = document.getElementById('tabSignup')!;
  const authBtn   = document.getElementById('authBtn')!;
  if (mode === 'login') {
    btnLogin.style.background  = 'var(--primary)'; btnLogin.style.color  = '#fff'; btnLogin.style.borderColor = 'var(--primary)';
    btnSignup.style.background = 'transparent';    btnSignup.style.color = 'var(--muted)'; btnSignup.style.borderColor = 'var(--border)';
    authBtn.textContent = 'Entrar';
  } else {
    btnSignup.style.background = 'var(--primary)'; btnSignup.style.color = '#fff'; btnSignup.style.borderColor = 'var(--primary)';
    btnLogin.style.background  = 'transparent';   btnLogin.style.color  = 'var(--muted)'; btnLogin.style.borderColor = 'var(--border)';
    authBtn.textContent = 'Criar conta';
  }
  setAuthMsg('');
}

async function submitAuth(): Promise<void> {
  const email = (document.getElementById('authEmail') as HTMLInputElement).value.trim();
  const pass  = (document.getElementById('authPass')  as HTMLInputElement).value;
  const btn   = document.getElementById('authBtn')!;
  if (!email || !pass) { setAuthMsg('Preencha email e senha.'); return; }
  btn.setAttribute('disabled', 'true');
  btn.textContent = '...';

  if (_authMode === 'login') {
    const err = await login(email, pass);
    if (err) { setAuthMsg(err); btn.removeAttribute('disabled'); btn.textContent = 'Entrar'; }
  } else {
    if (pass.length < 6) { setAuthMsg('Senha deve ter ao menos 6 caracteres.'); btn.removeAttribute('disabled'); btn.textContent = 'Criar conta'; return; }
    const err = await signup(email, pass);
    if (err) { setAuthMsg(err); } else { setAuthMsg('✅ Conta criada! Verifique seu email e faça login.'); }
    btn.removeAttribute('disabled'); btn.textContent = 'Criar conta';
  }
}

function setAuthMsg(msg: string): void {
  const el = document.getElementById('authMsg');
  if (el) { el.textContent = msg; el.style.color = msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)'; }
}

function setCloud(tipo: 'ok' | 'sync' | 'err', txt: string): void {
  const el  = document.getElementById('cloudStatus');
  const txt_el = document.getElementById('cloudTxt');
  if (!el || !txt_el) return;
  txt_el.textContent = txt;
  el.style.color = tipo === 'ok' ? 'var(--success)' : tipo === 'sync' ? 'var(--primary)' : 'var(--danger)';
  el.style.borderColor = tipo === 'ok' ? 'var(--success)' : tipo === 'sync' ? 'var(--primary)' : 'var(--danger)';
}

async function onLogin(email: string): Promise<void> {
  setCloud('sync', 'Carregando dados...');
  document.getElementById('loadingScreen')!.style.display = 'flex';
  document.getElementById('authScreen')!.style.display    = 'none';

  inicializarDados();
  const ok = await carregarDoSupabase();
  setCloud(ok ? 'ok' : 'err', ok ? `☁️ ${email}` : '⚠️ Offline');

  const emailEl = document.getElementById('userEmailSidebar');
  if (emailEl) emailEl.textContent = email;

  document.getElementById('loadingScreen')!.style.display = 'none';
  setIdioma(getIdioma());
  render();
  setupEditorAutoPreview();
  setupEventDelegation();
  setupDragAndDrop();
  setupRealtime(() => { render(); setCloud('ok', `☁️ ${email}`); });
}

function onLogout(): void {
  document.getElementById('authScreen')!.style.display = 'flex';
  document.getElementById('loadingScreen')!.style.display = 'none';
}

async function init(): Promise<void> {
  await initAuth(onLogin, onLogout);
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
        if (!isLoggedIn()) { document.getElementById('authScreen')!.style.display = 'flex'; }
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
        case 'logout':      logout().catch(console.error); break;
        case 'new-script':   novoScript(); break;
        case 'upload':       showModal('modalUpload'); break;
        case 'preview':      togglePreview(); break;
        case 'save':         handleSalvarNota(); break;
        case 'criar-projeto': handleCriarProjeto(); break;
        case 'criar-nota':   handleCriarNota(); break;
        case 'fazer-upload': handleUpload(); break;
        case 'confirmar-excluir':
          if (_confirmCallback) { _confirmCallback(); _confirmCallback = null; }
          hideModal('modalConfirm');
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
          handleExcluirNota();
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
      case 'g': e.preventDefault(); carregarDoSupabase().then(() => render()).catch(console.error); break;
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
