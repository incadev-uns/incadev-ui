import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Users, TrendingUp } from "lucide-react"
import { config } from "@/config/academic-config"
import { Progress } from "@/components/ui/progress"

// Interface basada en la estructura real del API
interface StudentStatistics {
  enrollment_id: number
  user_id: number
  name: string
  email: string
  statistics: {
    total_classes: number
    present: number
    absent: number
    late: number
    excused: number
    attendance_percentage: number
  }
}

interface StatisticsData {
  group_id: number
  group_name: string
  total_classes: number
  students_statistics: StudentStatistics[]
}

interface AttendanceStatisticsProps {
  open: boolean
  onClose: () => void
  groupId: string
  token: string
}

export function AttendanceStatistics({
  open,
  onClose,
  groupId,
  token
}: AttendanceStatisticsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)

  useEffect(() => {
    if (open) {
      loadStatistics()
    }
  }, [open, groupId, token])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.attendances.statistics.replace(':group', groupId)
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Estadísticas cargadas:", data)
      
      setStatistics(data.data || data)
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceColorForProgress = (rate: number) => {
    if (rate >= 90) return "bg-green-600"
    if (rate >= 75) return "bg-yellow-600"
    return "bg-red-600"
  }

  // Calcular estadísticas generales
  const getOverallStats = () => {
    if (!statistics) return null
    
    const totalStudents = statistics.students_statistics.length
    const totalClasses = statistics.total_classes
    
    // Calcular promedio de asistencia
    const totalAttendanceRate = statistics.students_statistics.reduce(
      (sum, student) => sum + student.statistics.attendance_percentage, 0
    )
    const averageAttendanceRate = totalStudents > 0 ? totalAttendanceRate / totalStudents : 0
    
    return {
      totalStudents,
      totalClasses,
      averageAttendanceRate
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px]">
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !statistics) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "No se pudo cargar las estadísticas"}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const overallStats = getOverallStats()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estadísticas de Asistencia</DialogTitle>
          <DialogDescription>{statistics.group_name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen general */}
          {overallStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{overallStats.totalStudents}</div>
                      <div className="text-sm text-muted-foreground">Estudiantes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{overallStats.totalClasses}</div>
                      <div className="text-sm text-muted-foreground">Clases totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getAttendanceColor(overallStats.averageAttendanceRate)}`}>
                        {overallStats.averageAttendanceRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Asistencia promedio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Estadísticas por estudiante */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asistencia por Estudiante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.students_statistics.map((student, index) => (
                  <Card key={student.enrollment_id}>
                    <CardContent className="py-3">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getAttendanceColor(student.statistics.attendance_percentage)}`}>
                              {student.statistics.attendance_percentage.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {student.statistics.present + student.statistics.late} / {student.statistics.total_classes}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div>
                            <div className="text-green-600 font-semibold">{student.statistics.present}</div>
                            <div className="text-muted-foreground">Presente</div>
                          </div>
                          <div>
                            <div className="text-yellow-600 font-semibold">{student.statistics.late}</div>
                            <div className="text-muted-foreground">Tardanza</div>
                          </div>
                          <div>
                            <div className="text-red-600 font-semibold">{student.statistics.absent}</div>
                            <div className="text-muted-foreground">Ausente</div>
                          </div>
                          <div>
                            <div className="text-blue-600 font-semibold">{student.statistics.excused}</div>
                            <div className="text-muted-foreground">Justificado</div>
                          </div>
                        </div>

                        <Progress 
                          value={student.statistics.attendance_percentage} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}