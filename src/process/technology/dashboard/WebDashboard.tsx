import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Newspaper,
  Megaphone,
  AlertTriangle,
  MessageCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  FileText,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import type { WebDashboardData } from "@/types/developer-web"

export default function WebDashboard() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [dashboardData, setDashboardData] = useState<WebDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard()
    }
  }, [authLoading, user])

  const fetchDashboard = async () => {
    const loadingState = refreshing ? setRefreshing : setLoading
    loadingState(true)
    try {
      const response = await technologyApi.developerWeb.dashboard()
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        toast.error("Error al cargar dashboard web")
      }
    } catch (error: any) {
      console.error("Error fetching web dashboard:", error)
      toast.error(error.message || "Error al cargar dashboard web")
    } finally {
      loadingState(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const getContentStats = (type: 'news' | 'announcements' | 'alerts') => {
    if (!dashboardData) return { total: 0, published: 0, views: 0 }

    const data = dashboardData[type]
    return {
      total: data.total || 0,
      published: data.published || 0,
      views: 'total_views' in data ? (data.total_views || 0) : 0
    }
  }

  if (authLoading) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </TechnologyLayout>
    )
  }

  const newsStats = getContentStats('news')
  const announcementStats = getContentStats('announcements')
  const alertStats = getContentStats('alerts')

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              Dashboard Web
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión de contenido web: noticias, anuncios, alertas y FAQs
            </p>
          </div>

          <Button
            onClick={() => fetchDashboard()}
            variant="outline"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : dashboardData ? (
          <>
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Noticias */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = "/tecnologico/web/noticias"}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Noticias</CardTitle>
                  <Newspaper className="w-5 h-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumber(newsStats.total)}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          {formatNumber(newsStats.published)} publicadas
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {formatNumber(newsStats.views)} vistas
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Anuncios */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = "/tecnologico/web/anuncios"}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Anuncios</CardTitle>
                  <Megaphone className="w-5 h-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumber(announcementStats.total)}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          {formatNumber(announcementStats.published)} activos
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {formatNumber(announcementStats.views)} vistas
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = "/tecnologico/web/alertas"}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumber(alertStats.total)}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          {formatNumber(alertStats.published)} activas
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Sistema
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Resumen General */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Resumen General</CardTitle>
                  <FileText className="w-5 h-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumber(dashboardData.total_content || 0)}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {formatNumber(dashboardData.total_published || 0)} publicados
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {formatNumber(dashboardData.total_views || 0)} vistas totales
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enlaces Directos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer border-blue-200"
                onClick={() => window.location.href = "/tecnologico/web/noticias_add"}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Newspaper className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestión de Noticias</h3>
                    <p className="text-sm text-muted-foreground">Ver todas las noticias</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer border-orange-200"
                onClick={() => window.location.href = "/tecnologico/web/anuncios"}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Megaphone className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestión de Anuncios</h3>
                    <p className="text-sm text-muted-foreground">Ver todos los anuncios</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer border-red-200"
                onClick={() => window.location.href = "/tecnologico/web/alertas"}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestión de Alertas</h3>
                    <p className="text-sm text-muted-foreground">Ver todas las alertas</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer border-green-200"
                onClick={() => window.location.href = "/tecnologico/web/faqs"}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestión de FAQs</h3>
                    <p className="text-sm text-muted-foreground">Ver todas las FAQs</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas Detalladas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Detalladas</CardTitle>
                <CardDescription>Resumen completo del contenido web</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-blue-600" />
                      Noticias
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <span className="font-medium">{formatNumber(newsStats.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Publicadas:</span>
                        <span className="font-medium text-green-600">{formatNumber(newsStats.published)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Vistas totales:</span>
                        <span className="font-medium text-blue-600">{formatNumber(newsStats.views)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-orange-600" />
                      Anuncios
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <span className="font-medium">{formatNumber(announcementStats.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Activos:</span>
                        <span className="font-medium text-green-600">{formatNumber(announcementStats.published)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Vistas totales:</span>
                        <span className="font-medium text-blue-600">{formatNumber(announcementStats.views)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Alertas
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <span className="font-medium">{formatNumber(alertStats.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Activas:</span>
                        <span className="font-medium text-green-600">{formatNumber(alertStats.published)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="font-medium text-muted-foreground">Sistema</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay datos del dashboard disponibles</p>
            <Button
              onClick={fetchDashboard}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </TechnologyLayout>
  )
}