import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle, TrendingUp, Users, FileText, Loader2 } from "lucide-react"
import type { SurveyAnalysis } from "@/process/evaluation/surveys/types/survey"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  surveyId: number | null
  onGetAnalysis: (surveyId: number) => Promise<SurveyAnalysis | null>
}

export function SurveyAnalysisDialog({ open, onOpenChange, surveyId, onGetAnalysis }: Props) {
  const [analysis, setAnalysis] = useState<SurveyAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && surveyId) {
      loadAnalysis()
    } else {
      // Resetear estado cuando se cierra el diálogo
      setAnalysis(null)
      setError(null)
    }
  }, [open, surveyId])

  const loadAnalysis = async () => {
    if (!surveyId) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await onGetAnalysis(surveyId)
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el análisis")
    } finally {
      setLoading(false)
    }
  }

  const getKpiIcon = (label: string) => {
    if (label.includes("Respuestas")) return <Users className="h-4 w-4" />
    if (label.includes("Promedio")) return <TrendingUp className="h-4 w-4" />
    if (label.includes("Preguntas")) return <FileText className="h-4 w-4" />
    return <TrendingUp className="h-4 w-4" />
  }

  const formatKpiValue = (value: number | string) => {
    if (typeof value === "number") {
      return Number(value).toFixed(2)
    }
    return value
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análisis de Resultados</DialogTitle>
          <DialogDescription>
            Estadísticas y recomendaciones basadas en las respuestas de la encuesta
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && !loading && (
          <div className="space-y-6">
            {/* Información de la encuesta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{analysis.survey.title}</CardTitle>
                <p className="text-muted-foreground">{analysis.survey.description}</p>
              </CardHeader>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.kpis.map((kpi, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {kpi.label}
                    </CardTitle>
                    {getKpiIcon(kpi.label)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatKpiValue(kpi.value)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gráfico */}
            {analysis.chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Puntajes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="label" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="value" 
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {analysis.recommendation.split('\n').map((line, index) => (
                    <p key={index} className={index === 0 ? "font-semibold text-lg" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button onClick={loadAnalysis}>
                <Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}