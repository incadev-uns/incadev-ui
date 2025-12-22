# Script para crear Service Account para GitHub Actions

$PROJECT_ID = "project-48be602c-d967-4478-ab6"
$SA_NAME = "github-actions-deployer"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
$KEY_FILE = "gcp-key.json"

Write-Host "Configurando Service Account para GitHub Actions..." -ForegroundColor Green
Write-Host ""

gcloud config set project $PROJECT_ID

Write-Host "Paso 1: Creando Service Account..." -ForegroundColor Yellow
$saExists = gcloud iam service-accounts describe $SA_EMAIL 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Service Account ya existe" -ForegroundColor Green
} else {
    gcloud iam service-accounts create $SA_NAME `
        --display-name="GitHub Actions Deployer" `
        --description="Service account para deployment automatico desde GitHub Actions"
}

Write-Host ""
Write-Host "Paso 2: Asignando permisos..." -ForegroundColor Yellow

# Permiso para Storage
Write-Host "- Storage Admin (para subir archivos al bucket)"
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SA_EMAIL" `
    --role="roles/storage.admin" `
    --condition=None

# Permiso para Compute (para invalidar cache CDN)
Write-Host "- Compute Admin (para invalidar cache del CDN)"
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SA_EMAIL" `
    --role="roles/compute.admin" `
    --condition=None

Write-Host ""
Write-Host "Paso 3: Creando clave JSON..." -ForegroundColor Yellow

if (Test-Path $KEY_FILE) {
    Write-Host "Eliminando clave anterior..." -ForegroundColor Yellow
    Remove-Item $KEY_FILE
}

gcloud iam service-accounts keys create $KEY_FILE `
    --iam-account=$SA_EMAIL

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SERVICE ACCOUNT CREADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivo creado: $KEY_FILE" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abre el archivo $KEY_FILE y copia TODO su contenido"
Write-Host ""
Write-Host "2. Ve a tu repositorio en GitHub:"
Write-Host "   - Settings > Secrets and variables > Actions"
Write-Host "   - Click en 'New repository secret'"
Write-Host "   - Name: GCP_SA_KEY"
Write-Host "   - Value: [Pega el contenido completo del archivo JSON]"
Write-Host "   - Click 'Add secret'"
Write-Host ""
Write-Host "3. Haz push de tus cambios a GitHub"
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "- NO subas el archivo $KEY_FILE a GitHub"
Write-Host "- El archivo .gitignore ya lo excluye"
Write-Host "- Guarda el archivo en un lugar seguro como backup"
Write-Host ""

# Abrir el archivo en notepad
Write-Host "Abriendo archivo en Notepad para copiar..." -ForegroundColor Cyan
Start-Process notepad $KEY_FILE
