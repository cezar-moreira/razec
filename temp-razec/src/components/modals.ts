import { criarProjeto } from '../services/projects';
import { criarNota } from '../services/notes';
import { importarArquivos } from '../services/upload';
import { StorageAdapter } from '../storage';
import { hideModal, render, showModal } from './render';
import { abrirNota, setNotaAtual } from './editor';
import type { CorProjeto, FonteIA } from '../types';

export function handleCriarProjeto(): void {
  const nome = (document.getElementById('projNome') as HTMLInputElement)?.value.trim();
  if (!nome) return;
  const desc = (document.getElementById('projDesc') as HTMLInputElement)?.value || '';
  const icon = (document.getElementById('projIcon') as HTMLInputElement)?.value || '📁';
  const cor = (document.getElementById('projCor') as HTMLSelectElement)?.value as CorProjeto || 'blue';

  criarProjeto(nome, desc, icon, cor);
  hideModal('modalProjeto');
  const el = document.getElementById('projNome') as HTMLInputElement;
  if (el) el.value = '';
  const el2 = document.getElementById('projDesc') as HTMLInputElement;
  if (el2) el2.value = '';
  render();
}

export function handleCriarNota(): void {
  const titulo = (document.getElementById('novoTitulo') as HTMLInputElement)?.value.trim();
  if (!titulo) return;
  const projeto = (document.getElementById('novoProjetoNota') as HTMLSelectElement)?.value || '';
  const tipo = (document.getElementById('novoTipo') as HTMLSelectElement)?.value as 'nota' | 'script' | 'conversa' | 'doc' || 'nota';
  const tagsStr = (document.getElementById('novasTags') as HTMLInputElement)?.value || '';
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  const fonteIA = (document.getElementById('fonteIA') as HTMLInputElement)?.value as FonteIA || 'nenhuma';

  const nota = criarNota({ titulo, projeto, tipo, tags, fonteIA });

  hideModal('modalNota');
  const el = document.getElementById('fonteIA') as HTMLInputElement;
  if (el) el.value = 'nenhuma';
  document.querySelectorAll('.fonte-btn').forEach(b => {
    (b as HTMLElement).style.borderColor = 'var(--border)';
  });
  setNotaAtual(null);
  abrirNota(nota.id);
  render();
}

export function selecionarFonte(btn: HTMLElement, fonte: FonteIA): void {
  document.querySelectorAll('.fonte-btn').forEach(b => {
    (b as HTMLElement).style.borderColor = 'var(--border)';
    (b as HTMLElement).style.color = 'var(--muted)';
    (b as HTMLElement).style.background = 'var(--bg)';
  });
  btn.style.borderColor = 'var(--primary)';
  btn.style.color = 'var(--primary)';
  btn.style.background = 'rgba(88,166,255,.1)';
  const el = document.getElementById('fonteIA') as HTMLInputElement;
  if (el) el.value = fonte;
}

export function handleUpload(): void {
  const fileInput = document.getElementById('uploadFile') as HTMLInputElement;
  if (!fileInput?.files?.length) return;
  const projetoId = (document.getElementById('uploadProjeto') as HTMLSelectElement)?.value || '';
  importarArquivos(fileInput.files, projetoId);
  hideModal('modalUpload');
  render();
}

export function handleSalvarGithubConfig(): void {
  const user = (document.getElementById('ghUser') as HTMLInputElement)?.value;
  const token = (document.getElementById('ghToken') as HTMLInputElement)?.value;
  const repo = (document.getElementById('ghRepo') as HTMLInputElement)?.value;
  if (user) StorageAdapter.setGhUser(user);
  if (token) StorageAdapter.setGhToken(token);
  if (repo) StorageAdapter.setGhRepo(repo);
  hideModal('modalGithub');
}

export function handleSyncGitHub(): void {
  const token = StorageAdapter.getGhToken();
  if (!token) { showModal('modalGithub'); }
}
