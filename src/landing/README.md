# Landing Page - INCADEV

Landing page modular desarrollado siguiendo las especificaciones de TechProc adaptadas al proyecto INCADEV.

## 📁 Estructura

```
src/landing/
├── LandingPage.tsx           # Componente principal que integra todas las secciones
├── sections/                 # Secciones modulares del landing
│   ├── HeroSection.tsx       # Sección hero con CTA principal
│   ├── AnnouncementsSection.tsx  # Noticias y anuncios
│   ├── ServicesSection.tsx   # Servicios principales
│   └── ContactSection.tsx    # Formulario de contacto
└── README.md                 # Este archivo
```

## 🎨 Diseño

El landing está diseñado con los colores de **shadcn/ui** usando las variables de Tailwind CSS del proyecto:

- `background` - Fondo principal
- `foreground` - Texto principal
- `primary` - Color primario (botones, enlaces)
- `secondary` - Color secundario
- `muted` - Color apagado para texto secundario
- `card` - Fondo de tarjetas
- `destructive` - Para alertas y errores

## 📝 Secciones

### 1. Hero Section

**Componente:** `HeroSection.tsx`

Características:
- Título impactante con gradiente en "INCADEV"
- Descripción breve del servicio
- 2 botones CTA: "Explorar Cursos" y "Registrarse Gratis"
- Ilustración/mockup en desktop (oculto en mobile)
- Badge de "Nuevos Cursos Disponibles"
- Diseño responsive con grid 2 columnas en desktop

### 2. Announcements Section (Noticias/Anuncios)

**Componente:** `AnnouncementsSection.tsx`

Características:
- Grid de 3 columnas (responsive a 1 columna en mobile)
- Card por anuncio con:
  - Badge de tipo (news, alert, announcement)
  - Título y descripción
  - Fecha de publicación
  - Link a más información (opcional)
  - Border lateral según prioridad (high/medium/low)
- Skeleton loader mientras carga
- Hover effects (elevación y sombra)

**Tipos de anuncios:**
- `news` - Noticias (badge default)
- `alert` - Alertas (badge destructive)
- `announcement` - Anuncios (badge secondary)

**Prioridades:**
- `high` - Border rojo (destructive)
- `medium` - Border amarillo
- `low` - Border verde

### 3. Services Section (Servicios)

**Componente:** `ServicesSection.tsx`

Características:
- Grid de 3 columnas (responsive)
- 3 servicios principales:
  1. **Cursos Educativos** - Icono BookOpen (azul)
  2. **Gestión Tecnológica** - Icono Laptop (púrpura)
  3. **Soporte Técnico** - Icono LifeBuoy (verde)
- Cada card incluye:
  - Icono con gradiente de fondo
  - Título y descripción
  - Lista de 4 características (con checkmarks)
  - Botón "Conocer más"
- Hover effects (elevación, border primary)

### 4. Contact Section (Contacto)

**Componente:** `ContactSection.tsx`

Características:
- Grid 2 columnas: Info de contacto (1/3) + Formulario (2/3)
- **Información de contacto:**
  - Dirección con icono MapPin
  - Teléfono con icono Phone
  - Email con icono Mail
  - Horario con icono Clock
- **Formulario:**
  - Nombre completo *
  - Email *
  - Teléfono (opcional)
  - Categoría * (Select con 4 opciones)
  - Asunto *
  - Mensaje * (Textarea)
  - Estados: loading, success, error
  - Validación con HTML5
  - Botón con spinner al enviar

**Categorías:**
- Consulta General
- Cursos
- Soporte Técnico
- Gestión Tecnológica

### 5. Footer

**Componente:** `src/components/core/Footer.tsx` (actualizado)

Características:
- Grid 4 columnas (responsive a 1 columna)
- Secciones:
  1. Logo + descripción + redes sociales
  2. Enlaces Rápidos
  3. Servicios
  4. Legal
- Redes sociales: Facebook, Twitter, LinkedIn, Instagram
- Copyright dinámico con año actual
- Separator antes del copyright

## 🎯 Responsive Design

Breakpoints utilizados:
- `sm:` 640px - Flex direction de botones
- `md:` 768px - Grid de 2 columnas
- `lg:` 1024px - Grid completo, mostrar ilustración hero
- `xl:` 1280px - Grid de 3 columnas en servicios/anuncios

## 🚀 Integración

El landing se integra en `src/pages/index.astro` usando el layout `PublicLayout`:

```astro
---
import PublicLayout from "@/layouts/PublicLayout.astro";
import LandingPage from "@/landing/LandingPage";
---

<PublicLayout title="INCADEV - Instituto de Capacitación y Desarrollo Virtual">
  <LandingPage client:load />
</PublicLayout>
```

## 🔗 Enlaces

Links principales configurados:
- `/academico/register` - Registro de usuarios
- `/academico/grupos/disponible` - Cursos disponibles
- `/#contacto` - Scroll a sección de contacto
- `/tecnologico` - Gestión tecnológica
- `/soporte` - Soporte técnico

## 🎨 Componentes shadcn/ui utilizados

- `Button` - Botones con variantes
- `Card` - Tarjetas para servicios y anuncios
- `Input` - Campos de texto
- `Label` - Etiquetas de formulario
- `Textarea` - Área de texto
- `Select` - Selector dropdown
- `Alert` - Mensajes de estado
- `Badge` - Etiquetas de categoría
- `Skeleton` - Loading states
- `Separator` - Separador horizontal

## 🔄 Próximas mejoras

- [ ] Integrar API real para anuncios (actualmente usa datos mock)
- [ ] Conectar formulario de contacto con backend
- [ ] Agregar animaciones con framer-motion
- [ ] Implementar sección de testimonios
- [ ] Agregar sección de estadísticas
- [ ] Lazy loading de imágenes
- [ ] Optimizar SEO con meta tags específicos

## 📊 Datos Mock

Los anuncios actualmente usan datos simulados en `AnnouncementsSection.tsx`. Para conectar con el API:

```typescript
// Reemplazar el useEffect con:
useEffect(() => {
  fetch('/api/announcements?limit=3')
    .then(res => res.json())
    .then(data => {
      setAnnouncements(data.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    });
}, []);
```

El formulario de contacto también simula el envío. Para conectar con el API:

```typescript
// En handleSubmit, reemplazar con:
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
const data = await response.json();
```

---

**Última actualización:** 2025-11-09
**Desarrollado por:** Claude Code
**Basado en:** Guía TechProc Landing Page v2.0.0
