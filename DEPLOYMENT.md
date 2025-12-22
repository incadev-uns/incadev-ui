# Guía de Deployment a GCP Cloud Storage + CDN

Este documento describe cómo deployar el frontend de INCADEV a Google Cloud Platform usando Cloud Storage y Cloud CDN.

## Estrategia de Migración

**Tipo:** Replatform

El build de la aplicación se migra desde el hosting actual hacia Cloud Storage y Cloud CDN, eliminando el flujo manual e inseguro de FTP (Puerto 21) por un despliegue automatizado con:
- ✅ Mayor velocidad de entrega de contenido estático
- ✅ Mayor seguridad de acceso
- ✅ CI/CD automatizado con GitHub Actions
- ✅ Escalabilidad global con CDN

## Configuración del Proyecto

### Información Básica
- **Proyecto GCP:** `project-48be602c-d967-4478-ab6`
- **Bucket:** `web-incadev`
- **Región:** `southamerica-east1` (São Paulo, Brasil)
- **Tipo de build:** Static (Astro)

## Prerequisitos

1. **Google Cloud SDK (gcloud CLI)**
   ```bash
   # Instalar desde: https://cloud.google.com/sdk/docs/install

   # Autenticarse
   gcloud auth login

   # Configurar proyecto
   gcloud config set project project-48be602c-d967-4478-ab6
   ```

2. **Node.js y pnpm**
   ```bash
   # Instalar Node.js 20+
   # Instalar pnpm
   npm install -g pnpm
   ```

## Deployment Manual

### 1. Build del proyecto
```bash
# Instalar dependencias
pnpm install

# Generar build de producción
pnpm build
```

Esto genera la carpeta `dist/` con todos los archivos estáticos.

### 2. Deploy con el script
```bash
# Dar permisos de ejecución (Linux/Mac)
chmod +x deploy-gcp.sh

# Ejecutar deployment
./deploy-gcp.sh
```

El script automáticamente:
- ✅ Crea el bucket si no existe
- ✅ Configura el bucket para hosting web
- ✅ Hace el bucket público
- ✅ Sube los archivos
- ✅ Configura cache headers optimizados

### 3. Deploy manual con gsutil
```bash
# Crear bucket (solo primera vez)
gsutil mb -p project-48be602c-d967-4478-ab6 -c STANDARD -l southamerica-east1 gs://web-incadev

# Configurar para hosting web
gsutil web set -m index.html -e 404.html gs://web-incadev

# Hacer público
gsutil iam ch allUsers:objectViewer gs://web-incadev

# Subir archivos
gsutil -m rsync -r -d dist gs://web-incadev

# Configurar cache
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" "gs://web-incadev/_astro/**"
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "gs://web-incadev/*.html"
```

## Deployment Automatizado (CI/CD)

### Configuración de GitHub Actions

El workflow `.github/workflows/deploy-gcp.yml` se ejecuta automáticamente cuando:
- Se hace push a la rama `main`
- Se ejecuta manualmente desde GitHub Actions

### Setup inicial

1. **Crear Service Account en GCP**
   ```bash
   # Crear service account
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions Deployer"

   # Dar permisos
   gcloud projects add-iam-policy-binding project-48be602c-d967-4478-ab6 \
     --member="serviceAccount:github-actions@project-48be602c-d967-4478-ab6.iam.gserviceaccount.com" \
     --role="roles/storage.admin"

   # Crear key JSON
   gcloud iam service-accounts keys create gcp-key.json \
     --iam-account=github-actions@project-48be602c-d967-4478-ab6.iam.gserviceaccount.com
   ```

2. **Configurar GitHub Secret**
   - Ve a tu repositorio en GitHub
   - Settings → Secrets and variables → Actions
   - Click en "New repository secret"
   - Nombre: `GCP_SA_KEY`
   - Valor: Contenido completo del archivo `gcp-key.json`
   - Guardar

