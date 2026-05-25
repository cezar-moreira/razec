import type { Nota, Projeto } from './types';
import { StorageAdapter } from './storage';

export function gerarIdNota(): string {
  return 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

export function inicializarDados(): void {
  if (StorageAdapter.isInit()) return;

  const projetos: Projeto[] = [
    { id: 'ultravida', nome: 'Ultravida — Painel TV', desc: 'Sistema de chamadas Flask/SocketIO com painel LED e sala de espera', icon: '🏥', cor: 'blue', criado: new Date().toISOString() },
    { id: 'clinicaos', nome: 'ClinicaOS', desc: 'Sistema completo de gestão clínica com IA, LGPD e deploy Railway', icon: '⚕️', cor: 'green', criado: new Date().toISOString() },
    { id: 'paulojose', nome: 'Paulo José — @paulojose.missao', desc: 'Direção musical, composição Suno AI, estratégia Instagram', icon: '🎵', cor: 'purple', criado: new Date().toISOString() },
    { id: 'instagram', nome: 'Instagram Growth', desc: 'Estratégias orgânicas, Reels, Collabs, SEO de perfil', icon: '📱', cor: 'orange', criado: new Date().toISOString() },
  ];

  const notas: Nota[] = [
    {
      id: gerarIdNota(), titulo: 'Bugs Ultravida — relatórios e ticker LED', projeto: 'ultravida', tipo: 'nota',
      tags: ['bug', 'flask', 'socketio'],
      conteudo: '# Bugs em aberto — Ultravida\n\n## Bug 1: Página de relatórios\n- Não carrega ao acessar\n- Verificar rota Flask e template\n\n## Bug 2: Ticker LED (footer)\n- Funciona no monitor padrão\n- Não renderiza na TV',
      criado: new Date().toISOString(), atualizado: new Date().toISOString(), fonteIA: 'nenhuma',
    },
    {
      id: gerarIdNota(), titulo: 'ClinicaOS — Arquitetura e deploy', projeto: 'clinicaos', tipo: 'doc',
      tags: ['fastapi', 'postgresql', 'railway', 'lgpd'],
      conteudo: '# ClinicaOS — Arquitetura\n\n## Stack\n- **Backend**: FastAPI + Python 3.12\n- **Banco**: PostgreSQL (Supabase gratuito)\n- **Cache**: Redis (Upstash gratuito)',
      criado: new Date().toISOString(), atualizado: new Date().toISOString(), fonteIA: 'nenhuma',
    },
    {
      id: gerarIdNota(), titulo: 'Análise 4Medic — Engenharia reversa', projeto: 'clinicaos', tipo: 'nota',
      tags: ['analise', '4medic', 'concorrente'],
      conteudo: '# Engenharia Reversa — 4Medic\n\n## Prós\n- Transcrição IA de consultas\n- Assinatura digital CFM\n\n## Contras\n- Mobile limitado\n- Sem CRM/marketing automático',
      criado: new Date().toISOString(), atualizado: new Date().toISOString(), fonteIA: 'nenhuma',
    },
  ];

  StorageAdapter.saveDados({ projetos, notas });
  StorageAdapter.setInit();
  StorageAdapter.setGhUser('cezar-moreira');
  StorageAdapter.setGhRepo('razec');
}
