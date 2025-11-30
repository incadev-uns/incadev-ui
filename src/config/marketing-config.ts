/**
 * @abstract Config file
 * @description Configuración del módulo de marketing.
 */

export const config = {
  apiUrl: "https://instituto.cetivirgendelapuerta.com/backend/marketing/public/api",
  //apiUrl: "http://127.0.0.1:8000/api",
  // Marketing backend auth and related services
  //authApiUrl: "http://127.0.0.1:8001/api", // Backend principal para autenticación
  // Explicit base URLs for related microservices so the UI can target the right hosts
  generationApiUrl: "http://127.0.0.1:8004/api", // generativeapi
  socialApiUrl: "http://127.0.0.1:8005/api", // socialmediaapi
  //metricsApiUrl: "http://127.0.0.1:8006", // metricsapi (same host used for auth/service)
  environment: "development",

  endpoints: {
    // Authentication (usa authApiUrl)
    auth: {
      me: "/auth/me",
      logout: "/auth/logout",
      profile: "/auth/profile",
    },

    // Proposals
    proposals: {
      list: "/proposals",
      create: "/proposals",
      detail: "/proposals/:id",
      update: "/proposals/:id",
      delete: "/proposals/:id",
    },

    // Campaigns
    campaigns: {
      list: "/campaigns",              // GET
      create: "/campaigns",            // POST
      detail: "/campaigns/:id",        // GET
      update: "/campaigns/:id",        // PUT
      delete: "/campaigns/:id",        // DELETE
      metrics: "/campaigns/:id/metrics", // GET
      posts: "/campaigns/:id/posts",   // GET
    },

    // Chatbot
    chatbot: {
      conversaciones: "/chatbot/conversaciones",
      conversacionDetail: "/chatbot/conversaciones/:id",
      sendMessage: "/chatbot/conversaciones/:id/mensaje",
      estadisticas: "/chatbot/estadisticas",
      automatizaciones: "/chatbot/automatizaciones",
      canales: "/chatbot/canales",
      configurarCanal: "/chatbot/canales/:id/configurar",
      testCanal: "/chatbot/canales/:id/test",
    },

    // Generative content (microservice: generativeapi)
    // Base prefix used by the backend is `/generation`
    generation: {
      facebook: "/generation/facebook",
      instagram: "/generation/instagram",
      podcast: "/generation/podcast",

      // Image endpoints
      image: "/generation/image",
      imageList: "/generation/image/list",
      imageSend: "/generation/image/send",
      imageGet: "/generation/image/:id",

      // Audio endpoints
      audio: "/generation/audio",
      audioList: "/generation/audio/list",
      audioSend: "/generation/audio/send",
      audioGet: "/generation/audio/:id",

      // Video generation
      video: "/generation/video",
    },

    // Posts
    posts: {
      list: "/posts",
      create: "/posts",
      detail: "/posts/:id",
      update: "/posts/:id",
      delete: "/posts/:id",
    },

    // Metrics
    metrics: {
      list: "/metrics",
      detail: "/metrics/:id",
      // Per-post metrics
      postMetrics: "/metrics/post/:postId",
      updatePostMetrics: "/metrics/post/:postId/update",

      // Campaign metrics
      campaign: "/metrics/campaign/:campaignId",
      refreshCampaign: "/metrics/campaign/:campaignId/refresh",

      // Platform fetch endpoints
      facebookPosts: "/metrics/facebook/posts",
      instagramPosts: "/metrics/instagram/posts",
    },

    // Social media (publish via socialmediaapi)
    socialmedia: {
      posts: {
        facebook: "/socialmedia/posts/facebook",
        instagram: "/socialmedia/posts/instagram",
      },
    },

    // Cursos (desde marketing-backend)
    courses: {
      list: "/courses",
      detail: "/courses/:id",
      proximos: "/cursos/proximos",
      versions: "/courses/:id/versions",
      campaigns: "/courses/:id/campaigns",
    },

    versions: {
      list: "/versions",
      detail: "/versions/:id",
      campaigns: "/versions/:id/campaigns",
    },

    // Alumnos (desde marketing-backend usando modelos de core-domain)
    alumnos: {
      stats: "/alumnos/stats",
      resumen: "/alumnos/resumen",
      detalle: "/alumnos/:id/detalle",

    },
  },

  externalUrls: {
    webhook: {
      whatsapp: "https://instituto.cetivirgendelapuerta.com/api/webhook/wa",
      messenger: "https://instituto.cetivirgendelapuerta.com/api/webhook/messenger",
      instagram: "https://instituto.cetivirgendelapuerta.com/api/webhook/instagram",
      facebook: "https://instituto.cetivirgendelapuerta.com/api/webhook/facebook",
    },
    matricula: {
      base: "https://instituto.cetivirgendelapuerta.com/matricula",
      curso: "https://instituto.cetivirgendelapuerta.com/matricula/:slug",
    },
  },
};
