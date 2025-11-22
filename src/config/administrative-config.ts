/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

import DashboardICV from "@/process/academic/dasboard/Dashboard";

export const config = {
  //apiUrl:"https://instituto.cetivirgendelapuerta.com/administrativo/backend/public",
  apiUrl: "http://127.0.0.1:8000",
  environment: "development",
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

    //estudiantes
    students: "/api/gestion-academica/estudiantes",
    studentsExportCsv: "/api/gestion-academica/estudiantes/export/csv",
    studentsExportData: "/api/gestion-academica/estudiantes/export-data",

    // Historial Académico
    academicHistory: "/api/gestion-academica/historial-academico",
    academicHistoryExportCsv:
      "/api/gestion-academica/historial-academico/exportar/csv",
    academicHistoryExportData:
      "/api/gestion-academica/historial-academico/exportar/datos",

    // Matrículas
    enrollments: "/api/gestion-academica/matriculas",

  },
};
