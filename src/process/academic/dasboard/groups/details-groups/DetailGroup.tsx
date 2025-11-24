import AcademicLayout from "@/process/academic/AcademicLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Loader2, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { config } from "@/config/academic-config"
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TeachersSection, 
  ModulesAccordion,
  formatDate,
  type Module,
  type Teacher,
  type Exam
} from "@/process/academic/dasboard/groups/details-groups/components/GroupDetailComponents"

interface GroupDetailData {
  id: number
  name: string
  course_name: string
  course_version: string
  course_version_name: string
  course_description: string
  course_image: string | null
  start_date: string
  end_date: string
  status: string
  teachers: Teacher[]
  modules: Module[]
  created_at: string
}

interface APIDetailResponse {
  data: GroupDetailData
}

export default function DetailGroup() {
  const { token } = useAcademicAuth()
  const [groupData, setGroupData] = useState<GroupDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getGroupIdFromURL = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('id')
    }
    return null
  }

  useEffect(() => {
    const fetchGroupDetail = async () => {
      const groupId = getGroupIdFromURL()
      
      if (!groupId) {
        setError("No se proporcionó un ID de grupo válido")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const tokenWithoutQuotes = token?.replace(/^"|"$/g, '')
        const endpoint = config.endpoints.groups.infoEnroll.replace(':group', groupId)
        
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

        const data: APIDetailResponse = await response.json()
        console.log("Detalle del grupo cargado:", data)
        setGroupData(data.data)
      } catch (error) {
        console.error("Error cargando detalle del grupo:", error)
        setError(error instanceof Error ? error.message : "Error desconocido al cargar el grupo")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchGroupDetail()
    }
  }, [token])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>
      case "completed":
        return <Badge variant="secondary">Completado</Badge>
      case "enrolling":
        return <Badge variant="outline">Inscripción Abierta</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calcular estadísticas
  const calculateStats = () => {
    if (!groupData) return { totalClasses: 0, totalExams: 0, completedExams: 0, averageGrade: 0 }
    
    let totalClasses = 0
    let totalExams = 0
    let completedExams = 0
    let totalGrade = 0

    groupData.modules.forEach(module => {
      totalClasses += module.classes.length
      totalExams += module.exams.length
      
      module.exams.forEach(exam => {
        if (exam.my_grade) {
          completedExams++
          totalGrade += parseFloat(exam.my_grade.grade)
        }
      })
    })

    const averageGrade = completedExams > 0 ? (totalGrade / completedExams).toFixed(2) : 0

    return { totalClasses, totalExams, completedExams, averageGrade }
  }

  if (loading) {
    return (
      <AcademicLayout title="Cargando...">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando información del grupo...</p>
        </div>
      </AcademicLayout>
    )
  }

  if (error || !groupData) {
    return (
      <AcademicLayout title="Error">
        <div className="flex flex-1 flex-col">
          <div className="px-4 lg:px-6 py-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "No se pudo cargar la información del grupo"}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </AcademicLayout>
    )
  }

  const stats = calculateStats()

  return (
    <AcademicLayout title={groupData.name}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
            {/* Header del grupo */}
            <div className="px-4 lg:px-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-2xl">{groupData.name}</CardTitle>
                        {getStatusBadge(groupData.status)}
                      </div>
                      <CardDescription className="text-base">
                        {groupData.course_name}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">
                        Versión: {groupData.course_version_name}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupData.course_description && (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {groupData.course_description}
                      </p>
                      <Separator />
                    </>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-muted-foreground">Inicio:</span>
                        <span className="font-medium ml-2">{formatDate(groupData.start_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-muted-foreground">Fin:</span>
                        <span className="font-medium ml-2">{formatDate(groupData.end_date)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas del estudiante */}
            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total de clases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalClasses}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Exámenes totales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalExams}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Exámenes completados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.completedExams} / {stats.totalExams}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Promedio actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {stats.averageGrade || "--"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Docentes */}
            <div className="px-4 lg:px-6">
              <TeachersSection teachers={groupData.teachers} />
            </div>

            {/* Módulos con clases y exámenes */}
            <div className="px-4 lg:px-6">
              <ModulesAccordion modules={groupData.modules} />
            </div>

          </div>
        </div>
      </div>
    </AcademicLayout>
  )
}