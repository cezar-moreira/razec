import { describe, it, expect, beforeEach } from 'vitest';

// Minimal localStorage mock for tests
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

describe('StorageAdapter', () => {
  beforeEach(() => {
    const mock = createMockStorage();
    Object.defineProperty(globalThis, 'localStorage', { value: mock, writable: true });
  });

  it('should store and retrieve values with prefix', async () => {
    const { StorageAdapter } = await import('../storage');
    StorageAdapter.setRaw('test', { hello: 'world' });
    expect(StorageAdapter.getRaw('test', null)).toEqual({ hello: 'world' });
  });

  it('should return default for missing keys', async () => {
    const { StorageAdapter } = await import('../storage');
    expect(StorageAdapter.getRaw('nonexistent', 42)).toBe(42);
  });

  it('should save and load complete data set', async () => {
    const { StorageAdapter } = await import('../storage');
    const dados = { projetos: [{ id: 'p1', nome: 'Test', desc: '', icon: '📁', cor: 'blue' as const, criado: new Date().toISOString() }], notas: [] };
    StorageAdapter.saveDados(dados);
    const loaded = StorageAdapter.getDados();
    expect(loaded.projetos).toHaveLength(1);
    expect(loaded.projetos[0].nome).toBe('Test');
  });

  it('should track storage usage', async () => {
    const { StorageAdapter } = await import('../storage');
    const info = StorageAdapter.getStorageInfo();
    expect(info.usedKB).toBeGreaterThanOrEqual(0);
    expect(info.pct).toBeGreaterThanOrEqual(0);
  });
});
