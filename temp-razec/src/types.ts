export type TipoNota = 'nota' | 'script' | 'conversa' | 'doc';
export type CorProjeto = 'blue' | 'green' | 'purple' | 'orange' | 'red';
export type FonteIA = 'nenhuma' | 'claude' | 'chatgpt' | 'gemini' | 'grok' | 'outro';
export type ViewName = 'dashboard' | 'editor' | 'files' | 'graph' | 'search' | 'ajuda' | 'github';
export type Idioma = 'pt-BR' | 'en' | 'es';

export interface Projeto {
  id: string;
  nome: string;
  desc: string;
  icon: string;
  cor: CorProjeto;
  criado: string;
}

export interface Nota {
  id: string;
  titulo: string;
  projeto: string;
  tipo: TipoNota;
  tags: string[];
  fonteIA: FonteIA;
  conteudo: string;
  criado: string;
  atualizado: string;
}

export interface DadosCompletos {
  projetos: Projeto[];
  notas: Nota[];
}

export const COR_PROJETO_MAP: Record<CorProjeto, string> = {
  blue: '#58a6ff',
  green: '#3fb950',
  purple: '#bc8cff',
  orange: '#ffa657',
  red: '#f85149',
};

export const TIPO_ICON: Record<TipoNota, string> = {
  nota: '📝',
  script: '💻',
  conversa: '💬',
  doc: '📄',
};

export const FONTE_ICON: Record<FonteIA, string> = {
  nenhuma: '',
  claude: '🟠',
  chatgpt: '🟢',
  gemini: '🔵',
  grok: '⚫',
  outro: '➕',
};

export interface VersaoNota {
  id: string;
  notaId: string;
  conteudo: string;
  titulo: string;
  salvoEm: string;
}
