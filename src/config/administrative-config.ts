/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

import DashboardICV from "@/process/academic/dasboard/Dashboard";

export const config = {
  //apiUrl:"https://instituto.cetivirgendelapuerta.com/administrativo/backend/public",
  apiUrl:"http://127.0.0.1:8000",
  environment:"development",
  endpoints: {

    //dashboard
    dashboard: "/api/dashboard/data",
    export_pdf: "/api/dashboard/export-data",

    //pagos
    pagos: "/api/pagos",
    pagosExportCsv: "/api/pagos/export-csv",
    pagosExportData: "/api/pagos/export-data",

    //finanzas
    balance_general: "/api/finanzas/balance-general",

    // RRHH - Nuevos endpoints agregados
    employees: "/api/rrhh/employees",
    contracts: '/api/rrhh/employees',
    offers: "/api/rrhh/offers",
    applicants: "/api/rrhh/applicants",


  },
};