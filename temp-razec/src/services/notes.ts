import type { Nota, FonteIA, VersaoNota } from '../types';
import { StorageAdapter } from '../storage';
import { gerarIdNota } from '../data';
import { syncNota, deleteNota } from './supabase';

export function listarNotas(): Nota[] {
  return StorageAdapter.getDados().notas;
}

export function buscarNota(id: string): Nota | undefined {
  return listarNotas().find(n => n.id === id);
}

export function criarNota(dados: {
  titulo: string; projeto: string; tipo: Nota['tipo'];
  tags: string[]; fonteIA: FonteIA; conteudo?: string;
}): Nota {
  const { projetos, notas } = StorageAdapter.getDados();
  const conteudo = dados.conteudo || genConteudoInicial(dados.titulo, dados.fonteIA);
  const nova: Nota = {
    id: gerarIdNota(),
    titulo: dados.titulo,
    projeto: dados.projeto,
    tipo: dados.tipo,
    tags: dados.tags,
    fonteIA: dados.fonteIA,
    conteudo,
    criado: new Date().toISOString(),
    atualizado: new Date().toISOString(),
  };
  notas.push(nova);
  StorageAdapter.saveDados({ projetos, notas });
  syncNota(nova).catch(console.error);
  return nova;
}

function genConteudoInicial(titulo: string, fonte: FonteIA): string {
  let c = `# ${titulo}\n\n`;
  if (fonte !== 'nenhuma') c += `> 🤖 Fonte: ${fonte.toUpperCase()}\n\n`;
  return c;
}

export function salvarNota(id: string, titulo: string, conteudo: string): Nota | null {
  const { projetos, notas } = StorageAdapter.getDados();
  const nota = notas.find(n => n.id === id);
  if (!nota) return null;

  StorageAdapter.pushHistorico(id, {
    titulo: nota.titulo, conteudo: nota.conteudo, salvoEm: nota.atualizado,
  });

  nota.titulo = titulo;
  nota.conteudo = conteudo;
  nota.atualizado = new Date().toISOString();
  StorageAdapter.saveDados({ projetos, notas });
  syncNota(nota).catch(console.error);
  return nota;
}

export function excluirNota(id: string): void {
  const { projetos, notas } = StorageAdapter.getDados();
  StorageAdapter.saveDados({ projetos, notas: notas.filter(n => n.id !== id) });
  StorageAdapter.remove('hist_' + id);
  deleteNota(id).catch(console.error);
}

export function getHistorico(notaId: string): VersaoNota[] {
  return StorageAdapter.getHistorico(notaId);
}
