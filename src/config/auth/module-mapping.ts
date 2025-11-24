/**
 * Mapeo de módulos a grupos de roles
 * Este archivo mapea los IDs de módulos con sus respectivos grupos de roles
 */

import { ROLES, type Role } from "@/types/roles";
import { MODULE_CATEGORIES, type ModuleCategory } from "@/types/module-categories";

/**
 * Mapa de módulos a grupos de roles
 */
const MODULE_TO_GROUP_MAP: Record<string, string> = {
  tecnologico: "support_admin",
  evaluacion: "audit_survey",
  administrativo: "hr_finance",
  marketing: "marketing",
  academico: "academic",
  soporte: "tutoring",
  estrategico: "planning",
};

/**
 * Obtiene los roles de un módulo específico
 */
export function getRolesByModule(moduleId: string): Role[] {
  const groupId = MODULE_TO_GROUP_MAP[moduleId];
  if (!groupId) return [];

  return ROLES.filter(role => role.group === groupId);
}

/**
 * Obtiene la información del módulo por su ID
 */
export function getModuleById(moduleId: string): ModuleCategory | undefined {
  return MODULE_CATEGORIES.find(module => module.id === moduleId);
}

/**
 * Verifica si un módulo existe
 */
export function isValidModule(moduleId: string): boolean {
  return moduleId in MODULE_TO_GROUP_MAP;
}

/**
 * Obtiene todos los IDs de módulos válidos
 */
export function getAllModuleIds(): string[] {
  return Object.keys(MODULE_TO_GROUP_MAP);
}
