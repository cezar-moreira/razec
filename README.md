# RAZEC — Central de Projetos e Conhecimento

> Organize projetos, notas e conhecimento em um só lugar. Acesse de qualquer dispositivo com sincronização em tempo real.

**Acesse:** [cezar-moreira.github.io/razec](https://cezar-moreira.github.io/razec/)

---

## O que é o RAZEC?

RAZEC é uma aplicação web pessoal para gestão de conhecimento e projetos. Funciona como um segundo cérebro digital — você escreve notas, organiza por projetos, adiciona tags e visualiza tudo em um mapa de conhecimento interativo.

Todos os dados ficam salvos na nuvem (Supabase), então você acessa do computador, celular ou tablet com a mesma conta.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Login seguro** | Conta com email e senha, dados isolados por usuário |
| **Projetos** | Agrupe notas por projeto com ícone e cor personalizados |
| **Notas** | Editor com suporte a Markdown e preview em tempo real |
| **Tags** | Classifique notas com múltiplas tags |
| **Busca avançada** | Filtros por `projeto:`, `tag:`, `tipo:` e texto livre |
| **Mapa de conhecimento** | Visualização gráfica das conexões entre notas e projetos |
| **Gerador de Prompts IA** | 60+ templates profissionais em 10 categorias (Marketing, Tech, Negócios, Educação, Criativo, Saúde, Finanças, Projetos, Jurídico, Geral) |
| **Auto-detecção de categoria** | Detecta automaticamente a melhor categoria de prompt pelo conteúdo da nota |
| **Prompts Salvos** | Salva prompts gerados na nuvem para reutilizar a qualquer momento |
| **Sync em tempo real** | Alterações aparecem em todos os dispositivos instantaneamente |
| **Export JSON** | Faça backup completo dos seus dados |
| **Auto-save** | Salva automaticamente enquanto você digita |

---

## Tecnologias

- **Frontend:** HTML5 + CSS3 + JavaScript puro (sem frameworks)
- **Banco de dados:** [Supabase](https://supabase.com) (PostgreSQL na nuvem)
- **Autenticação:** Supabase Auth (email + senha)
- **Hospedagem:** GitHub Pages
- **Deploy:** GitHub Actions (automático ao fazer push na `main`)
- **Segurança:** Row Level Security (RLS) — cada usuário acessa apenas seus próprios dados

---

## Arquitetura

```
RAZEC
├── razec/
│   └── index.html          # App completo (HTML + CSS + JS em um arquivo)
├── .github/
│   └── workflows/
│       └── deploy.yml      # Pipeline CI/CD para GitHub Pages
├── projetos/               # Documentação de projetos individuais
├── templates/              # Templates reutilizáveis
└── README.md
```

O app inteiro vive em um único arquivo `index.html`. Sem build, sem Node.js, sem dependências locais. O Supabase JS é carregado via CDN.

---

## Banco de dados (Supabase)

Duas tabelas com Row Level Security ativado:

```sql
-- Projetos do usuário
create table projetos (
  id        text not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  nome      text not null,
  descricao text default '',
  icon      text default '📁',
  cor       text default 'blue',
  criado    timestamptz default now(),
  primary key (id, user_id)
);

-- Notas do usuário
create table notas (
  id         text primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  titulo     text not null,
  conteudo   text default '',
  tipo       text default 'nota',
  projeto_id text default '',
  tags       text[] default '{}',
  fonte_ia   text default 'nenhuma',
  criado     timestamptz default now(),
  atualizado timestamptz default now()
);
```

---

## Deploy

O deploy é automático. Basta fazer push na branch `main`:

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

O GitHub Actions detecta o push, faz o deploy do conteúdo da pasta `razec/` para o GitHub Pages e a nova versão fica disponível em minutos.

---

## Segurança

- A chave pública do Supabase (`sb_publishable_`) no frontend é segura e esperada
- A chave secreta nunca está exposta no código
- RLS garante que cada usuário só lê e escreve seus próprios dados
- GitHub Pages serve o app via HTTPS
- Senhas são gerenciadas pelo Supabase Auth (hash bcrypt)

---

## Projetos cadastrados

| Projeto | Descrição |
|---------|-----------|
| `ultravida` | Projeto Ultravida |
| `clinicaos` | Sistema para clínicas |
| `paulo-jose` | Projeto Paulo José |
| `instagram` | Gestão e estratégia Instagram |

---

## Roadmap futuro

- [ ] Login com Google
- [ ] Compartilhamento de notas públicas
- [ ] Modo multi-usuário / equipes
- [ ] App mobile nativo (PWA)
- [ ] Editor de rich text (além de Markdown)
- [ ] Integração direta com IAs (via backend seguro)

---

*Desenvolvido por Cezar Moreira*
