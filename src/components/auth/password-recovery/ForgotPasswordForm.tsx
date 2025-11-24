"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconMail, IconArrowLeft, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { usePasswordRecovery } from "@/hooks/usePasswordRecovery"

// Form Schema
const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email({
      message: "Por favor, ingresa una dirección de correo válida.",
    })
    .min(1, {
      message: "El correo electrónico es obligatorio.",
    }),
})

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>

export function ForgotPasswordForm() {
  const { loading, error, success, sendRecoveryEmail } = usePasswordRecovery()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await sendRecoveryEmail(data)
    if (result?.success) {
      reset()
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <IconMail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa tu correo secundario y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
                <IconCircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">
                  Correo enviado
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Se ha enviado un enlace de recuperación a tu correo. Revisa tu bandeja de entrada y sigue las instrucciones.
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

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Secundario</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email-secundario@gmail.com"
                {...register("email")}
                disabled={loading}
                aria-invalid={errors.email ? "true" : "false"}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <span className="mr-2">Enviando...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <a
                href="/auth"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <IconArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
