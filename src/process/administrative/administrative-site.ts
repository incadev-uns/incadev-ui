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
      { title: "Estudiantes", url: "/administrativo/estudiantes" },
      { title: "Matrículas", url: "/administrativo/matriculas" },
      { title: "Historial Académico", url: "/administrativo/historial" },
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
        url: "/administrativo/academic-settings",
      },

      // Oferta educativa
      { title: "Cursos", url: "/administrativo/courses" },
      { title: "Versiones de Curso", url: "/administrativo/course-versions" },
      { title: "Módulos", url: "/administrativo/modules" },

      // Grupos
      { title: "Grupos", url: "/administrativo/groups" },
      { title: "Docentes por Grupo", url: "/administrativo/group-teachers" },

      // Control académico
      { title: "Estado de Matrículas", url: "/administrativo/enrollments" },
      {
        title: "Validación Académica",
        url: "/administrativo/payment-validation",
      },
    ],
  },

  // --------------------------------------
  // MÓDULO DE PAGOS
  // --------------------------------------
  {
    title: "Pagos",
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
      { title: "Empleados", url: "/administrativo/recursoshumanos/empleados" },
      { title: "Vacantes", url: "/administrativo/recursoshumanos/vacantes" },
      { title: "Postulantes", url: "/administrativo/recursoshumanos/postulantes" },
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
      { title: "Presupuestos", url: "/administrativo/finance/budget" },
      {
        title: "Pagos al Personal",
        url: "/administrativo/finance/staff-payments",
      },
      { title: "Reportes Contables", url: "/administrativo/finance/reports" },
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
      { title: "Documentos Administrativos", url: "/administrativo/documents" },
    ],
  },
];
