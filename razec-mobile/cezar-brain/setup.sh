#!/bin/bash
# RAZEC — Setup e push para GitHub
# Execute: chmod +x setup.sh && ./setup.sh

echo "⚡ RAZEC — Central de Inteligência"
echo ""

mkdir -p brain
cp frontend/index.html brain/index.html

mkdir -p projetos/ultravida/{scripts,notas,conversas}
mkdir -p projetos/clinicaos/{scripts,notas,docs}
mkdir -p projetos/paulo-jose/{composicoes,estrategia,notas}
mkdir -p projetos/instagram/{estrategias,notas}

cat > .gitignore << 'EOF'
.env
*.key
node_modules/
.DS_Store
EOF

git init
git add .
git commit -m "feat: RAZEC v1.0 — Central de Inteligência com IA"

echo ""
echo "✅ Pronto! Agora execute:"
echo ""
echo "  git remote add origin https://github.com/cezar-moreira/razec.git"
echo "  git push -u origin main"
echo ""
echo "Depois ative GitHub Pages em:"
echo "  github.com/cezar-moreira/razec/settings/pages"
echo "  Source: main / /brain"
echo ""
echo "Acesse de qualquer lugar:"
echo "  https://cezar-moreira.github.io/razec"
