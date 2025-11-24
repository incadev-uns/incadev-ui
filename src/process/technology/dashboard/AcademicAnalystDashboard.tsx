
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  BarChart3,
  Target,
  GraduationCap,
  Database,
  RefreshCw,
  CloudUpload
} from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { DashboardMainData, DashboardChartsData, BigQuerySyncResponse } from "@/types/academic-analysis"
import { toast } from "sonner"

export default function AcademicAnalystDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardMainData | null>(null)
  const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<'full' | 'incremental' | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [mainResponse, chartsResponse] = await Promise.all([
        technologyApi.academicAnalysis.dashboard.main(),
        technologyApi.academicAnalysis.dashboard.charts()
      ])

      if (mainResponse.success && mainResponse.data) {
        setDashboardData(mainResponse.data)
      }

      if (chartsResponse.success && chartsResponse.data) {
        setChartsData(chartsResponse.data)
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error)
      toast.error("Error al cargar los datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleFullSync = async () => {
    try {
      setSyncing('full')
      toast.info("Iniciando sincronización completa con BigQuery...")
      
      const response = await technologyApi.academicAnalysis.bigquery.syncFull()
      
      if (response.success) {
        toast.success(response.message || "Sincronización completa exitosa")
        console.log("Datos de sincronización:", response.data)
      } else {
        toast.error(response.message || "Error en la sincronización completa")
      }
    } catch (error: any) {
      console.error("Error en sincronización completa:", error)
      toast.error(error.message || "Error al realizar la sincronización completa")
    } finally {
      setSyncing(null)
    }
  }

  const handleIncrementalSync = async () => {
    try {
      setSyncing('incremental')
      toast.info("Iniciando sincronización incremental con BigQuery...")
      
      const response = await technologyApi.academicAnalysis.bigquery.syncIncremental()
      
      if (response.success) {
        toast.success(response.message || "Sincronización incremental exitosa")
        console.log("Datos de sincronización:", response.data)
      } else {
        toast.error(response.message || "Error en la sincronización incremental")
      }
    } catch (error: any) {
      console.error("Error en sincronización incremental:", error)
      toast.error(error.message || "Error al realizar la sincronización incremental")
    } finally {
      setSyncing(null)
    }
  }

  const metricCards = [
    {
      title: "Tasa de Asistencia",
      value: dashboardData ? `${dashboardData.attendance_rate}%` : "0%",
      icon: Users,
      color: "blue",
      description: `${dashboardData?.present_sessions || 0} de ${dashboardData?.total_sessions || 0} sesiones`
    },
    {
      title: "Tasa de Aprobación",
      value: dashboardData ? `${dashboardData.approval_rate}%` : "0%",
      icon: GraduationCap,
      color: "green",
      description: "Porcentaje de estudiantes aprobados"
    },
    {
      title: "Promedio General",
      value: dashboardData?.avg_grade?.toFixed(2) || "0.00",
      icon: Target,
      color: "orange",
      description: "Calificación promedio"
    },
    {
      title: "Estudiantes Activos",
      value: dashboardData?.total_students || 0,
      icon: Users,
      color: "purple",
      description: "Total de estudiantes"
    }
  ]

  if (loading) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Analista Académico</h1>
            <p className="text-muted-foreground">
              Resumen general del rendimiento y progreso académico
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDashboardData}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* BigQuery Sync Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sincronización con BigQuery
            </CardTitle>
            <CardDescription>
              Mantén tus datos actualizados en la nube
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleFullSync}
                disabled={syncing !== null}
                variant="outline"
                className="flex-1"
              >
                {syncing === 'full' ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CloudUpload className="mr-2 h-4 w-4" />
                )}
                {syncing === 'full' ? "Sincronizando..." : "Sincronización Completa"}
              </Button>
              
              <Button 
                onClick={handleIncrementalSync}
                disabled={syncing !== null}
                variant="default"
                className="flex-1"
              >
                {syncing === 'incremental' ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {syncing === 'incremental' ? "Sincronizando..." : "Sincronización Incremental"}
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p><strong>Completa:</strong> Sincroniza todas las tablas desde cero</p>
              <p><strong>Incremental:</strong> Sincroniza solo los cambios recientes</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 text-${card.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Grupos Activos</CardTitle>
              <CardDescription>Total de grupos en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {dashboardData?.total_groups || 0}
                </div>
                <Badge variant="default">
                  Activos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesiones Totales</CardTitle>
              <CardDescription>Registradas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {dashboardData?.total_sessions || 0}
                </div>
                <Badge variant="default">
                  Total
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Data Preview */}
        {chartsData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Asistencia</CardTitle>
                <CardDescription>Resumen por estados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chartsData.attendance_distribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{item.attendance_status}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calificaciones</CardTitle>
                <CardDescription>Por rangos de notas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chartsData.grade_distribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.grade_range}</span>
                      <Badge variant="secondary">{item.count} estudiantes</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Módulos de Análisis</CardTitle>
            <CardDescription>
              Accesos directos a los módulos principales de análisis académico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <a href="/tecnologico/academic_analyst/asistencia">
                  <Users className="h-6 w-6" />
                  <span>Asistencia</span>
                  <span className="text-xs text-muted-foreground">Control de presencia</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <a href="/tecnologico/academic_analyst/rendimiento">
                  <BarChart3 className="h-6 w-6" />
                  <span>Rendimiento</span>
                  <span className="text-xs text-muted-foreground">Calificaciones</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <a href="/tecnologico/academic_analyst/progreso">
                  <CheckCircle className="h-6 w-6" />
                  <span>Progreso</span>
                  <span className="text-xs text-muted-foreground">Avance académico</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <a href="/tecnologico/academic_analyst/prediccion-riesgo">
                  <BookOpen className="h-6 w-6" />
                  <span>Predicción</span>
                  <span className="text-xs text-muted-foreground">Predicción de deserción</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TechnologyLayout>
  )
}