/**
 * @module ModuleRoles
 * @description Sistema centralizado de configuración de roles por módulo
 * @category Config
 *
 * @remarks
 * Este archivo sirve como punto central de acceso a todos los roles
 * de todos los módulos del sistema INCADEV.
 *
 * ## Arquitectura
 * - Cada módulo tiene su propio archivo de configuración de roles
 * - Los roles se exportan desde este archivo index para fácil acceso
 * - Mantiene la separación de responsabilidades por módulo
 */

export * from './technology-roles'

// Placeholder para futuros módulos - descomentar cuando se implementen
// export * from './evaluation-roles'
// export * from './administrative-roles'
// export * from './marketing-roles'
// export * from './academic-roles'
// export * from './support-roles'
// export * from './strategic-roles'

/**
 * Tipo genérico para roles de cualquier módulo
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
 * Configuración de módulo
 */
export interface ModuleConfig {
  id: string
  name: string
  description: string
  loginPath: string
  basePath: string
  roles: ModuleRole[]
}

/**
 * Utilidades para trabajar con roles
 */
export const RoleUtils = {
  /**
   * Obtiene un rol por su ID
   */
  findRoleById: (roles: ModuleRole[], roleId: string): ModuleRole | undefined => {
    return roles.find(role => role.id === roleId)
  },

  /**
   * Obtiene el dashboard path de un rol
   * Si no está definido, construye uno usando el formato: /{moduleBase}/{roleId}/dashboard
   */
  getDashboardPath: (role: ModuleRole, moduleBasePath: string): string => {
    return role.dashboardPath || `${moduleBasePath}/${role.id}/dashboard`
  },

  /**
   * Valida si un roleId existe en la lista de roles
   */
  isValidRole: (roles: ModuleRole[], roleId: string): boolean => {
    return roles.some(role => role.id === roleId)
  },
}
