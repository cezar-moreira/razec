# RAZEC — Instruções para o Claude Code

## O que é o RAZEC

RAZEC é a central de projetos e conhecimento de Cezar Moreira.
Aplicação web em https://cezar-moreira.github.io/razec/ que usa localStorage
como armazenamento primário e sincroniza com este repositório via GitHub API.

## Estrutura do repositório

```
razec/
├── projetos/
│   └── {projeto-id}/
│       ├── notas/        ← notas manuais criadas no RAZEC
│       ├── scripts/      ← scripts salvos no RAZEC
│       ├── conversas/    ← conversas salvas no RAZEC
│       └── sessoes/      ← resumos de sessões do Claude Code
├── razec/
│   └── index.html        ← app completo (HTML + CSS + JS)
└── CLAUDE.md             ← este arquivo
```

## Como o Claude Code salva sessões

No projeto Ultravida existe o script `salvar_sessao.py` que:

1. Recebe o título da sessão como argumento
2. Coleta contexto do git (commits recentes, arquivos modificados)
3. Cria um arquivo markdown formatado
4. Salva via GitHub API em `projetos/ultravida/sessoes/`

Uso direto:
```bash
python salvar_sessao.py "Título da sessão"
python salvar_sessao.py "Título" --feito "O que foi feito" --falta "O que falta"
```

Via `publicar.bat` (interativo, inclui commit + push + RAZEC):
```
publicar.bat
```

## Formato padrão das notas de sessão

```markdown
# Título da Sessão

**Data:** DD/MM/YYYY às HH:MM
**Branch:** `nome-da-branch`
**Projeto:** Sistema Ultravida (Flask/Python)

## O que foi feito
Descrição do trabalho realizado.

## O que falta fazer
Próximos passos pendentes.

## Commits recentes
abc1234 feat: descrição

## Arquivos modificados
arquivo.py | 10 ++++------
```

## Path de salvamento

```
projetos/ultravida/sessoes/YYYY-MM-DD-titulo-slug.md
```

## Projetos cadastrados no RAZEC

| ID          | Projeto                              |
|-------------|--------------------------------------|
| `ultravida` | Sistema de Gestão Clínica Ultravida  |
| `instagram` | Projeto Instagram                    |
| `clinicaos` | Clínica OS                           |
| `paulo-jose`| Paulo José                           |

## Autenticação

O script usa o `gh` CLI já autenticado — sem PAT separado.
Verificar: `gh auth status`
