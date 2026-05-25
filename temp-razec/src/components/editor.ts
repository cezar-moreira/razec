import { listarNotas, buscarNota, salvarNota, criarNota, excluirNota, getHistorico } from '../services/notes';
import { listarProjetos } from '../services/projects';
import { renderMarkdown } from '../markdown';
import { showView, formatDate, showModal, hideModal, render } from './render';
import type { FonteIA } from '../types';

let notaAtual: string | null = null;

export function abrirNota(id: string): void {
  const notas = listarNotas();
  const nota = notas.find(n => n.id === id);
  if (!nota) return;
  notaAtual = id;
  const titleInput = document.getElementById('editorTitle') as HTMLInputElement;
  const bodyTextarea = document.getElementById('editorBody') as HTMLTextAreaElement;
  if (titleInput) titleInput.value = nota.titulo;
  if (bodyTextarea) bodyTextarea.value = nota.conteudo;

  setText('metaTags', (nota.tags || []).join(', ') || 'Sem tags');
  setText('metaData', formatDate(nota.atualizado));

  const proj = listarProjetos().find(p => p.id === nota.projeto);
  setText('metaProjeto', proj ? proj.nome : 'Sem projeto');

  showView('editor');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const editorNav = document.querySelectorAll('.nav-item')[1];
  if (editorNav) editorNav.classList.add('active');
}

function setText(id: string, v: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

export async function handleSalvarNota(): Promise<void> {
  const titulo = (document.getElementById('editorTitle') as HTMLInputElement)?.value.trim();
  const conteudo = (document.getElementById('editorBody') as HTMLTextAreaElement)?.value;
  if (!titulo) return;

  let id = notaAtual;
  if (!id) {
    const nova = criarNota({ titulo, projeto: '', tipo: 'nota', tags: [], fonteIA: 'nenhuma', conteudo });
    id = nova.id;
    notaAtual = id;
  } else {
    salvarNota(id, titulo, conteudo);
  }
  render();

  const btn = document.querySelector('.btn-save');
  if (btn) {
    const orig = btn.textContent || '';
    btn.textContent = '✅ Salvo!';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }
}

export function novaNota(fonte?: FonteIA): void {
  const tipoSelect = document.getElementById('novoTipo') as HTMLSelectElement;
  if (tipoSelect) tipoSelect.value = 'nota';
  const fonteInput = document.getElementById('fonteIA') as HTMLInputElement;
  if (fonteInput && fonte) fonteInput.value = fonte;
  showModal('modalNota');
}

export function novoScript(): void {
  const tipoSelect = document.getElementById('novoTipo') as HTMLSelectElement;
  if (tipoSelect) tipoSelect.value = 'script';
  showModal('modalNota');
}

export function togglePreview(): void {
  const panel = document.getElementById('previewPanel');
  if (!panel) return;
  const show = !panel.classList.contains('show');
  panel.classList.toggle('show', show);
  if (show) renderPreview();
}

export function renderPreview(): void {
  const md = (document.getElementById('editorBody') as HTMLTextAreaElement)?.value || '';
  const panel = document.getElementById('previewPanel');
  if (panel) panel.innerHTML = renderMarkdown(md);
}

export function setupEditorAutoPreview(): void {
  const body = document.getElementById('editorBody');
  body?.addEventListener('input', () => {
    const panel = document.getElementById('previewPanel');
    if (panel?.classList.contains('show')) renderPreview();
  });
}

export function fmt(before: string, after: string): void {
  const ta = document.getElementById('editorBody') as HTMLTextAreaElement;
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const sel = ta.value.substring(start, end);
  ta.value = ta.value.substring(0, start) + before + sel + after + ta.value.substring(end);
  ta.focus();
}

export function handleExcluirNota(): void {
  if (!notaAtual) return;
  if (!confirm('Tem certeza que deseja excluir esta nota?')) return;
  excluirNota(notaAtual);
  notaAtual = null;
  const titleInput = document.getElementById('editorTitle') as HTMLInputElement;
  const bodyTextarea = document.getElementById('editorBody') as HTMLTextAreaElement;
  if (titleInput) titleInput.value = '';
  if (bodyTextarea) bodyTextarea.value = '';
  render();
  showView('dashboard');
}

export function getNotaAtual(): string | null {
  return notaAtual;
}

export function setNotaAtual(id: string | null): void {
  notaAtual = id;
}

export function getHistoricoNota(): ReturnType<typeof getHistorico> {
  if (!notaAtual) return [];
  return getHistorico(notaAtual);
}
