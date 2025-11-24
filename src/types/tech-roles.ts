/**
 * Roles del Módulo Tecnológico - INCADEV
 * Grupo 03 - Soporte y Administración
 */

export interface TechRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  dashboardPath: string;
}

/**
 * Roles del módulo tecnológico
 */
export const TECH_ROLES: TechRole[] = [
  {
    id: "admin",
    name: "admin",
    displayName: "Administrador",
    description: "Gestiona roles, permisos y usuarios del sistema",
    icon: "Shield",
    color: "text-red-600",
    dashboardPath: "/tecnologico/admin/dashboard"
  },
  {
    id: "support",
    name: "support",
    displayName: "Soporte Técnico",
    description: "Gestiona tickets y soluciona problemas técnicos",
    icon: "LifeBuoy",
    color: "text-blue-600",
    dashboardPath: "/tecnologico/support/dashboard"
  },
  {
    id: "infrastructure",
    name: "infrastructure",
    displayName: "Infraestructura",
    description: "Gestiona activos tecnológicos y control de inventario",
    icon: "Server",
    color: "text-purple-600",
    dashboardPath: "/tecnologico/infrastructure/dashboard"
  },
  {
    id: "security",
    name: "security",
    displayName: "Seguridad",
    description: "Gestión de seguridad y encriptación de información",
    icon: "ShieldCheck",
    color: "text-orange-600",
    dashboardPath: "/tecnologico/security/dashboard"
  },
  {
    id: "academic_analyst",
    name: "academic_analyst",
    displayName: "Analista Académico",
    description: "Análisis de notas, asistencias y predicción de deserción",
    icon: "BarChart3",
    color: "text-teal-600",
    dashboardPath: "/tecnologico/analyst/dashboard"
  },
  {
    id: "web",
    name: "web",
    displayName: "Desarrollador Web",
    description: "Gestión del chatbot, anuncios y contenido web",
    icon: "Code",
    color: "text-indigo-600",
    dashboardPath: "/tecnologico/web/dashboard"
  }
];

/**
 * Obtener un rol por su ID
 */
export function getTechRoleById(roleId: string): TechRole | undefined {
  return TECH_ROLES.find(r => r.id === roleId);
}
