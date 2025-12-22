# Deploy script para GCP Cloud Storage + CDN
# Este script despliega el frontend estatico a Google Cloud Storage

# Configuracion
$PROJECT_ID = "project-48be602c-d967-4478-ab6"
$BUCKET_NAME = "web-incadev"
$REGION = "southamerica-east1"
$DIST_DIR = ".\dist"

Write-Host "Iniciando deployment a GCP..." -ForegroundColor Green
Write-Host "Proyecto: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "Bucket: $BUCKET_NAME" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host ""

# Verificar que gcloud este instalado
$gcloudCmd = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudCmd) {
    Write-Host "Error: gcloud CLI no esta instalado" -ForegroundColor Red
    Write-Host "Instalalo desde: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Verificar que el build exista
if (-not (Test-Path $DIST_DIR)) {
    Write-Host "Error: No se encontro la carpeta $DIST_DIR" -ForegroundColor Red
    Write-Host "Ejecuta 'pnpm build' primero" -ForegroundColor Yellow
    exit 1
}

# Configurar proyecto de GCP
Write-Host "Configurando proyecto GCP..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Verificar si el bucket existe
Write-Host "Verificando bucket..." -ForegroundColor Yellow
$bucketCheck = gsutil ls -b "gs://$BUCKET_NAME" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creando bucket $BUCKET_NAME..." -ForegroundColor Yellow
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION "gs://$BUCKET_NAME"

    # Configurar bucket para hosting web estatico
    Write-Host "Configurando bucket para hosting web..." -ForegroundColor Yellow
    gsutil web set -m index.html -e 404.html "gs://$BUCKET_NAME"

    # Hacer el bucket publico
    Write-Host "Configurando permisos publicos..." -ForegroundColor Yellow
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME"
}
else {
    Write-Host "Bucket ya existe" -ForegroundColor Green
}

# Subir archivos al bucket
Write-Host "Subiendo archivos a Cloud Storage..." -ForegroundColor Yellow
gsutil -m rsync -r -d $DIST_DIR "gs://$BUCKET_NAME"

# Configurar cache headers para assets
Write-Host "Configurando cache headers..." -ForegroundColor Yellow
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" "gs://$BUCKET_NAME/_astro/**" 2>$null
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "gs://$BUCKET_NAME/*.html" 2>$null

Write-Host ""
Write-Host "Deployment completado!" -ForegroundColor Green
Write-Host "URL del bucket: https://storage.googleapis.com/$BUCKET_NAME/index.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Configura Cloud CDN con un Load Balancer para mejor rendimiento"
Write-Host "2. Configura tu dominio personalizado"
Write-Host "3. Habilita HTTPS con certificado SSL"
