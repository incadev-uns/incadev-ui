// src/services/authService.ts
import { config } from '../../config/technology-config';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Obtiene el token guardado
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
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
 * Cierra sesión y limpia el storage
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/auth';
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