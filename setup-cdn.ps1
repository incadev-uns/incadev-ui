# Script para configurar Cloud CDN con Load Balancer
# Esto permite acceder al sitio con dominio propio y HTTPS

# Configuracion
$PROJECT_ID = "project-48be602c-d967-4478-ab6"
$BUCKET_NAME = "web-incadev"
$DOMAIN = "instituto.cetivirgendelapuerta.com"
$IP_NAME = "incadev-web-ip"
$BACKEND_BUCKET_NAME = "incadev-web-backend"
$URL_MAP_NAME = "incadev-web-url-map"
$SSL_CERT_NAME = "incadev-web-cert"
$HTTPS_PROXY_NAME = "incadev-web-https-proxy"
$FORWARDING_RULE_NAME = "incadev-web-https-rule"

Write-Host "Configurando Cloud CDN + Load Balancer para GCP..." -ForegroundColor Green
Write-Host "Proyecto: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "Bucket: $BUCKET_NAME" -ForegroundColor Cyan
Write-Host "Dominio: $DOMAIN" -ForegroundColor Cyan
Write-Host ""

# Verificar gcloud
$gcloudCmd = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudCmd) {
    Write-Host "Error: gcloud CLI no esta instalado" -ForegroundColor Red
    exit 1
}

# Configurar proyecto
gcloud config set project $PROJECT_ID

Write-Host "Paso 1: Reservando IP estatica global..." -ForegroundColor Yellow
$ipExists = gcloud compute addresses describe $IP_NAME --global 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "IP ya existe" -ForegroundColor Green
    $IP_ADDRESS = gcloud compute addresses describe $IP_NAME --global --format="get(address)"
} else {
    gcloud compute addresses create $IP_NAME --ip-version=IPV4 --global
    $IP_ADDRESS = gcloud compute addresses describe $IP_NAME --global --format="get(address)"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "IP ESTATICA RESERVADA: $IP_ADDRESS" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Configura estos registros DNS en tu proveedor:" -ForegroundColor Yellow
Write-Host "Tipo A: $DOMAIN -> $IP_ADDRESS"
Write-Host "Tipo A: www.$DOMAIN -> $IP_ADDRESS"
Write-Host ""
Read-Host "Presiona ENTER cuando hayas configurado los DNS"

Write-Host ""
Write-Host "Paso 2: Creando backend bucket..." -ForegroundColor Yellow
$backendExists = gcloud compute backend-buckets describe $BACKEND_BUCKET_NAME 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend bucket ya existe" -ForegroundColor Green
} else {
    gcloud compute backend-buckets create $BACKEND_BUCKET_NAME `
        --gcs-bucket-name=$BUCKET_NAME `
        --enable-cdn
}

Write-Host ""
Write-Host "Paso 3: Creando URL map..." -ForegroundColor Yellow
$urlMapExists = gcloud compute url-maps describe $URL_MAP_NAME 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "URL map ya existe" -ForegroundColor Green
} else {
    gcloud compute url-maps create $URL_MAP_NAME `
        --default-backend-bucket=$BACKEND_BUCKET_NAME
}

Write-Host ""
Write-Host "Paso 4: Creando certificado SSL managed..." -ForegroundColor Yellow
$certExists = gcloud compute ssl-certificates describe $SSL_CERT_NAME 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Certificado SSL ya existe" -ForegroundColor Green
    $CERT_STATUS = gcloud compute ssl-certificates describe $SSL_CERT_NAME --format="get(managed.status)"
    Write-Host "Estado del certificado: $CERT_STATUS" -ForegroundColor Cyan
} else {
    gcloud compute ssl-certificates create $SSL_CERT_NAME `
        --domains="$DOMAIN,www.$DOMAIN" `
        --global

    Write-Host ""
    Write-Host "NOTA: El certificado SSL puede tardar hasta 15-60 minutos en aprovisionarse" -ForegroundColor Yellow
    Write-Host "Puedes verificar el estado con:"
    Write-Host "gcloud compute ssl-certificates describe $SSL_CERT_NAME"
}

Write-Host ""
Write-Host "Paso 5: Creando HTTPS proxy..." -ForegroundColor Yellow
$proxyExists = gcloud compute target-https-proxies describe $HTTPS_PROXY_NAME 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "HTTPS proxy ya existe" -ForegroundColor Green
} else {
    gcloud compute target-https-proxies create $HTTPS_PROXY_NAME `
        --url-map=$URL_MAP_NAME `
        --ssl-certificates=$SSL_CERT_NAME
}

Write-Host ""
Write-Host "Paso 6: Creando forwarding rule..." -ForegroundColor Yellow
$ruleExists = gcloud compute forwarding-rules describe $FORWARDING_RULE_NAME --global 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Forwarding rule ya existe" -ForegroundColor Green
} else {
    gcloud compute forwarding-rules create $FORWARDING_RULE_NAME `
        --address=$IP_NAME `
        --global `
        --target-https-proxy=$HTTPS_PROXY_NAME `
        --ports=443
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACION COMPLETADA!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tu sitio estara disponible en:" -ForegroundColor Green
Write-Host "https://$DOMAIN"
Write-Host "https://www.$DOMAIN"
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Verifica que los registros DNS esten propagados (puede tardar hasta 48h)"
Write-Host "2. El certificado SSL puede tardar 15-60 minutos en activarse"
Write-Host "3. Una vez activo, tu sitio sera accesible via HTTPS"
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Cyan
Write-Host "- Ver estado del certificado: gcloud compute ssl-certificates describe $SSL_CERT_NAME"
Write-Host "- Invalidar cache CDN: gcloud compute url-maps invalidate-cdn-cache $URL_MAP_NAME --path=`"/*`""
Write-Host "- Ver IP: gcloud compute addresses describe $IP_NAME --global"
