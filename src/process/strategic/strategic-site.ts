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
  IconTarget,
  IconBuilding,
  IconFileText,
  IconCalendar,
  IconTrendingUp,
  IconMap,
  type Icon
} from "@tabler/icons-react"

export const routes = {
  base: "/estrategico/",
  general: {
    login: "/estrategico/login",
  },
  dashboard: {
    index: "/estrategico/admin/dashboard",
    admin: "/estrategico/admin/dashboard",
    planning: "/estrategico/planning/dashboard",
    monitoring: "/estrategico/monitoring/dashboard",
    analysis: "/estrategico/analysis/dashboard",
    coordination: "/estrategico/coordination/dashboard",
    reporting: "/estrategico/reporting/dashboard",
  },
  admin: {
    users: "/estrategico/admin/usuarios",
    roles: "/estrategico/admin/roles",
    permissions: "/estrategico/admin/permisos",
    profile: "/estrategico/admin/perfil",
    security: {
      dashboard: "/estrategico/admin/seguridad-dashboard",
      sessions: "/estrategico/admin/sesiones",
      events: "/estrategico/admin/eventos",
    },
    management: {
      organizations: "/estrategico/admin/organizaciones",
      agreements: "/estrategico/admin/convenios",
      plans: "/estrategico/plan",
      calidad: "/estrategico/calidadeducativa",
      documents: "/estrategico/admin/documentos",
    },
  },
  planning: {
    dashboard: "/estrategico/planning/dashboard",
    strategic_plans: "/estrategico/planning/planes-estrategicos",
    objectives: "/estrategico/planning/objetivos",
    initiatives: "/estrategico/planning/iniciativas",
    roadmaps: "/estrategico/planning/roadmaps",
    profile: "/estrategico/planning/perfil",
  },
  monitoring: {
    dashboard: "/estrategico/monitoring/dashboard",
    indicators: "/estrategico/monitoring/indicadores",
    metrics: "/estrategico/monitoring/metricas",
    reports: "/estrategico/monitoring/reportes",
    alerts: "/estrategico/monitoring/alertas",
    profile: "/estrategico/monitoring/perfil",
  },
  analysis: {
    dashboard: "/estrategico/analysis/dashboard",
    swot: "/estrategico/analysis/foda",
    benchmarking: "/estrategico/analysis/benchmarking",
    risk_analysis: "/estrategico/analysis/analisis-riesgos",
    market_research: "/estrategico/analysis/investigacion-mercado",
    profile: "/estrategico/analysis/perfil",
  },
  coordination: {
    dashboard: "/estrategico/coordination/dashboard",
    meetings: "/estrategico/coordination/reuniones",
    communications: "/estrategico/conversation/list",
    collaboration: "/estrategico/conversation",
    calendar: "/estrategico/coordination/calendario",
    profile: "/estrategico/coordination/perfil",
  },
  conversation: {
    list: "/estrategico/conversation", // Tu ruta actual
    chat: "/estrategico/conversation" // Base para chats
  },
  reporting: {
    dashboard: "/estrategico/reporting/dashboard",
    executive_reports: "/estrategico/reporting/reportes-ejecutivos",
    progress_reports: "/estrategico/reporting/reportes-progreso",
    performance_reports: "/estrategico/reporting/reportes-desempeno",
    custom_reports: "/estrategico/reporting/reportes-personalizados",
    profile: "/estrategico/reporting/perfil",
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
  name: "GESTIÓN ESTRATÉGICA - ADMINISTRACIÓN",
  description: "Sistema de gestión estratégica para la Universidad Nacional del Santa",
};

export const navMainCollapse: NavItem[] = [];

export const navSimpleMain: NavSimpleItem[] = [
  {
    title: "Usuarios",
    url: "/estrategico/admin/usuarios",
    icon: IconUsers,
  },
  {
    title: "Organizaciones",
    url: "/estrategico/admin/organizaciones",
    icon: IconBuilding,
  },
  {
    title: "Convenios",
    url: "/estrategico/admin/convenios",
    icon: IconFileText,
  },
  {
    title: "Roles",
    url: "/estrategico/admin/roles",
    icon: IconShieldLock,
  },
  {
    title: "Permisos",
    url: "/estrategico/admin/permisos",
    icon: IconKey,
  },
];

export const navMainOptions: NavSimpleItem[] = [
  {
    title: "Configuración",
    url: "/estrategico/admin/configuracion",
    icon: IconSettings,
    type: 'link'
  },
  {
    title: "Ayuda",
    url: "/estrategico/admin/ayuda",
    icon: IconHelp,
    type: 'link'
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
];

export const navPlanningMain: NavSimpleItem[] = [
  {
    title: "Dashboard",
    url: "/estrategico/planning/dashboard",
    icon: IconDatabase,
  },
  {
    title: "Planes Estratégicos",
    url: "/estrategico/planning/planes-estrategicos",
    icon: IconMap,
  },
  {
    title: "Objetivos",
    url: "/estrategico/planning/objetivos",
    icon: IconTarget,
  },
  {
    title: "Iniciativas",
    url: "/estrategico/planning/iniciativas",
    icon: IconTrendingUp,
  },
];

export const navMonitoringMain: NavSimpleItem[] = [
  {
    title: "Dashboard",
    url: "/estrategico/monitoring/dashboard",
    icon: IconDatabase,
  },
  {
    title: "Indicadores",
    url: "/estrategico/monitoring/indicadores",
    icon: IconChartBar,
  },
  {
    title: "Métricas",
    url: "/estrategico/monitoring/metricas",
    icon: IconTrendingUp,
  },
  {
    title: "Alertas",
    url: "/estrategico/monitoring/alertas",
    icon: IconAlertTriangle,
  },
];

export const navCoordinationMain: NavSimpleItem[] = [
  {
    title: "Dashboard",
    url: "/estrategico/coordination/dashboard",
    icon: IconDatabase,
  },
  {
    title: "Reuniones",
    url: "/estrategico/coordination/reuniones",
    icon: IconCalendar,
  },
  {
    title: "Comunicaciones",
    url: "/estrategico/coordination/comunicaciones",
    icon: IconMessageCircle,
  },
  {
    title: "Calendario",
    url: "/estrategico/coordination/calendario",
    icon: IconCalendar,
  },
];
