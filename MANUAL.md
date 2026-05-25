# Manual do RAZEC
### Guia completo de uso — do zero ao avançado

**Acesse em:** https://cezar-moreira.github.io/razec/

---

## O que é o RAZEC?

O RAZEC é sua central pessoal de projetos e conhecimento. Pense nele como um caderno digital inteligente que:

- Funciona no **celular, tablet e computador**
- Organiza suas ideias em **projetos e notas**
- Salva **scripts** e **conversas com IAs**
- Conecta tudo em um **mapa visual** estilo Obsidian
- Não precisa de login — abre e já funciona

> Os dados ficam salvos no navegador que você usa (localStorage). Para levar para outro dispositivo, use **Exportar JSON**.

---

## Parte 1 — A tela principal

Ao abrir o app, você vê:

- **Topbar** (topo): logo, barra de busca global, seletor de idioma, botões de ação e GitHub
- **Sidebar** (esquerda): menu de navegação, atalhos rápidos, lista de projetos e tags, indicador de armazenamento
- **Área central**: a tela ativa (Dashboard, Editor, Arquivos, Mapa ou Busca)
- **Status bar** (rodapé): mensagens de confirmação e estado do app

### Navegação

| Seção | Descrição |
|---|---|
| 🏠 Dashboard | Painel inicial com estatísticas e notas recentes |
| ✏️ Editor | Escreva e edite notas em Markdown |
| 📁 Arquivos | Liste, filtre e gerencie todos os arquivos |
| 🕸️ Mapa visual | Grafo interativo conectando notas e projetos |
| 🔍 Busca avançada | Pesquise com filtros poderosos |
| 💻 Scripts | Atalho direto para seus scripts de código |
| 💬 Conversas | Atalho direto para conversas com IAs |

No celular: use a **barra de navegação inferior** (Início, Arquivos, Buscar, Mapa, GitHub) e o **botão + flutuante** para criar conteúdo.

---

## Parte 2 — Projetos

Projetos são pastas que organizam suas notas.

### 2.1 Criar um projeto

1. Clique em **"+ Projeto"** no topo ou pressione `Ctrl+Shift+P`
2. Preencha: nome, descrição, emoji (ícone) e cor
3. Clique em **"Criar projeto"**

### 2.2 Excluir um projeto

1. Vá ao **Dashboard**
2. Clique no botão **🗑️** no canto superior direito do card do projeto
3. Confirme na janela que aparece

> As notas do projeto **não são apagadas** — elas ficam salvas sem projeto associado.

---

## Parte 3 — Notas

### 3.1 Criar uma nota

1. Pressione `Ctrl+N` ou clique no **＋** na barra de abas
2. Preencha: título, tipo, projeto e tags
3. Clique em **"Criar"**
4. A nota abre no editor automaticamente

### 3.2 Tipos de nota

| Tipo | Ícone | Uso sugerido |
|---|---|---|
| nota | 📝 | Anotações, ideias, resumos |
| script | 💻 | Código Python, JS, HTML, SQL |
| conversa | 💬 | Conversas com IAs (Claude, ChatGPT…) |
| doc | 📄 | Documentos e referências |

### 3.3 Escrever com Markdown

