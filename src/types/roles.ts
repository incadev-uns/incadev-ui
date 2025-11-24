/**
 * Sistema de Roles y Permisos - INCADEV
 * Definición de roles organizados por grupos funcionales
 */

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  group: string;
  icon: string;
  color: string;
  dashboardPath?: string; // Ruta al dashboard después del login
  loginPath?: string; // Ruta a la página de login del módulo
}

export interface RoleGroup {
  id: string;
  name: string;
  description: string;
  roles: Role[];
}

/**
 * Definición completa de roles del sistema
 */
export const ROLES: Role[] = [
  // GRUPO 03 - SOPORTE Y ADMINISTRACIÓN
  {
    id: "admin",
    name: "admin",
    displayName: "Administrador",
    description: "Gestiona roles, permisos y usuarios del sistema",
    group: "support_admin",
    icon: "Shield",
    color: "text-red-600",
    dashboardPath: "/tecnologico/admin/dashboard",
    loginPath: "/tecnologico/login"
  },
  {
    id: "support",
    name: "support",
    displayName: "Soporte Técnico",
    description: "Gestiona tickets y soluciona problemas técnicos",
    group: "support_admin",
    icon: "LifeBuoy",
    color: "text-blue-600",
    dashboardPath: "/tecnologico/support/dashboard",
    loginPath: "/tecnologico/login"
  },
  {
    id: "infrastructure",
    name: "infrastructure",
    displayName: "Infraestructura",
    description: "Gestiona activos tecnológicos y control de inventario",
    group: "support_admin",
    icon: "Server",
    color: "text-purple-600",
    dashboardPath: "/tecnologico/infrastructure/dashboard",
    loginPath: "/tecnologico"
  },
  {
    id: "security",
    name: "security",
    displayName: "Seguridad",
    description: "Gestión de seguridad y encriptación de información",
    group: "support_admin",
    icon: "ShieldCheck",
    color: "text-orange-600",
    dashboardPath: "/tecnologico/security/dashboard",
    loginPath: "/tecnologico"
  },
  {
    id: "academic_analyst",
    name: "academic_analyst",
    displayName: "Analista Académico",
    description: "Análisis de notas, asistencias y predicción de deserción",
    group: "support_admin",
    icon: "BarChart3",
    color: "text-teal-600",
    dashboardPath: "/tecnologico/analyst/dashboard",
    loginPath: "/tecnologico"
  },
  {
    id: "web",
    name: "web",
    displayName: "Desarrollador Web",
    description: "Gestión del chatbot, anuncios y contenido web",
    group: "support_admin",
    icon: "Code",
    color: "text-indigo-600",
    dashboardPath: "/tecnologico/web/dashboard",
    loginPath: "/tecnologico"
  },

  // GRUPO 06 - AUDITORÍA Y ENCUESTAS
  {
    id: "survey_admin",
    name: "survey_admin",
    displayName: "Administrador de Encuestas",
    description: "Creación, gestión y análisis de encuestas",
    group: "audit_survey",
    icon: "ClipboardList",
    color: "text-green-600",
    loginPath: "/evaluacion/login"
  },
  {
    id: "audit_manager",
    name: "audit_manager",
    displayName: "Jefe de Auditores",
    description: "Supervisión de auditorías y asignación de tareas",
    group: "audit_survey",
    icon: "UserCheck",
    color: "text-yellow-600",
    loginPath: "/evaluacion/login"
  },
  {
    id: "auditor",
    name: "auditor",
    displayName: "Auditor",
    description: "Ejecución de auditorías y registro de hallazgos",
    group: "audit_survey",
    icon: "Search",
    color: "text-amber-600",
    loginPath: "/evaluacion/login"
  },

  // GRUPO QUEZADA - RECURSOS HUMANOS Y FINANZAS
  {
    id: "human_resources",
    name: "human_resources",
    displayName: "Recursos Humanos",
    description: "Gestión de personal, contratación y nóminas",
    group: "hr_finance",
    icon: "Users",
    color: "text-pink-600",
    loginPath: "/administrativo/login"
  },
  {
    id: "financial_manager",
    name: "financial_manager",
    displayName: "Gerente Financiero",
    description: "Supervisión de flujos financieros y presupuestos",
    group: "hr_finance",
    icon: "DollarSign",
    color: "text-emerald-600",
    loginPath: "/administrativo/login"
  },
  {
    id: "system_viewer",
    name: "system_viewer",
    displayName: "Visualizador del Sistema",
    description: "Acceso de solo lectura al dashboard general",
    group: "hr_finance",
    icon: "Eye",
    color: "text-gray-600",
    loginPath: "/administrativo/login"
  },
  {
    id: "enrollment_manager",
    name: "enrollment_manager",
    displayName: "Gerente de Matrículas",
    description: "Administración de matrículas y grupos académicos",
    group: "hr_finance",
    icon: "UserPlus",
    color: "text-cyan-600",
    loginPath: "/administrativo/login"
  },
  {
    id: "data_analyst",
    name: "data_analyst",
    displayName: "Analista de Datos",
    description: "Diseño de KPIs y análisis estratégico de datos",
    group: "hr_finance",
    icon: "TrendingUp",
    color: "text-violet-600",
    loginPath: "/administrativo/login"
  },

  // GRUPO HURTADO - MARKETING
  {
    id: "marketing",
    name: "marketing",
    displayName: "Empleado de Marketing",
    description: "Manejo de redes sociales y creación de contenido",
    group: "marketing",
    icon: "Megaphone",
    color: "text-rose-600",
    loginPath: "/marketing/login"
  },
  {
    id: "marketing_admin",
    name: "marketing_admin",
    displayName: "Administrador de Marketing",
    description: "Administración de campañas y métricas de marketing",
    group: "marketing",
    icon: "Presentation",
    color: "text-fuchsia-600",
    loginPath: "/marketing/login"
  },

  // GRUPO VÁSQUEZ - ACADÉMICO
  {
    id: "teacher",
    name: "teacher",
    displayName: "Profesor/Docente",
    description: "Gestión de clases, materiales y evaluaciones",
    group: "academic",
    icon: "GraduationCap",
    color: "text-blue-700",
    loginPath: "/academico/login"
  },
  {
    id: "student",
    name: "student",
    displayName: "Estudiante",
    description: "Acceso a clases, materiales y calificaciones",
    group: "academic",
    icon: "BookOpen",
    color: "text-sky-600",
    loginPath: "/academico/login"
  },

  // GRUPO DE LEYTON - TUTORÍAS Y ADMINISTRACIÓN
  {
    id: "tutor",
    name: "tutor",
    displayName: "Tutor/Psicólogo",
    description: "Manejo de tutorías y apoyo psicopedagógico",
    group: "tutoring",
    icon: "Heart",
    color: "text-red-500",
    loginPath: "/soporte/login"
  },
  {
    id: "administrative_clerk",
    name: "administrative_clerk",
    displayName: "Empleado Administrativo",
    description: "Gestión de trámites y documentación administrativa",
    group: "tutoring",
    icon: "FileText",
    color: "text-slate-600",
    loginPath: "/soporte/login"
  },

  // GRUPO DE BUSTAMANTE
  {
    id: "planner_admin",
    name: "planner_admin",
    displayName: "Administrador de Planificación",
    description: "Administración de planificación estratégica",
    group: "planning",
    icon: "Calendar",
    color: "text-lime-600",
    loginPath: "/estrategico/login"
  },
  {
    id: "planner",
    name: "planner",
    displayName: "Planificador",
    description: "Ejecución de tareas de planificación",
    group: "planning",
    icon: "CalendarCheck",
    color: "text-green-700",
    loginPath: "/estrategico/login"
  },
  {
    id: "continuous_improvement",
    name: "continuous_improvement",
    displayName: "Mejora Continua",
    description: "Gestión de procesos de mejora continua",
    group: "planning",
    icon: "Repeat",
    color: "text-teal-700",
    loginPath: "/estrategico/login"
  }
];

