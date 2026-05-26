# RAZEC — Histórico de Decisões Técnicas

> Registro das principais decisões, mudanças e arquitetura do projeto.
> Gerado em: 2026-05-26

---

## O que é o RAZEC

**RAZEC AI** é uma central de conhecimento pessoal (PKM — Personal Knowledge Management) que roda no browser como PWA. Permite criar notas, scripts, projetos, buscar com regex, visualizar conexões em grafo D3.js e sincronizar tudo na nuvem via Supabase.

URL de produção: **https://cezar-moreira.github.io/razec/**

---

## Arquitetura Atual (v3.0)

| Camada | Tecnologia |
|---|---|
| Frontend | TypeScript + Vite |
| Estilo | CSS puro (dark theme, GitHub colors) |
| Grafo | D3.js v7 (force simulation, zoom, drag) |
| Banco de dados | **Supabase (PostgreSQL)** — primário |
| Cache offline | localStorage + LZ-String compressão |
| Auth | Supabase Auth (email + senha) |
| Realtime | Supabase Realtime subscriptions |
| Deploy | GitHub Pages via GitHub Actions |
| Testes | Vitest + Playwright (integração) |

---

## Supabase — Configuração

```
Projeto:  razec
URL:      https://ryolqzqcbwwtuaagorvr.supabase.co
Region:   AWS sa-east-1 (São Paulo)
Conta:    cezardouberin@gmail.com
```

### Schema das tabelas

```sql
create table projetos (
  id         text not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  nome       text not null,
  descricao  text default '',
  icon       text default '📁',
  cor        text default 'blue',
  criado     timestamptz default now(),
  primary key (id, user_id)
);

create table notas (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  titulo      text not null,
  conteudo    text default '',
  tipo        text default 'nota',       -- nota | script | conversa | doc
  projeto_id  text default '',
  tags        text[] default '{}',
  fonte_ia    text default 'nenhuma',    -- claude | chatgpt | gemini | grok | outro
  criado      timestamptz default now(),
  atualizado  timestamptz default now()
);

-- RLS habilitado em ambas as tabelas (cada usuário vê só seus dados)
alter table projetos enable row level security;
alter table notas    enable row level security;
```

---

## Estrutura de Arquivos

```
temp-razec/
├── src/
│   ├── app.ts                  ← entrada principal, auth + event delegation
│   ├── storage.ts              ← StorageAdapter (localStorage + LZ-String)
│   ├── types.ts                ← interfaces TypeScript
│   ├── data.ts                 ← dados de exemplo iniciais
│   ├── style.css               ← estilos globais
│   ├── components/
│   │   ├── render.ts           ← render(), showView(), showModal()
│   │   ├── editor.ts           ← editor de notas com preview Markdown
│   │   ├── graph.ts            ← grafo D3.js force simulation
│   │   └── modals.ts           ← handlers dos modais
│   ├── services/
│   │   ├── supabase.ts         ← cliente Supabase, auth, CRUD, realtime
│   │   ├── notes.ts            ← CRUD de notas (sync Supabase embutido)
│   │   ├── projects.ts         ← CRUD de projetos (sync Supabase embutido)
│   │   ├── search.ts           ← busca avançada com regex
│   │   ├── sync.ts             ← sync GitHub (backup secundário)
│   │   └── upload.ts           ← importação de arquivos
│   └── i18n/
│       └── index.ts            ← internacionalização (pt/en/es)
├── public/
│   ├── sw.js                   ← Service Worker (PWA, cache-first)
│   └── manifest.webmanifest    ← manifest PWA
├── index.html                  ← tela de auth + app shell
└── vite.config.ts              ← build config
```

---

## Decisões Técnicas Principais

### 1. Migração de arquivo único → modular TypeScript
- **Antes:** `razec/index.html` — HTML + CSS + JS em um arquivo (~2000 linhas)
- **Depois:** `temp-razec/` — TypeScript modular com Vite, testes, tipos
- **Por quê:** Manutenibilidade, TypeScript strict, tree-shaking, testes automatizados

