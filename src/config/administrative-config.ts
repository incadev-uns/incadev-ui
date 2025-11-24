/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

import DashboardICV from "@/process/academic/dasboard/Dashboard";

export const config = {
  //apiUrl:"https://instituto.cetivirgendelapuerta.com/administrativo/backend/public",
  apiUrl:  "http://127.0.0.1:8000",
  environment:  "development",
  endpoints: {
    //dashboard
    dashboard: "/api/dashboard/data",
    export_pdf: "/api/dashboard/export-data",

    //procesos academicos
    teacherGroups: "/api/academic-processes/teacher-groups",
    assignTeacher: "/api/academic-processes/teacher-groups/assign",
    removeTeacher: "/api/academic-processes/teacher-groups/remove",

    //pagos
    pagos: "/api/pagos",
    pagosExportCsv: "/api/pagos/export-csv",
    pagosExportData: "/api/pagos/export-data",

    //finanzas
    balance_general: "/api/finanzas/balance-general",
    financialReports: "/api/financial-reports/report",


    //estudiantes

    students:"/api/gestion-academica/estudiantes",
    studentsExportCsv: '/api/gestion-academica/estudiantes/export/csv',
    studentsExportData: '/api/gestion-academica/estudiantes/export-data',

    //documentos administrativos
    documents: "/api/gestion-documentaria/documentos",
    documentsExportCsv: '/api/gestion-documentaria/documentos/export/csv',
    documentsExportData: '/api/gestion-documentaria/documentos/export-data',
    documentsDownload: '/api/gestion-documentaria/documentos',

    //Firmas del director
    instituteDirectors: "/api/gestion-documentaria/institute-directors",


    // Historial Académico
    academicHistory: "/api/gestion-academica/historial-academico",
    academicHistoryExportCsv:
      "/api/gestion-academica/historial-academico/exportar/csv",
    academicHistoryExportData:
      "/api/gestion-academica/historial-academico/exportar/datos",

    // Matrículas
    enrollments: "/api/gestion-academica/matriculas",

    // Módulos
    modulesCourses: "/api/academic-processes/courses",
    modulesCourseVersion: "/api/academic-processes/course-version",
    modules: "/api/academic-processes",
    modulesReorder: "/api/academic-processes/reorder",

    // Grupos
    groups: "/api/academic-processes/groups",
    groupsCourseVersions: "/api/academic-processes/groups/course-versions",
    groupsStatistics: "/api/academic-processes/groups/statistics",


    //Configuración Académica
    academicSettings: "/api/academic-processes/academic-settings",

    //cursos
    courses: '/api/academic-processes/courses-management',

    //versiones de cursos
    courseVersions: '/api/academic-processes/course-versions',

    //indicadores (KPIs)
    kpis: "/api/indicadores",
    kpisUpdateGoal: "/api/indicadores",
    kpisRecalculate: "/api/indicadores/recalculate",
    kpisExportData: "/api/indicadores/export-data",

    // RRHH - Nuevos endpoints agregados
    employees: "/api/rrhh/employees",
    contracts: '/api/rrhh/employees',
    offers: "/api/rrhh/offers",
    applicants: "/api/rrhh/applicants",


  },
};
