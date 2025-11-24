import {
  type LucideIcon,
} from "lucide-react"
import {
  IconDatabase,
  IconReport,
  IconHelp,
  IconSearch,
  IconSettings,
  IconUsersPlus,
  IconUserCheck,
  IconCircleCheck,
  IconChalkboard,
  IconChecklist,
  IconSchool,
  type Icon
} from "@tabler/icons-react"

export const routes = {
  base: "/evaluacion/",
  general: {
    login: "/auth/evaluacion",
  },
  dashboard: {
    index: "/evaluacion/encuestas",
    account: "/academico/account"
  },
  audits: {
    index: "/evaluacion/auditorias",
    reportes: "/evaluacion/auditorias/reportes",
    create: "/evaluacion/auditorias/crear",
    getById: "/evaluacion/auditorias/:id",
    update: "/evaluacion/auditorias/:id",
    delete: "/evaluacion/auditorias/:id",
    updateStatus: "/evaluacion/auditorias/:id",
    updateFinding: "/evaluacion/auditorias/:id",
    updateAction: "/evaluacion/auditorias/:id",
    updateActionStatus: "/evaluacion/auditorias/:id",
    updateFindingStatus: "/evaluacion/auditorias/:id",



  }
};

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    adminOnly?: boolean;
  }[];
  adminOnly?: boolean;
}

export interface NavSimpleItem {
  title: string;
  url: string;
  icon: Icon;
  type?: 'link' | 'search';
  allowedRoles?: string[];
}

export const siteConfig = {
  name: "INSTITUTO DE CAPACITACIÓN VIRTUAL EN EL PERÚ - PROCESOS DE EVALUACION",
  description: "Instituto de Capacitación Virtual en el Perú - Procesos Evaluación es un servicio que brinda la Universidad Nacional del Santa",
};

export const navMainCollapse: NavItem[] = [];

export const navSimpleMain: NavSimpleItem[] = [
  {
    title: "Crear Encuestas",
    url: "/evaluacion/encuestas/panel-survey",
    icon: IconUsersPlus,
    allowedRoles: ["survey_admin"]
  },
  {
    title: "Dashboard",
    url: "/evaluacion/auditorias",
    icon: IconChalkboard,
    allowedRoles: ["audit_manager", "auditor"]
  },
  {
    title: "Auditorias",
    url: "/evaluacion/auditorias/panel-audit",
    icon: IconChalkboard,
    allowedRoles: ["audit_manager", "auditor"]
  },

  {
    title: "Reportes",
    url: "/evaluacion/auditorias/reportes",
    icon: IconReport,
    allowedRoles: ["audit_manager"]
  }
];

export const navMainOptions: NavSimpleItem[] = [
  {
    title: "Configuración",
    url: "/academico/configuracion",
    icon: IconSettings,
    type: 'link'
  },
  {
    title: "Ayuda",
    url: "/academico/ayuda",
    icon: IconHelp,
    type: 'link'
  },
];