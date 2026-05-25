import type { Idioma } from '../types';
import { ptBR } from './pt-BR';
import { en } from './en';
import { es } from './es';

const TRANSLATIONS: Record<Idioma, Record<string, string>> = { 'pt-BR': ptBR, en, es };

let currentLang: Idioma = 'pt-BR';

export function setIdioma(lang: Idioma): void {
  currentLang = lang;
  localStorage.setItem('razec_lang', lang);
}

export function getIdioma(): Idioma {
  const saved = localStorage.getItem('razec_lang') as Idioma | null;
  if (saved && saved in TRANSLATIONS) return saved;
  return 'pt-BR';
}

export function t(key: string, ...args: string[]): string {
  const text = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['pt-BR']?.[key] || key;
  if (args.length === 0) return text;
  let i = 0;
  return text.replace(/\{\}/g, () => args[i++] || '');
}

export function proximoIdioma(): Idioma {
  const langs: Idioma[] = ['pt-BR', 'en', 'es'];
  const idx = langs.indexOf(currentLang);
  const next = langs[(idx + 1) % langs.length];
  setIdioma(next);
  return next;
}

export { TRANSLATIONS };
