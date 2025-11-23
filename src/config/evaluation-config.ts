/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

export const config = {
  apiUrl:"https://instituto.cetivirgendelapuerta.com/academico/backend/public",
  //apiUrl:"http://127.0.0.1:8002",
  environment:"development",
  endpoints: {
    surveys:{
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
    }
  },
};