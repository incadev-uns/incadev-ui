// src/process/technology/dashboard/risk-prediction/PredictionsTab.tsx
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, AlertTriangle, TrendingUp, Users, GraduationCap } from "lucide-react"
import { DropoutPredictionService } from "@/services/tecnologico/dropout-prediction-service"
import type { 
  StudentPrediction, 
  DropoutPredictionFilters,
  RiskLevel 
} from "@/types/dropout-prediction"
import { RiskLevelLabels, RiskLevelColors, DataStatusColors } from "@/types/dropout-prediction"

interface PredictionsTabProps {
  filters: DropoutPredictionFilters
  onFiltersChange: (filters: DropoutPredictionFilters) => void
}

export function PredictionsTab({ filters, onFiltersChange }: PredictionsTabProps) {
  const [predictions, setPredictions] = useState<StudentPrediction[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [availableGroups, setAvailableGroups] = useState<{id: number, name: string}[]>([])

  useEffect(() => {
    loadPredictions()
  }, [filters]) // Se recarga cuando cambian los filtros

  useEffect(() => {
    extractAvailableGroups()
  }, [predictions])

  const loadPredictions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let response;
      if (filters.group_id) {
        // Usar endpoint específico por grupo
        response = await DropoutPredictionService.getPredictionsByGroup(filters.group_id)
      } else {
        // Usar endpoint general con filtros
        response = await DropoutPredictionService.getPredictions(filters)
      }
      
      setPredictions(response.predictions)
      setSummary(response.summary)
    } catch (err) {
      console.error("Error al cargar predicciones:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Extraer grupos únicos de las predicciones para el filtro
  const extractAvailableGroups = () => {
    if (predictions.length > 0) {
      const groups = predictions
        .filter((pred, index, self) => 
          index === self.findIndex(p => p.group_id === pred.group_id)
        )
        .map(pred => ({
          id: pred.group_id,
          name: pred.group_name
        }))
      setAvailableGroups(groups)
    }
  }

  const handleRiskLevelChange = (level: string) => {
    onFiltersChange({
      ...filters,
      risk_level: level === "ALL" ? undefined : level as RiskLevel
    })
  }

  const handleGroupChange = (groupId: string) => {
    onFiltersChange({
      ...filters,
      group_id: groupId === "ALL" ? undefined : parseInt(groupId)
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
    setSearchTerm("")
  }

  // Filtrar predicciones por búsqueda y nivel de riesgo (filtro adicional en frontend)
  const filteredPredictions = predictions.filter(prediction => {
    // Filtro por búsqueda
    const matchesSearch = prediction.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prediction.group_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro por nivel de riesgo (si está activo)
    const matchesRiskLevel = !filters.risk_level || filters.risk_level === "ALL" || 
                           prediction.risk_level === filters.risk_level
    
    return matchesSearch && matchesRiskLevel
  })

  const getProbabilityColor = (probability: number) => {
    if (probability > 0.7) return 'bg-destructive'
    if (probability > 0.4) return 'bg-warning'
    return 'bg-success'
  }

  const getProbabilityWidth = (probability: number) => {
    return Math.min(probability * 100, 100)
  }

  const formatProbability = (probability: number) => {
    return (probability * 100).toFixed(2)
  }

  // Función para aplicar filtros y recargar datos
  const applyFilters = () => {
    loadPredictions()
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
                <Button variant="outline" size="sm" onClick={loadPredictions} className="mt-2">
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_students}</div>
              <p className="text-xs text-muted-foreground">Monitoreados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alto Riesgo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summary.high_risk_count}</div>
              <p className="text-xs text-muted-foreground">Críticos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Riesgo Medio</CardTitle>
              <Filter className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{summary.medium_risk_count}</div>
              <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Probabilidad Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatProbability(summary.avg_dropout_probability)}%</div>
              <p className="text-xs text-muted-foreground">Riesgo general</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Predicción</CardTitle>
          <CardDescription>
            Filtra estudiantes por grupo y nivel de riesgo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Fila 1: Búsqueda y Botones */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por estudiante o grupo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={applyFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
                <Button variant="ghost" onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Fila 2: Filtros por Riesgo */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <Select
                  value={filters.risk_level || "ALL"}
                  onValueChange={handleRiskLevelChange}
                >
                  <SelectTrigger>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos los niveles de riesgo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los niveles</SelectItem>
                    <SelectItem value="ALTO">Alto Riesgo</SelectItem>
                    <SelectItem value="MEDIO">Riesgo Medio</SelectItem>
                    <SelectItem value="BAJO">Bajo Riesgo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estado de filtros activos */}
            {(filters.group_id || filters.risk_level) && (
              <div className="flex flex-wrap gap-2">
                {filters.group_id && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Grupo: {availableGroups.find(g => g.id === filters.group_id)?.name}
                  </Badge>
                )}
                {filters.risk_level && filters.risk_level !== "ALL" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Riesgo: {RiskLevelLabels[filters.risk_level as RiskLevel]}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Predicciones de Deserción</CardTitle>
          <CardDescription>
            Lista de estudiantes con sus probabilidades de deserción calculadas
            {filteredPredictions.length > 0 && ` (${filteredPredictions.length} estudiantes)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Cargando predicciones...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Nivel de Riesgo</TableHead>
                    <TableHead>Probabilidad</TableHead>
                    <TableHead>Nota Promedio</TableHead>
                    <TableHead>Asistencia</TableHead>
                    <TableHead>Estado Datos</TableHead>
                    <TableHead>Acción Recomendada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPredictions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No se encontraron estudiantes</p>
                          <p className="text-sm text-muted-foreground">
                            {filters.group_id || filters.risk_level 
                              ? "Intenta ajustar los filtros" 
                              : "No hay datos disponibles"
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPredictions.map((prediction) => (
                      <TableRow key={prediction.enrollment_id} className="group hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{prediction.student_name}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {prediction.enrollment_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{prediction.group_name}</span>
                            <span className="text-xs text-muted-foreground">
                              Grupo ID: {prediction.group_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={RiskLevelColors[prediction.risk_level]}
                          >
                            {RiskLevelLabels[prediction.risk_level]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-[80px] max-w-[100px]">
                                <div className="relative w-full bg-secondary rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${getProbabilityColor(prediction.dropout_probability)}`}
                                    style={{ 
                                      width: `${getProbabilityWidth(prediction.dropout_probability)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="font-medium text-sm min-w-[50px] text-right">
                                {formatProbability(prediction.dropout_probability)}%
                              </span>
                            </div>
                            {prediction.predicted_dropped_out === 1 && (
                              <div className="text-xs text-destructive font-medium">
                                Predicción: Probable abandono
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={`font-medium ${
                              prediction.avg_grade < 11 ? 'text-destructive' : 
                              prediction.avg_grade < 14 ? 'text-warning' : 
                              'text-success'
                            }`}>
                              {prediction.avg_grade || 0}
                            </span>
                            {prediction.total_exams_taken > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {prediction.total_exams_taken} exámenes
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={`font-medium ${
                              prediction.attendance_rate < 70 ? 'text-destructive' : 
                              prediction.attendance_rate < 85 ? 'text-warning' : 
                              'text-success'
                            }`}>
                              {prediction.attendance_rate || 0}%
                            </span>
                            {prediction.attendance_rate === 0 && (
                              <span className="text-xs text-warning">Sin datos</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={DataStatusColors[prediction.data_status] || "bg-muted/10 text-muted-foreground"}
                          >
                            {prediction.data_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="text-sm text-muted-foreground">
                            {prediction.recommended_action}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Status Summary */}
      {summary?.data_status_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Estado de los Datos</CardTitle>
            <CardDescription>
              Distribución de la completitud de la información estudiantil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Datos Completos</span>
                </div>
                <span className="font-bold text-success">
                  {summary.data_status_summary.complete_data}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>Faltan Datos Académicos</span>
                </div>
                <span className="font-bold text-warning">
                  {summary.data_status_summary.missing_academic}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>Faltan Datos de Asistencia</span>
                </div>
                <span className="font-bold text-warning">
                  {summary.data_status_summary.missing_attendance}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}