# Configuración de Roles por Módulo

Sistema centralizado para gestionar roles de usuario por módulo en INCADEV.

## 🚀 Uso Rápido

```typescript
// Importar roles
import { TECHNOLOGY_ROLES } from '@/config/roles/technology-roles'

// Usar en componente
{TECHNOLOGY_ROLES.map(role => (
  <RoleCard key={role.id} role={role} />
))}
```

## 📂 Archivos

- `index.ts` - Exportaciones centrales y utilidades
- `technology-roles.ts` - Roles del módulo tecnológico
- *Otros módulos se agregarán aquí*

## 🔧 Agregar Nuevo Módulo

1. Crea `{nombre}-roles.ts` siguiendo el patrón de `technology-roles.ts`
2. Exporta desde `index.ts`
3. Usa en tu módulo

## 📖 Documentación Completa

Ver [/docs/ROLES_CONFIGURATION.md](../../../docs/ROLES_CONFIGURATION.md) para:
- Guía completa de uso
- Ejemplos detallados
- Mejores prácticas
- API de utilidades

## 🏗️ Estructura de Rol

```typescript
{
  id: string              // ID único del rol
  name: string            // Nombre visible
  description: string     // Descripción breve
  icon: string            // Icono de @tabler/icons-react
  color: string           // Gradiente Tailwind
  dashboardPath?: string  // Ruta opcional del dashboard
}
```

---

**Documentación**: [ROLES_CONFIGURATION.md](../../../docs/ROLES_CONFIGURATION.md)