/**
 * Grupos de roles organizados por área funcional
 */
export const ROLE_GROUPS: RoleGroup[] = [
  {
    id: "support_admin",
    name: "Soporte y Administración",
    description: "Roles relacionados con soporte técnico, administración del sistema y seguridad",
    roles: ROLES.filter(r => r.group === "support_admin")
  },
  {
    id: "audit_survey",
    name: "Auditoría y Encuestas",
    description: "Roles enfocados en auditorías internas y gestión de encuestas",
    roles: ROLES.filter(r => r.group === "audit_survey")
  },
  {
    id: "hr_finance",
    name: "Recursos Humanos y Finanzas",
    description: "Roles de gestión de personal, finanzas y análisis de datos",
    roles: ROLES.filter(r => r.group === "hr_finance")
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Roles de gestión de marketing y comunicaciones",
    roles: ROLES.filter(r => r.group === "marketing")
  },
  {
    id: "academic",
    name: "Académico",
    description: "Roles relacionados con la gestión académica y educativa",
    roles: ROLES.filter(r => r.group === "academic")
  },
  {
    id: "tutoring",
    name: "Tutorías y Administración",
    description: "Roles de apoyo académico y gestión administrativa",
    roles: ROLES.filter(r => r.group === "tutoring")
  },
  {
    id: "planning",
    name: "Planificación y Mejora Continua",
    description: "Roles de planificación estratégica y mejora de procesos",
    roles: ROLES.filter(r => r.group === "planning")
  }
];

/**
 * Obtener un rol por su ID
 */
export function getRoleById(roleId: string): Role | undefined {
  return ROLES.find(r => r.id === roleId);
}

/**
 * Obtener roles por grupo
 */
export function getRolesByGroup(groupId: string): Role[] {
  return ROLES.filter(r => r.group === groupId);
}

/**
 * Obtener un grupo de roles por su ID
 */
export function getRoleGroupById(groupId: string): RoleGroup | undefined {
  return ROLE_GROUPS.find(g => g.id === groupId);
}
