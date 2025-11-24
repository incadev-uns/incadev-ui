"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconLock, IconEye, IconEyeOff, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { usePasswordRecovery } from "@/hooks/usePasswordRecovery"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"

// Form Schema
const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "La contraseña debe tener al menos 8 caracteres.",
      })
      .regex(/[a-z]/, {
        message: "La contraseña debe contener al menos una letra minúscula.",
      })
      .regex(/[A-Z]/, {
        message: "La contraseña debe contener al menos una letra mayúscula.",
      })
      .regex(/\d/, {
        message: "La contraseña debe contener al menos un número.",
      }),
    password_confirmation: z.string().min(1, {
      message: "Por favor, confirma tu contraseña.",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["password_confirmation"],
  })

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState("")
  const [token, setToken] = useState<string>("")
  const [email, setEmail] = useState<string>("")

  const { loading, error, success, resetPassword } = usePasswordRecovery()

  // Get token and email from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const tokenParam = urlParams.get("token") || ""
      const emailParam = urlParams.get("email") || ""
      setToken(tokenParam)
      setEmail(emailParam)
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  })

  // Watch password for strength indicator
  const password = watch("password")

  useEffect(() => {
    setPasswordValue(password || "")
  }, [password])

  // Redirect to login after success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        window.location.href = "/auth"
      }, 3000)
    }
  }, [success])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) {
      return
    }

    await resetPassword({
      email,
      token,
      password: data.password,
      password_confirmation: data.password_confirmation,
    })
  }

  // Check if token and email are valid
  if (!token || !email) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertTitle>Link inválido</AlertTitle>
              <AlertDescription>
                El enlace de recuperación es inválido o ha expirado. Por favor, solicita un nuevo enlace de recuperación.
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <a
                href="/tecnologico/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Solicitar nuevo enlace
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <IconLock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
                <IconCircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">
                  Contraseña actualizada
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Tu contraseña ha sido actualizada exitosamente. Redirigiendo al inicio de sesión...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={loading || success}
                  aria-invalid={errors.password ? "true" : "false"}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={passwordValue} />

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password_confirmation")}
                  disabled={loading || success}
                  aria-invalid={errors.password_confirmation ? "true" : "false"}
                  className={errors.password_confirmation ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || success}
              size="lg"
            >
              {loading ? (
                <>
                  <span className="mr-2">Cambiando contraseña...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : success ? (
                "Redirigiendo..."
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
