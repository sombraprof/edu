# Este script constrói o projeto para produção e o serve localmente para teste.

# 1. Executa o build de produção
Write-Host "📦  Gerando build de produção (npm run build)..."
npm run build

# 2. Navega para o diretório de distribuição
Set-Location -Path "dist"

# 3. Cria uma junção para lidar com a base path '/algi/' do Vite.
#    Isso faz o servidor local encontrar os assets no caminho correto.
if (Test-Path "algi") {
    Remove-Item "algi" -Force
}
New-Item -ItemType Junction -Path "algi" -Target "."

# 4. Inicia um servidor web local
$port = 8080
# A URL agora inclui /algi/
Write-Host "🚀 Iniciando servidor local em http://localhost:$port/algi/"
Write-Host "   Pressione Ctrl+C para parar o servidor."

# Tenta abrir o navegador na URL correta
Start-Process "http://localhost:$port/algi/"

# Inicia o servidor Python. Se não estiver instalado, sugere alternativas.
$pythonExists = (Get-Command python -ErrorAction SilentlyContinue) -or (Get-Command python3 -ErrorAction SilentlyContinue)
if (-not $pythonExists) {
    Write-Warning "Python não encontrado. Por favor, inicie um servidor na pasta 'dist'."
    Write-Host "   Exemplo com npx: npx http-server"
    Read-Host -Prompt "Pressione Enter para sair"
    exit
}

# Tenta python primeiro, depois python3
try {
    python -m http.server $port
}
catch {
    python3 -m http.server $port
}
