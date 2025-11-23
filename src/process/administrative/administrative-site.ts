import {
  IconChalkboard,
  IconSchool,
  IconHome2,
  IconCreditCard,
  IconChartBar,
  IconFileText,
  IconUsers,
} from "@tabler/icons-react";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon | React.ComponentType<any>;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    adminOnly?: boolean;
  }[];
  adminOnly?: boolean;
}

export const routes = {
  base: "/administrativo/",
  dashboard: {
    index: "/administrativo/dashboard",
    course: "/administrativo/course",
  },
};

export const adminNavItems: NavItem[] = [
  // --------------------------------------
  // PANEL PRINCIPAL
  // --------------------------------------
  {
    title: "Panel Principal",
    url: "#",
    icon: IconHome2,
    items: [
      { title: "Dashboard", url: "/administrativo/dashboard" },
      { title: "Indicadores", url: "/administrativo/indicadores" },
    ],
  },

  // --------------------------------------
  // GESTIÓN ACADÉMICA
  // --------------------------------------
  {
    title: "Gestión Académica",
    url: "#",
    icon: IconSchool,
    items: [
      { title: "Estudiantes", url: "/administrativo/gestion-academica/estudiantes" },
      { title: "Matrículas", url: "/administrativo/gestion-academica/matriculas" },
      { title: "Historial Académico", url: "/administrativo/gestion-academica/historial-academico" },
    ],
  },

  // --------------------------------------
  // PROCESOS ACADÉMICO–ADMINISTRATIVOS
  // --------------------------------------
  {
    title: "Procesos Académicos",
    url: "#",
    icon: IconChalkboard,
    items: [
      {
        title: "Configuración Académica",
        url: "/administrativo/procesos-academicos/config-academica",
      },

      // Oferta educativa
      { title: "Cursos", url: "/administrativo/procesos-academicos/courses" },
      { title: "Versiones de Curso", url: "/administrativo/procesos-academicos/course-versions" },
      { title: "Módulos", url: "/administrativo/procesos-academicos/modules-course" },

      // Grupos
      { title: "Grupos", url: "/administrativo/procesos-academicos/grupos" },
      { title: "Docentes por Grupo", url: "/administrativo/procesos-academicos/group-teachers" },

      // Control académico
      { title: "Estado de Matrículas", url: "/administrativo/procesos-academicos/enrollment-status" },
      //{ title: "Validación Académica", url: "/administrativo/payment-validation" },
    ],
  },

  // --------------------------------------
  // MÓDULO DE PAGOS
  // --------------------------------------
  {
    title: "Pagos Académicos",
    url: "#",
    icon: IconCreditCard,
    items: [
      { title: "Historial de Pagos", url: "/administrativo/pagos/history" },
      { title: "Validar Pagos", url: "/administrativo/pagos/approval" },
      //{ title: "Pagos Rechazados", url: "/administrativo/pagos/rejected" },
      //{ title: "Pagos en Revisión", url: "/administrativo/pagos/review" },
    ],
  },

  // --------------------------------------
  // RECURSOS HUMANOS
  // --------------------------------------
  {
    title: "Recursos Humanos",
    url: "#",
    icon: IconUsers,
    items: [
      { title: "Ofertas Laborales", url: "/administrativo/offers" },
      { title: "Postulaciones", url: "/administrativo/applications" },
      { title: "Contratos", url: "/administrativo/contracts" },
      { title: "Gastos de Nómina", url: "/administrativo/payroll-expenses" },
    ],
  },

  // --------------------------------------
  // MÓDULO FINANCIERO
  // --------------------------------------
  {
    title: "Finanzas",
    url: "#",
    icon: IconChartBar,
    items: [
      { title: "Balance General", url: "/administrativo/finanzas/balance" },
      { title: "Reportes Contables", url: "/administrativo/finanzas/reportes" },
    ],
  },

  // --------------------------------------
  // GESTIÓN DOCUMENTARIA
  // --------------------------------------
  {
    title: "Gestión Documentaria",
    url: "#",
    icon: IconFileText,
    items: [
      { title: "Documentos Administrativos", url: "/administrativo/gestion-documentaria/documentos" },
    ],
  },
];
