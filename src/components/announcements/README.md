# Sistema de Anuncios Dinámicos 🎉

Sistema completo de anuncios con diferentes tipos de visualización y animaciones sorprendentes para el landing page.

## 📋 Tipos de Anuncios

### 1. **Banner** (`item_type: "banner"`)
- **Posición**: Parte superior de la página, debajo del navbar
- **Animación**: Slide-in desde arriba con efecto shimmer
- **Características**:
  - Barra de progreso animada
  - Gradiente de fondo con imagen opcional
  - Botón de acción flotante
  - Cierre con rotación del icono

### 2. **Modal** (`item_type: "modal"`)
- **Posición**: Centro de la pantalla con backdrop
- **Animación**: Scale y rotate con blur en fondo
- **Características**:
  - Imagen de encabezado con overlay de gradiente
  - Efectos decorativos con blur
  - Botón de acción con gradiente
  - Previene scroll del body
  - Cierre al hacer clic en backdrop

### 3. **Popup** (`item_type: "popup"`)
- **Posición**: Esquina inferior derecha
- **Animación**: Bounce periódico para llamar la atención
- **Características**:
  - Borde animado con gradiente rotativo
  - Efecto shine deslizante
  - Partículas flotantes con ping
  - Ícono de sparkles animado
  - Imagen con hover zoom

## 🚀 Características

### Gestión Inteligente
- **Priorización**: Muestra anuncios según su campo `priority` (mayor número = mayor prioridad)
- **Limitación**: Solo muestra un anuncio de cada tipo simultáneamente
- **Persistencia**: Guarda anuncios cerrados en `localStorage` para no mostrarlos nuevamente
- **Scheduling**: Cada tipo aparece con un delay específico:
  - Banner: 500ms
  - Modal: 2 segundos
  - Popup: 5 segundos

### Animaciones CSS Personalizadas
- `shimmer`: Efecto de brillo deslizante
- `progress`: Barra de progreso lineal
- `shine`: Destello atravesando el componente
- `gradient-rotate`: Gradiente rotativo para bordes

## 📦 Estructura de Archivos

```
src/components/announcements/
├── AnnouncementManager.tsx   # Gestor principal
├── BannerAnnouncement.tsx    # Componente Banner
├── ModalAnnouncement.tsx     # Componente Modal
├── PopupAnnouncement.tsx     # Componente Popup
├── index.ts                  # Exportaciones
└── README.md                 # Esta documentación
```

## 🎨 Integración

El sistema se integra automáticamente en `PublicLayout.astro`:

```astro
<AnnouncementManager client:load />
```

## 🔌 API Endpoint

Obtiene anuncios desde:
```
GET http://localhost:8000/api/developer-web/announcements/list/published
```

## 📝 Formato de Datos

```typescript
interface Announcement {
  id: number
  title: string
  content: string
  image_url?: string
  item_type: "banner" | "modal" | "popup"
  status: "active" | "inactive"
  priority: number
  start_date: string
  end_date: string
  button_text?: string
  link_url?: string
  target_page?: string
}
```

## 🎯 Comportamiento

1. **Carga inicial**: El `AnnouncementManager` obtiene todos los anuncios publicados
2. **Filtrado**: Excluye anuncios previamente cerrados (guardados en localStorage)
3. **Programación**: Programa la aparición de cada anuncio según su tipo
4. **Visualización**: Muestra solo el anuncio de mayor prioridad de cada tipo
5. **Cierre**: Al cerrar, guarda el ID en localStorage y lo oculta

## 🛠️ Personalización

### Modificar delays de aparición:
```typescript
// En AnnouncementManager.tsx
const MODAL_SHOW_DELAY = 2000  // 2 segundos
const POPUP_SHOW_DELAY = 5000  // 5 segundos
```

### Limpiar anuncios cerrados:
```javascript
localStorage.removeItem('dismissed_announcements')
```

## 🎨 Estilos

Las animaciones están definidas en `src/styles/global.css` y son completamente compatibles con el sistema de temas (light/dark) de la aplicación.

## ✨ Efectos Especiales

- **Banner**: Shimmer background + Progress bar
- **Modal**: Scale + Rotate + Backdrop blur + Decorative blobs
- **Popup**: Periodic bounce + Gradient border + Shine + Floating particles + Sparkles

¡Sorprende a tus usuarios con estos anuncios espectaculares! 🚀
