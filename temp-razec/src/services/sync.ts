import { StorageAdapter } from '../storage';
import { listarNotas } from './notes';
import { listarProjetos } from './projects';

export async function fazerSync(onProgress?: (msg: string) => void): Promise<{ success: boolean; error?: string }> {
  const user = StorageAdapter.getGhUser();
  const token = StorageAdapter.getGhToken();
  const repo = StorageAdapter.getGhRepo();
  if (!token) return { success: false, error: 'Token não configurado' };

  const notas = listarNotas();
  const projetos = listarProjetos();

  onProgress?.('Salvando backup completo...');
  const dados = { projetos, notas, atualizado: new Date().toISOString() };
  await pushToGitHub(user, token, repo, 'dados.json', btoa(unescape(encodeURIComponent(JSON.stringify(dados, null, 2)))));

  onProgress?.('Gerando README...');
  const readme = `# RAZEC — Base de Conhecimento\n\nAtualizado: ${new Date().toLocaleString('pt-BR')}\n\n## Projetos\n\n${projetos.map(p => `- ${p.icon} **${p.nome}** — ${p.desc}`).join('\n')}\n\n## Estatísticas\n\n- 📝 ${notas.length} notas\n- 📁 ${projetos.length} projetos\n`;
  await pushToGitHub(user, token, repo, 'README.md', btoa(unescape(encodeURIComponent(readme))));

  for (const proj of projetos) {
    const notasDoProjeto = notas.filter(n => n.projeto === proj.id);
    for (let i = 0; i < notasDoProjeto.length; i++) {
      const nota = notasDoProjeto[i];
      onProgress?.(`⬆ ${proj.nome}: ${nota.titulo} (${i + 1}/${notasDoProjeto.length})`);
      const path = `projetos/${proj.id}/${nota.titulo.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')}.md`;
      const content = btoa(unescape(encodeURIComponent(nota.conteudo)));
      await pushToGitHub(user, token, repo, path, content);
    }
  }

  return { success: true };
}

async function pushToGitHub(user: string, token: string, repo: string, path: string, content: string): Promise<void> {
  try {
    let sha: string | null = null;
    try {
      const check = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
        headers: { Authorization: 'token ' + token },
      });
      if (check.ok) { const d = await check.json(); sha = d.sha; }
    } catch { /* arquivo não existe */ }
    const body: Record<string, unknown> = {
      message: `chore: sync RAZEC ${new Date().toISOString()}`,
      content,
    };
    if (sha) body.sha = sha;
    await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: 'token ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) { console.error('GitHub sync error:', e); }
}

export async function pullFromGitHub(): Promise<{ success: boolean; error?: string }> {
  const user = StorageAdapter.getGhUser();
  const token = StorageAdapter.getGhToken();
  const repo = StorageAdapter.getGhRepo();
  if (!token) return { success: false, error: 'Token não configurado' };

  try {
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/dados.json`, {
      headers: { Authorization: 'token ' + token },
    });
    if (!res.ok) return { success: false, error: 'dados.json não encontrado no repositório' };
    const file = await res.json();
    const json = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));
    const dados = JSON.parse(json);
    if (dados.notas && dados.projetos) {
      StorageAdapter.saveDados({ notas: dados.notas, projetos: dados.projetos });
      return { success: true };
    }
    return { success: false, error: 'Formato inválido' };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
