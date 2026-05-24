# Manual do RAZEC
### Guia completo de uso — do zero ao avançado

---

## O que é o RAZEC?

O RAZEC é sua central pessoal de projetos e conhecimento. Pense nele como um caderno digital inteligente que:

- Fica salvo na **nuvem** (não perde se trocar de computador)
- Funciona no **celular, tablet e computador**
- Organiza suas ideias em **projetos e notas**
- Conecta tudo em um **mapa visual**
- Gera **prompts prontos** para usar em IAs como ChatGPT e Claude
- Salva prompts na nuvem para reutilizá-los quando quiser

**Acesse em:** https://cezar-moreira.github.io/razec/

---

## Parte 1 — Primeiros Passos

### 1.1 Criando sua conta

1. Abra o app no navegador
2. Clique em **"Criar conta"**
3. Digite seu email e uma senha (mínimo 6 caracteres)
4. Clique no botão **"Criar conta"**
5. Pronto — você já entra automaticamente

> A mesma conta funciona em todos os seus dispositivos. Use o mesmo email e senha no celular, tablet ou outro computador.

### 1.2 Fazendo login

1. Abra o app
2. Certifique-se que a aba **"Entrar"** está selecionada
3. Digite email e senha
4. Clique em **"Entrar"**

### 1.3 Esqueci minha senha

1. Na tela de login, clique em **"Esqueci minha senha"** (abaixo do botão Entrar)
2. Digite seu email e clique em **"Enviar link de recuperação"**
3. Verifique seu email (cheque o spam também)
4. Clique no link — o app abre com o formulário de nova senha
5. Digite e confirme a nova senha → clique em **"Salvar nova senha"**

### 1.4 A tela principal

Ao entrar, você vê o menu lateral com:
- Dashboard, Projetos, Notas, Busca, Mapa, **Prompts salvos**

---

## Parte 2 — Projetos

Projetos são **pastas** que organizam suas notas.

### 2.1 Criar um projeto

1. Clique em **"Projetos"** no menu lateral
2. Clique em **"+ Novo Projeto"**
3. Preencha nome, ícone e cor
4. Clique em **"Salvar"**

### 2.2 Editar / Excluir

- Editar: clique no projeto → ícone de lápis
- Excluir: clique no projeto → ícone de lixeira → confirmar

> Excluir um projeto não exclui as notas dentro dele.

---

## Parte 3 — Notas

### 3.1 Criar uma nota

1. Clique em **"Notas"** → **"+ Nova Nota"**
2. Preencha título, tipo, projeto, tags e conteúdo (Markdown)
3. O auto-save salva automaticamente na nuvem a cada 2,5 segundos

### 3.2 Tipos de nota

nota · tarefa · referência · ideia · resumo · prompt

### 3.3 Markdown suportado

| Você digita | Resultado |
|---|---|
| `# Título` | Título grande |
| `**negrito**` | **negrito** |
| `*itálico*` | *itálico* |
| `- item` | lista com marcador |
| `1. item` | lista numerada |

---

## Parte 4 — Busca Avançada

### Filtros especiais

| Filtro | Exemplo | O que faz |
|---|---|---|
| `projeto:` | `projeto:instagram` | Filtra por projeto |
| `tag:` | `tag:marketing` | Filtra por tag |
| `tipo:` | `tipo:tarefa` | Filtra por tipo |
| texto livre | `reunião` | Busca em título e conteúdo |

Combine: `projeto:ultravida reunião` → notas do projeto com "reunião"

---

## Parte 5 — Mapa de Conhecimento

1. Clique em **"Mapa"** no menu
2. Veja todas as notas e projetos como um gráfico interativo
3. Clique em um nó para abrir a nota ou filtrar o projeto

---

## Parte 6 — Gerador de Prompts e Prompts Salvos

### 6.1 Gerando um prompt

1. Abra qualquer nota no editor
2. No painel direito, escolha o tipo:
   - 📋 Resumir esta nota
   - ☑️ Listar tarefas
   - ✨ Sugerir melhorias
   - 💻 Explicar o código
   - ❓ Perguntas de revisão
   - 📝 Expandir pontos
3. O prompt é gerado com o conteúdo da nota
4. Clique em **"📋 Copiar prompt"** e cole na IA

### 6.2 Salvando um prompt

1. Gere o prompt (passo 6.1)
2. Clique em **"💾 Salvar prompt"**
3. O prompt fica salvo na nuvem com o nome da nota como título
4. Confirmação: **"✅ Salvo!"**

### 6.3 Acessando prompts salvos

1. No menu lateral, clique em **"🤖 Prompts salvos"**
2. Veja todos os prompts salvos em cards com data
3. **"📋 Copiar"** — copia o prompt
4. **"🗑️ Excluir"** — remove o prompt

---

## Parte 7 — Dashboard

Painel inicial com: total de projetos, notas, scripts, conversas e notas recentes.

---

## Parte 8 — Dados e Backup

Todos os dados ficam no Supabase (nuvem). Para fazer backup:

1. Acesse o menu de exportação no app
2. Clique em **"Exportar JSON"**
3. Salve o arquivo em local seguro

---

## Parte 9 — Multi-dispositivos

1. Acesse `https://cezar-moreira.github.io/razec/` em qualquer dispositivo
2. Faça login com o mesmo email e senha
3. Todos os dados sincronizam automaticamente em tempo real

---

## Parte 10 — Segurança

- Senhas com hash bcrypt — nunca armazenadas em texto
- Row Level Security — cada usuário acessa apenas seus dados
- HTTPS em todas as conexões

---

## Perguntas Frequentes

**Esqueci minha senha?**
Login → "Esqueci minha senha" → informe o email → link no email → nova senha. Cheque o spam se não encontrar.

**Os prompts ficam salvos?**
Sim! Gere o prompt → "Salvar prompt" → acesse em "Prompts salvos" de qualquer dispositivo.

**Funciona sem internet?**
Não — o app precisa de conexão para carregar e salvar dados.

**Funciona no iPhone/Android?**
Sim — qualquer navegador moderno (Chrome, Safari, Firefox, Edge).

---

## Atalhos

| Ação | Como fazer |
|---|---|
| Nova nota | Botão "+ Nova Nota" |
| Salvar nota | Automático (2,5s) |
| Gerar prompt | Nota aberta → painel direito → tipo de prompt |
| Salvar prompt | Gerar → "💾 Salvar prompt" |
| Ver prompts salvos | Menu "🤖 Prompts salvos" |
| Buscar | Menu "Busca" |
| Mapa visual | Menu "Mapa" |
| Recuperar senha | Login → "Esqueci minha senha" |
| Exportar backup | Menu exportação → "Exportar JSON" |
| Sair | Botão "Sair" no topo |

---

*RAZEC — Central de Projetos e Conhecimento*
*Versão 3.1 — Prompts salvos na nuvem + Recuperação de senha*
