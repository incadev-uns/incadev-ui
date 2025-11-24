import { useState } from "react";
import { toast } from "sonner";
import { config } from "@/config/technology-config";

interface PasswordRecoveryResponse {
  success: boolean;
  message: string;
}

interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export function usePasswordRecovery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Enviar email de recuperación de contraseña usando el email secundario
   * POST /api/auth/forgot-password
   * Body: { "email": "mi_email_secundario@gmail.com" }
   */
  const sendRecoveryEmail = async (data: { email: string }): Promise<PasswordRecoveryResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.forgotPassword}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast.success("Correo enviado", {
          description: "Se ha enviado un enlace de recuperación a tu correo secundario",
        });
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || "Error al enviar el correo de recuperación";
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = "Error de conexión. Por favor intenta nuevamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<PasswordRecoveryResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.resetPassword}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast.success("Contraseña actualizada", {
          description: "Tu contraseña ha sido restablecida exitosamente",
        });
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || "Error al restablecer la contraseña";
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = "Error de conexión. Por favor intenta nuevamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    sendRecoveryEmail,
    resetPassword,
  };
}
