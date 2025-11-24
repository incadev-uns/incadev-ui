/**
 * @abstract API Service Layer
 * @description Capa de abstracción para manejar todas las peticiones a la API REST del módulo tecnológico.
 * Proporciona un cliente HTTP centralizado con manejo de autenticación, errores y tipos.
 */

import { config } from "@/config/technology-config";
import type { WebDashboardData, FAQCategory } from "@/types/developer-web";
import type {
  AttendanceResponse,
  LocalAttendanceSummary,
  PerformanceResponse,
  ProgressResponse,
  AttendanceStatusResponse,
  WeeklyTrendsResponse,
  AttendanceCalendarResponse,
  GradeDistributionResponse,
  AttendanceGradeCorrelationResponse,
  GroupPerformanceResponse,
  GradeEvolutionResponse,
  ChartFilters,
  GroupOption,
  DashboardMainResponse,
  DashboardChartsResponse,
  BigQuerySyncResponse
} from "@/types/academic-analysis"

import type {
  SystemStatusData,
  PredictionsResponse,
  HighRiskResponse,
  DropoutPredictionFilters,
  DetailedPredictionsResponse,
} from "@/types/dropout-prediction"

// ============================================
// Types & Interfaces
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  password_confirmation: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  requires_2fa?: boolean;
}

