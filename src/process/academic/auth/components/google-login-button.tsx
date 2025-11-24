"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { config } from "@/config/academic-config"

interface GoogleLoginButtonProps {
  text?: string
}

export function GoogleLoginButton({ text = "Iniciar con Google" }: GoogleLoginButtonProps) {
  const handleGoogleLogin = async () => {
    try {
      /* const response = await fetch(`${config.apiUrl}${config.endpoints.auth.redirect}?redirect=/academico/dashboard`)

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || "Error al obtener la URL de redirección")
      }

      const data = await response.json()
      console.log("Login response:", data);
      if (data.redirect_url) {
        toast.info("Redirigiendo a Google...")
        window.location.href = data.redirect_url
      } else {
        throw new Error("No se recibió la URL de redirección")
      } */
      window.location.href = "https://instituto.cetivirgendelapuerta.com/backend/academico/public/auth/google/redirect"
    } catch (error: any) {
      console.error("Error en login con Google:", error)
      toast.error("No se pudo iniciar sesión con Google.")
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {text}
    </Button>
  )
}
