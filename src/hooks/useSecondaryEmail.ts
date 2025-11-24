import { useState } from "react";
import { toast } from "sonner";
import { config } from "@/config/technology-config";

interface SecondaryEmailResponse {
  success: boolean;
  message: string;
}

export function useSecondaryEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  /**
   * Enviar código de verificación al email secundario
   * POST /api/auth/secondary-email/add
   * Body: { "secondary_email": "mi_email_secundario@gmail.com" }
   */
  const addSecondaryEmail = async (
    secondaryEmail: string
  ): Promise<SecondaryEmailResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.secondaryEmail.add}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ secondary_email: secondaryEmail }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast.success("Código enviado", {
          description: "Revisa tu correo electrónico para obtener el código de verificación",
        });
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || "Error al enviar el código";
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

  /**
   * Verificar código de email secundario
   * POST /api/auth/secondary-email/verify
   * Body: { "code": "123456" }
   */
  const verifySecondaryEmail = async (
    code: string
  ): Promise<SecondaryEmailResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.secondaryEmail.verify}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast.success("Email verificado", {
          description: "Tu email secundario ha sido verificado exitosamente",
        });
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || "Error al verificar el código";
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

  /**
   * Reenviar código de verificación
   * POST /auth/secondary-email/resend-code
   */
  const resendCode = async (): Promise<SecondaryEmailResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.secondaryEmail.resendCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast.success("Código reenviado", {
          description: "Se ha enviado un nuevo código a tu email",
        });
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || "Error al reenviar el código";
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

  /**
   * Eliminar email secundario
   * DELETE /auth/secondary-email/remove
   */
  const removeSecondaryEmail = async (): Promise<SecondaryEmailResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.secondaryEmail.remove}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast.success("Email eliminado", {
          description: "Tu email secundario ha sido eliminado",
        });
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || "Error al eliminar el email";
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
    addSecondaryEmail,
    verifySecondaryEmail,
    resendCode,
    removeSecondaryEmail,
  };
}
