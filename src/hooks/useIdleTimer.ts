import { useEffect, useRef, useCallback } from 'react';

export interface UseIdleTimerOptions {
  /**
   * Tiempo de inactividad en milisegundos antes de considerar al usuario como inactivo
   * Por defecto: 30 minutos (1800000 ms)
   */
  timeout?: number;

  /**
   * Callback que se ejecuta cuando el usuario se vuelve inactivo
   */
  onIdle?: () => void;

  /**
   * Callback que se ejecuta cuando el usuario vuelve a estar activo
   */
  onActive?: () => void;

  /**
   * Eventos que resetean el timer de inactividad
   * Por defecto: ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
   */
  events?: string[];

  /**
   * Si está deshabilitado, el timer no se ejecutará
   */
  disabled?: boolean;

  /**
   * Tiempo de advertencia en milisegundos antes del logout
   * Si se establece, se llamará onWarning en lugar de onIdle
   */
  warningTimeout?: number;

  /**
   * Callback que se ejecuta cuando se muestra la advertencia
   */
  onWarning?: () => void;
}

/**
 * Hook personalizado para detectar inactividad del usuario
 *
 * @example
 * ```tsx
 * useIdleTimer({
 *   timeout: 30 * 60 * 1000, // 30 minutos
 *   onIdle: () => {
 *     console.log('Usuario inactivo, cerrando sesión...');
 *     logout();
 *   }
 * });
 * ```
 */
export function useIdleTimer({
  timeout = 30 * 60 * 1000, // 30 minutos por defecto
  onIdle,
  onActive,
  events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'],
  disabled = false,
  warningTimeout,
  onWarning,
}: UseIdleTimerOptions = {}) {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);
  const isWarningShownRef = useRef(false);

  /**
   * Limpia todos los timers activos
   */
  const clearTimers = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current);
      warningTimeoutIdRef.current = null;
    }
  }, []);

  /**
   * Marca al usuario como inactivo
   */
  const setIdle = useCallback(() => {
    if (!isIdleRef.current) {
      isIdleRef.current = true;
      onIdle?.();
    }
  }, [onIdle]);

  /**
   * Muestra la advertencia de inactividad
   */
  const showWarning = useCallback(() => {
    if (!isWarningShownRef.current) {
      isWarningShownRef.current = true;
      onWarning?.();
    }
  }, [onWarning]);

  /**
   * Resetea el timer de inactividad
   */
  const resetTimer = useCallback(() => {
    if (disabled) return;

    // Si el usuario estaba inactivo, marcarlo como activo
    if (isIdleRef.current) {
      isIdleRef.current = false;
      onActive?.();
    }

    // Resetear la advertencia
    isWarningShownRef.current = false;

    // Limpiar timers existentes
    clearTimers();

    // Si hay warning timeout, configurar el timer de advertencia
    if (warningTimeout && onWarning) {
      warningTimeoutIdRef.current = setTimeout(() => {
        showWarning();

        // Después de mostrar la advertencia, esperar el tiempo restante
        const remainingTime = timeout - warningTimeout;
        timeoutIdRef.current = setTimeout(setIdle, remainingTime);
      }, warningTimeout);
    } else {
      // Sin advertencia, ir directo al timeout
      timeoutIdRef.current = setTimeout(setIdle, timeout);
    }
  }, [disabled, timeout, warningTimeout, onWarning, setIdle, showWarning, onActive, clearTimers]);

  /**
   * Configura los event listeners
   */
  useEffect(() => {
    if (disabled) {
      clearTimers();
      return;
    }

    // Agregar event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Iniciar el timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimers();
    };
  }, [disabled, events, resetTimer, clearTimers]);

  /**
   * Retorna un objeto con utilidades para controlar el timer
   */
  return {
    /**
     * Resetea manualmente el timer de inactividad
     */
    reset: resetTimer,

    /**
     * Indica si el usuario está inactivo
     */
    isIdle: () => isIdleRef.current,

    /**
     * Indica si se está mostrando la advertencia
     */
    isWarningShown: () => isWarningShownRef.current,
  };
}
