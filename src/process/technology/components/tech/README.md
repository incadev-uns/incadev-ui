# Módulo Tecnológico - INCADEV

Sistema de autenticación y gestión para el módulo tecnológico (Grupo 03 - Soporte y Administración).

## Estructura del Módulo

```
src/
├── types/
│   └── tech-roles.ts          # Definición de roles del módulo
├── components/
│   └── tech/
│       ├── TechAuth.tsx        # Componente principal de autenticación
│       ├── TechRoleSelector.tsx # Selector de roles (6 roles)
│       ├── TechLoginForm.tsx   # Formulario de login
│       └── index.ts            # Exports
├── layouts/
│   └── TechDashboardLayout.astro # Layout para dashboards
└── pages/
    └── tecnologico/
        ├── index.astro         # Página de login
        └── admin/
            └── dashboard.astro # Dashboard del administrador
```

## Roles del Módulo

El módulo tecnológico gestiona 6 roles específicos:

### 1. **admin** (Administrador)
- **Descripción**: Gestiona roles, permisos y usuarios del sistema
- **Dashboard**: `/tecnologico/admin/dashboard`
- **Permisos**: CRUD completo de usuarios, gestión de roles y permisos

### 2. **support** (Soporte Técnico)
- **Descripción**: Gestiona tickets y soluciona problemas técnicos
- **Dashboard**: `/tecnologico/support/dashboard`
- **Permisos**: Gestión de tickets, solución de problemas, atención a usuarios

### 3. **infrastructure** (Infraestructura)
- **Descripción**: Gestiona activos tecnológicos y control de inventario
- **Dashboard**: `/tecnologico/infrastructure/dashboard`
- **Permisos**: CRUD de activos tecnológicos, administración de hardware, control de inventario

### 4. **security** (Seguridad)
- **Descripción**: Gestión de seguridad y encriptación de información
- **Dashboard**: `/tecnologico/security/dashboard`
- **Permisos**: Gestión de seguridad de usuarios, encriptación, seguimiento de amenazas

### 5. **academic_analyst** (Analista Académico)
- **Descripción**: Análisis de notas, asistencias y predicción de deserción
- **Dashboard**: `/tecnologico/analyst/dashboard`
- **Permisos**: Análisis de datos académicos, reportes y KPIs, predicción de deserción

### 6. **web** (Desarrollador Web)
- **Descripción**: Gestión del chatbot, anuncios y contenido web
- **Dashboard**: `/tecnologico/web/dashboard`
- **Permisos**: Gestión del chatbot, administración de anuncios, contenido del landing page

## Flujo de Autenticación

1. Usuario accede a `/tecnologico`
2. Se muestra el selector de roles con los 6 roles disponibles
3. Usuario selecciona un rol
4. Se muestra el formulario de login específico del rol
5. Usuario ingresa credenciales (email + password)
6. Sistema valida y redirige al dashboard correspondiente

## Componentes

### TechAuth
Componente principal que maneja el flujo completo de autenticación.

**Características**:
- Fondo con elementos decorativos animados
- Header fijo con logo y controles
- Footer minimalista
- Gestión de estados (selector de rol vs formulario de login)

### TechRoleSelector
Interfaz de selección de roles.

**Características**:
- Búsqueda en tiempo real
- Grid responsive (1→2→3 columnas)
- Tarjetas con hover effects
- Animaciones escalonadas
- Iconos específicos para cada rol

### TechLoginForm
Formulario de inicio de sesión.

**Características**:
- Header con gradiente
- Campos de email y password
- Toggle de visibilidad de contraseña
- Checkbox "Recordar sesión"
- Estados de loading, error y success
- Validación de formulario
- Redirección automática al dashboard

## Páginas

### `/tecnologico` (Login)
Página de autenticación del módulo tecnológico.

### `/tecnologico/admin/dashboard`
Dashboard del administrador (actualmente vacío, listo para agregar funcionalidades).

## Estilos y Diseño

**Paleta de colores**:
- Fondo: Gradiente de blue-500/5, background, purple-500/5
- Elementos decorativos: Círculos difuminados animados
- Grid pattern sutil

**Componentes shadcn/ui utilizados**:
- Card, CardContent, CardHeader, CardTitle, CardDescription
- Input
- Label
- Badge
- Alert, AlertDescription

**Animaciones**:
- Elementos decorativos con pulse animation
- Tarjetas con fade-in y slide-in escalonado
- Hover effects con scale y rotate
- Transiciones suaves

## Próximos Pasos

### Desarrollo de Dashboards
Cada rol necesitará su dashboard específico:
- `/tecnologico/support/dashboard` - Gestión de tickets
- `/tecnologico/infrastructure/dashboard` - Gestión de activos
- `/tecnologico/security/dashboard` - Panel de seguridad
- `/tecnologico/analyst/dashboard` - Análisis académico
- `/tecnologico/web/dashboard` - Gestión de contenido web

### Integración con Backend
```typescript
// En TechLoginForm.tsx
const response = await fetch('/api/tech/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, role: role.id })
});

const data = await response.json();

if (data.success) {
  // Guardar token
  localStorage.setItem('tech_token', data.token);
  localStorage.setItem('tech_role', role.id);

  // Redirigir
  window.location.href = role.dashboardPath;
}
```

### Middleware de Autenticación
Proteger las rutas de dashboards:
```typescript
// middleware.ts
export function onRequest({ request, redirect }) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/tecnologico/admin/')) {
    const token = getCookie('tech_token');
    const role = getCookie('tech_role');

    if (!token || role !== 'admin') {
      return redirect('/tecnologico');
    }
  }
}
```

## Notas Técnicas

- Todos los roles usan `guard_name: 'web'`
- Los permisos siguen el formato: `{modelo}.{acción}`
- Componentes React con `"use client"`
- Compatible con Astro islands architecture
- Diseño responsive con Tailwind CSS

## URLs del Módulo

- Login: `/tecnologico`
- Dashboard Admin: `/tecnologico/admin/dashboard`
- Dashboard Support: `/tecnologico/support/dashboard` (próximamente)
- Dashboard Infrastructure: `/tecnologico/infrastructure/dashboard` (próximamente)
- Dashboard Security: `/tecnologico/security/dashboard` (próximamente)
- Dashboard Analyst: `/tecnologico/analyst/dashboard` (próximamente)
- Dashboard Web: `/tecnologico/web/dashboard` (próximamente)
