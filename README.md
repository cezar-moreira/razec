# RAZEC — Central de Projetos e Conhecimento

> Organize projetos, notas, scripts e conversas em um só lugar. Acesse de qualquer dispositivo, sem precisar de conta.

**Acesse:** [cezar-moreira.github.io/razec](https://cezar-moreira.github.io/razec/)

---

## O que é o RAZEC?

RAZEC é uma aplicação web pessoal para gestão de conhecimento e projetos. Funciona como um segundo cérebro digital — você escreve notas, organiza por projetos, adiciona tags e visualiza tudo em um mapa de conhecimento interativo estilo Obsidian.

Todos os dados ficam salvos no **localStorage do navegador** (até 5MB por dispositivo). Sem login, sem conta, sem servidor — abre e já funciona.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Dashboard** | Painel com totais de notas, projetos, scripts e conversas, além das notas recentes |
| **Projetos** | Crie projetos com nome, ícone emoji e cor. Exclua projetos pelo botão 🗑️ no card |
| **Notas** | Editor com suporte a Markdown, preview em tempo real e auto-save |
| **Excluir notas** | Botão 🗑️ no toolbar do editor e em cada card na lista de arquivos |
| **Tags** | Classifique notas com múltiplas tags; clique na tag na sidebar para filtrar |
| **Tipos de conteúdo** | nota · script · conversa · doc — cada tipo tem ícone e cor próprios no mapa |
| **Busca avançada** | Filtros por `projeto:`, `tag:`, `tipo:` e texto livre combinados |
| **Mapa de conhecimento** | Grafo interativo D3.js estilo Obsidian: zoom, arraste nós, tooltips, física ajustável |
| **Auto-fit do mapa** | O grafo se ajusta automaticamente ao tamanho da tela (funciona no celular) |
| **Abas (tabs)** | Abra múltiplas notas em abas, feche com ✕ ou Ctrl+W |
| **Atalhos de teclado** | 16 atalhos: Ctrl+N/S/F/P/U/G/W/L, Ctrl+1–5, Ctrl+Shift+P, Ctrl+/, Escape |
| **Drag & drop** | Arraste arquivos .py/.js/.html/.sql/.md/.txt para importar como notas |
| **Filtros de arquivo** | Filtre por tipo: Python, HTML, JS, SQL, Conversas, Claude, ChatGPT, Gemini, Grok |
| **Resolução de conflito** | Detecção de título duplicado com opções: substituir, manter ambas ou cancelar |
| **Sidebar inteligente** | Atalhos rápidos para Scripts e Conversas com contagem em tempo real |
| **Status bar** | Barra inferior com mensagens de feedback (salvo, erro, pronto…) |
| **i18n** | Interface em pt-BR, English e Español — alterne com Ctrl+L |
| **Navegação mobile** | Bottom navigation bar + botão FAB (+) para criar conteúdo no celular |
| **Armazenamento** | Indicador de uso localStorage (KB / 5MB) no rodapé da sidebar |
| **Export JSON** | Faça backup completo dos seus dados |

---

## Tecnologias

- **Frontend:** HTML5 + CSS3 + JavaScript puro (sem frameworks)
- **Gráfico:** [D3.js v7](https://d3js.org) via CDN — força simulada, zoom, drag
- **Armazenamento:** localStorage do navegador (5MB por origem)
- **Hospedagem:** GitHub Pages
- **Deploy:** GitHub Actions (automático ao fazer push na `main`)

---

## Arquitetura

```
RAZEC
├── razec/
│   └── index.html          # App completo (HTML + CSS + JS em um único arquivo)
├── .github/
│   └── workflows/
│       └── deploy.yml      # Pipeline CI/CD para GitHub Pages
├── README.md               # Este arquivo
└── MANUAL.md               # Manual completo de uso
```

O app inteiro vive em um único arquivo `index.html`. Sem build, sem Node.js, sem dependências locais além do D3.js via CDN.

---

## Armazenamento local

Os dados ficam no **localStorage do navegador**:

- Limite: **5MB por origem** (suficiente para milhares de notas)
- Indicador de uso visível no rodapé da sidebar esquerda
- Os dados ficam no dispositivo atual — use **Exportar JSON** para fazer backup ou migrar para outro dispositivo

---

## Atalhos de teclado

| Atalho | Ação |
|---|---|
| `Ctrl+N` | Nova nota |
| `Ctrl+S` | Salvar nota |
| `Ctrl+F` | Focar na busca |
| `Ctrl+W` | Fechar aba atual |
| `Ctrl+P` | Toggle preview Markdown |
| `Ctrl+U` | Upload de arquivo |
| `Ctrl+G` | Sincronizar GitHub |
| `Ctrl+L` | Alternar idioma (pt-BR → en → es) |
| `Ctrl+Shift+P` | Novo projeto |
| `Ctrl+1` | Dashboard |
| `Ctrl+2` | Editor |
| `Ctrl+3` | Arquivos |
| `Ctrl+4` | Mapa visual |
| `Ctrl+5` | Busca avançada |
| `Ctrl+/` | Ver todos os atalhos |
| `Escape` | Fechar modal |

---

## Tipos de conteúdo e cores no mapa

| Tipo | Ícone | Cor no mapa |
|---|---|---|
| Projeto | emoji do projeto | Azul |
| Nota | 📝 | Verde |
| Script | 💻 | Laranja |
| Conversa | 💬 | Roxo |
| Doc | 📄 | Cinza claro |

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

## Roadmap futuro

- [ ] Sincronização entre dispositivos (via GitHub Gist ou nuvem opcional)
- [ ] Login com Google (modo nuvem opcional)
- [ ] Compartilhamento de notas públicas
- [ ] Editor de rich text além de Markdown
- [ ] PWA com suporte offline completo
- [ ] Integração direta com IAs via API

---

*Desenvolvido por Cezar Moreira*
