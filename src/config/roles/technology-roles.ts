/**
 * @module TechnologyRoles
 * @description Configuración de roles para el módulo de Procesos Tecnológicos
 * @category Config
 */

export interface ModuleRole {
  id: string
  name: string
  description: string
  icon: string
  color: string
  dashboardPath?: string
}

/**
 * Roles disponibles para el módulo de Procesos Tecnológicos
 *
 * @remarks
 * - Cada rol tiene un ID único que debe coincidir con el backend
 * - El icon debe ser un nombre de icono válido de @tabler/icons-react
 * - El color usa clases de Tailwind para gradientes
 * - dashboardPath es opcional, si no se especifica se usa /tecnologico/{roleId}/dashboard
 */
export const TECHNOLOGY_ROLES: ModuleRole[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acceso completo al sistema",
    icon: "IconShieldCheck",
    color: "from-blue-500 to-blue-600",
    dashboardPath: "/tecnologico/admin/dashboard",
  },
  {
    id: "support",
    name: "Soporte",
    description: "Asistencia técnica y atención",
    icon: "IconLifebuoy",
    color: "from-green-500 to-green-600",
    dashboardPath: "/tecnologico/support/dashboard",
  },
  {
    id: "infrastructure",
    name: "Infraestructura",
    description: "Gestión de infraestructura TI",
    icon: "IconServer",
    color: "from-purple-500 to-purple-600",
    dashboardPath: "/tecnologico/infrastructure/dashboard",
  },
  {
    id: "academic_analyst",
    name: "Analista Académico",
    description: "Análisis y reportes académicos",
    icon: "IconChartBar",
    color: "from-orange-500 to-orange-600",
    dashboardPath: "/tecnologico/academic_analyst/dashboard",
  },
  {
    id: "web",
    name: "Desarrollo Web",
    description: "Desarrollo y mantenimiento web",
    icon: "IconCode",
    color: "from-cyan-500 to-cyan-600",
    dashboardPath: "/tecnologico/web/dashboard",
  },
]

/**
 * Mapa de iconos de @tabler/icons-react
 * Importa los iconos necesarios aquí
 */
export const TECHNOLOGY_ICON_MAP = {
  IconShieldCheck: "IconShieldCheck",
  IconLifebuoy: "IconLifebuoy",
  IconServer: "IconServer",
  IconShield: "IconShield",
  IconChartBar: "IconChartBar",
  IconCode: "IconCode",
} as const

/**
 * Metadata del módulo tecnológico
 */
export const TECHNOLOGY_MODULE_META = {
  id: "tecnologico",
  name: "Procesos Tecnológicos",
  description: "Soporte, Infraestructura y Administración del Sistema",
  loginPath: "/tecnologico/login",
  basePath: "/tecnologico",
}
