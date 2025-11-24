import AcademicLayout from "@/process/academic/AcademicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Users, GraduationCap, BookOpen, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { config } from "@/config/academic-config"
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupHeader } from "@/process/academic/dasboard/groups/details-teach/components/GroupHeader"
import { CompletionStatusCard } from "@/process/academic/dasboard/groups/details-teach/components/CompletionStatusCard"
import { ClassesManagement } from "@/process/academic/dasboard/groups/details-teach/classes/ClassesManagement"
import { ExamsManagement } from "@/process/academic/dasboard/groups/details-teach/exams/ExamsManagement"
import { AttendancesManagement } from "@/process/academic/dasboard/groups/details-teach/attendances/AttendancesManagement"

interface Teacher {
  id: number
  name: string
  fullname: string
  email: string
  avatar: string | null
}

interface Student {
  id: number
  name: string
  fullname: string
  email: string
  avatar: string | null
}

interface Module {
  id: number
  title: string
  description: string
  sort: number
  classes: any[]
  exams: any[]
}

interface GroupDetail {
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
  students: Student[]
  modules: Module[]
  created_at: string
}

interface CanCompleteData {
  can_complete: boolean
  reasons: {
    has_students: boolean
    has_classes: boolean
    has_exams: boolean
    total_students: number
    total_classes: number
    total_exams: number
  }
}

export default function DetailTeachGroup() {
  const { token } = useAcademicAuth()
  const [groupData, setGroupData] = useState<GroupDetail | null>(null)
  const [canCompleteData, setCanCompleteData] = useState<CanCompleteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
    
  const getGroupIdFromURL = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('id')
    }
    return null
  }
  
  const groupId = getGroupIdFromURL()
  
  useEffect(() => {
    if (groupId && token) {
      loadGroupDetail()
      loadCanComplete()
    }
  }, [groupId, token])

  const loadGroupDetail = async () => {
    if (!token || !groupId) return

    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.groups.specificTeaching.replace(':group', groupId)
      
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
      console.log("Detalle del grupo cargado:", data)
      setGroupData(data.data)
    } catch (error) {
      console.error("Error cargando detalle del grupo:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const loadCanComplete = async () => {
    if (!token || !groupId) return

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.groups.canComplete.replace(':group', groupId)
      
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
        throw new Error(`Error al verificar completitud`)
      }

      const data = await response.json()
      console.log("Verificación de completitud:", data)
      setCanCompleteData(data.data)
    } catch (error) {
      console.error("Error verificando completitud:", error)
    }
  }

  const handleCompleteGroup = async () => {
    if (!token || !groupId || !canCompleteData?.can_complete) return

    if (!confirm('¿Estás seguro de completar este grupo? Esta acción generará certificados y notas finales.')) {
      return
    }

    try {
      setCompleting(true)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.groups.complete.replace(':group', groupId)
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error al completar el grupo`)
      }

      const data = await response.json()
      console.log("Grupo completado:", data)
      alert('Grupo completado exitosamente. Se han generado los certificados y notas finales.')
      loadGroupDetail()
      loadCanComplete()
    } catch (error) {
      console.error("Error completando grupo:", error)
      alert('Error al completar el grupo. Por favor, inténtalo de nuevo.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <AcademicLayout title="Detalle del grupo">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando información del grupo...</p>
          </div>
        </div>
      </AcademicLayout>
    )
  }

  if (error || !groupData) {
    return (
      <AcademicLayout title="Detalle del grupo">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center py-12 px-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "No se pudo cargar la información del grupo"}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.history.back()} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </AcademicLayout>
    )
  }

  return (
    <AcademicLayout title={groupData.name}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
            {/* Header */}
            <div className="px-4 lg:px-6">
              <GroupHeader 
                groupData={groupData}
                onBack={() => window.history.back()}
              />
            </div>

            {/* Estado de completitud */}
            {canCompleteData && groupData.status !== "completed" && (
              <div className="px-4 lg:px-6">
                <CompletionStatusCard
                  canCompleteData={canCompleteData}
                  completing={completing}
                  onComplete={handleCompleteGroup}
                />
              </div>
            )}

            {/* Tabs de gestión */}
            <div className="px-4 lg:px-6">
              <Tabs defaultValue="classes">
                <TabsList>
                  <TabsTrigger value="classes">Clases</TabsTrigger>
                  <TabsTrigger value="exams">Exámenes</TabsTrigger>
                  <TabsTrigger value="attendances">Asistencias</TabsTrigger>
                  <TabsTrigger value="modules">Módulos</TabsTrigger>
                  <TabsTrigger value="students">Estudiantes</TabsTrigger>
                  <TabsTrigger value="teachers">Docentes</TabsTrigger>
                </TabsList>

                <TabsContent value="classes" className="mt-4">
                  {token && groupId && (
                    <ClassesManagement
                      groupId={groupId}
                      modules={groupData.modules}
                      token={token}
                    />
                  )}
                </TabsContent>

                <TabsContent value="exams" className="mt-4">
                  {token && groupId && (
                    <ExamsManagement
                      groupId={groupId}
                      modules={groupData.modules}
                      token={token}
                    />
                  )}
                </TabsContent>

                <TabsContent value="attendances" className="mt-4">
                  {token && groupId && (
                    <AttendancesManagement
                      groupId={groupId}
                      modules={groupData.modules}
                      token={token}
                    />
                  )}
                </TabsContent>

                <TabsContent value="modules" className="mt-4">
                  <div className="grid gap-4">
                    {groupData.modules.map((module) => (
                      <Card key={module.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                                <h3 className="font-semibold text-lg">
                                  Módulo {module.sort}: {module.title}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {module.description}
                              </p>
                              <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                <span>Clases: {module.classes.length}</span>
                                <span>Exámenes: {module.exams.length}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="students" className="mt-4">
                  {groupData.students.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No hay estudiantes inscritos en este grupo
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-3">
                      {groupData.students.map((student) => (
                        <Card key={student.id}>
                          <CardContent className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{student.fullname}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="teachers" className="mt-4">
                  <div className="grid gap-3">
                    {groupData.teachers.map((teacher) => (
                      <Card key={teacher.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">{teacher.fullname}</p>
                              <p className="text-sm text-muted-foreground">{teacher.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

          </div>
        </div>
      </div>
    </AcademicLayout>
  )
}