3. **Activar GitHub Actions**
   - El workflow se ejecutará automáticamente en el próximo push a `main`

## Configurar Cloud CDN (Opcional pero Recomendado)

Para mejorar el rendimiento global con CDN:

### 1. Crear Load Balancer

```bash
# Reservar IP estática
gcloud compute addresses create web-incadev-ip \
    --ip-version=IPV4 \
    --global

# Crear backend bucket
gcloud compute backend-buckets create web-incadev-backend \
    --gcs-bucket-name=web-incadev \
    --enable-cdn

# Crear URL map
gcloud compute url-maps create web-incadev-url-map \
    --default-backend-bucket=web-incadev-backend

# Crear certificado SSL managed
gcloud compute ssl-certificates create web-incadev-cert \
    --domains=instituto.cetivirgendelapuerta.com \
    --global

# Crear HTTPS proxy
gcloud compute target-https-proxies create web-incadev-https-proxy \
    --url-map=web-incadev-url-map \
    --ssl-certificates=web-incadev-cert

# Crear forwarding rule
gcloud compute forwarding-rules create web-incadev-https-rule \
    --address=web-incadev-ip \
    --global \
    --target-https-proxy=web-incadev-https-proxy \
    --ports=443
```

### 2. Obtener la IP y configurar DNS

```bash
# Obtener la IP asignada
gcloud compute addresses describe web-incadev-ip --global
```

Configura un registro DNS tipo `A` apuntando tu dominio a esta IP.

## URLs de Acceso

- **Bucket directo:** `https://storage.googleapis.com/web-incadev/index.html`
- **Con CDN (después de configurar):** `https://instituto.cetivirgendelapuerta.com`

## Actualización de Contenido

### Deployment rápido
```bash
pnpm build
./deploy-gcp.sh
```

### Invalidar cache del CDN
```bash
gcloud compute url-maps invalidate-cdn-cache web-incadev-url-map \
    --path="/*"
```

## Monitoreo y Logs

```bash
# Ver estadísticas del bucket
gsutil du -sh gs://web-incadev

# Ver objetos en el bucket
gsutil ls -r gs://web-incadev

# Ver logs de acceso (si están habilitados)
gcloud logging read "resource.type=gcs_bucket AND resource.labels.bucket_name=web-incadev" \
    --limit 50 \
    --format json
```

## Costos Estimados

- **Cloud Storage:** ~$0.020 por GB/mes (clase STANDARD)
- **Egress (salida de datos):**
  - Primeros 1 TB: Gratis por mes
  - 1-10 TB: $0.12 por GB
- **Cloud CDN:** $0.04-0.08 por GB (dependiendo de la región)
- **Load Balancer:** ~$18/mes + $0.008 por GB procesado

**Estimado mensual:** $20-50 USD para tráfico moderado

## Troubleshooting

### Error: Bucket already exists
El nombre del bucket ya está en uso. Cambia `BUCKET_NAME` en los scripts.

### Error: Permission denied
Verifica que estés autenticado: `gcloud auth login`

### Archivos no se actualizan
Invalida el cache del CDN o espera a que expire (configura TTL más bajo).

### Error 404 en rutas
Verifica que `index.html` y `404.html` estén configurados correctamente en el bucket.

## Seguridad

- ✅ El bucket es público solo para lectura (objectViewer)
- ✅ HTTPS forzado con certificado SSL managed
- ✅ Service Account con permisos mínimos necesarios
- ✅ Secrets en GitHub Actions (no en código)

## Rollback

Para volver a una versión anterior:

```bash
# Listar versiones si el versionado está habilitado
gsutil ls -a gs://web-incadev

# O redesplegar un commit anterior
git checkout <commit-hash>
pnpm build
./deploy-gcp.sh
```

## Soporte

Para problemas o preguntas:
- Documentación GCP: https://cloud.google.com/storage/docs
- Astro Docs: https://docs.astro.build
