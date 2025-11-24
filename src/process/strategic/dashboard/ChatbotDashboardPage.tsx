import { useState, useEffect } from "react"
import { TechnologyLayout } from "../components/TechnologyLayout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { technologyApi } from "@/services/tecnologico/api"
import type { ChatbotAnalytics, ChatbotConfig } from "@/types/developer-web"
import { 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Plus,
  Activity,
  ThumbsUp,
  Users,
  Loader2
} from "lucide-react"

export default function ChatbotDashboardPage() {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null)
  const [config, setConfig] = useState<ChatbotConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsResponse, configResponse] = await Promise.all([
        technologyApi.developerWeb.chatbotAnalytics.summary(),
        technologyApi.developerWeb.chatbotConfig.get()
      ])

      if (analyticsResponse.success) setAnalytics(analyticsResponse.data)
      if (configResponse.success) setConfig(configResponse.data)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para navegar usando window.location
  const navigateTo = (path: string) => {
    window.location.href = path
  }

  const quickActions = [
    {
      title: "Gestionar FAQs",
      description: "Crear y editar preguntas frecuentes",
      icon: MessageSquare,
      href: "/tecnologico/web/chatbot/faqs",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Ver Analytics",
      description: "Métricas y estadísticas",
      icon: BarChart3,
      href: "/tecnologico/web/chatbot/analytics",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Configuración",
      description: "Ajustes del chatbot",
      icon: Settings,
      href: "/tecnologico/web/chatbot/configuracion",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    }
  ]

  if (loading) {
    return (
      <TechnologyLayout breadcrumbs={[{ label: "Chatbot" }]}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando dashboard...</span>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout breadcrumbs={[{ label: "Chatbot" }]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard del Chatbot</h1>
            <p className="text-muted-foreground">
              Resumen y gestión del asistente virtual
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigateTo("/tecnologico/web/chatbot/faqs")} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nueva FAQ
            </Button>
          </div>
        </div>

        {/* Estado del Servicio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Estado del Servicio
            </CardTitle>
            <CardDescription>
              Información general del chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Estado:</span>
                  <Badge variant={config?.enabled ? "default" : "secondary"}>
                    {config?.enabled ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {config?.enabled 
                    ? "El chatbot está respondiendo a usuarios" 
                    : "El chatbot está desactivado"
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Última Actualización</p>
                <p className="text-sm text-muted-foreground">
                  {config?.updated_at 
                    ? new Date(config.updated_at).toLocaleDateString('es-ES')
                    : "N/A"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principales */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total de conversaciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Resolución</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{((analytics.resolved_rate || 0) * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.resolved || 0} resueltas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avg_satisfaction || 0}/5</div>
                <p className="text-xs text-muted-foreground">
                  Basado en feedback
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Derivadas a Humano</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.handed_to_human || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Conversaciones derivadas
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateTo(action.href)}
            >
              <CardHeader className="cursor-pointer">
                <div className={`p-2 rounded-lg w-fit ${action.bgColor}`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Información Adicional */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Rendimiento Reciente
              </CardTitle>
              <CardDescription>
                Métricas del chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversaciones activas</span>
                <span className="font-medium">{analytics?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total resueltas</span>
                <span className="font-medium">{analytics?.resolved || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tasa de resolución</span>
                <span className="font-medium">{((analytics?.resolved_rate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Satisfacción promedio</span>
                <span className="font-medium">{analytics?.avg_satisfaction || 0}/5</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración Actual</CardTitle>
              <CardDescription>
                Resumen de la configuración activa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Retardo de respuesta</span>
                <span className="font-medium">{config?.response_delay || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Límite diario</span>
                <span className="font-medium">
                  {config?.max_conversations_per_day === 0 
                    ? "Ilimitado" 
                    : config?.max_conversations_per_day || 0
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Umbral humano</span>
                <span className="font-medium">{config?.contact_threshold || 0} intentos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Estado</span>
                <span className="font-medium">
                  {config?.enabled ? "Activo" : "Inactivo"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnologyLayout>
  )
}