| Você digita | Resultado |
|---|---|
| `# Título` | Título grande |
| `## Subtítulo` | Subtítulo |
| `**negrito**` | **negrito** |
| `*itálico*` | *itálico* |
| `` `código` `` | `código inline` |
| ` ``` ` | Bloco de código |
| `- item` | Lista com marcador |
| `1. item` | Lista numerada |
| `[[link]]` | Link entre notas |

Use o botão **👁 Preview** (ou `Ctrl+P`) para ver o resultado renderizado.

### 3.4 Auto-save

O editor salva automaticamente. Você também pode forçar com `Ctrl+S`.

### 3.5 Excluir uma nota

**Pelo editor:** clique no botão **🗑️** vermelho no toolbar → confirme.

**Pela lista de arquivos:** passe o mouse sobre o card → clique no **🗑️** que aparece no canto → confirme.

> A exclusão é permanente. Não há lixeira.

### 3.6 Abas (tabs)

Cada nota abre em uma aba separada. Para fechar: clique no **✕** da aba ou pressione `Ctrl+W`.

---

## Parte 4 — Arquivos

A tela **Arquivos** lista todas as notas e permite filtrar por tipo.

### Filtros disponíveis

| Filtro | O que mostra |
|---|---|
| Todos | Tudo |
| 🐍 Python | Scripts com tag python |
| 🌐 HTML | Scripts com tag html |
| ⚡ JavaScript | Scripts com tag js |
| 🗄️ SQL | Scripts com tag sql |
| 💬 Conversas | Notas do tipo conversa |
| 🟠 Claude | Conversas salvas do Claude |
| 🟢 ChatGPT | Conversas salvas do ChatGPT |
| 🔵 Gemini | Conversas salvas do Gemini |
| ⚫ Grok | Conversas salvas do Grok |

### Importar arquivos (Drag & Drop)

Arraste um arquivo do seu computador para a área de Arquivos. Formatos suportados: `.py`, `.js`, `.html`, `.css`, `.sql`, `.md`, `.txt`, `.json`.

---

## Parte 5 — Busca Avançada

### Filtros especiais

| Filtro | Exemplo | O que faz |
|---|---|---|
| `projeto:` | `projeto:instagram` | Filtra por projeto |
| `tag:` | `tag:marketing` | Filtra por tag |
| `tipo:` | `tipo:script` | Filtra por tipo |
| texto livre | `reunião` | Busca em título e conteúdo |

Combine filtros: `projeto:ultravida tipo:nota reunião` → notas do projeto com "reunião".

A **barra de busca global** no topo (ou `Ctrl+F`) faz busca rápida em tempo real.

---

## Parte 6 — Mapa de Conhecimento

O mapa mostra todas as notas e projetos conectados visualmente.

### Como usar

1. Clique em **🕸️ Mapa visual** no menu lateral
2. O grafo carrega e se ajusta automaticamente à tela
3. **Clique** em um nó: abre a nota ou filtra o projeto
4. **Arraste** um nó: reposiciona (a posição é salva)
5. **Scroll / pinça**: zoom in/out
6. **Arraste fundo**: mover o mapa
7. **Hover**: vê tooltip com detalhes do nó

### Controles

| Botão | Ação |
|---|---|
| ↺ Resetar | Ajusta o zoom para mostrar todos os nós |
| ⏸ Pausar | Para a simulação de física |
| ▶ Retomar | Reinicia a física |
| Filtro de projeto | Destaca nós de um projeto |
| Filtro de tipo | Mostra só um tipo de conteúdo |
| Campo de busca | Destaca nós pelo nome |

### Legenda de cores

| Cor | Tipo |
|---|---|
| 🔵 Azul | Projeto |
| 🟢 Verde | Nota |
| 🟠 Laranja | Script |
| 🟣 Roxo | Conversa |
| ⬜ Cinza | Doc |

---

## Parte 7 — Armazenamento e Backup

### Quanto espaço tenho?

O app usa o **localStorage do navegador**: **5MB por origem**. Você vê o uso no rodapé da sidebar:

```
42KB / 5MB (1%)
```

5MB é suficiente para milhares de notas. Se encher, exporte o JSON, apague notas antigas e reimporte.

### Exportar backup (JSON)

1. No menu de exportação do app, clique em **"Exportar JSON"**
2. Salve o arquivo em local seguro
3. Para restaurar: importe o arquivo pelo upload

### Usar em outro dispositivo

Os dados ficam no navegador do dispositivo atual. Para migrar:

1. **Neste dispositivo:** Exportar JSON
2. **No outro dispositivo:** Abrir o RAZEC → Upload → selecionar o arquivo exportado

---

## Parte 8 — Atalhos de Teclado

Pressione `Ctrl+/` dentro do app para ver todos os atalhos.

| Atalho | Ação |
|---|---|
| `Ctrl+N` | Nova nota |
| `Ctrl+S` | Salvar nota |
| `Ctrl+F` | Focar na busca global |
| `Ctrl+W` | Fechar aba atual |
| `Ctrl+P` | Toggle preview Markdown |
| `Ctrl+U` | Upload de arquivo |
| `Ctrl+G` | Sincronizar GitHub |
| `Ctrl+L` | Alternar idioma (pt-BR → en → es) |
| `Ctrl+Shift+P` | Novo projeto |
| `Ctrl+1` | Ir para Dashboard |
| `Ctrl+2` | Ir para Editor |
| `Ctrl+3` | Ir para Arquivos |
| `Ctrl+4` | Ir para Mapa visual |
| `Ctrl+5` | Ir para Busca avançada |
| `Ctrl+/` | Ver todos os atalhos |
| `Escape` | Fechar janela/modal aberto |

---

## Perguntas Frequentes

**Preciso criar conta?**
Não. O app abre e funciona direto no navegador. Nenhuma conta necessária.

**Meus dados ficam salvos?**
Sim, no localStorage do navegador. Se limpar os dados do navegador ou usar aba anônima, os dados se perdem. Use **Exportar JSON** para backup.

**Funciona no celular?**
Sim — qualquer navegador moderno (Chrome, Safari, Firefox, Edge). A navegação inferior e o botão + flutuante facilitam o uso mobile.

**Como apago uma nota?**
Botão 🗑️ no toolbar do editor (nota aberta) ou 🗑️ no card da lista de Arquivos. Sempre pede confirmação.

**Como apago um projeto?**
No Dashboard, clique no 🗑️ no canto do card do projeto. As notas do projeto não são apagadas.

**O mapa está muito pequeno no celular?**
Clique em **↺ Resetar** — o mapa se ajusta automaticamente à tela.

**Posso usar em mais de um idioma?**
Sim. Pressione `Ctrl+L` para alternar entre Português, English e Español.

---

*RAZEC — Central de Projetos e Conhecimento*
*Versão 4.0 — localStorage, D3.js, tabs, mobile, excluir notas/projetos*
