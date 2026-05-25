import type { Nota } from '../types';
import { listarNotas } from './notes';
import { listarProjetos } from './projects';
import { StorageAdapter } from '../storage';

export interface ResultadoBusca {
  nota: Nota;
  matches: { titulo: boolean; conteudo: boolean; tags: boolean };
}

export function buscarSimples(q: string): ResultadoBusca[] {
  if (q.length < 2) return listarNotas().map(n => ({ nota: n, matches: { titulo: false, conteudo: false, tags: false } }));
  const query = q.toLowerCase();
  return listarNotas()
    .filter(n => n.titulo.toLowerCase().includes(query) || n.conteudo.toLowerCase().includes(query) || (n.tags || []).some(t => t.toLowerCase().includes(query)))
    .map(n => ({
      nota: n,
      matches: {
        titulo: n.titulo.toLowerCase().includes(query),
        conteudo: n.conteudo.toLowerCase().includes(query),
        tags: (n.tags || []).some(t => t.toLowerCase().includes(query)),
      },
    }));
}

export function buscarAvancado(query: string): ResultadoBusca[] {
  const filters: { projeto?: string; tag?: string; tipo?: string; texto?: string } = {};

  const projMatch = query.match(/projeto:(\S+)/);
  if (projMatch) { filters.projeto = projMatch[1]; query = query.replace(projMatch[0], '').trim(); }

  const tagMatch = query.match(/tag:(\S+)/);
  if (tagMatch) { filters.tag = tagMatch[1]; query = query.replace(tagMatch[0], '').trim(); }

  const tipoMatch = query.match(/tipo:(\S+)/);
  if (tipoMatch) { filters.tipo = tipoMatch[1]; query = query.replace(tipoMatch[0], '').trim(); }

  filters.texto = query;

  let notas = listarNotas();

  if (filters.projeto) notas = notas.filter(n => n.projeto === filters.projeto || n.projeto?.toLowerCase().includes(filters.projeto!.toLowerCase()));
  if (filters.tag) notas = notas.filter(n => (n.tags || []).some(t => t.toLowerCase().includes(filters.tag!.toLowerCase())));
  if (filters.tipo) notas = notas.filter(n => n.tipo === filters.tipo);

  if (filters.texto && filters.texto.length >= 2) {
    const t = filters.texto.toLowerCase();
    notas = notas.filter(n => n.titulo.toLowerCase().includes(t) || n.conteudo.toLowerCase().includes(t));
  }

  return notas.map(n => ({ nota: n, matches: { titulo: true, conteudo: true, tags: true } }));
}

export function notasPorProjeto(projetoId: string): Nota[] {
  return listarNotas().filter(n => n.projeto === projetoId);
}

export function filtrarPorTipo(filtro: string): Nota[] {
  let notas = listarNotas();
  if (filtro === 'todos') return notas;
  if (filtro.startsWith('ia_')) {
    const ia = filtro.replace('ia_', '');
    return notas.filter(n => n.fonteIA === ia);
  }
  if (['python', 'html', 'js', 'sql'].includes(filtro)) {
    return notas.filter(n => n.tipo === 'script' && (n.tags || []).includes(filtro));
  }
  return notas.filter(n => n.tipo === filtro);
}

export function todasTags(): string[] {
  return [...new Set(listarNotas().flatMap(n => n.tags || []))];
}

export function storageInfo(): { usedKB: number; pct: number } {
  return StorageAdapter.getStorageInfo();
}

export function buscarGlobal(q: string): void {
  if (!q || q.length < 2) return;
  const results = buscarAvancado(q);
  const container = document.getElementById('searchResults');
  if (!container) return;
  // Renders quick results inline — view switch handled by caller
}

export function filtroSearch(tipo: string): void {
  const input = document.getElementById('advSearch') as HTMLInputElement | null;
  if (!input) return;
  const hints: Record<string, string> = { projeto: 'projeto:', tag: 'tag:', tipo: 'tipo:', data: 'data:' };
  input.value = hints[tipo] || '';
  input.focus();
  buscarAvancado(input.value);
}
