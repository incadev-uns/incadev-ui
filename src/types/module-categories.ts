/**
 * Categorías de módulos del sistema INCADEV
 */

export interface ModuleCategory {
  id: string;
  name: string;
  description: string;
  loginPath: string;
  icon: string;
  color: string;
  gradient: string;
  roleCount: number;
}

/**
 * Definición de las 7 categorías principales del sistema
 */
export const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    id: "tecnologico",
    name: "Tecnológico",
    description: "Soporte, Infraestructura y Administración del Sistema",
    loginPath: "/auth/tecnologico",
    icon: "Server",
    color: "text-blue-600",
    gradient: "from-blue-500/20 to-blue-500/5",
    roleCount: 6
  },
  {
    id: "evaluacion",
    name: "Evaluación",
    description: "Auditoría y Gestión de Encuestas",
    loginPath: "/auth/evaluacion",
    icon: "ClipboardList",
    color: "text-green-600",
    gradient: "from-green-500/20 to-green-500/5",
    roleCount: 3
  },
  {
    id: "administrativo",
    name: "Administrativo",
    description: "Recursos Humanos, Finanzas y Análisis de Datos",
    loginPath: "/auth/administrativo",
    icon: "Users",
    color: "text-purple-600",
    gradient: "from-purple-500/20 to-purple-500/5",
    roleCount: 5
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Gestión de Marketing y Comunicaciones",
    loginPath: "/auth/marketing",
    icon: "Megaphone",
    color: "text-rose-600",
    gradient: "from-rose-500/20 to-rose-500/5",
    roleCount: 2
  },
  {
    id: "academico",
    name: "Académico",
    description: "Gestión Académica y Educativa",
    loginPath: "/auth/academico",
    icon: "GraduationCap",
    color: "text-sky-600",
    gradient: "from-sky-500/20 to-sky-500/5",
    roleCount: 2
  },
  {
    id: "soporte",
    name: "Soporte",
    description: "Tutorías y Administración de Documentos",
    loginPath: "/auth/soporte",
    icon: "Heart",
    color: "text-red-600",
    gradient: "from-red-500/20 to-red-500/5",
    roleCount: 2
  },
  {
    id: "estrategico",
    name: "Estratégico",
    description: "Planificación y Mejora Continua",
    loginPath: "/auth/estrategico",
    icon: "Calendar",
    color: "text-teal-600",
    gradient: "from-teal-500/20 to-teal-500/5",
    roleCount: 3
  }
];
