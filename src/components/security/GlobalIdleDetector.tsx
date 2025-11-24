import { useEffect, useState } from 'react';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { technologyApi } from '@/services/tecnologico/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

interface GlobalIdleDetectorProps {
  /**
   * Si está habilitado, el detector estará activo
   * Por defecto: true
   */
  enabled?: boolean;

  /**
   * Callback adicional cuando se cierra sesión por inactividad
   */
  onLogout?: () => void;
}

/**
 * Componente global que detecta inactividad del usuario y cierra sesión automáticamente
 * según la configuración del módulo de seguridad
 *
 * @example
 * ```tsx
 * <GlobalIdleDetector enabled={!!token} />
 * ```
 */
export function GlobalIdleDetector({ enabled = true, onLogout }: GlobalIdleDetectorProps) {
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [loading, setLoading] = useState(true);

  // Verificar si hay token (usuario autenticado)
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  /**
   * Obtiene la configuración de timeout de sesión desde el backend
   */
  useEffect(() => {
    if (!enabled || !hasToken) {
      setLoading(false);
      return;
    }

    const fetchSessionTimeout = async () => {
      try {
        const response = await technologyApi.security.settings.grouped();
        if (response.success && response.data?.sessions?.session_timeout_minutes) {
          const timeoutMinutes = response.data.sessions.session_timeout_minutes.value;
          // Convertir minutos a milisegundos
          setSessionTimeout(timeoutMinutes * 60 * 1000);
        } else {
          // Usar valor por defecto de 30 minutos si no se puede obtener la configuración
          setSessionTimeout(30 * 60 * 1000);
        }
      } catch (error) {
        console.error('Error fetching session timeout:', error);
        // Usar valor por defecto de 30 minutos en caso de error
        setSessionTimeout(30 * 60 * 1000);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionTimeout();
  }, [enabled, hasToken]);

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Ejecutar callback personalizado si existe
    onLogout?.();

    // Redirigir a la página raíz
    window.location.href = '/';
  };

  /**
   * Cuenta regresiva para el cierre de sesión
   */
  useEffect(() => {
    if (!showWarningDialog) return;

    setRemainingSeconds(60);
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarningDialog]);

  /**
   * Muestra la advertencia de inactividad
   */
  const handleWarning = () => {
    setShowWarningDialog(true);
  };

  /**
   * Maneja cuando el usuario se marca como inactivo (timeout completo)
   */
  const handleIdle = () => {
    handleLogout();
  };

  /**
   * Continúa la sesión (cierra el diálogo de advertencia)
   */
  const handleContinueSession = () => {
    setShowWarningDialog(false);
    idleTimer.reset();
  };

  /**
   * Hook de detección de inactividad
   */
  const idleTimer = useIdleTimer({
    timeout: sessionTimeout || 30 * 60 * 1000,
    warningTimeout: sessionTimeout ? sessionTimeout - 60 * 1000 : 29 * 60 * 1000, // 1 minuto antes
    onWarning: handleWarning,
    onIdle: handleIdle,
    disabled: !enabled || !hasToken || sessionTimeout === null || loading,
    events: ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'],
  });

  // No renderizar nada si no está habilitado o no hay sesión
  if (!enabled || !hasToken || loading) {
    return null;
  }

  return (
    <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Clock className="w-5 h-5" />
            Sesión por Expirar
          </DialogTitle>
          <DialogDescription>
            Tu sesión está a punto de cerrarse por inactividad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertDescription className="text-center">
              <div className="text-4xl font-bold mb-2">{remainingSeconds}s</div>
              <div className="text-sm">
                Tu sesión se cerrará automáticamente si no realizas ninguna acción
              </div>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>Has estado inactivo por un período prolongado.</p>
            <p>
              Por tu seguridad, cerraremos tu sesión en{' '}
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {remainingSeconds} segundos
              </span>
              .
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión Ahora
          </Button>
          <Button
            onClick={handleContinueSession}
            className="w-full sm:w-auto"
            autoFocus
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Continuar Sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
