import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { technologyApi } from "@/services/tecnologico/api"
import type { ChatbotConfig } from "@/types/developer-web"
import { Loader2, Save, Bot, MessageCircle, Clock, Users, AlertCircle, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function ChatbotConfigPage() {
  const [config, setConfig] = useState<ChatbotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [formData, setFormData] = useState({
    enabled: true,
    greeting_message: "",
    fallback_message: "",
    response_delay: 1000,
    max_conversations_per_day: 1000,
    contact_threshold: 3,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await technologyApi.developerWeb.chatbotConfig.get()
      if (response.success && response.data) {
        setConfig(response.data)
        setFormData({
          enabled: response.data.enabled ?? true,
          greeting_message: response.data.greeting_message || "",
          fallback_message: response.data.fallback_message || "",
          response_delay: response.data.response_delay || 1000,
          max_conversations_per_day: response.data.max_conversations_per_day || 1000,
          contact_threshold: response.data.contact_threshold || 3,
        })
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
      toast.error("Error al cargar la configuración del chatbot")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await technologyApi.developerWeb.chatbotConfig.update(formData)
      if (response.success) {
        toast.success("Configuración guardada correctamente")
        setConfig(formData as ChatbotConfig)
      } else {
        toast.error(response.message || "Error al guardar configuración")
      }
    } catch (error: any) {
      console.error("Error al guardar configuración:", error)
      toast.error(error.message || "Error al guardar configuración")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setResetting(true)
      const response = await technologyApi.developerWeb.chatbotConfig.reset()
      if (response.success) {
        toast.success("Configuración restaurada a valores por defecto")
        loadConfig() // Recargar la configuración
      } else {
        toast.error(response.message || "Error al restaurar configuración")
      }
    } catch (error: any) {
      console.error("Error al restaurar configuración:", error)
      toast.error(error.message || "Error al restaurar configuración")
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando configuración...</span>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración del Chatbot</h1>
            <p className="text-muted-foreground">
              Personaliza el comportamiento y apariencia del chatbot
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} disabled={resetting} variant="outline">
              {resetting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Restaurar
            </Button>
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Estado del Servicio
                </CardTitle>
                <CardDescription>
                  Activa o desactiva el servicio de chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <Checkbox
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enabled: checked as boolean })
                    }
                  />
                  <div className="space-y-0.5">
                    <label
                      htmlFor="enabled"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Chatbot Habilitado
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {formData.enabled 
                        ? "El chatbot está activo y disponible para los usuarios" 
                        : "El chatbot está desactivado y no responderá a los usuarios"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Mensajes del Chatbot
                </CardTitle>
                <CardDescription>
                  Personaliza los mensajes que mostrará el chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="greeting_message">
                    Mensaje de Bienvenida
                  </Label>
                  <Textarea
                    id="greeting_message"
                    value={formData.greeting_message}
                    onChange={(e) => setFormData({ ...formData, greeting_message: e.target.value })}
                    placeholder="¡Hola! Soy tu asistente virtual de Incadev. ¿En qué puedo ayudarte hoy?"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.greeting_message.length}/500 caracteres
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="fallback_message">
                    Mensaje de Respuesta por Defecto
                  </Label>
                  <Textarea
                    id="fallback_message"
                    value={formData.fallback_message}
                    onChange={(e) => setFormData({ ...formData, fallback_message: e.target.value })}
                    placeholder="Lo siento, no entendí tu pregunta. ¿Podrías reformularla o elegir una de las opciones siguientes?"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.fallback_message.length}/500 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Comportamiento
                </CardTitle>
                <CardDescription>
                  Configura el timing y límites del chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="response_delay">
                      Retardo de Respuesta (ms)
                    </Label>
                    <Input
                      id="response_delay"
                      type="number"
                      min="0"
                      max="10000"
                      value={formData.response_delay}
                      onChange={(e) => setFormData({ ...formData, response_delay: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tiempo en milisegundos antes de mostrar respuesta (0-10000)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_conversations_per_day">
                      Máximo de Conversaciones por Día
                    </Label>
                    <Input
                      id="max_conversations_per_day"
                      type="number"
                      min="0"
                      value={formData.max_conversations_per_day}
                      onChange={(e) => setFormData({ ...formData, max_conversations_per_day: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      0 = ilimitado
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="contact_threshold">
                    Umbral de Contacto Humano
                  </Label>
                  <Input
                    id="contact_threshold"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.contact_threshold}
                    onChange={(e) => setFormData({ ...formData, contact_threshold: parseInt(e.target.value) || 3 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Intentos fallidos antes de derivar a humano (1-10)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estado Actual</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formData.enabled 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {formData.enabled ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  
                  {config?.updated_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Última Actualización</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(config.updated_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Recomendaciones</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>El retardo de respuesta debe ser entre 500-2000ms para una experiencia natural</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Configura límites razonables según tu capacidad de servidor</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Los mensajes deben ser claros y dar confianza al usuario</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>
                  Cómo se verán los mensajes configurados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-sm">{formData.greeting_message || "¡Hola! Soy tu asistente virtual..."}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-sm">¿Cuál es el horario de atención?</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-sm">{formData.fallback_message || "Lo siento, no entendí tu pregunta..."}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TechnologyLayout>
  )
}