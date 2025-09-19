#!/usr/bin/env bash
set -euo pipefail

# Este script constrói o projeto para produção e o serve localmente para teste.

# 1. Executa o build de produção
echo "📦  Gerando build de produção (npm run build)..."
npm run build

# 2. Prepara um diretório temporário para simular a base '/algi/'
echo "📁 Preparando diretório de teste..."
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/algi"
# Move o conteúdo de 'dist' para 'TEMP_DIR/algi'
# O 'shopt -s dotglob' garante que arquivos ocultos (como .vite) também sejam movidos.
shopt -s dotglob
mv dist/* "$TEMP_DIR/algi/"
shopt -u dotglob

# Garante que o diretório temporário seja removido ao sair
trap 'rm -rf "$TEMP_DIR"' EXIT

# 3. Navega para o diretório temporário
cd "$TEMP_DIR"

# 4. Inicia um servidor web local
PORT=8081
echo "🚀 Iniciando servidor local em http://localhost:$PORT/algi/"
echo "   Acesse o endereço acima. Pressione Ctrl+C para parar."

# Tenta abrir o navegador na URL correta
(xdg-open http://localhost:$PORT/algi/ || echo "   Abra manualmente: http://localhost:$PORT/algi/") &

# Inicia o servidor Python. Se não estiver instalado, sugere alternativas.
if ! command -v python3 &> /dev/null
then
    echo "⚠️  Python 3 não encontrado. Por favor, inicie um servidor na pasta '$TEMP_DIR'."
    echo "   Exemplo com npx: npx http-server"
    exit 1
fi
python3 -m http.server $PORT

