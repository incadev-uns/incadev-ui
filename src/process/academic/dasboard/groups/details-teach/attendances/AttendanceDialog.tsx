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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Save, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react"
import { config } from "@/config/academic-config"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AttendanceData {
  id: number
  status: string
  created_at: string
  updated_at: string
}

interface Student {
  enrollment_id: number
  user_id: number
  name: string
  email: string
  avatar: string | null
  attendance: AttendanceData | null
}

interface ClassInfo {
  id: number
  title: string
  start_time: string
  end_time: string
  meet_url: string | null
  module: {
    id: number
    title: string
  }
  group: {
    id: number
    name: string
  }
  students: Student[]
  created_at: string
  updated_at: string
}

interface AttendanceFormData {
  enrollment_id: number
  status: string
}

interface AttendanceDialogProps {
  open: boolean
  onClose: (success?: boolean) => void
  classId: number
  classTitle: string
  token: string
}

const ATTENDANCE_STATUS = [
  { value: "present", label: "Presente", icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100" },
  { value: "late", label: "Tardanza", icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { value: "absent", label: "Ausente", icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  { value: "excused", label: "Justificado", icon: AlertTriangle, color: "text-blue-600", bgColor: "bg-blue-100" },
]

export function AttendanceDialog({
  open,
  onClose,
  classId,
  classTitle,
  token
}: AttendanceDialogProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [attendances, setAttendances] = useState<AttendanceFormData[]>([])

  useEffect(() => {
    if (open) {
      loadClassInfo()
    }
  }, [open, classId, token])

  const loadClassInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.attendances.info.replace(':class', classId.toString())
      
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
      console.log("Información de la clase cargada:", data)
      
      const classData: ClassInfo = data.data
      setClassInfo(classData)
      
      // Inicializar formulario de asistencias con los datos existentes o "present" por defecto
      const initialAttendances = classData.students.map((student: Student) => ({
        enrollment_id: student.enrollment_id,
        status: student.attendance?.status || "present"
      }))
      setAttendances(initialAttendances)
    } catch (error) {
      console.error("Error cargando información de la clase:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (enrollmentId: number, status: string) => {
    setAttendances(prev => 
      prev.map(a => 
        a.enrollment_id === enrollmentId 
          ? { ...a, status }
          : a
      )
    )
  }

  const handleQuickMarkAll = (status: string) => {
    setAttendances(prev => prev.map(a => ({ ...a, status })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.attendances.register.replace(':class', classId.toString())
      
      const body = { attendances }

      const response = await fetch(
        `${config.apiUrl}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Error ${response.status}`)
      }

      console.log("Asistencias guardadas exitosamente")
      alert('Asistencias guardadas exitosamente')
      onClose(true)
    } catch (error) {
      console.error("Error guardando asistencias:", error)
      alert(error instanceof Error ? error.message : 'Error al guardar las asistencias')
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const statusConfig = ATTENDANCE_STATUS.find(s => s.value === status)
    if (!statusConfig) return null
    const Icon = statusConfig.icon
    return <Icon className={`w-4 h-4 ${statusConfig.color}`} />
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = ATTENDANCE_STATUS.find(s => s.value === status)
    if (!statusConfig) return null
    return (
      <Badge variant="outline" className={`${statusConfig.color} border-current`}>
        {statusConfig.label}
      </Badge>
    )
  }

  const getAttendanceStats = () => {
    const stats = {
      present: attendances.filter(a => a.status === "present").length,
      late: attendances.filter(a => a.status === "late").length,
      absent: attendances.filter(a => a.status === "absent").length,
      excused: attendances.filter(a => a.status === "excused").length,
    }
    return stats
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[800px]">
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !classInfo) {
    return (
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[800px]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "No se pudo cargar la información"}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => onClose()}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const stats = getAttendanceStats()

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tomar Asistencia</DialogTitle>
          <DialogDescription>{classTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la clase */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{classInfo.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {classInfo.module.title} • {classInfo.group.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de marcado rápido */}
          <Card>
            <CardContent className="py-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium mr-2">Marcar todos como:</span>
                {ATTENDANCE_STATUS.map((status) => {
                  const Icon = status.icon
                  return (
                    <Button
                      key={status.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickMarkAll(status.value)}
                    >
                      <Icon className={`w-4 h-4 mr-1 ${status.color}`} />
                      {status.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardContent className="py-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <div className="text-xs text-muted-foreground">Presentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <div className="text-xs text-muted-foreground">Tardanzas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-xs text-muted-foreground">Ausentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                <div className="text-xs text-muted-foreground">Justificados</div>
              </CardContent>
            </Card>
          </div>

          {classInfo.students.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay estudiantes inscritos en este grupo
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                {classInfo.students.map((student, index) => {
                  const attendanceData = attendances.find(a => a.enrollment_id === student.enrollment_id)
                  const currentStatus = attendanceData?.status || "present"
                  
                  return (
                    <Card key={student.enrollment_id}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {student.attendance && getStatusBadge(student.attendance.status)}
                            <Select
                              value={currentStatus}
                              onValueChange={(value) => handleStatusChange(student.enrollment_id, value)}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ATTENDANCE_STATUS.map((status) => {
                                  const Icon = status.icon
                                  return (
                                    <SelectItem key={status.value} value={status.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${status.color}`} />
                                        {status.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar asistencias
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}