import type { LucideIcon } from "lucide-react"
import {
  IconDatabase,
  IconHelp,
  IconSearch,
  IconSettings,
  IconUsers,
  IconShieldLock,
  IconKey,
  IconNews,
  IconBell,
  IconAlertTriangle,
  IconMessageCircle,
  IconRobot,
  IconChartBar,
  type Icon
} from "@tabler/icons-react"

export const routes = {
  base: "/tecnologico/",
  general: {
    login: "/tecnologico/login",
  },
  dashboard: {
    index: "/tecnologico/admin/dashboard",
    admin: "/tecnologico/admin/dashboard",
    support: "/tecnologico/support/dashboard",
    infrastructure: "/tecnologico/infrastructure/dashboard",
    security: "/tecnologico/security/dashboard",
    academic_analyst: "/tecnologico/academic_analyst/dashboard",
    web: "/tecnologico/web/dashboard",
  },
  admin: {
    users: "/tecnologico/admin/usuarios",
    roles: "/tecnologico/admin/roles",
    permissions: "/tecnologico/admin/permisos",
    profile: "/tecnologico/admin/perfil",
    security: {
      dashboard: "/tecnologico/admin/seguridad-dashboard",
      sessions: "/tecnologico/admin/sesiones",
      events: "/tecnologico/admin/eventos",
      blocks: "/tecnologico/admin/bloqueos",
      settings: "/tecnologico/admin/seguridad-configuracion",
    },
    support: {
      tickets: "/tecnologico/admin/tickets",
      createTicket: "/tecnologico/admin/crear-ticket",
    },
  },
  support: {
    dashboard: "/tecnologico/support/dashboard",
    tickets: "/tecnologico/support/tickets",
    myTickets: "/tecnologico/support/mis-tickets",
    createTicket: "/tecnologico/support/tickets/crear",
    ticketDetail: (id: number) => `/tecnologico/support/tickets/detail?id=${id}`,
    profile: "/tecnologico/support/perfil",
  },
  infrastructure: {
    dashboard: "/tecnologico/infrastructure/dashboard",
    servers: "/tecnologico/infrastructure/servidores",
    assets: "/tecnologico/infrastructure/assets",
    software: "/tecnologico/infrastructure/software",
    licenses: "/tecnologico/infrastructure/licenses",
    profile: "/tecnologico/infrastructure/perfil",
  },
  security: {
    dashboard: "/tecnologico/security/dashboard",
    incidents: "/tecnologico/security/incidentes",
    blocks: "/tecnologico/security/bloqueos",
    sessions: "/tecnologico/security/sesiones",
    events: "/tecnologico/security/eventos",
    settings: "/tecnologico/security/configuracion",
    profile: "/tecnologico/security/perfil",
  },
  academic_analyst: {
    dashboard: "/tecnologico/academic_analyst/dashboard",
    attendance: "/tecnologico/academic_analyst/asistencia",
    performance: "/tecnologico/academic_analyst/rendimiento",
    progress: "/tecnologico/academic_analyst/progreso",
    riskPrediction: "/tecnologico/academic_analyst/prediccion-riesgo",
    reports: "/tecnologico/academic_analyst/reportes",
    profile: "/tecnologico/academic_analyst/perfil",
  },
  web: {
    dashboard: "/tecnologico/web/dashboard",
    news: "/tecnologico/web/noticias_add",
    announcements: "/tecnologico/web/anuncios", 
    alerts: "/tecnologico/web/alertas",
    projects: "/tecnologico/web/proyectos",
    profile: "/tecnologico/web/perfil",
    // Nuevo módulo Chatbot
    chatbot: {
      dashboard: "/tecnologico/web/chatbot/dashboard",
      faqs: "/tecnologico/web/chatbot/faqs",
      configuracion: "/tecnologico/web/chatbot/configuracion",
      analytics: "/tecnologico/web/chatbot/analytics",
    }
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
  adminOnly?: boolean;
  type?: 'link' | 'search';
}

export const siteConfig = {
  name: "PROCESOS TECNOLÓGICOS - ADMINISTRACIÓN",
  description: "Sistema de gestión de procesos tecnológicos para la Universidad Nacional del Santa",
};

export const navMainCollapse: NavItem[] = [];

export const navSimpleMain: NavSimpleItem[] = [
  {
    title: "Usuarios",
    url: "/tecnologico/admin/usuarios",
    icon: IconUsers,
  },
  {
    title: "Roles",
    url: "/tecnologico/admin/roles",
    icon: IconShieldLock,
  },
  {
    title: "Permisos",
    url: "/tecnologico/admin/permisos",
    icon: IconKey,
  },
];

export const navMainOptions: NavSimpleItem[] = [
  {
    title: "Configuración",
    url: "/tecnologico/admin/configuracion",
    icon: IconSettings,
    type: 'link'
  },
  {
    title: "Ayuda",
    url: "/tecnologico/admin/ayuda",
    icon: IconHelp,
    type: 'link'
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
];

export const navWebMain: NavSimpleItem[] = [
  {
    title: "Dashboard",
    url: "/tecnologico/web/dashboard",
    icon: IconDatabase,
  },
  {
    title: "Noticias",
    url: "/tecnologico/web/noticias",
    icon: IconNews,
  },
  {
    title: "Anuncios",
    url: "/tecnologico/web/anuncios",
    icon: IconBell,
  },
  {
    title: "Alertas",
    url: "/tecnologico/web/alertas",
    icon: IconAlertTriangle,
  },
];

export const navChatbotMain: NavSimpleItem[] = [
  {
    title: "Dashboard Chatbot",
    url: "/tecnologico/web/chatbot/dashboard",
    icon: IconRobot,
  },
  {
    title: "FAQs",
    url: "/tecnologico/web/chatbot/faqs",
    icon: IconMessageCircle,
  },
  {
    title: "Configuración",
    url: "/tecnologico/web/chatbot/configuracion",
    icon: IconSettings,
  },
  {
    title: "Analytics",
    url: "/tecnologico/web/chatbot/analytics",
    icon: IconChartBar,
  },
];