### 2. localStorage → Supabase como banco primário
- **Antes:** Dados só no browser (5MB localStorage)
- **Depois:** PostgreSQL na nuvem com RLS por usuário
- **Por quê:** Acesso em múltiplos dispositivos, sem perda de dados ao limpar browser
- **Fallback:** localStorage ainda é usado como cache offline

### 3. Migração automática no primeiro login
- Se Supabase está vazio + localStorage tem dados → faz upload automático
- Garante que dados criados antes do Supabase não sejam perdidos
- Arquivo: `src/services/supabase.ts` → função `migrarLocalParaSupabase()`

### 4. Grafo D3.js com física (força, colisão, zoom)
- **Antes:** Canvas 2D com posições fixas (não interativo)
- **Depois:** D3.js v7 com `forceSimulation`, `forceLink`, `forceManyBody`, `forceCollide`
- Detecção de `[[wikilinks]]` no conteúdo das notas para criar arestas
- Drag, zoom, auto-fit após simulação
- Arquivo: `src/components/graph.ts`

### 5. Event delegation para toda a UI
- **Antes:** `addEventListener` por elemento (quebrava ao re-renderizar)
- **Depois:** Um único `document.addEventListener('click')` com `closest()`
- **Por quê:** Elementos gerados por `innerHTML` perdem listeners após re-render
- Arquivo: `src/app.ts` → função `setupEventDelegation()`

### 6. Token GitHub permanente (localStorage)
- **Antes:** Token no `sessionStorage` (expirava ao fechar aba)
- **Depois:** Token no `localStorage` (persiste)
- Arquivo: `src/storage.ts` → `getGhToken()` / `setGhToken()`

### 7. Botões de exclusão com hover reveal
- Projeto sidebar: botão ✕ vermelho aparece no hover
- Projeto card (Dashboard): botão 🗑 Excluir aparece no hover
- Arquivo de notas: botão 🗑 aparece no hover
- Confirmação via modal antes de excluir

---

## Fluxo de Dados

```
Usuário cria/edita nota
        ↓
StorageAdapter.saveDados()   ← localStorage (síncrono, instantâneo)
        ↓
syncNota() via Supabase      ← background async (não bloqueia UI)
        ↓
Realtime subscription        ← outros dispositivos recebem a mudança
```

---

## CI/CD — GitHub Actions

Arquivo: `.github/workflows/deploy.yml`

```yaml
# Quando push em main:
# 1. npm install (em temp-razec/)
# 2. npm run build (Vite → temp-razec/dist/)
# 3. Deploy para GitHub Pages
```

---

## PWA — Service Worker

- Cache-first para assets estáticos
- Cache name: `razec-v3`
- Funciona offline (lê do localStorage)
- Arquivo: `public/sw.js`

---

## Segurança

- **RLS ativado** no Supabase: cada usuário só acessa seus próprios dados
- **Publishable key** (não secret): seguro para expor no frontend
- **Token GitHub** armazenado em localStorage comprimido (não fica em código)
- Arquivo `Senha do banco de dados.txt` removido do git history

---

## Projetos do Usuário (dados de exemplo incluídos)

| Projeto | Descrição |
|---|---|
| Ultravida | Painel TV Flask/SocketIO com sistema de chamadas |
| ClinicaOS | FastAPI + PostgreSQL (Supabase) + Railway + LGPD |
| Paulo José | Gerenciamento de artista/músico |

---

## Commits Relevantes

| Hash | Descrição |
|---|---|
| `1a50ea0` | Migração para arquitetura modular TypeScript (v3.0) |
| `1bb4b33` | Grafo D3.js force simulation + token GitHub persistente |
| `44383ad` | Event delegation para toda navegação |
| `6140e2c` | Restaura botões excluir projetos e notas |
| `b99e6a3` | Botão ✕ na sidebar + auto-sync + backup dados.json |
| `07a368e` | Integração Supabase completa (auth, CRUD, realtime) |
| `1ebfedf` | Migração automática localStorage → Supabase no primeiro login |
