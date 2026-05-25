import { describe, it, expect, beforeEach } from 'vitest';

function createMockStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => Object.keys(store).forEach(k => delete store[k]),
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

describe('Notes Service', () => {
  beforeEach(() => {
    const mock = createMockStorage();
    Object.defineProperty(globalThis, 'localStorage', { value: mock, writable: true });
    // Reset sessionStorage
    Object.defineProperty(globalThis, 'sessionStorage', { value: { ...mock }, writable: true });
  });

  it('should create a note', async () => {
    const { criarNota } = await import('../services/notes');
    const { inicializarDados } = await import('../data');
    inicializarDados();

    const nota = criarNota({
      titulo: 'Nota de teste',
      projeto: 'ultravida',
      tipo: 'nota',
      tags: ['teste'],
      fonteIA: 'nenhuma',
    });

    expect(nota.titulo).toBe('Nota de teste');
    expect(nota.tipo).toBe('nota');
    expect(nota.id).toContain('n_');

    // Should be findable
    const { listarNotas, buscarNota } = await import('../services/notes');
    expect(listarNotas().length).toBeGreaterThanOrEqual(4);
    expect(buscarNota(nota.id)?.titulo).toBe('Nota de teste');
  });

  it('should save and version a note', async () => {
    const { criarNota, salvarNota, getHistorico } = await import('../services/notes');
    const { inicializarDados } = await import('../data');
    inicializarDados();

    const nota = criarNota({ titulo: 'Original', projeto: '', tipo: 'nota', tags: [], fonteIA: 'nenhuma' });
    salvarNota(nota.id, 'Modificado', 'Novo conteúdo');

    const { buscarNota } = await import('../services/notes');
    expect(buscarNota(nota.id)?.titulo).toBe('Modificado');

    const hist = getHistorico(nota.id);
    expect(hist.length).toBe(1);
    expect(hist[0].titulo).toBe('Original');
  });

  it('should delete a note', async () => {
    const { criarNota, excluirNota, listarNotas } = await import('../services/notes');
    const { inicializarDados } = await import('../data');
    inicializarDados();

    const before = listarNotas().length;
    const nota = criarNota({ titulo: 'Temp', projeto: '', tipo: 'nota', tags: [], fonteIA: 'nenhuma' });
    excluirNota(nota.id);
    expect(listarNotas().length).toBe(before);
  });
});
