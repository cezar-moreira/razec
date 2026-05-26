import type { DadosCompletos, Nota, Projeto, VersaoNota } from './types';

const PREFIX = 'razec_';
const MAX_HISTORY = 10;

function compress(str: string): string {
  const LZString = (window as any).LZString;
  if (LZString) return LZString.compress(str);
  return str;
}

function decompress(str: string): string {
  if (!str || str.startsWith('{') || str.startsWith('[')) return str;
  const LZString = (window as any).LZString;
  if (LZString) {
    try { return LZString.decompress(str) || str; } catch { return str; }
  }
  return str;
}

export const StorageAdapter = {
  getRaw<T>(key: string, def: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return def;
      const dec = decompress(raw);
      return JSON.parse(dec) ?? def;
    } catch {
      return def;
    }
  },

  setRaw(key: string, value: unknown): void {
    const json = JSON.stringify(value);
    const compressed = compress(json);
    localStorage.setItem(PREFIX + key, compressed);
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },

  getDados(): DadosCompletos {
    return {
      projetos: this.getRaw<Projeto[]>('projetos', []),
      notas: this.getRaw<Nota[]>('notas', []),
    };
  },

  saveDados(dados: DadosCompletos): void {
    const { projetos, notas } = dados;
    this.setRaw('projetos', projetos);
    this.setRaw('notas', notas);
  },

  isInit(): boolean {
    return this.getRaw<boolean>('init', false);
  },

  setInit(): void {
    this.setRaw('init', true);
  },

  // --- GitHub config ---
  getGhUser(): string { return this.getRaw<string>('ghUser', 'cezar-moreira'); },
  setGhUser(v: string) { this.setRaw('ghUser', v); },
  getGhToken(): string {
    return this.getRaw<string>('ghToken', '');
  },
  setGhToken(v: string) {
    this.setRaw('ghToken', v);
  },
  getGhRepo(): string { return this.getRaw<string>('ghRepo', 'razec'); },
  setGhRepo(v: string) { this.setRaw('ghRepo', v); },

  // --- Versionamento ---
  getHistorico(notaId: string): VersaoNota[] {
    return this.getRaw<VersaoNota[]>('hist_' + notaId, []);
  },
  pushHistorico(notaId: string, versao: Omit<VersaoNota, 'id' | 'notaId'>): void {
    const hist = this.getHistorico(notaId);
    hist.push({ id: crypto.randomUUID(), notaId, ...versao });
    if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
    this.setRaw('hist_' + notaId, hist);
  },

  // --- Storage usage ---
  getStorageInfo(): { usedKB: number; pct: number } {
    const used = new Blob([JSON.stringify(localStorage)]).size;
    const max = 5 * 1024 * 1024;
    return { usedKB: Math.round(used / 1024), pct: Math.min(100, Math.round(used / max * 100)) };
  },
};
