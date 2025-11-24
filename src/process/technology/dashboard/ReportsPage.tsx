import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, BarChart3, Users, Calendar, Filter } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { CombinedReport } from "@/types/academic-analysis"

export default function ReportsPage() {
  const [combinedData, setCombinedData] = useState<CombinedReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setLoading(true)
      const response = await technologyApi.academicAnalysis.dashboard.charts
    } catch (error) {
      console.error("Error al cargar datos de reportes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando reportes consolidados...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Reportes Académicos</h1>
            <p className="text-muted-foreground">
              Reportes consolidados y análisis integral del sistema académico
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>
        </div>

        {/* Report Types */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reporte de Asistencia</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PDF/Excel</div>
              <p className="text-xs text-muted-foreground">Análisis detallado</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reporte de Rendimiento</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PDF/Excel</div>
              <p className="text-xs text-muted-foreground">Calificaciones</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reporte de Progreso</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PDF/Excel</div>
              <p className="text-xs text-muted-foreground">Avance académico</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reporte Consolidado</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PDF</div>
              <p className="text-xs text-muted-foreground">Completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Generation Options */}
        <Card>
          <CardHeader>
            <CardTitle>Generar Reportes Personalizados</CardTitle>
            <CardDescription>
              Selecciona el tipo de reporte y el período deseado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <FileText className="h-6 w-6" />
                <span>Reporte Semanal</span>
                <span className="text-xs text-muted-foreground">Últimos 7 días</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Calendar className="h-6 w-6" />
                <span>Reporte Mensual</span>
                <span className="text-xs text-muted-foreground">Mes actual</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <BarChart3 className="h-6 w-6" />
                <span>Reporte Trimestral</span>
                <span className="text-xs text-muted-foreground">Último trimestre</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TechnologyLayout>
  )
}