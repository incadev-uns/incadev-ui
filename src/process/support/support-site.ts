import {
  type Icon
} from "@tabler/icons-react"
import {
  IconSchool,
  IconSettings,
  IconHelp,
  IconSearch,
} from "@tabler/icons-react"

export const routes = {
  base: "/soporte/",
  general: {
    login: "/auth/soporte",
  },
  dashboard:{
    index: "/soporte/dashboard",
    tutoring: "/soporte/tutoria",
  }
};

export interface NavSimpleItem {
  title: string;
  url: string;
  icon: Icon;
  type?: 'link' | 'search';
  allowedRoles?: string[];
}

export const siteConfig = {
  name: "MÓDULO DE SOPORTE Y TUTORÍAS",
  description: "Gestión de tutorías y apoyo académico personalizado",
};

export const navSimpleMain: NavSimpleItem[] = [
  {
    title: "Tutorías",
    url: "/soporte/tutoria",
    icon: IconSchool,
    allowedRoles: ["tutor"]
  },
];

export const navMainOptions: NavSimpleItem[] = [
  {
    title: "Configuración",
    url: "/soporte/configuracion",
    icon: IconSettings,
    type: 'link'
  },
  {
    title: "Ayuda", 
    url: "/soporte/ayuda",
    icon: IconHelp,
    type: 'link'
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
];
