import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { technologyApi } from "@/services/tecnologico/api"
import type { ChatbotAnalytics } from "@/types/developer-web"
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Star, 
  ThumbsUp, 
  Clock,
  Loader2,
  Eye
} from "lucide-react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Función para formatear fechas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export default function ChatbotAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await technologyApi.developerWeb.chatbotAnalytics.summary()
      if (response.success && response.data) {
        setAnalytics(response.data)
      }
    } catch (error) {
      console.error("Error al cargar analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Datos para gráficos basados en analytics reales
  const conversationsByDay = analytics?.conversations_by_day?.map(item => ({
    date: formatDate(item.date),
    count: item.count
  })) || [
    { date: 'Lun', count: 0 },
    { date: 'Mar', count: 0 },
    { date: 'Mié', count: 0 },
    { date: 'Jue', count: 0 },
    { date: 'Vie', count: 0 },
    { date: 'Sáb', count: 0 },
    { date: 'Dom', count: 0 },
  ]

  const faqsByCategory = analytics?.faqs_by_category?.map((item, index) => ({
    name: item.category,
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) || []

  const mostUsedFaqs = analytics?.most_used_faqs?.slice(0, 5) || []

  if (loading) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando analytics...</span>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics del Chatbot</h1>
          <p className="text-muted-foreground">
            Métricas y estadísticas de rendimiento del chatbot
          </p>
        </div>

        {analytics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversaciones Totales</CardTitle>
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
                  {analytics.resolved || 0} de {analytics.total || 0} resueltas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avg_satisfaction || 0}/5</div>
                <p className="text-xs text-muted-foreground">
                  Basado en feedback de usuarios
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos con datos reales */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Conversaciones por día */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Conversaciones por Día</CardTitle>
              <CardDescription>
                Evolución de conversaciones en los últimos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversationsByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No hay datos de conversaciones recientes
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQs por categoría */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>FAQs por Categoría</CardTitle>
              <CardDescription>
                Distribución de preguntas frecuentes activas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {faqsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={faqsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {faqsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No hay FAQs activas por categoría
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQs más utilizadas */}
        <Card>
          <CardHeader>
            <CardTitle>FAQs Más Utilizadas</CardTitle>
            <CardDescription>
              Preguntas frecuentes con mayor número de usos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mostUsedFaqs.length > 0 ? (
              <div className="space-y-4">
                {mostUsedFaqs.map((faq, index) => (
                  <div key={faq.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{faq.question}</p>
                        <p className="text-xs text-muted-foreground">ID: {faq.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{faq.usage_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No hay datos de FAQs utilizadas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Métricas adicionales */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversaciones Activas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.active || 0}</div>
              <p className="text-xs text-muted-foreground">
                En este momento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total FAQs Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {faqsByCategory.reduce((total, item) => total + item.value, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Preguntas frecuentes disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback Positivo</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.avg_satisfaction ? `${Math.round((analytics.avg_satisfaction / 5) * 100)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Usuarios satisfechos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnologyLayout>
  )
}