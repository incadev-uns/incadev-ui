/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

export const config = {
  //apiUrl:"https://instituto.cetivirgendelapuerta.com/backend/academico/public",
  apiUrl: "http://127.0.0.1:8000",
  environment: "development",
  endpoints: {
    users: {
      updateDNI: "/api/update-dni-and-fullname",
      checkDNI: "/api/get-fullname-by-dni",
    },
    auth: {
      register: "/api/auth/register",
      redirect: "/auth/google/redirect",
      callback: "/auth/google/callback",
    },
    groups: {
      available: "/api/available-groups",
      enroll: "/api/available-groups/:group/enroll",
      mylist: "/api/enrolled-groups",
      infoEnroll: "/api/enrolled-groups/:group",
      listComplete: "/api/student/completed-groups",
      certificate: "/api/student/certificates/:uuid/download",
      teaching: "/api/teaching-groups",
      specificTeaching: "/api/teaching-groups/:group",
      canComplete: "/api/teaching-groups/:group/can-complete",
      complete: "/api/teaching-groups/:group/complete",
    },
    classes: {
      listAll: "/api/teaching-groups/:group/classes",
      create: "/api/teaching-groups/:group/modules/:module/classes",
      update: "/api/teaching-groups/classes/:class",
      delete: "/api/teaching-groups/classes/:class",
    },
    materials: {
      listAll: "/api/teaching-groups/classes/:class/materials",
      create: "/api/teaching-groups/classes/:class/materials",
      update: "/api/teaching-groups/materials/:material",
      delete: "/api/teaching-groups/materials/:material",
    },
    exams: {
      listAll: "/api/teaching-groups/:group/exams",
      create: "/api/teaching-groups/:group/modules/:module/exams",
      info: "/api/teaching-groups/exams/:exam",
      update: "/api/teaching-groups/exams/:exam",
      delete: "/api/teaching-groups/exams/:exam",
      registerGrades: "/api/teaching-groups/exams/:exam/grades",
      updateGrade: "/api/teaching-groups/grades/:grade"
    },
    attendances: {
      listAll: "/api/teaching-groups/:group/attendances",
      info: "/api/teaching-groups/classes/:class/attendances",
      register: "/api/teaching-groups/classes/:class/attendances",
      update: "/api/teaching-groups/attendances/:attendance",
      statistics: "/api/teaching-groups/:group/attendance-statistics"
    },
    marketing: {
      students: "/api/marketing/students",
      courses: "/api/marketing/courses",
      versions: "/api/marketing/versions"
    },
    export: {
      matriculas: "/api/export/:groupId/enrollments",
      asistencias: "/api/export/:groupId/attendances",
      grades: "/api/export/:groupId/grades"
    }
  },
};