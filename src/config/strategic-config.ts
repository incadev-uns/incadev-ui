/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 **/

type apiProps = string | number;

export const config = {
  apiUrl:
  "https://instituto.cetivirgendelapuerta.com/estrategico/StrategicProcessApp/public",
  //apiUrl: "http://127.0.0.1:8001",
  environment: "development",
  endpoints: {
    messageFiles: {
      list: "/api/message-files",
      get: (id: apiProps) => `/api/message-files/${id}`,
      update: (id: apiProps) => `/api/message-files/${id}`,
      delete: (id: apiProps) => `/api/message-files/${id}`,
    },

    messages: {
      list: "/api/messages",
      create: "/api/messages",
      get: (id: apiProps) => `/api/messages/${id}`,
      update: (id: apiProps) => `/api/messages/${id}`,
      delete: (id: apiProps) => `/api/messages/${id}`,
    },

    organizations: {
      list: "/api/organizations",
      create: "/api/organizations",
      get: (id: apiProps) => `/api/organizations/${id}`,
      update: (id: apiProps) => `/api/organizations/${id}`,
      delete: (id: apiProps) => `/api/organizations/${id}`,
      lookup: (ruc: string) => `/api/organizations/lookup/${ruc}`, // ✅ agregado
    },

    agreements: {
      list: "/api/agreements", // ✅ nuevo grupo
      create: "/api/agreements",
      get: (id: apiProps) => `/api/agreements/${id}`,
      update: (id: apiProps) => `/api/agreements/${id}`,
      delete: (id: apiProps) => `/api/agreements/${id}`,
    },

    candidates: {
      list: "/api/candidates", // ✅ nuevo grupo
      create: "/api/candidates",
      get: (id: apiProps) => `/api/candidates/${id}`,
      delete: (id: apiProps) => `/api/candidates/${id}`,
    },

    strategicContents: {
      list: "/api/strategic-contents",
      create: "/api/strategic-contents",
      get: (id: apiProps) => `/api/strategic-contents/${id}`,
      update: (id: apiProps) => `/api/strategic-contents/${id}`,
      delete: (id: apiProps) => `/api/strategic-contents/${id}`,
    },

    strategicDocuments: {
      list: "/api/strategic-documents",
      create: "/api/strategic-documents",
      get: (id: apiProps) => `/api/strategic-documents/${id}`,
      update: (id: apiProps) => `/api/strategic-documents/${id}`,
      delete: (id: apiProps) => `/api/strategic-documents/${id}`,
    },

    strategicObjectives: {
      list: "/api/strategic-objectives",
      create: "/api/strategic-objectives",
      get: (id: apiProps) => `/api/strategic-objectives/${id}`,
      update: (id: apiProps) => `/api/strategic-objectives/${id}`,
      delete: (id: apiProps) => `/api/strategic-objectives/${id}`,
    },

    strategicPlans: {
      list: "/api/strategic-plans",
      create: "/api/strategic-plans",
      get: (id: apiProps) => `/api/strategic-plans/${id}`,
      update: (id: apiProps) => `/api/strategic-plans/${id}`,
      delete: (id: apiProps) => `/api/strategic-plans/${id}`,
    },

    strategicGoals: {
      list: "/api/strategic/goals", // ✅ nuevo grupo
      create: "/api/strategic/goals",
      update: (id: apiProps) => `/api/strategic/goals/${id}`,
      delete: (id: apiProps) => `/api/strategic/goals/${id}`,
      rate: (id: apiProps) => `/api/strategic/goals/${id}/rate`,
    },

    qualityStandards: {
      list: "/api/strategic/quality-standards",
      create: "/api/strategic/quality-standards",
      rate: (id: apiProps) => `/api/strategic/quality-standards/${id}/rate`,
      get: (id: apiProps) => `/api/strategic/quality-standards/${id}`,
      update: (id: apiProps) => `/api/strategic/quality-standards/${id}`,
      delete: (id: apiProps) => `/api/strategic/quality-standards/${id}`,
    },

    user: {
      me: "/api/user",
    },

    security: {
      csrf: "/sanctum/csrf-cookie",
    },

    storage: {
      file: (path: string) => `/storage/${path}`,
    },
  },
};
