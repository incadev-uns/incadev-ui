import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldLabel } from "@/components/ui/field"
import {
  IconMail,
  IconMailCheck,
  IconTrash,
  IconRefresh,
  IconX
} from "@tabler/icons-react"

interface RecoveryEmailCardProps {
  recoveryEmail: string | undefined
  recoveryEmailVerified: boolean
  showRecoveryEmailSetup: boolean
  recoveryEmailStep: 'add' | 'verify'
  recoveryEmailInput: string
  recoveryCode: string
  processingRecovery: boolean
  onAddRecoveryEmail: () => void
  onVerifyRecoveryEmail: () => void
  onResendRecoveryCode: () => void
  onRemoveRecoveryEmail: () => void
  onRecoveryEmailInputChange: (email: string) => void
  onRecoveryCodeChange: (code: string) => void
  onShowSetup: (show: boolean) => void
  onChangeStep: (step: 'add' | 'verify') => void
}

export function RecoveryEmailCard({
  recoveryEmail,
  recoveryEmailVerified,
  showRecoveryEmailSetup,
  recoveryEmailStep,
  recoveryEmailInput,
  recoveryCode,
  processingRecovery,
  onAddRecoveryEmail,
  onVerifyRecoveryEmail,
  onResendRecoveryCode,
  onRemoveRecoveryEmail,
  onRecoveryEmailInputChange,
  onRecoveryCodeChange,
  onShowSetup,
  onChangeStep
}: RecoveryEmailCardProps) {
  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <IconMail className="h-5 w-5" />
          Email Secundario
        </CardTitle>
        <CardDescription className="text-sm mt-1.5">
          Correo alternativo para recuperar tu contraseña y recibir notificaciones importantes de seguridad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        {recoveryEmail ? (
          <>
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              recoveryEmailVerified
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <IconMailCheck className={`h-5 w-5 ${
                recoveryEmailVerified
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  recoveryEmailVerified
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-yellow-900 dark:text-yellow-100'
                }`}>
                  {recoveryEmail}
                </p>
                <p className={`text-xs ${
                  recoveryEmailVerified
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {recoveryEmailVerified ? 'Verificado' : 'Pendiente de verificación'}
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={onRemoveRecoveryEmail}
              className="w-full"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Eliminar Email Secundario
            </Button>
          </>
        ) : !showRecoveryEmailSetup ? (
          <Button
            onClick={() => onShowSetup(true)}
            className="w-full"
          >
            <IconMail className="mr-2 h-4 w-4" />
            Agregar Email Secundario
          </Button>
        ) : recoveryEmailStep === 'add' ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  1
                </div>
                <p className="text-sm font-medium">Ingresa tu email alternativo</p>
              </div>

              <div className="space-y-2">
                <FieldLabel>Email Secundario</FieldLabel>
                <Input
                  type="email"
                  placeholder="tu-email-secundario@gmail.com"
                  value={recoveryEmailInput}
                  onChange={(e) => onRecoveryEmailInputChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Debe ser diferente a tu email principal
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onAddRecoveryEmail}
                disabled={processingRecovery || !recoveryEmailInput}
                className="flex-1"
              >
                <IconMail className="mr-2 h-4 w-4" />
                {processingRecovery ? "Enviando..." : "Enviar Código"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onShowSetup(false)
                  onRecoveryEmailInputChange("")
                }}
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Código enviado a <strong>{recoveryEmailInput}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  2
                </div>
                <p className="text-sm font-medium">Verifica el código</p>
              </div>

              <div className="space-y-2">
                <FieldLabel>Código de 6 dígitos</FieldLabel>
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={recoveryCode}
                  onChange={(e) => onRecoveryCodeChange(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Revisa tu bandeja de entrada
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onVerifyRecoveryEmail}
                  disabled={processingRecovery || recoveryCode.length !== 6}
                  className="flex-1"
                >
                  <IconMailCheck className="mr-2 h-4 w-4" />
                  {processingRecovery ? "Verificando..." : "Verificar"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onResendRecoveryCode}
                  title="Reenviar código"
                >
                  <IconRefresh className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChangeStep('add')
                  onRecoveryCodeChange("")
                }}
                className="w-full"
              >
                ← Cambiar Email
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
