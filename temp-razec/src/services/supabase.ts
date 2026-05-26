import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import type { Nota, Projeto } from '../types';
import { StorageAdapter } from '../storage';

const SURL = 'https://ryolqzqcbwwtuaagorvr.supabase.co';
const SKEY = 'sb_publishable_iGLysHT8cw_fhWGa50ljhA_LPnfyCRr';

export const sb = createClient(SURL, SKEY);

let _userId: string | null = null;
let _channel: RealtimeChannel | null = null;
let _onUpdate: (() => void) | null = null;

export function isLoggedIn(): boolean { return !!_userId; }
export function getUserId(): string | null { return _userId; }

export async function initAuth(
  onLogin: (email: string) => Promise<void>,
  onLogout: () => void
): Promise<void> {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    _userId = session.user.id;
    await onLogin(session.user.email ?? '');
  } else {
    onLogout();
  }

  sb.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      _userId = session.user.id;
      await onLogin(session.user.email ?? '');
    } else {
      _userId = null;
      _channel?.unsubscribe();
      onLogout();
    }
  });
}

export async function login(email: string, password: string): Promise<string | null> {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (!error) return null;
  if (error.message.includes('Invalid login')) return 'Email ou senha incorretos.';
  if (error.message.includes('Email not confirmed')) return 'Confirme seu email antes de entrar.';
  return error.message;
}

export async function signup(email: string, password: string): Promise<string | null> {
  const { error } = await sb.auth.signUp({ email, password });
  if (!error) return null;
  if (error.message.includes('already registered')) return 'Este email já possui uma conta.';
  return error.message;
}

export async function logout(): Promise<void> {
  await sb.auth.signOut();
}

// Carrega todos os dados do Supabase e salva no localStorage
export async function carregarDoSupabase(): Promise<boolean> {
  if (!_userId) return false;
  try {
    const [{ data: projData }, { data: notasData }] = await Promise.all([
      sb.from('projetos').select('*').eq('user_id', _userId).order('criado', { ascending: true }),
      sb.from('notas').select('*').eq('user_id', _userId).order('atualizado', { ascending: false }),
    ]);
    const projetos: Projeto[] = (projData ?? []).map(r => ({
      id: r.id, nome: r.nome, desc: r.descricao ?? '',
      icon: r.icon ?? '📁', cor: r.cor ?? 'blue', criado: r.criado,
    }));
    const notas: Nota[] = (notasData ?? []).map(r => ({
      id: r.id, titulo: r.titulo, conteudo: r.conteudo ?? '',
      tipo: r.tipo ?? 'nota', projeto: r.projeto_id ?? '',
      tags: r.tags ?? [], fonteIA: r.fonte_ia ?? 'nenhuma',
      criado: r.criado, atualizado: r.atualizado,
    }));
    StorageAdapter.saveDados({ projetos, notas });
    return true;
  } catch (e) {
    console.error('[Supabase] carregarDoSupabase:', e);
    return false;
  }
}

// Sincroniza uma nota ao Supabase
export async function syncNota(nota: Nota): Promise<void> {
  if (!_userId) return;
  const { error } = await sb.from('notas').upsert({
    id: nota.id, user_id: _userId,
    titulo: nota.titulo, conteudo: nota.conteudo,
    tipo: nota.tipo, projeto_id: nota.projeto ?? '',
    tags: nota.tags ?? [], fonte_ia: nota.fonteIA ?? 'nenhuma',
    criado: nota.criado, atualizado: nota.atualizado,
  });
  if (error) console.error('[Supabase] syncNota:', error);
}

// Sincroniza um projeto ao Supabase
export async function syncProjeto(projeto: Projeto): Promise<void> {
  if (!_userId) return;
  const { error } = await sb.from('projetos').upsert({
    id: projeto.id, user_id: _userId,
    nome: projeto.nome, descricao: projeto.desc ?? '',
    icon: projeto.icon ?? '📁', cor: projeto.cor ?? 'blue',
    criado: projeto.criado,
  });
  if (error) console.error('[Supabase] syncProjeto:', error);
}

// Deleta uma nota do Supabase
export async function deleteNota(id: string): Promise<void> {
  if (!_userId) return;
  await sb.from('notas').delete().eq('id', id).eq('user_id', _userId);
}

// Deleta um projeto e suas notas do Supabase
export async function deleteProjeto(id: string): Promise<void> {
  if (!_userId) return;
  await Promise.all([
    sb.from('notas').delete().eq('projeto_id', id).eq('user_id', _userId),
    sb.from('projetos').delete().eq('id', id).eq('user_id', _userId),
  ]);
}

// Escuta mudanças em tempo real e re-carrega tudo
export function setupRealtime(onUpdate: () => void): void {
  _onUpdate = onUpdate;
  if (!_userId) return;
  _channel?.unsubscribe();
  _channel = sb.channel('razec-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notas',    filter: `user_id=eq.${_userId}` }, async () => { await carregarDoSupabase(); onUpdate(); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projetos', filter: `user_id=eq.${_userId}` }, async () => { await carregarDoSupabase(); onUpdate(); })
    .subscribe();
}
