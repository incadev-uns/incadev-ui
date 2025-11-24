/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

export const config = {
  apiUrl: "https://instituto.cetivirgendelapuerta.com/backend/evaluacion/public",
  //apiUrl:"http://127.0.0.1:8002",
  environment: "development",
  endpoints: {
    surveys: {
      listAll: "/api/surveys",
      show: "/api/surveys/:id",
      create: "/api/surveys",
      update: "/api/surveys/:id",
      delete: "/api/surveys/:id",
      response: "/api/surveys/:id/responses",
      byRole: "/api/surveys/by-role",
      active: "/api/surveys/active",
      isSurveyCompleted: "/api/surveys/completed",
    },
    questions: {
      listAll: "/api/surveys/:surveyId/questions",
      show: "/api/questions/:id",
      create: "/api/surveys/:surveyId/questions",
      update: "/api/questions/:id",
      delete: "/api/questions/:id",
    },
    reports: {
      pdf: "/api/reports/survey/:surveyId/pdf",
      excel: "/api/reports/survey/:surveyId/excel",
      analysis: "/api/surveys/:surveyId/analysis",
    },

    audits: {
      list: "/api/audits",
      create: "/api/audits",
      getById: "/api/audits/:id",
      getMyAudits: "/api/audits/my-audits",
      updateStatus: "/api/audits/:id/status",
      updateRecommendation: "/api/audits/:id/recommendation",

      // Hallazgos
      getFindings: "/api/audits/:id/findings",
      createFinding: "/api/audits/:id/findings",
      updateFindingStatus: "/api/findings/:id/status",

      // Evidencias
      uploadEvidence: "/api/findings/:id/evidences",

      // Acciones correctivas
      createAction: "/api/findings/:id/actions",
      updateActionStatus: "/api/actions/:id/status",

      // Reportes
      generateReport: "/api/audits/:id/report/generate",
      previewReport: "/api/audits/:id/report/preview",
      downloadReport: "/api/audits/:id/report/download",

      // ⭐ NUEVO
      dashboardStats: "/api/audits/dashboard"

    },
  },

};
