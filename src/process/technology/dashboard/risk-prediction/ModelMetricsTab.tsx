// src/process/technology/dashboard/risk-prediction/ModelMetricsTab.tsx
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  Target,
  Clock
} from "lucide-react"
import { DropoutPredictionService } from "@/services/tecnologico/dropout-prediction-service"
import type { 
  SystemStatusData,
  StudentPrediction 
} from "@/types/dropout-prediction"

interface ModelMetricsTabProps {
  systemStatus: SystemStatusData | null
}

export function ModelMetricsTab({ systemStatus }: ModelMetricsTabProps) {
  const [predictions, setPredictions] = useState<StudentPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPredictionsData()
  }, [])

  const loadPredictionsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { predictions: data } = await DropoutPredictionService.getPredictions()
      setPredictions(data)
    } catch (err) {
      console.error("Error al cargar métricas del modelo:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Calcular métricas basadas en los datos reales
  const calculateMetrics = () => {
    if (predictions.length === 0) return null

    const highRiskCount = predictions.filter(p => p.risk_level === "ALTO").length
    const mediumRiskCount = predictions.filter(p => p.risk_level === "MEDIO").length
    const lowRiskCount = predictions.filter(p => p.risk_level === "BAJO" || p.risk_level === "BAJO RIESGO").length
    
    const truePositives = predictions.filter(p => 
      p.predicted_dropped_out === 1 && p.dropout_probability > 0.5
    ).length
    
    const falsePositives = predictions.filter(p => 
      p.predicted_dropped_out === 1 && p.dropout_probability <= 0.5
    ).length
    
    const trueNegatives = predictions.filter(p => 
      p.predicted_dropped_out === 0 && p.dropout_probability <= 0.5
    ).length
    
    const falseNegatives = predictions.filter(p => 
      p.predicted_dropped_out === 0 && p.dropout_probability > 0.5
    ).length

    const accuracy = (truePositives + trueNegatives) / predictions.length
    const precision = truePositives / (truePositives + falsePositives) || 0
    const recall = truePositives / (truePositives + falseNegatives) || 0
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: {
        true_positive: truePositives,
        true_negative: trueNegatives,
        false_positive: falsePositives,
        false_negative: falseNegatives
      },
      riskDistribution: {
        high: highRiskCount,
        medium: mediumRiskCount,
        low: lowRiskCount
      }
    }
  }

  const getTrendIcon = (value: number, threshold: number = 0.7) => {
    if (value > threshold + 0.1) return <TrendingUp className="h-4 w-4 text-success" />
    if (value < threshold - 0.1) return <TrendingDown className="h-4 w-4 text-destructive" />
    return <Minus className="h-4 w-4 text-warning" />
  }

  const metrics = calculateMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas del modelo...</p>
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

  if (!metrics || !systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">No se pudieron calcular las métricas del modelo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Model Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión General</CardTitle>
            {getTrendIcon(metrics.accuracy)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <Progress value={metrics.accuracy * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Exactitud general del modelo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión (Precision)</CardTitle>
            {getTrendIcon(metrics.precision)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.precision * 100).toFixed(1)}%</div>
            <Progress value={metrics.precision * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Predicciones positivas correctas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensibilidad (Recall)</CardTitle>
            {getTrendIcon(metrics.recall)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.recall * 100).toFixed(1)}%</div>
            <Progress value={metrics.recall * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Capacidad de detectar abandonos reales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación F1</CardTitle>
            {getTrendIcon(metrics.f1Score)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.f1Score * 100).toFixed(1)}%</div>
            <Progress value={metrics.f1Score * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Balance entre precisión y recall
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Confusion Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Confusión</CardTitle>
            <CardDescription>
              Desempeño del modelo en clasificación binaria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div></div>
              <div className="text-center font-medium">Predicho Abandono</div>
              <div className="text-center font-medium">Predicho Permanencia</div>
              
              <div className="font-medium">Real Abandono</div>
              <div className="p-2 bg-success/10 text-success text-center rounded border">
                VP: {metrics.confusionMatrix.true_positive}
              </div>
              <div className="p-2 bg-destructive/10 text-destructive text-center rounded border">
                FN: {metrics.confusionMatrix.false_negative}
              </div>
              
              <div className="font-medium">Real Permanencia</div>
              <div className="p-2 bg-destructive/10 text-destructive text-center rounded border">
                FP: {metrics.confusionMatrix.false_positive}
              </div>
              <div className="p-2 bg-success/10 text-success text-center rounded border">
                VN: {metrics.confusionMatrix.true_negative}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-primary/10 rounded border">
                <div className="font-bold">{(metrics.precision * 100).toFixed(1)}%</div>
                <div className="text-muted-foreground">Precisión</div>
              </div>
              <div className="text-center p-2 bg-primary/10 rounded border">
                <div className="font-bold">{(metrics.recall * 100).toFixed(1)}%</div>
                <div className="text-muted-foreground">Sensibilidad</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo</CardTitle>
            <CardDescription>
              Clasificación de estudiantes por nivel de riesgo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span>Alto Riesgo</span>
                </div>
                <div className="font-bold">{metrics.riskDistribution.high}</div>
              </div>
              <Progress value={(metrics.riskDistribution.high / predictions.length) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>Riesgo Medio</span>
                </div>
                <div className="font-bold">{metrics.riskDistribution.medium}</div>
              </div>
              <Progress value={(metrics.riskDistribution.medium / predictions.length) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Bajo Riesgo</span>
                </div>
                <div className="font-bold">{metrics.riskDistribution.low}</div>
              </div>
              <Progress value={(metrics.riskDistribution.low / predictions.length) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Modelo</CardTitle>
          <CardDescription>
            Detalles técnicos y configuración del modelo predictivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Algoritmo</p>
              <p className="text-sm text-muted-foreground">Random Forest</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Precisión Reportada</p>
              <p className="text-sm text-muted-foreground">{(systemStatus.model_accuracy * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Última Actualización</p>
              <p className="text-sm text-muted-foreground">
                {new Date(systemStatus.last_updated).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Estudiantes Analizados</p>
              <p className="text-sm text-muted-foreground">{predictions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretación del Modelo</CardTitle>
          <CardDescription>
            Análisis y recomendaciones para el uso del modelo predictivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Assessment */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Evaluación General
              </h4>
              <p className="text-sm text-muted-foreground">
                {systemStatus.model_accuracy > 0.8 
                  ? "Modelo de alta calidad, puede usarse con confianza para la toma de decisiones."
                  : systemStatus.model_accuracy > 0.7
                  ? "Modelo de buena calidad, puede usarse con monitoreo continuo."
                  : "Modelo requiere mejoras antes de su implementación completa."
                }
              </p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Fortalezas
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0" />
                  Excelente para detectar patrones de riesgo temprano
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0" />
                  Basado en datos académicos y de comportamiento reales
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0" />
                  Actualización continua con nuevos datos
                </li>
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Recomendaciones
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Monitorear métricas semanalmente
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Validar predicciones con intervenciones reales
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Considerar retraining trimestral con datos actualizados
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}