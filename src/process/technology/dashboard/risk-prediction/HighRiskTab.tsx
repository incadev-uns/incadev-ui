// src/process/technology/dashboard/risk-prediction/HighRiskTab.tsx
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Mail, 
  Phone, 
  Calendar,
  UserPlus,
  TrendingUp,
  Users,
  Eye,
  BookOpen,
  CreditCard,
  CalendarDays
} from "lucide-react"
import { DropoutPredictionService } from "@/services/tecnologico/dropout-prediction-service"
import type { 
  HighRiskStudent
} from "@/types/dropout-prediction"
import { RiskLevelColors } from "@/types/dropout-prediction"

export function HighRiskTab() {
  const [highRiskStudents, setHighRiskStudents] = useState<HighRiskStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHighRiskData()
  }, [])

  const loadHighRiskData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { highRiskStudents: students, count } = await DropoutPredictionService.getHighRiskStudents()
      
      setHighRiskStudents(students)
    } catch (err) {
      console.error("Error al cargar datos de alto riesgo:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Generar factores críticos basados en los datos reales de la API
  const getCriticalFactors = (student: HighRiskStudent) => {
    const factors: string[] = []
    
    // Factores basados en los datos reales
    if (student.attendance_rate < 70) {
      factors.push(`Asistencia: ${student.attendance_rate}%`)
    }
    
    if (student.avg_grade < 11) {
      factors.push(`Nota promedio: ${student.avg_grade}`)
    }
    
    if (student.payment_regularity < 1) {
      factors.push("Problemas de pago")
    }
    
    if (student.days_since_last_payment > 30) {
      factors.push(`Último pago hace ${student.days_since_last_payment} días`)
    }
    
    // Si no hay factores específicos, agregar algunos genéricos basados en el riesgo
    if (factors.length === 0) {
      factors.push("Alta probabilidad de deserción")
      factors.push("Requiere evaluación inmediata")
    }
    
    return factors
  }

  // Generar acciones recomendadas basadas en la acción de la API
  const getRecommendedActions = (student: HighRiskStudent) => {
    const actions: string[] = []
    
    // Acción principal de la API
    actions.push(student.accion_recomendada)
    
    // Acciones adicionales basadas en los datos
    if (student.attendance_rate < 70) {
      actions.push("Mejorar asistencia a clases")
    }
    
    if (student.avg_grade < 11) {
      actions.push("Refuerzo académico urgente")
    }
    
    if (student.days_since_last_payment > 30) {
      actions.push("Revisar situación financiera")
    }
    
    // Acciones generales
    actions.push("Contacto inmediato con el estudiante")
    actions.push("Asignar tutor personalizado")
    
    return actions
  }

  // Calcular métricas reales basadas en los datos
  const calculateStats = () => {
    const total = highRiskStudents.length
    
    if (total === 0) {
      return {
        total: 0,
        avgProbability: 0,
        avgAttendance: 0,
        avgGrade: 0
      }
    }
    
    const avgProbability = highRiskStudents.reduce((sum, student) => 
      sum + student.dropout_probability, 0) / total
    
    const avgAttendance = highRiskStudents.reduce((sum, student) => 
      sum + student.attendance_rate, 0) / total
    
    const avgGrade = highRiskStudents.reduce((sum, student) => 
      sum + student.avg_grade, 0) / total
    
    return {
      total,
      avgProbability: avgProbability * 100, // Convertir a porcentaje
      avgAttendance,
      avgGrade
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando estudiantes de alto riesgo...</p>
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
                <Button variant="outline" size="sm" onClick={loadHighRiskData} className="mt-2">
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
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Alto Riesgo</CardTitle>
            <Users className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probabilidad Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.avgProbability.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Riesgo de deserción</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
            <CalendarDays className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.avgAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">En estudiantes de riesgo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota Promedio</CardTitle>
            <BookOpen className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.avgGrade.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Rendimiento académico</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Estudiantes de Alto Riesgo Prioritarios</CardTitle>
            <CardDescription>
              Estudiantes con probabilidad de deserción mayor al 70% ({highRiskStudents.length} encontrados)
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Probabilidad ≥70%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {highRiskStudents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">No hay estudiantes identificados con alto riesgo de deserción</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ¡Excelentes noticias! Ningún estudiante supera el 70% de probabilidad de deserción.
                </p>
              </div>
            ) : (
              highRiskStudents.map((student, index) => (
                <div key={student.enrollment_id} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{student.student_name}</h3>
                        <Badge variant="outline" className="bg-destructive/10 text-destructive">
                          {student.riesgo_porcentaje}% de riesgo
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{student.group_name}</p>
                      
                      {/* Métricas del estudiante */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{student.avg_grade}</div>
                            <div className="text-xs text-muted-foreground">Nota</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{student.attendance_rate}%</div>
                            <div className="text-xs text-muted-foreground">Asistencia</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{student.payment_regularity}</div>
                            <div className="text-xs text-muted-foreground">Pagos</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{student.days_since_last_payment}d</div>
                            <div className="text-xs text-muted-foreground">Últ. pago</div>
                          </div>
                        </div>
                      </div>

                      {/* Critical Factors */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-2">Factores Críticos:</h4>
                        <div className="flex flex-wrap gap-2">
                          {getCriticalFactors(student).map((factor, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-destructive/10 text-destructive">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-2">Acciones Recomendadas:</h4>
                        <ul className="text-sm space-y-1">
                          {getRecommendedActions(student).map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-destructive/20">
                    <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                      <Mail className="h-4 w-4 mr-1" />
                      Contactar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Llamar
                    </Button>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Asignar Tutor
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Programar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Detalles
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Intervention Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Intervención</CardTitle>
            <CardDescription>
              Estadísticas basadas en los estudiantes de alto riesgo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estudiantes Críticos</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <Progress 
                  value={Math.min(stats.total * 10, 100)} 
                  className="h-2 bg-destructive/20"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Probabilidad Promedio</span>
                  <span className="font-medium text-destructive">{stats.avgProbability.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={stats.avgProbability} 
                  className="h-2 bg-destructive/20"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Asistencia Promedio</span>
                  <span className="font-medium text-warning">{stats.avgAttendance.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={stats.avgAttendance} 
                  className="h-2 bg-warning/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nota Promedio</span>
                  <span className="font-medium text-warning">{stats.avgGrade.toFixed(1)}</span>
                </div>
                <Progress 
                  value={(stats.avgGrade / 20) * 100} 
                  className="h-2 bg-warning/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Grupo</CardTitle>
            <CardDescription>
              Estudiantes de alto riesgo agrupados por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {highRiskStudents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">No hay estudiantes en alto riesgo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(new Set(highRiskStudents.map(s => s.group_name))).map((groupName, index) => {
                  const groupStudents = highRiskStudents.filter(s => s.group_name === groupName)
                  return (
                    <div key={groupName} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{groupName}</p>
                        <p className="text-xs text-muted-foreground">
                          {groupStudents.length} estudiante{groupStudents.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive">
                        {groupStudents.length}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}