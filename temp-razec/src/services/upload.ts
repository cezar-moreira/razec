import type { Nota } from '../types';
import { StorageAdapter } from '../storage';
import { gerarIdNota } from '../data';

export function importarArquivos(files: FileList, projetoId: string): Nota[] {
  const criadas: Nota[] = [];
  const { projetos, notas } = StorageAdapter.getDados();

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const tipoMap: Record<string, Nota['tipo']> = { py: 'script', js: 'script', html: 'script', css: 'script', sql: 'script', md: 'nota', txt: 'nota' };
      const isMd = ext === 'md';
      const nova: Nota = {
        id: gerarIdNota(),
        titulo: file.name,
        projeto: projetoId,
        tipo: tipoMap[ext] || 'nota',
        tags: [ext],
        conteudo: isMd ? e.target?.result as string : '```' + ext + '\n' + (e.target?.result as string) + '\n```',
        criado: new Date().toISOString(),
        atualizado: new Date().toISOString(),
        fonteIA: 'nenhuma',
      };
      notas.push(nova);
      StorageAdapter.saveDados({ projetos, notas });
      criadas.push(nova);
    };
    reader.readAsText(file);
  });

  return criadas;
}
