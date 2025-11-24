/**
 * @abstract Config file
 * @description Configuración del módulo de marketing.
 */

export const config = {
  //apiUrl:"https://instituto.cetivirgendelapuerta.com/backend/marketing/public/api"
  apiUrl: "http://127.0.0.1:8002",
  // Marketing backend auth and related services
  authApiUrl: "http://127.0.0.1:8001/api", // Backend principal para autenticación
  // Explicit base URLs for related microservices so the UI can target the right hosts
  generationApiUrl: "http://127.0.0.1:8004", // generativeapi
  socialApiUrl: "http://127.0.0.1:8005", // socialmediaapi
  metricsApiUrl: "http://127.0.0.1:8006", // metricsapi (same host used for auth/service)
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
      list: "/campaigns",              // GET con ?proposal_id=X
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
    // Base prefix used by the backend is `/api/v1/marketing/generation`
    generation: {
      facebook: "/api/v1/marketing/generation/facebook",
      instagram: "/api/v1/marketing/generation/instagram",
      podcast: "/api/v1/marketing/generation/podcast",

      // Image endpoints
      image: "/api/v1/marketing/generation/image",
      imageList: "/api/v1/marketing/generation/image/list",
      imageSend: "/api/v1/marketing/generation/image/send",
      imageGet: "/api/v1/marketing/generation/image/:id",

      // Audio endpoints
      audio: "/api/v1/marketing/generation/audio",
      audioList: "/api/v1/marketing/generation/audio/list",
      audioSend: "/api/v1/marketing/generation/audio/send",
      audioGet: "/api/v1/marketing/generation/audio/:id",

      // Video generation
      video: "/api/v1/marketing/generation/video",
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
      postMetrics: "/api/v1/marketing/metrics/post/:postId",
      updatePostMetrics: "/api/v1/marketing/metrics/post/:postId/update",

      // Campaign metrics
      campaign: "/api/v1/marketing/metrics/campaign/:campaignId",
      refreshCampaign: "/api/v1/marketing/metrics/campaign/:campaignId/refresh",

      // Platform fetch endpoints
      facebookPosts: "/api/v1/marketing/metrics/facebook/posts",
      instagramPosts: "/api/v1/marketing/metrics/instagram/posts",
    },

    // Social media (publish via socialmediaapi)
    socialmedia: {
      posts: {
        facebook: "/api/v1/marketing/socialmedia/posts/facebook",
        instagram: "/api/v1/marketing/socialmedia/posts/instagram",
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


    // Alumnos (desde marketing-backend usando modelos de core-domain)
    alumnos: {
      stats: "/alumnos/stats",
      resumen: "/alumnos/resumen",
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
