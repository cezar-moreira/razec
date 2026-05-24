# RAZEC — Central de Inteligência 🧠

> Sistema de notas, scripts e projetos com IA integrada — acessível de qualquer lugar, seguro, sincronizado com GitHub. Desenvolvido por Cezar Moreira.

## 📁 Estrutura de pastas

```
razec/
├── projetos/
│   ├── ultravida/          # Sistema de painel de chamadas
│   │   ├── scripts/        # Código Python/Flask/HTML
│   │   ├── notas/          # Anotações e bugs
│   │   └── conversas/      # Histórico de conversas
│   ├── clinicaos/          # Sistema clínico completo
│   │   ├── scripts/
│   │   ├── notas/
│   │   └── docs/
│   ├── paulo-jose/         # Projeto musical
│   │   ├── composicoes/
│   │   ├── estrategia/
│   │   └── notas/
│   └── instagram/          # Growth e estratégia
│       ├── estrategias/
│       └── notas/
├── brain/                  # App web (roda no GitHub Pages)
│   └── index.html
├── templates/
│   ├── nota-projeto.md
│   ├── script-python.py
│   └── conversa-ia.md
└── README.md
```

## 🚀 Como usar

### GitHub Pages (grátis, acessa de qualquer lugar)
1. Fork este repositório
2. Vá em Settings → Pages → Source: main / /brain
3. Acesse: `https://cezar-moreira.github.io/razec`

### Local
```bash
open brain/index.html
```

## 🔐 Segurança
- Dados armazenados localmente (localStorage) — não vão para servidores externos
- Sincronização com GitHub via token pessoal
- Repositório privado recomendado

