import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Field } from "@/components/ui/field"
import { IconLoader2 } from "@tabler/icons-react"

interface TechRole {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

interface LoginCardProps {
  selectedRole: TechRole | undefined
  roleIcon: React.ComponentType<{ className?: string }>
  requires2FA: boolean
  isSubmitting: boolean
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
}

export function LoginCard({
  selectedRole,
  roleIcon: RoleIcon,
  requires2FA,
  isSubmitting,
  children,
  onSubmit
}: LoginCardProps) {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center p-6 md:p-10 pt-32">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Formulario - Columna izquierda */}
            <form className="p-6 md:p-8" onSubmit={onSubmit}>
              <FieldGroup>
                {/* Header del formulario */}
                <div className="flex flex-col items-center gap-2 text-center mb-6">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${selectedRole?.color || "from-primary to-primary"} mb-2`}>
                    <RoleIcon className="h-9 w-9 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold">
                    {requires2FA ? "Verificación 2FA" : "Bienvenido"}
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    {requires2FA
                      ? "Ingresa tu código de verificación"
                      : `Inicia sesión como ||| ${selectedRole?.name || "usuario"}`}
                  </p>
                </div>

                {/* Campos del formulario (children) */}
                {children}

                {/* Botón de envío */}
                <Field>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        {requires2FA ? "Verificando..." : "Iniciando sesión..."}
                      </>
                    ) : (
                      requires2FA ? "Verificar código" : "Iniciar sesión"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            {/* Imagen - Columna derecha (solo visible en desktop) */}
            <div className="bg-muted relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20" />
              <img
                src="/ISOLOGOTIPO_VERTICAL.svg"
                alt="INCADEV Tecnológico"
                className="absolute inset-0 h-full w-full object-contain p-16 dark:brightness-[0.9]"
              />
              <div className="absolute bottom-8 left-8 right-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  INCADEV Tecnológico
                </h2>
                <p className="text-muted-foreground">
                  Sistema de gestión de procesos tecnológicos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer con términos */}
        <p className="px-6 text-center text-sm text-muted-foreground mt-6">
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Política de Privacidad
          </a>
          .
        </p>
      </div>
    </div>
  )
}
