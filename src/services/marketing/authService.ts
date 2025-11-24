// src/services/marketing/authService.ts
import { config } from '../../config/marketing-config';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface User {
  id: number;
  name: string;
  fullname?: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * Obtiene el token guardado
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? token.replace(/^"|"$/g, '') : null;
}

/**
 * Obtiene el usuario guardado
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Cierra sesión: llama al backend y limpia el storage
 */
export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;

  const token = getToken();

  // Intentar cerrar sesión en el backend
  if (token) {
    try {
      await fetch(`${config.authApiUrl}${config.endpoints.auth.logout}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('[authService] Error al cerrar sesión en backend:', error);
    }
  }

  // Siempre limpiar localStorage y redirigir
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/auth/marketing';
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(role: string | string[]): boolean {
  const user = getUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

/**
 * Wrapper de fetch que incluye automáticamente el Bearer token
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token found. Please login first.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please login again.');
  }

  return response;
}