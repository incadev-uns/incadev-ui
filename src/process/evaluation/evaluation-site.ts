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
  dashboard:{
    index: "/evaluacion/encuestas",
    account: "/academico/account"
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
    url: "/evaluacion/crud",
    icon: IconUsersPlus,
    allowedRoles: ["survey_admin"]
  },
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