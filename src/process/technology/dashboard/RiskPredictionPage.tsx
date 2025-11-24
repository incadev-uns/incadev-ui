// src/process/technology/dashboard/RiskPredictionPage.tsx
import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target, 
  AlertTriangle, 
  Gauge, 
  Brain, 
  Download, 
  Filter,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"
import { DropoutPredictionService } from "@/services/tecnologico/dropout-prediction-service"
import { technologyApi } from "@/services/tecnologico/api"
import type { 
  SystemStatusData,
  DropoutPredictionFilters,
  RiskLevel 
} from "@/types/dropout-prediction"
import { RiskLevelLabels, RiskLevelColors, SystemStatusLabels, SystemStatusColors } from "@/types/dropout-prediction"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Importar componentes de las subpáginas
import { OverviewTab } from "./risk-prediction/OverviewTab"
import { PredictionsTab } from "./risk-prediction/PredictionsTab"
import { HighRiskTab } from "./risk-prediction/HighRiskTab"
import { ModelMetricsTab } from "./risk-prediction/ModelMetricsTab"

export default function RiskPredictionPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DropoutPredictionFilters>({})

  useEffect(() => {
    loadSystemStatus()
  }, [])

  const loadSystemStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const status = await DropoutPredictionService.getSystemStatus()
      setSystemStatus(status)
    } catch (err) {
      console.error("Error al cargar estado del sistema:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // ✅ NUEVA FUNCIÓN PARA EXPORTAR REPORTES
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(true)
      
      let blob: Blob;
      let filename: string;

      if (activeTab === "predictions") {
        // Exportar predicciones generales
        blob = await technologyApi.dropoutPrediction.exportPredictions(filters, format)
        filename = `predicciones_desercion_${new Date().toISOString().slice(0, 10)}`
      } else if (activeTab === "high-risk") {
        // Exportar estudiantes de alto riesgo
        blob = await technologyApi.dropoutPrediction.exportHighRisk(format)
        filename = `estudiantes_alto_riesgo_${new Date().toISOString().slice(0, 10)}`
      } else {
        // Exportación general del dashboard
        blob = await technologyApi.dropoutPrediction.exportPredictions({}, format)
        filename = `reporte_prediccion_riesgo_${new Date().toISOString().slice(0, 10)}`
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const extension = format === 'pdf' ? 'pdf' : 'xlsx'
      a.download = `${filename}.${extension}`
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      window.URL.revokeObjectURL(url)
      
      toast.success(`Reporte exportado correctamente en formato ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exportando reporte:', error)
      toast.error('Error al exportar el reporte')
    } finally {
      setExportLoading(false)
    }
  }

  if (loading) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando sistema de predicción...</p>
          </div>
        </div>
      </TechnologyLayout>
    )
  }

  if (error) {
    return (
      <TechnologyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar el sistema</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadSystemStatus}>Reintentar</Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Predicción de Riesgo Estudiantil</h1>
            <p className="text-muted-foreground">
              Sistema de inteligencia artificial para predecir deserción académica
            </p>
          </div>
          <div className="flex gap-2">
            
            {/* ✅ REEMPLAZAR BOTÓN SIMPLE POR DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Reporte
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('excel')}
                  disabled={exportLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar como Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* System Status Cards */}
        {systemStatus && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Modelo</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge 
                    variant="outline" 
                    className={SystemStatusColors[systemStatus.model_status]}
                  >
                    {SystemStatusLabels[systemStatus.model_status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Actualizado: {new Date(systemStatus.last_updated).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisión del Modelo</CardTitle>
                <Brain className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(systemStatus.model_accuracy * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Exactitud predictiva</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(systemStatus.last_updated).toLocaleTimeString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(systemStatus.last_updated).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Predicciones</span>
            </TabsTrigger>
            <TabsTrigger value="high-risk" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Alto Riesgo</span>
            </TabsTrigger>
            <TabsTrigger value="model-metrics" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Métricas</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab systemStatus={systemStatus} />
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions">
            <PredictionsTab filters={filters} onFiltersChange={setFilters} />
          </TabsContent>

          {/* High Risk Tab */}
          <TabsContent value="high-risk">
            <HighRiskTab />
          </TabsContent>

          {/* Model Metrics Tab */}
          <TabsContent value="model-metrics">
            <ModelMetricsTab systemStatus={systemStatus} />
          </TabsContent>
        </Tabs>
      </div>
    </TechnologyLayout>
  )
}