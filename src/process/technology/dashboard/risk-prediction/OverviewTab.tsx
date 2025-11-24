// src/process/technology/dashboard/risk-prediction/OverviewTab.tsx
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { DropoutPredictionService } from "@/services/tecnologico/dropout-prediction-service"
import type { 
  SystemStatusData, 
  StudentPrediction,
  RiskLevel 
} from "@/types/dropout-prediction"
import { RiskLevelLabels, RiskLevelColors } from "@/types/dropout-prediction"

interface OverviewTabProps {
  systemStatus: SystemStatusData | null
}

export function OverviewTab({ systemStatus }: OverviewTabProps) {
  const [predictions, setPredictions] = useState<StudentPrediction[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPredictionsData()
  }, [])

  const loadPredictionsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { predictions: data, summary: summaryData } = await DropoutPredictionService.getPredictions()
      setPredictions(data)
      setSummary(summaryData)
    } catch (err) {
      console.error("Error al cargar datos de resumen:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Obtener alertas recientes (estudiantes con mayor probabilidad de deserción)
  const recentAlerts = predictions
    .filter(p => p.dropout_probability > 0.5)
    .sort((a, b) => b.dropout_probability - a.dropout_probability)
    .slice(0, 3)
    .map(prediction => ({
      student_name: prediction.student_name,
      group_name: prediction.group_name,
      risk_level: prediction.risk_level,
      probability: prediction.dropout_probability,
      timestamp: new Date().toISOString(), // Usar fecha actual ya que la API no proporciona timestamp
      critical_factors: [
        prediction.attendance_rate < 70 ? `Asistencia: ${prediction.attendance_rate}%` : null,
        prediction.avg_grade < 12 ? `Nota promedio: ${prediction.avg_grade}` : null,
        prediction.data_status === "FALTAN DATOS ACADÉMICOS" ? "Datos académicos incompletos" : null
      ].filter(Boolean) as string[]
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos de resumen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={loadPredictionsData} className="mt-2">
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!summary) return null

  const riskDistribution = [
    { level: "ALTO" as RiskLevel, count: summary.high_risk_count, color: "bg-destructive" },
    { level: "MEDIO" as RiskLevel, count: summary.medium_risk_count, color: "bg-warning" },
    { level: "BAJO" as RiskLevel, count: summary.low_risk_count, color: "bg-success" }
  ]

  const totalStudents = summary.total_students

  return (
    <div className="space-y-6">
      {/* Risk Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo</CardTitle>
            <CardDescription>
              Clasificación de estudiantes por nivel de riesgo de deserción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskDistribution.map((risk) => (
                <div key={risk.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                    <span className="font-medium">{RiskLevelLabels[risk.level]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{risk.count}</span>
                    <span className="text-sm text-muted-foreground">
                      ({totalStudents > 0 ? ((risk.count / totalStudents) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
              {riskDistribution.map((risk) => (
                <div
                  key={risk.level}
                  className={`${risk.color} transition-all duration-500`}
                  style={{ 
                    width: totalStudents > 0 ? `${(risk.count / totalStudents) * 100}%` : '0%' 
                  }}
                />
              ))}
            </div>
            
            {/* Data Status Summary */}
            {summary.data_status_summary && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Estado de los Datos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Datos Completos</span>
                    <span className="font-medium text-success">
                      {summary.data_status_summary.complete_data}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Faltan Datos Académicos</span>
                    <span className="font-medium text-warning">
                      {summary.data_status_summary.missing_academic}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Faltan Datos de Asistencia</span>
                    <span className="font-medium text-warning">
                      {summary.data_status_summary.missing_attendance}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Recientes</CardTitle>
            <CardDescription>
              Estudiantes con mayor probabilidad de deserción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay alertas recientes</p>
                  <p className="text-sm text-muted-foreground">Todos los estudiantes tienen bajo riesgo</p>
                </div>
              ) : (
                recentAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.student_name}</span>
                        <Badge 
                          variant="outline" 
                          className={RiskLevelColors[alert.risk_level]}
                        >
                          {RiskLevelLabels[alert.risk_level]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.group_name}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alert.critical_factors.map((factor, idx) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-destructive">
                        {(alert.probability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Rendimiento</CardTitle>
          <CardDescription>
            Indicadores clave del sistema de predicción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{(summary.avg_dropout_probability * 100).toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Riesgo Promedio</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-sm text-muted-foreground">Total Estudiantes</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">
                {systemStatus ? `${(systemStatus.model_accuracy * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">Precisión Modelo</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">
                {systemStatus ? new Date(systemStatus.last_updated).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">Última Actualización</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Acciones inmediatas para gestionar el riesgo de deserción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <span>Revisar Alto Riesgo</span>
              <span className="text-xs text-muted-foreground">{summary.high_risk_count} estudiantes</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Clock className="h-6 w-6 text-warning" />
              <span>Intervenciones Pendientes</span>
              <span className="text-xs text-muted-foreground">Programar seguimiento</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>Actualizar Modelo</span>
              <span className="text-xs text-muted-foreground">Re-entrenar IA</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <CheckCircle className="h-6 w-6 text-success" />
              <span>Reporte Semanal</span>
              <span className="text-xs text-muted-foreground">Generar informe</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}