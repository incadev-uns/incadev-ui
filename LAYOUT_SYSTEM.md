# Sistema de Layouts Unificado 🎨

## Descripción General

Todos los layouts de la aplicación ahora usan el mismo sistema de manejo de temas, lo que garantiza persistencia del tema seleccionado al navegar entre páginas.

## Layouts Disponibles

### 1. **PublicLayout** (`src/layouts/PublicLayout.astro`)
Para páginas públicas del landing y sitio web general.

**Características:**
- Navbar y Footer públicos
- AnnouncementManager integrado
- SEO completo (Open Graph, Twitter Cards)
- Sistema de temas persistente

**Uso:**
```astro
---
import PublicLayout from '@/layouts/PublicLayout.astro';
---

<PublicLayout
  robots={["index", "follow"]}
  title="Título de la página"
  description="Descripción"
  keywords={["palabra1", "palabra2"]}
  url="https://example.com"
  imageOG="/imagen.jpg"
  imagetwt="/imagen.jpg"
>
  <!-- Contenido -->
</PublicLayout>
```

### 2. **TechDashboardLayout** (`src/process/technology/layouts/TechDashboardLayout.astro`)
Para el dashboard interno de procesos tecnológicos (con sidebar y autenticación).

**Características:**
- Solo estructura HTML básica
- Sistema de temas persistente
- Sin navbar/footer (se usa el componente TechnologyLayout de React)
- GlobalIdleDetector integrado

**Uso:**
```astro
---
import TechDashboardLayout from '@/process/technology/layouts/TechDashboardLayout.astro';
import MiComponente from '@/components/MiComponente';
---

<TechDashboardLayout
  title="Dashboard | INCADEV"
  description="Panel de control"
>
  <MiComponente client:load />
</TechDashboardLayout>
```

### 3. **TechWebLayout** (`src/process/technology/layouts/TechWebLayout.astro`)
Para páginas públicas del módulo tecnológico.

**Características:**
- Navbar y Footer públicos
- AnnouncementManager integrado
- Sistema de temas persistente
- GlobalIdleDetector integrado

**Uso:**
```astro
---
import TechWebLayout from '@/process/technology/layouts/TechWebLayout.astro';
---

<TechWebLayout
  title="INCADEV Tecnológico"
  description="Plataforma educativa"
>
  <!-- Contenido -->
</TechWebLayout>
```

## Sistema de Temas Unificado 🎨

### Funcionamiento

El sistema de temas está completamente unificado y sincronizado en toda la aplicación:

1. **Lee la preferencia del usuario** desde `localStorage.theme` (valor: "light" o "dark")
2. **Aplica el tema ANTES de renderizar** el body (previene flash de contenido)
3. **Persiste automáticamente** cada cambio de tema en `localStorage`
4. **Sincroniza entre todos los layouts** - el tema se mantiene al navegar

### Componentes del Sistema

#### 1. Script de inicialización en `<head>` (todos los layouts .astro)
Ejecuta ANTES de renderizar el body para evitar flash:

```html
<script is:inline>
  const getThemePreference = () => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const isDark = getThemePreference() === 'dark';
  document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
</script>
```

#### 2. Observer de sincronización (todos los layouts .astro)
Mantiene actualizado `localStorage` cuando cambia el tema:

```html
<script is:inline>
  if (typeof localStorage !== 'undefined') {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
</script>
```

#### 3. ModeToggle Component (React)
Componente que permite cambiar el tema. Ahora GUARDA en localStorage:

- Lee el tema actual de `localStorage` al montar
- Aplica cambios a `document.documentElement`
- Guarda automáticamente en `localStorage` cada cambio
- Opciones: Light, Dark, System

### Flujo Completo del Sistema de Temas

```
1. Usuario carga página
   ↓
2. Script en <head> lee localStorage.theme
   ↓
3. Aplica clase "dark" (o la remueve) en <html>
   ↓
4. Página se renderiza con el tema correcto
   ↓
5. Usuario cambia tema con ModeToggle
   ↓
6. ModeToggle actualiza clase en <html>
   ↓
7. ModeToggle guarda en localStorage.theme
   ↓
8. Observer detecta el cambio y confirma en localStorage
   ↓
9. Usuario navega a otra página → vuelve al paso 1
```

### Beneficios

✅ **Persistencia Total**: El tema se mantiene en TODAS las páginas (landing, dashboard, admin)
✅ **Sin flash**: Se aplica antes de renderizar el contenido
✅ **Sincronización Perfecta**: Todos los layouts usan el mismo `localStorage.theme`
✅ **Respeto a preferencias**: Detecta automáticamente el tema del sistema si no hay guardado
✅ **Reactivo**: Los cambios se aplican instantáneamente sin recargar

## Componentes Compartidos

### ModeToggle
El componente `ModeToggle` (ubicado en `src/components/core/ModeToggle.tsx`) permite cambiar entre tema claro y oscuro:

```typescript
// Cambia el tema agregando/removiendo la clase 'dark' en el <html>
document.documentElement.classList.toggle('dark')
```

Este componente está integrado en:
- Navbar (PublicLayout y TechWebLayout)
- SiteHeader (TechDashboardLayout via TechnologyLayout)

## Sistema de Anuncios

Los layouts públicos (`PublicLayout` y `TechWebLayout`) incluyen el `AnnouncementManager` que muestra anuncios dinámicos según su tipo:

- **Banner**: Superior, con slide-in
- **Modal**: Centro, con backdrop
- **Popup**: Inferior derecha, con bounce

## Mejores Prácticas

1. **Usa el layout correcto según el contexto:**
   - Landing/web público → `PublicLayout` o `TechWebLayout`
   - Dashboard con autenticación → `TechDashboardLayout`

2. **Nunca duplicar el sistema de temas:**
   - Los layouts ya lo implementan
   - Solo usa `ModeToggle` para cambiar el tema

3. **Mantener consistencia:**
   - Todos los nuevos layouts deben incluir el script de temas
   - La estructura debe ser similar para facilitar mantenimiento

## Solución de Problemas

### El tema se resetea al navegar
- ✅ **Solucionado**: ModeToggle ahora guarda en `localStorage` + todos los layouts leen de `localStorage`

### Flash de contenido con tema incorrecto
- ✅ **Solucionado**: El script se ejecuta en el `<head>` antes de renderizar el body

### Tema no se sincroniza entre páginas
- ✅ **Solucionado**: ModeToggle + layouts + observer, todos usan `localStorage.theme`

### El tema vuelve a oscuro automáticamente
- ✅ **Solucionado**: Era porque ModeToggle no guardaba en localStorage

## Archivos Modificados

- ✅ `src/layouts/PublicLayout.astro` - Script de temas en `<head>`
- ✅ `src/process/technology/layouts/TechDashboardLayout.astro` - Script de temas en `<head>`
- ✅ `src/process/technology/layouts/TechWebLayout.astro` - Script de temas en `<head>`
- ✅ `src/components/core/ModeToggle.tsx` - **AHORA GUARDA EN LOCALSTORAGE**

## Prueba el Sistema

1. Abre la landing page (`/`)
2. Cambia el tema a Light
3. Navega al dashboard (`/tecnologico/admin/dashboard`)
4. ✅ El tema se mantiene en Light
5. Navega a cualquier otra página del dashboard
6. ✅ El tema sigue siendo Light
7. Vuelve a la landing page
8. ✅ El tema aún es Light

Todos los layouts ahora tienen el sistema de temas unificado y funcionan de manera consistente. 🎉
