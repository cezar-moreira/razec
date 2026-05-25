import type { Projeto, CorProjeto } from '../types';
import { StorageAdapter } from '../storage';

export function listarProjetos(): Projeto[] {
  return StorageAdapter.getDados().projetos;
}

export function criarProjeto(nome: string, desc: string, icon: string, cor: CorProjeto): Projeto {
  const { projetos, notas } = StorageAdapter.getDados();
  const id = nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const projeto: Projeto = { id, nome, desc, icon: icon || '📁', cor, criado: new Date().toISOString() };
  projetos.push(projeto);
  StorageAdapter.saveDados({ projetos, notas });
  return projeto;
}

export function excluirProjeto(id: string): void {
  const { projetos, notas } = StorageAdapter.getDados();
  StorageAdapter.saveDados({
    projetos: projetos.filter(p => p.id !== id),
    notas: notas.filter(n => n.projeto !== id),
  });
}
