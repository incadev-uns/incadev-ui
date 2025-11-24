import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ClipboardList, 
  Clock, 
  Loader2, 
  AlertCircle, 
  Video,
  ExternalLink,
  BarChart3
} from "lucide-react"
import { config } from "@/config/academic-config"
import { AttendanceDialog } from "@/process/academic/dasboard/groups/details-teach/attendances/AttendanceDialog"
import { AttendanceStatistics } from "@/process/academic/dasboard/groups/details-teach/attendances/AttendanceStatistics"

// Interface para la respuesta del listado de clases
interface ClassBasicInfo {
  id: number
  title: string
  start_time: string
  end_time: string
  meet_url: string | null
  my_attendance: any | null
  created_at: string
}

// Interface para la información detallada de una clase (usada en el dialog)
interface ClassDetailedInfo {
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
  students: any[]
  created_at: string
  updated_at: string
}

interface Module {
  id: number
  title: string
  description: string
  sort: number
}

interface AttendancesManagementProps {
  groupId: string
  modules: Module[]
  token: string
}

export function AttendancesManagement({ groupId, modules, token }: AttendancesManagementProps) {
  const [classes, setClasses] = useState<ClassBasicInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassBasicInfo | null>(null)
  const [showStatistics, setShowStatistics] = useState(false)

  useEffect(() => {
    loadAttendances()
  }, [groupId, token])

  const loadAttendances = async () => {
    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.attendances.listAll.replace(':group', groupId)
      
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
      console.log("Asistencias cargadas:", data)
      
      let classesData: ClassBasicInfo[] = []
      
      if (Array.isArray(data)) {
        classesData = data
      } else if (data.data && Array.isArray(data.data)) {
        classesData = data.data
      } else if (data.classes && Array.isArray(data.classes)) {
        classesData = data.classes
      } else {
        console.warn("Estructura de respuesta inesperada:", data)
        classesData = []
      }
      
      setClasses(classesData)
    } catch (error) {
      console.error("Error cargando asistencias:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleTakeAttendance = (classData: ClassBasicInfo) => {
    setSelectedClass(classData)
  }

  const handleDialogClose = (success?: boolean) => {
    setSelectedClass(null)
    if (success) {
      loadAttendances()
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('es-PE', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Como no tenemos estadísticas en el listado, mostramos información básica
  const getClassStatus = (classData: ClassBasicInfo) => {
    const now = new Date()
    const startTime = new Date(classData.start_time)
    const endTime = new Date(classData.end_time)
    
    if (now < startTime) return { status: "programada", color: "border-l-blue-500", text: "Programada" }
    if (now > endTime) return { status: "finalizada", color: "border-l-gray-500", text: "Finalizada" }
    return { status: "en_curso", color: "border-l-green-500", text: "En curso" }
  }

  const safeClasses = Array.isArray(classes) ? classes : []
  
  // Como las clases del listado no tienen módulo, las mostramos todas juntas
  // o puedes implementar lógica para agrupar por fecha u otro criterio

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Asistencias</h3>
          <p className="text-sm text-muted-foreground">
            Total: {safeClasses.length} {safeClasses.length === 1 ? 'clase' : 'clases'}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowStatistics(true)}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Estadísticas
        </Button>
      </div>

      {/* Mostrar todas las clases sin agrupar por módulo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Todas las clases del grupo
          </CardTitle>
          <CardDescription>
            {safeClasses.length} {safeClasses.length === 1 ? 'clase' : 'clases'} programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {safeClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay clases programadas en este grupo
            </p>
          ) : (
            <div className="space-y-3">
              {safeClasses.map((classData) => {
                const classStatus = getClassStatus(classData)
                
                return (
                  <Card key={classData.id} className={`border-l-4 ${classStatus.color}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <Video className="w-4 h-4 mt-1 text-green-500 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{classData.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {classStatus.text}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDateTime(classData.start_time)}</span>
                                </div>
                                <span>-</span>
                                <span>{new Date(classData.end_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              {classData.meet_url && (
                                <a 
                                  href={classData.meet_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Enlace de reunión
                                </a>
                              )}
                              
                              {/* Información básica - sin estadísticas de asistencia */}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">
                                  {classData.my_attendance ? "Asistencia tomada" : "Sin asistencia"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTakeAttendance(classData)}
                        >
                          <ClipboardList className="w-4 h-4 mr-2" />
                          {classData.my_attendance ? "Ver asistencia" : "Tomar asistencia"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClass && (
        <AttendanceDialog
          open={!!selectedClass}
          onClose={handleDialogClose}
          classId={selectedClass.id}
          classTitle={selectedClass.title}
          token={token}
        />
      )}

      {showStatistics && (
        <AttendanceStatistics
          open={showStatistics}
          onClose={() => setShowStatistics(false)}
          groupId={groupId}
          token={token}
        />
      )}
    </div>
  )
}