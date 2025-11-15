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
    pagos: "/api/pagos",
    pagosExportCsv: "/api/pagos/export-csv",
    pagosExportData: "/api/pagos/export-data",
    dashboard: "/api/dashboard/data",
    export_pdf: "/api/dashboard/export-data",
  },
};