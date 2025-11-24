/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

export const config = {
  apiUrl: "https://instituto.cetivirgendelapuerta.com/backend/tecnologico/public/api",
  //apiUrl: "http://localhost:8000/api",
  environment: "development",
  endpoints: {
    // Authentication 
    auth: {
      register: "/auth/register",
      login: "/auth/login",
      logout: "/auth/logout",
      me: "/auth/me",
      profile: "/auth/profile",
      forgotPassword: "/auth/forgot-password",
      resetPassword: "/auth/reset-password",
    },

    // Secondary Email
    secondaryEmail: {
      add: "/auth/secondary-email/add",
      verify: "/auth/secondary-email/verify",
      resendCode: "/auth/secondary-email/resend-code",
      remove: "/auth/secondary-email/remove",
    },

    // Two-Factor Authentication (2FA)
    twoFactor: {
      enable: "/auth/2fa/enable",
      verify: "/auth/2fa/verify",
      verifyLogin: "/auth/2fa/verify-login",
      disable: "/auth/2fa/disable",
      regenerateRecoveryCodes: "/auth/2fa/recovery-codes/regenerate",
    },

    // Users Management
    users: {
      list: "/users",
      create: "/users",
      getById: "/users/:id",
      update: "/users/:id",
      delete: "/users/:id",
      assignRoles: "/users/:id/roles",
      assignPermissions: "/users/:id/permissions",
    },

    // Roles Management
    roles: {
      list: "/roles",
      create: "/roles",
      getById: "/roles/:id",
      update: "/roles/:id",
      delete: "/roles/:id",
      assignPermissions: "/roles/:id/permissions",
    },

    // Permissions Management
    permissions: {
      list: "/permissions",
      create: "/permissions",
      getById: "/permissions/:id",
      update: "/permissions/:id",
      delete: "/permissions/:id",
    },

    // Support Tickets Management
    support: {
      // Tickets
      tickets: {
        list: "/support/tickets",
        myTickets: "/support/my-tickets",
        create: "/support/tickets",
        getById: "/support/tickets/:id",
        update: "/support/tickets/:id",
        close: "/support/tickets/:id/close",
        reopen: "/support/tickets/:id/reopen",
      },
      // Replies
      replies: {
        create: "/support/tickets/:ticketId/replies",
        update: "/support/tickets/:ticketId/replies/:replyId",
        delete: "/support/tickets/:ticketId/replies/:replyId",
      },
      // Attachments
      attachments: {
        download: "/support/attachments/:id/download",
        delete: "/support/attachments/:id",
      },
      // Statistics
      statistics: "/support/statistics",
    },
    // Security Module
    security: {
      // Dashboard
      dashboard: "/security/dashboard",

      // User Blocks Management
      blocks: {
        list: "/security/blocks", // Listar usuarios bloqueados
        create: "/security/blocks", // Bloquear usuario manualmente
        history: "/security/blocks/history", // Historial de bloqueos
        statistics: "/security/blocks/statistics", // Estadísticas de bloqueos
        userHistory: "/security/blocks/user/:userId", // Historial de bloqueos de un usuario
        check: "/security/blocks/check/:userId", // Verificar si usuario está bloqueado
        unblockByUser: "/security/blocks/user/:userId", // Desbloquear por user ID
        unblockById: "/security/blocks/:blockId", // Desbloquear por ID de bloqueo
      },

      // Security Settings
      settings: {
        list: "/security/settings", // Obtener todas las configuraciones
        grouped: "/security/settings/grouped", // Configuraciones agrupadas
        login: "/security/settings/login", // Configuraciones de login
        update: "/security/settings/:key", // Actualizar una configuración
        updateBulk: "/security/settings", // Actualizar múltiples configuraciones
        clearCache: "/security/settings/clear-cache", // Limpiar cache
      },

      // Sessions Management
      sessions: {
        list: "/security/sessions", // Mis sesiones o de un usuario (?user_id=X)
        all: "/security/sessions/all", // Todas las sesiones (solo admin)
        suspicious: "/security/sessions/suspicious", // Sesiones sospechosas
        terminate: "/security/sessions/:sessionId", // Terminar sesión específica
        terminateAll: "/security/sessions/terminate-all", // Terminar todas las sesiones
      },

      // Security Events
      events: {
        list: "/security/events", // Mis eventos (user normal) o de todos (admin)
        recent: "/security/events/recent", // Eventos recientes
        critical: "/security/events/critical", // Eventos críticos
        statistics: "/security/events/statistics", // Estadísticas de eventos
      },
    },

    // Developer Web Module
    developerWeb: {
      // Estadísticas generales
      stats: {
        overall: "/developer-web/stats/overall",
      },

      // News
      news: {
        index: "/developer-web/news",
        show: "/developer-web/news/:id",
        store: "/developer-web/news",
        update: "/developer-web/news/:id",
        destroy: "/developer-web/news/:id",
        published: "/developer-web/news/list/published",
        resetViews: "/developer-web/news/:id/reset-views",
        categories: "/developer-web/news/list/categories",
        stats: "/developer-web/news/stats/summary",
      },

      // Announcements
      announcements: {
        index: "/developer-web/announcements",
        show: "/developer-web/announcements/:id",
        store: "/developer-web/announcements",
        update: "/developer-web/announcements/:id",
        destroy: "/developer-web/announcements/:id",
        published: "/developer-web/announcements/list/published",
        resetViews: "/developer-web/announcements/:id/reset-views",
        stats: "/developer-web/announcements/stats/summary",
      },

      // Alerts
      alerts: {
        index: "/developer-web/alerts",
        show: "/developer-web/alerts/:id",
        store: "/developer-web/alerts",
        update: "/developer-web/alerts/:id",
        destroy: "/developer-web/alerts/:id",
        published: "/developer-web/alerts/list/published",
        stats: "/developer-web/alerts/stats/summary",
      },

      // Chatbot
      chatbot: {
        // Configuración del Chatbot
        config: {
          get: "/developer-web/chatbot/config",
          update: "/developer-web/chatbot/config",
          reset: "/developer-web/chatbot/config/reset",
        },
        // Analytics del Chatbot
        analytics: {
          summary: "/developer-web/chatbot/analytics/summary",
          conversationsByDay: "/developer-web/chatbot/analytics/conversations-by-day",
        },
        // Conversación del Chatbot
        conversation: {
          start: "/developer-web/chatbot/conversation/start",
          message: "/developer-web/chatbot/conversation/message",
          end: "/developer-web/chatbot/conversation/end",
        },
        // FAQs del Chatbot
        faqs: {
          public: {
            index: "/developer-web/chatbot/faqs/public",
            show: "/developer-web/chatbot/faqs/public/:id",
          },
          categories: "/developer-web/chatbot/faqs/categories",
          index: "/developer-web/chatbot/faqs",
          show: "/developer-web/chatbot/faqs/:id",
          store: "/developer-web/chatbot/faqs",
          update: "/developer-web/chatbot/faqs/:id",
          destroy: "/developer-web/chatbot/faqs/:id",
          stats: "/developer-web/chatbot/faqs/stats/summary",
        },
      },

      // Landing Page (Public)
      landing: {
        heroStats: "/developer-web/landing/hero-stats",
        courses: "/developer-web/landing/courses",
        featuredTeachers: "/developer-web/landing/featured-teachers",
        testimonials: "/developer-web/landing/testimonials",
        news: "/developer-web/landing/news",
        newsDetail: "/developer-web/landing/news/:slug",
        announcements: "/developer-web/landing/announcements",
        alerts: "/developer-web/landing/alerts",
      },
    },

    // Academic Analysis Module
    academicAnalysis: {
      // Dashboard
      dashboard: {
        main: "/data-analyst/dashboard",
        charts: "/data-analyst/dashboard/charts"
      },
      // BigQuery Sync
      bigquery: {
        syncFull: "/data-analyst/dataset-sync/sync",
        syncIncremental: "/data-analyst/bigquery/sync-incremental"
      },
      // Attendance
      attendance: {
        general: "/data-analyst/attendance",
        local: "/data-analyst/local/attendance/summary",
        statusDistribution: "/data-analyst/charts/attendance-status",
        weeklyTrends: "/data-analyst/charts/weekly-absence-trends",
        attendanceCalendar: "/data-analyst/charts/attendance-calendar",
        export: "/data-analyst/export/attendance",
      },
      // Performance
      performance: {
        general: "/data-analyst/performance",
        gradeDistribution: "/data-analyst/charts/grade-distribution",
        attendanceGradeCorrelation: "/data-analyst/charts/attendance-grade-correlation",
        groupPerformance: "/data-analyst/charts/group-performance-radar",
        export: "/data-analyst/export/performance",
      },
      // Progress
      progress: {
        general: "/data-analyst/progress",
        activeStudents: "/data-analyst/local/students/active",
        gradeEvolution: "/data-analyst/charts/grade-evolution",
        export: "/data-analyst/export/progress",
      },
    },
    // Dropout Prediction Module
    dropoutPrediction: {
      // System Status & Overview
      systemStatus: "/data-analyst/dropout-prediction/system-status",
      // Predictions
      predictions: "/data-analyst/dropout-prediction/predictions",
      predictionsDetailed: "/data-analyst/dropout-prediction/predictions/detailed",
      predictionsByGroup: "/data-analyst/dropout-prediction/predictions/group/:groupId",
      // High Risk
      highRisk: "/data-analyst/dropout-prediction/high-risk",

      export: {
        predictions: "/data-analyst/dropout-prediction/export/predictions",
        highRisk: "/data-analyst/dropout-prediction/export/high-risk"
      }
    },
    groups: {
      active: "/data-analyst/groups/active",
    },

    // Infrastructure Module
    infrastructure: {
      // Dashboard
      dashboard: {
        stats: "/infrastructure/dashboard/stats",
        summary: "/infrastructure/dashboard/summary",
      },
      // Tech Assets
      assets: {
        list: "/infrastructure/assets",
        show: "/infrastructure/assets/:id",
        store: "/infrastructure/assets",
        update: "/infrastructure/assets/:id",
        destroy: "/infrastructure/assets/:id",
      },
      // Hardware
      hardware: {
        list: "/infrastructure/hardwares",
        show: "/infrastructure/hardwares/:id",
        store: "/infrastructure/hardwares",
        update: "/infrastructure/hardwares/:id",
        destroy: "/infrastructure/hardwares/:id",
      },
      // Software
      software: {
        list: "/infrastructure/softwares",
        show: "/infrastructure/softwares/:id",
        store: "/infrastructure/softwares",
        update: "/infrastructure/softwares/:id",
        destroy: "/infrastructure/softwares/:id",
      },
      // Licenses
      licenses: {
        list: "/infrastructure/licenses",
        show: "/infrastructure/licenses/:id",
        store: "/infrastructure/licenses",
        update: "/infrastructure/licenses/:id",
        destroy: "/infrastructure/licenses/:id",
      },
      // License Assignments
      assignments: {
        list: "/infrastructure/assignments",
        show: "/infrastructure/assignments/:id",
        store: "/infrastructure/assignments",
        update: "/infrastructure/assignments/:id",
        destroy: "/infrastructure/assignments/:id",
      },
    },
  }
};