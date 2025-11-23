import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldLabel } from "@/components/ui/field"
import {
  IconShieldCheck,
  IconShieldOff,
  IconRefresh,
  IconX
} from "@tabler/icons-react"
import { toast } from "sonner"

interface TwoFactorAuthCardProps {
  twoFactorEnabled: boolean
  show2FASetup: boolean
  qrCodeUrl: string
  secret: string
  recoveryCodes: string[]
  twoFACode: string
  twoFAPassword: string
  processing2FA: boolean
  onEnable2FA: () => void
  onVerify2FA: () => void
  onDisable2FA: () => void
  onRegenerateRecoveryCodes: () => void
  onTwoFACodeChange: (code: string) => void
  onTwoFAPasswordChange: (password: string) => void
  onCancel2FASetup: () => void
}

export function TwoFactorAuthCard({
  twoFactorEnabled,
  show2FASetup,
  qrCodeUrl,
  secret,
  recoveryCodes,
  twoFACode,
  twoFAPassword,
  processing2FA,
  onEnable2FA,
  onVerify2FA,
  onDisable2FA,
  onRegenerateRecoveryCodes,
  onTwoFACodeChange,
  onTwoFAPasswordChange,
  onCancel2FASetup
}: TwoFactorAuthCardProps) {
  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <IconShieldCheck className="h-5 w-5" />
          Autenticación 2FA
        </CardTitle>
        <CardDescription className="text-sm mt-1.5">
          Protege tu cuenta con verificación de dos pasos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        {twoFactorEnabled ? (
          <>
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <IconShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                2FA Habilitado
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateRecoveryCodes}
              className="w-full"
            >
              <IconRefresh className="mr-2 h-4 w-4" />
              Regenerar Códigos de Recuperación
            </Button>

            <div className="space-y-2">
              <FieldLabel>Contraseña para deshabilitar</FieldLabel>
              <Input
                type="password"
                placeholder="Tu contraseña"
                value={twoFAPassword}
                onChange={(e) => onTwoFAPasswordChange(e.target.value)}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={onDisable2FA}
                disabled={processing2FA}
                className="w-full"
              >
                <IconShieldOff className="mr-2 h-4 w-4" />
                {processing2FA ? "Deshabilitando..." : "Deshabilitar 2FA"}
              </Button>
            </div>

            {recoveryCodes.length > 0 && (
              <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border-2 border-yellow-200 dark:border-yellow-800/50">
                <div className="flex items-start gap-2">
                  <IconShieldCheck className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                      Códigos de Recuperación
                    </p>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      Guárdalos en un lugar seguro
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded border border-yellow-300 dark:border-yellow-700"
                    >
                      <code className="text-xs font-mono font-semibold flex-1">
                        {code}
                      </code>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = recoveryCodes.join('\n')
                    navigator.clipboard.writeText(text)
                    toast.success("Códigos copiados")
                  }}
                  className="w-full"
                >
                  Copiar códigos
                </Button>
              </div>
            )}
          </>
        ) : !show2FASetup ? (
          <Button
            onClick={onEnable2FA}
            disabled={processing2FA}
            className="w-full"
          >
            <IconShieldCheck className="mr-2 h-4 w-4" />
            {processing2FA ? "Habilitando..." : "Habilitar 2FA"}
          </Button>
        ) : (
          <div className="space-y-6">
            {/* Step 1: QR Code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  1
                </div>
                <p className="text-sm font-medium">Escanea el código QR</p>
              </div>

              <div className="bg-card p-6 rounded-lg border-2 border-dashed border-border">
                {qrCodeUrl && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeUrl)}`}
                        alt="QR Code para Google Authenticator"
                        className="rounded"
                        width="250"
                        height="250"
                        onError={(e) => {
                          e.currentTarget.src = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(qrCodeUrl)}&choe=UTF-8`
                        }}
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Usa Google Authenticator, Authy o similar
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Código manual:</p>
                        <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded">
                          <code className="text-xs font-mono font-semibold text-foreground">{secret}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(secret)
                              toast.success("Código copiado")
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Recovery Codes */}
            {recoveryCodes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    2
                  </div>
                  <p className="text-sm font-medium">Guarda tus códigos de recuperación</p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border-2 border-amber-200 dark:border-amber-800/50 space-y-3">
                  <div className="flex items-start gap-2">
                    <IconShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        ⚠️ Importante: Guarda estos códigos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Usa estos códigos si pierdes acceso a tu autenticador. Solo se muestran una vez.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-card rounded border border-border"
                      >
                        <code className="text-xs font-mono font-semibold flex-1 text-foreground">
                          {code}
                        </code>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = recoveryCodes.join('\n')
                      navigator.clipboard.writeText(text)
                      toast.success("Códigos copiados al portapapeles")
                    }}
                    className="w-full"
                  >
                    Copiar todos los códigos
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Verify */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  3
                </div>
                <p className="text-sm font-medium">Verifica el código</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <FieldLabel>Ingresa el código de 6 dígitos</FieldLabel>
                  <Input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={twoFACode}
                    onChange={(e) => onTwoFACodeChange(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Código de tu app de autenticación
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={onVerify2FA}
                    disabled={processing2FA || twoFACode.length !== 6}
                    className="flex-1"
                  >
                    <IconShieldCheck className="mr-2 h-4 w-4" />
                    {processing2FA ? "Verificando..." : "Activar 2FA"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel2FASetup}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
