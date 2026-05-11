# Script para iniciar el servidor Spring Boot con variables de entorno
# Uso: .\start-server.ps1

# Cargar variables de entorno desde .env en AirportFront
$envFile = "..\AirportFront\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remover comillas si existen
            $value = $value -replace '^"(.*)"$', '$1'
            [Environment]::SetEnvironmentVariable($key, $value)
            Write-Host "✅ Variable establecida: $key"
        }
    }
} else {
    Write-Host "⚠️ Archivo .env no encontrado en: $envFile"
    Write-Host "Por favor, asegúrate de que AirportFront/.env contiene las siguientes variables:"
    Write-Host "STRIPE_API_KEY=sk_test_..."
    Write-Host "STRIPE_PUBLISHABLE_KEY=pk_test_..."
    exit 1
}

# Iniciar el servidor
Write-Host "`n🚀 Iniciando Spring Boot..."
& "C:\Users\loren\.maven\maven-3.9.15\bin\mvn.cmd" spring-boot:run
