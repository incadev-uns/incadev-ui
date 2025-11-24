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
  base: "/academico/",
  general: {
    login: "/auth/academico",
    register: "/academico/register",
  },
  dashboard:{
    index: "/academico/dashboard",
    account: "/academico/account",
    surveys: "/academico/encuesta",
    tutoring: "/academico/tutoria",
    detailGroup: "/academico/grupos/informacion",
    detailTeachGroup: "/academico/grupos/detalle-teach",
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
  name: "INSTITUTO DE CAPACITACIÓN VIRTUAL EN EL PERÚ - PROCESOS ACADÉMICOS",
  description: "Instituto de Capacitación Virtual en el Perú - Procesos Académicos es un servicio que brinda la Universidad Nacional del Santa",
};

export const navMainCollapse: NavItem[] = [];

export const navSimpleMain: NavSimpleItem[] = [
  {
    title: "Grupos Disponibles",
    url: "/academico/grupos/disponible",
    icon: IconUsersPlus,
    allowedRoles: ["student"]
  },
  {
    title: "Mis Grupos Académicos", 
    url: "/academico/grupos/joined",
    icon: IconUserCheck,
    allowedRoles: ["student"]
  },
  {
    title: "Grupos Terminados",
    url: "/academico/grupos/completado",
    icon: IconCircleCheck,
    allowedRoles: ["student"]
  },
  {
    title: "Grupos Académicos",
    url: "/academico/grupos/teach", 
    icon: IconChalkboard,
    allowedRoles: ["teacher"]
  },
  {
    title: "Encuestas",
    url: "/academico/encuesta",
    icon: IconChecklist,
    allowedRoles: ["teacher"]
  },
  {
    title: "Tutorias",
    url: "/academico/tutoria",
    icon: IconSchool,
    allowedRoles: ["teacher"]
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
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
];