// Respuesta de /auth/me con estructura anidada
export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Respuesta de /auth/profile con estructura anidada
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  fullname?: string;
  dni?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string | null;
  roles?: string[];
  permissions?: string[];
  two_factor_enabled?: boolean;
  secondary_email?: string;
  secondary_email_verified?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  fullname?: string;
  email?: string;
  dni?: string;
  phone?: string;
  avatar?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// API Error Class
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================
// HTTP Client
// ============================================

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    // Limpia comillas si existen
    return token.replace(/^"|"$/g, "");
  }

  /**
   * Construye los headers para las peticiones
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Reemplaza parámetros en la URL (ej: /users/:id -> /users/1)
   */
  private replaceUrlParams(url: string, params: Record<string, string | number>): string {
    let finalUrl = url;
    Object.entries(params).forEach(([key, value]) => {
      finalUrl = finalUrl.replace(`:${key}`, String(value));
    });
    return finalUrl;
  }

  /**
   * Maneja errores HTTP y los convierte en ApiError
   * NOTA: 422 con requires_2fa NO es un error, es una respuesta válida
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    // Si la respuesta es JSON, parseamos el body primero
    let jsonData: any = null;
    if (isJson) {
      jsonData = await response.json();
    }

    if (!response.ok) {
      // Caso especial: 422 con requires_2fa es una respuesta válida, NO un error
      if (response.status === 422 && jsonData?.requires_2fa) {
        return jsonData as T;
      }

      // Error 401: Token inválido o expirado - limpiar sesión automáticamente
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Solo redirigir si no estamos ya en la página de login
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/tecnologico/login";
          }
        }
      }

      // Errores reales
      if (jsonData) {
        throw new ApiError(
          jsonData.message || `Error ${response.status}: ${response.statusText}`,
          response.status,
          jsonData.errors
        );
      } else {
        throw new ApiError(
          `Error ${response.status}: ${response.statusText}`,
          response.status
        );
      }
    }

    // Respuesta exitosa
    if (jsonData) {
      return jsonData as T;
    }

    return {} as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>, urlParams?: Record<string, string | number>): Promise<T> {
    let url = urlParams ? this.replaceUrlParams(endpoint, urlParams) : endpoint;

    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString();
      url += `?${queryString}`;
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, urlParams?: Record<string, string | number>, includeAuth: boolean = true): Promise<T> {
    const url = urlParams ? this.replaceUrlParams(endpoint, urlParams) : endpoint;

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, urlParams?: Record<string, string | number>): Promise<T> {
    const url = urlParams ? this.replaceUrlParams(endpoint, urlParams) : endpoint;

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, urlParams?: Record<string, string | number>): Promise<T> {
    const url = urlParams ? this.replaceUrlParams(endpoint, urlParams) : endpoint;

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

// Instancia única del cliente
const apiClient = new ApiClient();

// ============================================
// API Service Methods
// ============================================

export const technologyApi = {
  // ========== Authentication ==========
  auth: {
    /**
     * Inicia sesión con email, password y role
     */
    login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
      return apiClient.post<ApiResponse<AuthResponse>>(
        config.endpoints.auth.login,
        credentials,
        undefined,
        false // No incluir auth header
      );
    },

    /**
     * Registra un nuevo usuario
     */
    register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
      return apiClient.post<ApiResponse<AuthResponse>>(
        config.endpoints.auth.register,
        data,
        undefined,
        false
      );
    },

    /**
     * Cierra sesión
     */
    logout: async (): Promise<ApiResponse<null>> => {
      return apiClient.post<ApiResponse<null>>(config.endpoints.auth.logout);
    },

    /**
     * Obtiene el usuario autenticado
     * Responde con: { success: true, data: { user: {...} } }
     */
    me: async (): Promise<MeResponse> => {
      return apiClient.get<MeResponse>(config.endpoints.auth.me);
    },

    /**
     * Actualiza el perfil del usuario autenticado
     * Responde con: { success: true, message: "...", data: { user: {...} } }
     */
    updateProfile: async (data: UpdateProfileData): Promise<ProfileResponse> => {
      return apiClient.put<ProfileResponse>(config.endpoints.auth.profile, data);
    },

    /**
     * Solicita un email de recuperación de contraseña
     */
    forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
      return apiClient.post<ApiResponse<null>>(
        config.endpoints.auth.forgotPassword,
        { email },
        undefined,
        false
      );
    },

    /**
     * Restablece la contraseña con el token recibido
     */
    resetPassword: async (data: {
      email: string;
      token: string;
      password: string;
      password_confirmation: string;
    }): Promise<ApiResponse<null>> => {
      return apiClient.post<ApiResponse<null>>(
        config.endpoints.auth.resetPassword,
        data,
        undefined,
        false
      );
    },
  },

  // ========== 2FA ==========
  twoFactor: {
    /**
     * Habilita 2FA para el usuario
     */
    enable: async (): Promise<ApiResponse<{ qr_code: string; secret: string; recovery_codes: string[] }>> => {
      return apiClient.post(config.endpoints.twoFactor.enable);
    },

    /**
     * Verifica y activa 2FA con el código
     */
    verify: async (code: string): Promise<ApiResponse<null>> => {
      return apiClient.post(config.endpoints.twoFactor.verify, { code });
    },

    /**
     * Verifica el código 2FA en el login
     */
    verifyLogin: async (email: string, password: string, code: string, role: string): Promise<ApiResponse<AuthResponse>> => {
      return apiClient.post<ApiResponse<AuthResponse>>(
        config.endpoints.twoFactor.verifyLogin,
        { email, password, code, role },
        undefined,
        false
      );
    },

    /**
     * Deshabilita 2FA
     */
    disable: async (password: string): Promise<ApiResponse<null>> => {
      return apiClient.post(config.endpoints.twoFactor.disable, { password });
    },

    /**
     * Regenera códigos de recuperación
     */
    regenerateRecoveryCodes: async (password: string): Promise<ApiResponse<{ recovery_codes: string[] }>> => {
      return apiClient.post(config.endpoints.twoFactor.regenerateRecoveryCodes, { password });
    },
  },

  // ========== Secondary Email ==========
  secondaryEmail: {
    /**
     * Agrega un email secundario
     * POST /api/auth/secondary-email/add
     * Body: { "secondary_email": "mi_email_secundario@gmail.com" }
     */
    add: async (secondaryEmail: string): Promise<ApiResponse<null>> => {
      return apiClient.post(config.endpoints.secondaryEmail.add, { secondary_email: secondaryEmail });
    },

    /**
     * Verifica el email secundario con código
     * POST /api/auth/secondary-email/verify
     * Body: { "code": "123456" }
     */
    verify: async (code: string): Promise<ApiResponse<null>> => {
      return apiClient.post(config.endpoints.secondaryEmail.verify, { code });
    },

    /**
     * Reenvía el código de verificación
     * POST /auth/secondary-email/resend-code
     */
    resendCode: async (): Promise<ApiResponse<null>> => {
      return apiClient.post(config.endpoints.secondaryEmail.resendCode);
    },

    /**
     * Elimina el email secundario
     */
    remove: async (): Promise<ApiResponse<null>> => {
      return apiClient.delete(config.endpoints.secondaryEmail.remove);
    },
  },

  // ========== Users Management ==========
  users: {
    /**
     * Lista todos los usuarios con paginación
     */
    list: async (page?: number, perPage?: number, search?: string): Promise<ApiResponse<PaginatedResponse<User>>> => {
      const params: Record<string, string | number> = {};
      if (page) params.page = page;
      if (perPage) params.per_page = perPage;
      if (search) params.search = search;

      return apiClient.get<ApiResponse<PaginatedResponse<User>>>(config.endpoints.users.list, params);
    },

    /**
     * Obtiene un usuario por ID
     */
    getById: async (id: number): Promise<ApiResponse<User>> => {
      return apiClient.get<ApiResponse<User>>(config.endpoints.users.getById, undefined, { id });
    },

    /**
     * Crea un nuevo usuario
     */
    create: async (data: { name: string; email: string; password: string; roles?: string[] }): Promise<ApiResponse<User>> => {
      return apiClient.post<ApiResponse<User>>(config.endpoints.users.create, data);
    },

    /**
     * Actualiza un usuario
     */
    update: async (id: number, data: Partial<User>): Promise<ApiResponse<User>> => {
      return apiClient.put<ApiResponse<User>>(config.endpoints.users.update, data, { id });
    },

    /**
     * Elimina un usuario
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return apiClient.delete<ApiResponse<null>>(config.endpoints.users.delete, { id });
    },

    /**
     * Asigna roles a un usuario
     */
    assignRoles: async (id: number, roles: string[]): Promise<ApiResponse<User>> => {
      return apiClient.post<ApiResponse<User>>(config.endpoints.users.assignRoles, { roles }, { id });
    },

    /**
     * Asigna permisos a un usuario
     */
    assignPermissions: async (id: number, permissions: string[]): Promise<ApiResponse<User>> => {
      return apiClient.post<ApiResponse<User>>(config.endpoints.users.assignPermissions, { permissions }, { id });
    },
  },

  // ========== Roles Management ==========
  roles: {
    /**
     * Lista todos los roles
     */
    list: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get<ApiResponse<any[]>>(config.endpoints.roles.list);
    },

    /**
     * Crea un nuevo rol
     */
    create: async (data: { name: string; permissions?: string[] }): Promise<ApiResponse<any>> => {
      return apiClient.post<ApiResponse<any>>(config.endpoints.roles.create, data);
    },

    /**
     * Obtiene un rol por ID
     */
    getById: async (id: number): Promise<ApiResponse<any>> => {
      return apiClient.get<ApiResponse<any>>(config.endpoints.roles.getById, undefined, { id });
    },

    /**
     * Actualiza un rol
     */
    update: async (id: number, data: { name?: string; permissions?: string[] }): Promise<ApiResponse<any>> => {
      return apiClient.put<ApiResponse<any>>(config.endpoints.roles.update, data, { id });
    },

    /**
     * Elimina un rol
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return apiClient.delete<ApiResponse<null>>(config.endpoints.roles.delete, { id });
    },

    /**
     * Asigna permisos a un rol
     */
    assignPermissions: async (id: number, permissions: string[]): Promise<ApiResponse<any>> => {
      return apiClient.post<ApiResponse<any>>(config.endpoints.roles.assignPermissions, { permissions }, { id });
    },
  },

  // ========== Permissions Management ==========
  permissions: {
    /**
     * Lista todos los permisos
     */
    list: async (): Promise<ApiResponse<any[]>> => {
      return apiClient.get<ApiResponse<any[]>>(config.endpoints.permissions.list);
    },

    /**
     * Crea un nuevo permiso
     */
    create: async (data: { name: string }): Promise<ApiResponse<any>> => {
      return apiClient.post<ApiResponse<any>>(config.endpoints.permissions.create, data);
    },

    /**
     * Obtiene un permiso por ID
     */
    getById: async (id: number): Promise<ApiResponse<any>> => {
      return apiClient.get<ApiResponse<any>>(config.endpoints.permissions.getById, undefined, { id });
    },

    /**
     * Actualiza un permiso
     */
    update: async (id: number, data: { name: string }): Promise<ApiResponse<any>> => {
      return apiClient.put<ApiResponse<any>>(config.endpoints.permissions.update, data, { id });
    },

    /**
     * Elimina un permiso
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return apiClient.delete<ApiResponse<null>>(config.endpoints.permissions.delete, { id });
    },
  },

  // ========== Support Tickets ==========
  support: {
    tickets: {
      /**
       * Lista todos los tickets con filtros y paginación (admin/support)
       */
      list: async (params?: {
        page?: number;
        per_page?: number;
        status?: string;
        priority?: string;
        type?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
      }): Promise<any> => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.per_page) queryParams.per_page = params.per_page;
        if (params?.status) queryParams.status = params.status;
        if (params?.priority) queryParams.priority = params.priority;
        if (params?.type) queryParams.type = params.type;
        if (params?.search) queryParams.search = params.search;
        if (params?.sort_by) queryParams.sort_by = params.sort_by;
        if (params?.sort_order) queryParams.sort_order = params.sort_order;

        return apiClient.get<any>(config.endpoints.support.tickets.list, queryParams);
      },

      /**
       * Lista mis tickets (del usuario autenticado) con filtros y paginación
       */
      myTickets: async (params?: {
        page?: number;
        per_page?: number;
        status?: string;
        priority?: string;
        type?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
      }): Promise<any> => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.per_page) queryParams.per_page = params.per_page;
        if (params?.status) queryParams.status = params.status;
        if (params?.priority) queryParams.priority = params.priority;
        if (params?.type) queryParams.type = params.type;
        if (params?.search) queryParams.search = params.search;
        if (params?.sort_by) queryParams.sort_by = params.sort_by;
        if (params?.sort_order) queryParams.sort_order = params.sort_order;

        return apiClient.get<any>(config.endpoints.support.tickets.myTickets, queryParams);
      },

      /**
       * Crea un nuevo ticket
       */
      create: async (data: {
        title: string;
        type?: string;
        priority: string;
        content: string;
      }): Promise<any> => {
        return apiClient.post<any>(config.endpoints.support.tickets.create, data);
      },

      /**
       * Obtiene un ticket por ID
       */
      getById: async (id: number): Promise<any> => {
        return apiClient.get<any>(config.endpoints.support.tickets.getById, undefined, { id });
      },

      /**
       * Actualiza un ticket
       */
      update: async (id: number, data: {
        title?: string;
        status?: string;
        priority?: string;
        type?: string;
      }): Promise<any> => {
        return apiClient.put<any>(config.endpoints.support.tickets.update, data, { id });
      },

      /**
       * Cierra un ticket
       */
      close: async (id: number): Promise<any> => {
        return apiClient.post<any>(config.endpoints.support.tickets.close, {}, { id });
      },

      /**
       * Reabre un ticket
       */
      reopen: async (id: number): Promise<any> => {
        return apiClient.post<any>(config.endpoints.support.tickets.reopen, {}, { id });
      },
    },

    replies: {
      /**
       * Crea una respuesta a un ticket (con soporte para archivos adjuntos)
       */
      create: async (ticketId: number, content: string, attachments?: File[]): Promise<any> => {
        const formData = new FormData();
        formData.append('content', content);

        if (attachments && attachments.length > 0) {
          attachments.forEach((file) => {
            formData.append('attachments[]', file);
          });
        }

        const endpoint = config.endpoints.support.replies.create.replace(':ticketId', ticketId.toString());

        // Obtener token para headers
        const token = getStoredToken();
        const headers: HeadersInit = {
          'Accept': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${config.apiUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });

        return response.json();
      },

      /**
       * Actualiza una respuesta
       */
      update: async (ticketId: number, replyId: number, content: string): Promise<any> => {
        return apiClient.put<any>(
          config.endpoints.support.replies.update,
          { content },
          { ticketId, replyId }
        );
      },

      /**
       * Elimina una respuesta
       */
      delete: async (ticketId: number, replyId: number): Promise<any> => {
        return apiClient.delete<any>(
          config.endpoints.support.replies.delete,
          { ticketId, replyId }
        );
      },
    },

    attachments: {
      /**
       * Descarga un archivo adjunto
       */
      download: async (id: number): Promise<Blob> => {
        const endpoint = config.endpoints.support.attachments.download.replace(':id', id.toString());
        const token = getStoredToken();

        const headers: HeadersInit = {
          'Accept': 'application/octet-stream',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${config.apiUrl}${endpoint}`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error('Error descargando archivo');
        }

        return response.blob();
      },

      /**
       * Elimina un archivo adjunto
       */
      delete: async (id: number): Promise<any> => {
        return apiClient.delete<any>(config.endpoints.support.attachments.delete, { id });
      },
    },

    /**
     * Obtiene estadísticas de soporte
     */
    statistics: async (period?: string): Promise<any> => {
      const params: Record<string, string> = {};
      if (period) params.period = period;

      return apiClient.get<any>(config.endpoints.support.statistics, params);
    },
  },

  // ============================================
  // Security Module
  // ============================================

  security: {
    /**
     * Dashboard de seguridad
     */
    dashboard: async (): Promise<any> => {
      return apiClient.get<any>(config.endpoints.security.dashboard);
    },

    // User Blocks Management
    blocks: {
      /**
       * Lista usuarios bloqueados actualmente
       */
      list: async (perPage: number = 15, page: number = 1): Promise<any> => {
        const params: Record<string, string> = {
          per_page: perPage.toString(),
          page: page.toString(),
        };
        return apiClient.get<any>(config.endpoints.security.blocks.list, params);
      },

      /**
       * Historial de todos los bloqueos
       */
      history: async (perPage: number = 20, page: number = 1): Promise<any> => {
        const params: Record<string, string> = {
          per_page: perPage.toString(),
          page: page.toString(),
        };
        return apiClient.get<any>(config.endpoints.security.blocks.history, params);
      },

      /**
       * Estadísticas de bloqueos
       */
      statistics: async (days: number = 30): Promise<any> => {
        const params: Record<string, string> = {
          days: days.toString(),
        };
        return apiClient.get<any>(config.endpoints.security.blocks.statistics, params);
      },

      /**
       * Historial de bloqueos de un usuario específico
       */
      userHistory: async (userId: number): Promise<any> => {
        return apiClient.get<any>(
          config.endpoints.security.blocks.userHistory,
          undefined,
          { userId: userId.toString() }
        );
      },

      /**
       * Verificar si un usuario está bloqueado
       */
      check: async (userId: number): Promise<any> => {
        return apiClient.get<any>(
          config.endpoints.security.blocks.check,
          undefined,
          { userId: userId.toString() }
        );
      },

      /**
       * Bloquear usuario manualmente
       */
      create: async (data: {
        user_id: number;
        reason: string;
        duration_minutes?: number;
      }): Promise<any> => {
        return apiClient.post<any>(config.endpoints.security.blocks.create, data);
      },

      /**
       * Desbloquear usuario por User ID
       */
      unblockByUser: async (userId: number): Promise<any> => {
        return apiClient.delete<any>(
          config.endpoints.security.blocks.unblockByUser,
          { userId: userId.toString() }
        );
      },

      /**
       * Desbloquear por ID de bloqueo
       */
      unblockById: async (blockId: number): Promise<any> => {
        return apiClient.delete<any>(
          config.endpoints.security.blocks.unblockById,
          { blockId: blockId.toString() }
        );
      },
    },

    // Security Settings
    settings: {
      /**
       * Obtiene todas las configuraciones de seguridad
       */
      list: async (): Promise<any> => {
        return apiClient.get<any>(config.endpoints.security.settings.list);
      },

      /**
       * Obtiene configuraciones agrupadas
       */
      grouped: async (): Promise<any> => {
        return apiClient.get<any>(config.endpoints.security.settings.grouped);
      },

      /**
       * Obtiene configuraciones de login
       */
      login: async (): Promise<any> => {
        return apiClient.get<any>(config.endpoints.security.settings.login);
      },

      /**
       * Actualiza una configuración específica
       */
      update: async (key: string, value: any): Promise<any> => {
        return apiClient.put<any>(
          config.endpoints.security.settings.update,
          { value },
          { key }
        );
      },

      /**
       * Actualiza múltiples configuraciones
       */
      updateBulk: async (settings: Record<string, any>): Promise<any> => {
        return apiClient.put<any>(config.endpoints.security.settings.updateBulk, { settings });
      },

      /**
       * Limpia el cache de configuraciones
       */
      clearCache: async (): Promise<any> => {
        return apiClient.post<any>(config.endpoints.security.settings.clearCache);
      },
    },

    // Sessions Management
    sessions: {
      /**
       * Obtiene mis sesiones activas o de un usuario específico (si es admin)
       */
      list: async (userId?: number): Promise<any> => {
        const params: Record<string, string> = {};
        if (userId) params.user_id = userId.toString();

        return apiClient.get<any>(config.endpoints.security.sessions.list, params);
      },

      /**
       * Obtiene TODAS las sesiones activas del sistema (solo admin)
       */
      all: async (): Promise<any> => {
        return apiClient.get<any>(config.endpoints.security.sessions.all);
      },

      /**
       * Obtiene sesiones sospechosas
       */
      suspicious: async (): Promise<any> => {
        return apiClient.get<any>(config.endpoints.security.sessions.suspicious);
      },

      /**
       * Termina una sesión específica (revocar token)
       */
      terminate: async (sessionId: number): Promise<any> => {
        return apiClient.delete<any>(
          config.endpoints.security.sessions.terminate,
          { sessionId: sessionId.toString() }
        );
      },

      /**
       * Termina todas las sesiones excepto la actual
       */
      terminateAll: async (userId?: number): Promise<any> => {
        let url = config.endpoints.security.sessions.terminateAll;
        if (userId) {
          url += `?user_id=${userId}`;
        }

        return apiClient.post<any>(url, {});
      },
    },

    // Security Events
    events: {
      /**
       * Obtiene eventos de seguridad con paginación
       * - Usuario normal: solo sus eventos
       * - Admin/Security: eventos de TODOS los usuarios
       */
      list: async (perPage: number = 15, page: number = 1): Promise<any> => {
        const params: Record<string, string> = {
          per_page: perPage.toString(),
          page: page.toString(),
        };

        return apiClient.get<any>(config.endpoints.security.events.list, params);
      },

      /**
       * Obtiene eventos recientes
       */
      recent: async (days: number = 7): Promise<any> => {
        const params: Record<string, string> = {
          days: days.toString(),
        };

        return apiClient.get<any>(config.endpoints.security.events.recent, params);
      },

      /**
       * Obtiene eventos críticos
       */
      critical: async (days: number = 7): Promise<any> => {
        const params: Record<string, string> = {
          days: days.toString(),
        };

        return apiClient.get<any>(config.endpoints.security.events.critical, params);
      },

      /**
       * Obtiene estadísticas de eventos
       */
      statistics: async (days: number = 30): Promise<any> => {
        const params: Record<string, string> = {
          days: days.toString(),
        };

        return apiClient.get<any>(config.endpoints.security.events.statistics, params);
      },
    },
  },

  // ============================================
  // Developer Web Module
  // ============================================

  developerWeb: {
    /**
     * Dashboard del módulo web
     */
    dashboard: async (): Promise<ApiResponse<WebDashboardData>> => {
      return apiClient.get<ApiResponse<WebDashboardData>>(config.endpoints.developerWeb.stats.overall);
    },

    // News Management
    news: {
      /**
       * Lista todas las noticias
       */
      list: async (params?: {
        page?: number;
        per_page?: number;
        category?: number;
        status?: string;
        search?: string;
      }): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.news.index, params);
      },

      /**
       * Obtiene una noticia por ID
       */
      getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(
          config.endpoints.developerWeb.news.show,
          undefined,
          { id }
        );
      },

      /**
       * Crea una nueva noticia
       */
      create: async (data: any): Promise<ApiResponse<any>> => {
        return apiClient.post<ApiResponse<any>>(config.endpoints.developerWeb.news.store, data);
      },

      /**
       * Actualiza una noticia
       */
      update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiClient.put<ApiResponse<any>>(
          config.endpoints.developerWeb.news.update,
          data,
          { id }
        );
      },

      /**
       * Elimina una noticia
       */
      delete: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.delete<ApiResponse<any>>(
          config.endpoints.developerWeb.news.destroy,
          { id }
        );
      },

      /**
       * Obtiene noticias publicadas
       */
      published: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.news.published);
      },

      /**
       * Reinicia contador de vistas de una noticia
       */
      resetViews: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.post<ApiResponse<any>>(
          config.endpoints.developerWeb.news.resetViews,
          {},
          { id }
        );
      },

      /**
       * Obtiene categorías de noticias
       */
      categories: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.news.categories);
      },

      /**
       * Obtiene estadísticas de noticias
       */
      stats: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.news.stats);
      },
    },

    // Announcements Management
    announcements: {
      list: async (params?: {
        page?: number;
        per_page?: number;
        status?: string;
        target_page?: string;
        search?: string;
      }): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.announcements.index, params);
      },

      getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(
          config.endpoints.developerWeb.announcements.show,
          undefined,
          { id }
        );
      },

      create: async (data: any): Promise<ApiResponse<any>> => {
        return apiClient.post<ApiResponse<any>>(config.endpoints.developerWeb.announcements.store, data);
      },

      update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiClient.put<ApiResponse<any>>(
          config.endpoints.developerWeb.announcements.update,
          data,
          { id }
        );
      },

      delete: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.delete<ApiResponse<any>>(
          config.endpoints.developerWeb.announcements.destroy,
          { id }
        );
      },

      published: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.announcements.published);
      },

      resetViews: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.post<ApiResponse<any>>(
          config.endpoints.developerWeb.announcements.resetViews,
          {},
          { id }
        );
      },

      stats: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.announcements.stats);
      },
    },

    // Alerts Management
    alerts: {
      list: async (params?: {
        page?: number;
        per_page?: number;
        status?: string;
        item_type?: string;
        search?: string;
      }): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.alerts.index, params);
      },

      getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(
          config.endpoints.developerWeb.alerts.show,
          undefined,
          { id }
        );
      },

      create: async (data: any): Promise<ApiResponse<any>> => {
        return apiClient.post<ApiResponse<any>>(config.endpoints.developerWeb.alerts.store, data);
      },

      update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiClient.put<ApiResponse<any>>(
          config.endpoints.developerWeb.alerts.update,
          data,
          { id }
        );
      },

      delete: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.delete<ApiResponse<any>>(
          config.endpoints.developerWeb.alerts.destroy,
          { id }
        );
      },

      published: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.alerts.published);
      },

      stats: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.alerts.stats);
      },
    },

    // Chatbot Analytics
    chatbotAnalytics: {
      summary: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.analytics.summary);
      },
    },

    // Chatbot Config
    chatbotConfig: {
      get: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.config.get);
      },
      update: async (data: any): Promise<ApiResponse<any>> => {
        return apiClient.put<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.config.update, data);
      },
      reset: async (): Promise<ApiResponse<any>> => {
        return apiClient.post<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.config.reset);
      }
    },

    // FAQs Management
    faqs: {
      list: async (params?: {
        page?: number;
        per_page?: number;
        category?: string;  // Cambiado a string
        active?: boolean;   // Cambiado de status a active
        search?: string;
      }): Promise<ApiResponse<any>> => {
        const queryParams: Record<string, string | number> | undefined = params
          ? Object.fromEntries(
            Object.entries(params)
              .filter(([, value]) => value !== undefined && value !== null)
              .map(([key, value]) => {
                if (key === "active" && typeof value === "boolean") {
                  return [key, value ? 1 : 0];
                }
                return [key, value as string | number];
              })
          )
          : undefined;

        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.faqs.index, queryParams);
      },

      getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(
          config.endpoints.developerWeb.chatbot.faqs.show,
          undefined,
          { id }
        );
      },

      create: async (data: any): Promise<ApiResponse<any>> => {
        return apiClient.post<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.faqs.store, data);
      },

      update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiClient.put<ApiResponse<any>>(
          config.endpoints.developerWeb.chatbot.faqs.update,
          data,
          { id }
        );
      },

      delete: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.delete<ApiResponse<any>>(
          config.endpoints.developerWeb.chatbot.faqs.destroy,
          { id }
        );
      },

      categories: async (): Promise<ApiResponse<FAQCategory[]>> => {
        // Usar las categorías estáticas según la documentación
        const staticCategories: FAQCategory[] = [
          { value: "general", name: "General", color: "blue" },
          { value: "academico", name: "Académico", color: "green" },
          { value: "tecnico", name: "Técnico", color: "orange" },
          { value: "pagos", name: "Pagos y Facturación", color: "purple" },
          { value: "soporte", name: "Soporte Técnico", color: "red" },
        ];

        return Promise.resolve({
          success: true,
          data: staticCategories,
          message: "Categorías cargadas correctamente"
        });
      },

      stats: async (): Promise<ApiResponse<any>> => {
        return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.faqs.stats);
      },

      // Public endpoints
      public: {
        list: async (): Promise<ApiResponse<any>> => {
          return apiClient.get<ApiResponse<any>>(config.endpoints.developerWeb.chatbot.faqs.public.index);
        },

        getById: async (id: number): Promise<ApiResponse<any>> => {
          return apiClient.get<ApiResponse<any>>(
            config.endpoints.developerWeb.chatbot.faqs.public.show,
            undefined,
            { id }
          );
        },
      },
    },
  },

  // ============================================
  // Academic Analysis Module
  // ============================================

  academicAnalysis: {

    groups: {
      /**
       * Obtiene la lista de grupos activos para filtros
       */
      active: async (): Promise<ApiResponse<GroupOption[]>> => {
        return apiClient.get<ApiResponse<GroupOption[]>>(
          "/data-analyst/groups/active"
        );
      },
    },
    // Dashboard
    dashboard: {
      /**
     * Obtiene los datos principales del dashboard
     */
      main: async (filters?: ChartFilters): Promise<DashboardMainResponse> => {
        return apiClient.get<DashboardMainResponse>(
          config.endpoints.academicAnalysis.dashboard.main,
          filters as Record<string, string | number> | undefined
        );
      },

      /**
       * Obtiene los datos de gráficos del dashboard
       */
      charts: async (filters?: ChartFilters): Promise<DashboardChartsResponse> => {
        return apiClient.get<DashboardChartsResponse>(
          config.endpoints.academicAnalysis.dashboard.charts,
          filters as Record<string, string | number> | undefined
        );
      },
    },

    // BigQuery Sync
    bigquery: {
      /**
       * Sincronización completa de tablas con BigQuery
       */
      syncFull: async (): Promise<ApiResponse<BigQuerySyncResponse>> => {
        return apiClient.post<ApiResponse<BigQuerySyncResponse>>(
          config.endpoints.academicAnalysis.bigquery.syncFull,
          {}
        );
      },

      /**
       * Sincronización incremental con BigQuery
       */
      syncIncremental: async (): Promise<ApiResponse<BigQuerySyncResponse>> => {
        return apiClient.post<ApiResponse<BigQuerySyncResponse>>(
          config.endpoints.academicAnalysis.bigquery.syncIncremental,
          {}
        );
      },
    },

    // Attendance
    attendance: {
      /**
       * Obtiene el resumen general de asistencia
       */
      general: async (filters?: ChartFilters): Promise<AttendanceResponse> => {
        return apiClient.get<AttendanceResponse>(
          config.endpoints.academicAnalysis.attendance.general,
          filters as Record<string, string | number> | undefined
        );
      },

      /**
       * Obtiene el resumen local de asistencia
       */
      local: async (filters?: ChartFilters): Promise<ApiResponse<LocalAttendanceSummary[]>> => {
        return apiClient.get<ApiResponse<LocalAttendanceSummary[]>>(
          config.endpoints.academicAnalysis.attendance.local,
          filters as Record<string, string | number> | undefined
        );
      },

      /**
   * Exporta reporte de asistencia en PDF o Excel
   */
      export: async (filters: ChartFilters, format: 'pdf' | 'excel'): Promise<Blob> => {
        const response = await fetch(`${config.apiUrl}${config.endpoints.academicAnalysis.attendance.export}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Authorization': `Bearer ${getStoredToken()}`
          },
          body: JSON.stringify({
            ...filters,
            format: format
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApiError(
            errorData.error || `Error ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        return response.blob();
      },
    },

    // Performance
    performance: {
      /**
       * Obtiene el rendimiento completo
       */
      general: async (filters?: ChartFilters): Promise<PerformanceResponse> => {
        return apiClient.get<PerformanceResponse>(
          config.endpoints.academicAnalysis.performance.general,
          filters as Record<string, string | number> | undefined
        );
      },
      export: async (filters: ChartFilters, format: 'pdf' | 'excel'): Promise<Blob> => {
        const response = await fetch(`${config.apiUrl}${config.endpoints.academicAnalysis.performance.export}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Authorization': `Bearer ${getStoredToken()}`
          },
          body: JSON.stringify({
            ...filters,
            format: format
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApiError(
            errorData.error || `Error ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        return response.blob();
      },
    },

    // Progress
    progress: {
      /**
       * Obtiene el progreso completo
       */
      general: async (filters?: ChartFilters): Promise<ProgressResponse> => {
        return apiClient.get<ProgressResponse>(
          config.endpoints.academicAnalysis.progress.general,
          filters as Record<string, string | number> | undefined
        );
      },

      export: async (filters: ChartFilters, format: 'pdf' | 'excel'): Promise<Blob> => {
        const response = await fetch(`${config.apiUrl}${config.endpoints.academicAnalysis.progress.export}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Authorization': `Bearer ${getStoredToken()}`
          },
          body: JSON.stringify({
            ...filters,
            format: format
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApiError(
            errorData.error || `Error ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        return response.blob();
      },
    },

    // Attendance Charts
    attendanceCharts: {
      /**
       * Obtiene distribución de estados de asistencia
       */
      statusDistribution: async (filters?: ChartFilters): Promise<ApiResponse<AttendanceStatusResponse>> => {
        return apiClient.get<ApiResponse<AttendanceStatusResponse>>(
          config.endpoints.academicAnalysis.attendance.statusDistribution,
          filters as Record<string, string | number> | undefined
        );
      },

      /**
       * Obtiene tendencias semanales de ausencias
       */
      weeklyTrends: async (filters?: ChartFilters): Promise<ApiResponse<WeeklyTrendsResponse>> => {
        return apiClient.get<ApiResponse<WeeklyTrendsResponse>>(
          config.endpoints.academicAnalysis.attendance.weeklyTrends,
          filters as Record<string, string | number> | undefined
        );
      },

      /**
       * Obtiene datos para calendario de asistencia
       */
      attendanceCalendar: async (filters?: ChartFilters): Promise<ApiResponse<AttendanceCalendarResponse>> => {
        return apiClient.get<ApiResponse<AttendanceCalendarResponse>>(
          config.endpoints.academicAnalysis.attendance.attendanceCalendar,
          filters as Record<string, string | number> | undefined
        );
      },
    },

    // Performance Charts
    performanceCharts: {
      /**
       * Obtiene distribución de calificaciones
       */
      gradeDistribution: async (filters?: ChartFilters): Promise<ApiResponse<GradeDistributionResponse>> => {
        return apiClient.get<ApiResponse<GradeDistributionResponse>>(
          config.endpoints.academicAnalysis.performance.gradeDistribution,
          filters as Record<string, string | number> | undefined
        )
      },

      /**
       * Obtiene correlación entre asistencia y calificación
       */
      attendanceGradeCorrelation: async (filters?: ChartFilters): Promise<ApiResponse<AttendanceGradeCorrelationResponse>> => {
        return apiClient.get<ApiResponse<AttendanceGradeCorrelationResponse>>(
          config.endpoints.academicAnalysis.performance.attendanceGradeCorrelation,
          filters as Record<string, string | number> | undefined
        )
      },

      /**
       * Obtiene rendimiento por grupo para gráfico radar
       */
      groupPerformance: async (filters?: ChartFilters): Promise<ApiResponse<GroupPerformanceResponse>> => {
        return apiClient.get<ApiResponse<GroupPerformanceResponse>>(
          config.endpoints.academicAnalysis.performance.groupPerformance,
          filters as Record<string, string | number> | undefined
        )
      },
    },

    // Progress Charts
    progressCharts: {
      /**
       * Obtiene evolución de calificaciones
       */
      gradeEvolution: async (filters?: ChartFilters): Promise<ApiResponse<GradeEvolutionResponse>> => {
        return apiClient.get<ApiResponse<GradeEvolutionResponse>>(
          config.endpoints.academicAnalysis.progress.gradeEvolution,
          filters as Record<string, string | number> | undefined
        )
      },
    },
  },

  // ============================================
  // Dropout Prediction Module
  // ============================================

  dropoutPrediction: {
    /**
     * Obtiene las predicciones de deserción
     */
    predictions: async (filters?: DropoutPredictionFilters): Promise<PredictionsResponse> => {
      const params = filters ? convertDropoutFilters(filters) : undefined
      return apiClient.get<PredictionsResponse>(
        config.endpoints.dropoutPrediction.predictions,
        params
      )
    },

    /**
     * Obtiene predicciones detalladas
     */
    predictionsDetailed: async (): Promise<DetailedPredictionsResponse> => {
      return apiClient.get<DetailedPredictionsResponse>(
        config.endpoints.dropoutPrediction.predictionsDetailed
      )
    },

    /**
     * Obtiene estudiantes de alto riesgo
     */
    highRisk: async (): Promise<HighRiskResponse> => {
      return apiClient.get<HighRiskResponse>(
        config.endpoints.dropoutPrediction.highRisk
      )
    },

    /**
     * Obtiene el estado del sistema
     */
    systemStatus: async (): Promise<ApiResponse<SystemStatusData>> => {
      return apiClient.get<ApiResponse<SystemStatusData>>(
        config.endpoints.dropoutPrediction.systemStatus
      )
    },

    /**
     * Obtiene predicciones por grupo
     */
    predictionsByGroup: async (groupId: number): Promise<PredictionsResponse> => {
      return apiClient.get<PredictionsResponse>(
        config.endpoints.dropoutPrediction.predictionsByGroup.replace(':groupId', groupId.toString())
      )
    },

    /**
   * Exporta predicciones de deserción en PDF o Excel
   */
    exportPredictions: async (filters: DropoutPredictionFilters, format: 'pdf' | 'excel'): Promise<Blob> => {
      const response = await fetch(`${config.apiUrl}${config.endpoints.dropoutPrediction.export.predictions}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          ...filters,
          format: format
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.error || `Error ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return response.blob();
    },

    /**
     * Exporta estudiantes de alto riesgo en PDF o Excel
     */
    exportHighRisk: async (format: 'pdf' | 'excel'): Promise<Blob> => {
      const response = await fetch(`${config.apiUrl}${config.endpoints.dropoutPrediction.export.highRisk}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          format: format
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.error || `Error ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return response.blob();
    },
  },
};

// ============================================
// Helpers
// ============================================

/**
 * Guarda la sesión en localStorage
 */
export const saveAuthSession = (token: string, user: User): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Limpia la sesión del localStorage
 */
export const clearAuthSession = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Obtiene el usuario del localStorage
 */
export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Obtiene el token del localStorage
 */
export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  return token ? token.replace(/^"|"$/g, "") : null;
};

function convertDropoutFilters(filters: DropoutPredictionFilters): Record<string, string | number> {
  const result: Record<string, string | number> = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'date_range' && typeof value === 'object') {
        if (value.start) result.start_date = value.start
        if (value.end) result.end_date = value.end
      } else {
        result[key] = value
      }
    }
  })

  return result
}
