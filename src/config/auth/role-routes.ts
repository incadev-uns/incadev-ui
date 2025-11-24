/**
 * @module RoleRoutes
 * @description Mapa centralizado de rutas de redirección por rol para todos los módulos
 * @category Config - Authentication
 *
 * @remarks
 * Este archivo contiene las rutas de redirección post-login para TODOS los roles del sistema.
 * Cada rol tiene su propia ruta de destino independientemente del módulo.
 *
 * ## Grupos de Roles
 * - **Tecnológico (Grupo 03)**: Soporte y Administración
 * - **Evaluación (Grupo 06)**: Auditoría y Encuestas
 * - **Administrativo (Grupo Quezada)**: RRHH y Finanzas
 * - **Marketing (Grupo Hurtado)**: Marketing
 * - **Académico (Grupo Vásquez)**: Docencia y Estudiantes
 * - **Soporte (Grupo De Leyton)**: Tutorías y Administración
 * - **Estratégico (Grupo De Bustamante)**: Planificación y Mejora Continua
 */

/**
 * Mapa de rutas de redirección por rol
 *
 * @remarks
 * - La clave es el ID del rol (debe coincidir con el backend)
 * - El valor es la ruta absoluta de destino después del login
 * - Si agregas un nuevo rol, añádelo aquí con su ruta
 */
export const ROLE_ROUTES: Record<string, string> = {
  // ========================================
  // 🧩 GRUPO 03 - SOPORTE Y ADMINISTRACIÓN
  // ========================================
  admin: "/tecnologico/admin/dashboard",
  support: "/tecnologico/support/dashboard",
  infrastructure: "/tecnologico/infrastructure/dashboard",
  security: "/tecnologico/security/dashboard",
  academic_analyst: "/tecnologico/academic_analyst/dashboard",
  web: "/tecnologico/web/dashboard",

  // ========================================
  // 📋 GRUPO 06 - AUDITORÍA Y ENCUESTAS
  // ========================================
  survey_admin: "/evaluacion/encuestas",
  audit_manager: "/evaluacion/auditorias",
  auditor: "/evaluacion/auditorias",

  // ========================================
  // 💼 GRUPO QUEZADA - RECURSOS HUMANOS Y FINANZAS
  // ========================================
  human_resources: "/administrativo/human_resources/dashboard",
  financial_manager: "/administrativo/financial_manager/dashboard",
  system_viewer: "/administrativo/system_viewer/dashboard",
  enrollment_manager: "/administrativo/enrollment_manager/dashboard",
  data_analyst: "/administrativo/data_analyst/dashboard",

  // ========================================
  // 📢 GRUPO HURTADO - MARKETING
  // ========================================
  marketing: "/marketing/dashboard",
  marketing_admin: "/marketing/dashboard",

  // ========================================
  // 🎓 GRUPO VÁSQUEZ - ACADÉMICO
  // ========================================
  teacher: "/academico/dashboard",
  student: "/academico/dashboard",

  // ========================================
  // 🧠 GRUPO DE LEYTON - TUTORÍAS Y ADMINISTRACIÓN
  // ========================================
  tutor: "/soporte/tutor/dashboard",
  administrative_clerk: "/soporte/administrative_clerk/dashboard",

  // ========================================
  // ⚙️ GRUPO DE BUSTAMANTE - ESTRATÉGICO
  // ========================================
  planner_admin: "/estrategico/planner_admin/dashboard",
  planner: "/estrategico/planner/dashboard",
  // auditor: "/estrategico/auditor/dashboard", // NOTA: Comentado porque auditor ya existe en Grupo 06
  continuous_improvement: "/estrategico/continuous_improvement/dashboard",
}

/**
 * Ruta por defecto cuando el rol no se encuentra
 */
export const DEFAULT_ROUTE = "/dashboard"

/**
 * Obtiene la ruta de redirección para un rol específico
 *
 * @param role - El ID del rol
 * @returns La ruta de destino o la ruta por defecto si no se encuentra
 *
 * @example
 * ```typescript
 * const route = getRoleRoute('admin')
 * console.log(route) // '/tecnologico/admin/dashboard'
 * ```
 */
export function getRoleRoute(role: string): string {
  return ROLE_ROUTES[role] || DEFAULT_ROUTE
}

/**
 * Verifica si un rol tiene una ruta configurada
 *
 * @param role - El ID del rol
 * @returns true si el rol tiene una ruta configurada, false en caso contrario
 *
 * @example
 * ```typescript
 * const hasRoute = hasConfiguredRoute('admin')
 * console.log(hasRoute) // true
 * ```
 */
export function hasConfiguredRoute(role: string): boolean {
  return role in ROLE_ROUTES
}

/**
 * Obtiene todos los roles configurados
 *
 * @returns Array con todos los IDs de roles configurados
 *
 * @example
 * ```typescript
 * const roles = getAllConfiguredRoles()
 * console.log(roles) // ['admin', 'support', 'infrastructure', ...]
 * ```
 */
export function getAllConfiguredRoles(): string[] {
  return Object.keys(ROLE_ROUTES)
}

/**
 * Obtiene el módulo base de una ruta
 *
 * @param route - La ruta
 * @returns El nombre del módulo base o null si no se puede determinar
 *
 * @example
 * ```typescript
 * const module = getModuleFromRoute('/tecnologico/admin/dashboard')
 * console.log(module) // 'tecnologico'
 * ```
 */
export function getModuleFromRoute(route: string): string | null {
  const match = route.match(/^\/([^/]+)/)
  return match ? match[1] : null
}

/**
 * Obtiene todos los roles de un módulo específico
 *
 * @param module - El nombre del módulo (ej: 'tecnologico', 'evaluacion')
 * @returns Array de objetos con role y route para ese módulo
 *
 * @example
 * ```typescript
 * const techRoles = getRolesByModule('tecnologico')
 * console.log(techRoles)
 * // [
 * //   { role: 'admin', route: '/tecnologico/admin/dashboard' },
 * //   { role: 'support', route: '/tecnologico/support/dashboard' },
 * //   ...
 * // ]
 * ```
 */
export function getRolesByModule(module: string): Array<{ role: string; route: string }> {
  return Object.entries(ROLE_ROUTES)
    .filter(([_, route]) => route.startsWith(`/${module}/`))
    .map(([role, route]) => ({ role, route }))
}

// ========================================
// COMPATIBILIDAD CON NOMBRE ANTERIOR
// ========================================
/**
 * @deprecated Use getRoleRoute instead
 */
export const getDashboardRoute = getRoleRoute

/**
 * @deprecated Use ROLE_ROUTES instead
 */
export const DASHBOARD_ROUTES = ROLE_ROUTES

/**
 * @deprecated Use DEFAULT_ROUTE instead
 */
export const DEFAULT_DASHBOARD_ROUTE = DEFAULT_ROUTE
