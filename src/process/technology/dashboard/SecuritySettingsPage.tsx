import { useState, useEffect } from "react"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Settings,
  Save,
  RefreshCw,
  Shield,
  Clock,
  Lock,
  Monitor,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

interface GroupedSettings {
  login: Record<string, { value: any; type: string; description: string }>
  blocking: Record<string, { value: any; type: string; description: string }>
  sessions: Record<string, { value: any; type: string; description: string }>
  anomaly_detection: Record<string, { value: any; type: string; description: string }>
}

export default function SecuritySettingsPage() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [settings, setSettings] = useState<GroupedSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modifiedSettings, setModifiedSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!authLoading && user) {
      fetchSettings()
    }
  }, [authLoading, user])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await technologyApi.security.settings.grouped()
      if (response.success && response.data) {
        setSettings(response.data)
        setModifiedSettings({})
      } else {
        toast.error("Error al cargar configuraciones")
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error)
      toast.error(error.message || "Error al cargar configuraciones")
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setModifiedSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveSettings = async () => {
    if (Object.keys(modifiedSettings).length === 0) {
      toast.info("No hay cambios para guardar")
      return
    }

    setSaving(true)
    try {
      const response = await technologyApi.security.settings.updateBulk(modifiedSettings)
      if (response.success) {
        toast.success("Configuraciones guardadas exitosamente")
        setModifiedSettings({})
        fetchSettings()
      } else {
        toast.error(response.message || "Error al guardar configuraciones")
      }
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast.error(error.message || "Error al guardar configuraciones")
    } finally {
      setSaving(false)
    }
  }

  const handleClearCache = async () => {
    try {
      const response = await technologyApi.security.settings.clearCache()
      if (response.success) {
        toast.success("Cache limpiado exitosamente")
      } else {
        toast.error(response.message || "Error al limpiar cache")
      }
    } catch (error: any) {
      console.error("Error clearing cache:", error)
      toast.error(error.message || "Error al limpiar cache")
    }
  }

  const getSettingValue = (key: string, originalValue: any) => {
    return modifiedSettings.hasOwnProperty(key) ? modifiedSettings[key] : originalValue
  }

  const renderSettingInput = (key: string, setting: { value: any; type: string; description: string }) => {
    const currentValue = getSettingValue(key, setting.value)
    const isModified = modifiedSettings.hasOwnProperty(key)

    if (setting.type === "boolean") {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={key}
            checked={currentValue}
            onCheckedChange={(checked) => handleSettingChange(key, checked)}
          />
          <Label htmlFor={key} className={isModified ? "text-primary" : "text-muted-foreground"}>
            {currentValue ? "Habilitado" : "Deshabilitado"}
          </Label>
        </div>
      )
    }

    return (
      <Input
        id={key}
        type="number"
        value={currentValue}
        onChange={(e) => handleSettingChange(key, parseInt(e.target.value) || 0)}
        className={isModified ? "border-primary" : ""}
      />
    )
  }

  if (authLoading || loading) {
    return (
      <TechnologyLayout title="Configuracion de Seguridad">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Configuracion de Seguridad">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" />
              Configuracion de Seguridad
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ajusta los parametros de seguridad del sistema
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleClearCache} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar Cache
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving || Object.keys(modifiedSettings).length === 0}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>

        {Object.keys(modifiedSettings).length > 0 && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span>
                Tienes {Object.keys(modifiedSettings).length} cambio(s) sin guardar
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModifiedSettings({})
                  fetchSettings()
                }}
              >
                Descartar cambios
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {settings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Login Settings */}
            {settings.login && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    Configuracion de Login
                  </CardTitle>
                  <CardDescription>
                    Controla los intentos de inicio de sesion y bloqueos automaticos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.login).map(([key, setting]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium text-foreground">
                        {setting.description}
                      </Label>
                      {renderSettingInput(key, setting)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Blocking Settings */}
            {settings.blocking && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-destructive" />
                    Configuracion de Bloqueos
                  </CardTitle>
                  <CardDescription>
                    Configura la duracion y comportamiento de los bloqueos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.blocking).map(([key, setting]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium text-foreground">
                        {setting.description}
                      </Label>
                      {renderSettingInput(key, setting)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sessions Settings */}
            {settings.sessions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Configuracion de Sesiones
                  </CardTitle>
                  <CardDescription>
                    Administra el tiempo de sesion y sesiones concurrentes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.sessions).map(([key, setting]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium text-foreground">
                        {setting.description}
                      </Label>
                      {renderSettingInput(key, setting)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Anomaly Detection Settings */}
            {settings.anomaly_detection && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                    Deteccion de Anomalias
                  </CardTitle>
                  <CardDescription>
                    Configura la deteccion de actividad sospechosa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.anomaly_detection).map(([key, setting]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium text-foreground">
                        {setting.description}
                      </Label>
                      {renderSettingInput(key, setting)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </TechnologyLayout>
  )
}
