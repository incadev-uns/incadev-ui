/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

export const config = {
  apiUrl:"https://instituto.cetivirgendelapuerta.com/backend/bienestar/public",
  
  //apiUrl:"http://127.0.0.1:8000",
  environment:"development",
  endpoints: {
    tutoring: {
      // Endpoints para tutores/profesores
      teacherRequests: "/api/tutoring/requests",
      acceptRequest: "/api/tutoring/requests/:id/accept",
      rejectRequest: "/api/tutoring/requests/:id/reject",
      markAttendance: "/api/tutoring/requests/:id/mark-attendance",
      teacherHistory: "/api/tutoring/history",
      myAvailability: "/api/tutoring/my-availability",
      createAvailability: "/api/tutoring/availability",
      deleteAvailability: "/api/tutoring/availability/:id",
      // Endpoints para estudiantes
      studentRequests: "/api/tutoring/my-requests",
      createRequest: "/api/tutoring/requests",
      teachers: "/api/tutoring/teachers",
      teacherAvailability: "/api/tutoring/availabilities/:teacherId"
    },
    forums: {
      list: "/api/forums",
      get: "/api/forums/:forumId",
      create: "/api/forums",
      update: "/api/forums/:forumId",
      delete: "/api/forums/:forumId",
    },
    threads: {
      listByForum: "/api/forums/:forumId/threads",
      get: "/api/threads/:threadId",
      create: "/api/forums/:forumId/threads",
      update: "/api/threads/:threadId",
      delete: "/api/threads/:threadId",
    },
    comments: {
      listByThread: "/api/threads/:threadId/comments",
      create: "/api/threads/:threadId/comments",
      update: "/api/comments/:commentId",
      delete: "/api/comments/:commentId",
    },
    votes: {
      voteThread: "/api/threads/:threadId/votes",
      voteComment: "/api/comments/:commentId/votes",
    },
    report: {
      studentGroups: "/api/report/student-groups",
      groupGrades: "/api/report/group-grades",
      enrolledCoursesPdf: "/api/report/reports/enrolled-courses",
      singleCourseGradesPdf: "/api/report/reports/single-course-grades"
    }
  },
};