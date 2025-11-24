import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  FileCheck, 
  Clock, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  ExternalLink,
  GraduationCap
} from "lucide-react"
import { config } from "@/config/academic-config"
import { ExamFormDialog } from "@/process/academic/dasboard/groups/details-teach/exams/ExamFormDialog"
import { ExamGradesDialog } from "@/process/academic/dasboard/groups/details-teach/exams/ExamGradesDialog"

interface ExamData {
  id: number
  title: string
  start_time: string
  end_time: string
  exam_url: string | null
  module: {
    id: number
    title: string
    description: string
    sort: number
  }
  created_at: string
}

interface Module {
  id: number
  title: string
  description: string
  sort: number
}

interface ExamsManagementProps {
  groupId: string
  modules: Module[]
  token: string
}

export function ExamsManagement({ groupId, modules, token }: ExamsManagementProps) {
  const [exams, setExams] = useState<ExamData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<ExamData | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [gradingExam, setGradingExam] = useState<ExamData | null>(null)

  useEffect(() => {
    loadExams()
  }, [groupId, token])

  const loadExams = async () => {
    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.exams.listAll.replace(':group', groupId)
      
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
      console.log("Exámenes cargados:", data)
      
      let examsData: ExamData[] = []
      
      if (Array.isArray(data)) {
        examsData = data
      } else if (data.data && Array.isArray(data.data)) {
        examsData = data.data
      } else if (data.exams && Array.isArray(data.exams)) {
        examsData = data.exams
      } else {
        console.warn("Estructura de respuesta inesperada:", data)
        examsData = []
      }
      
      setExams(examsData)
    } catch (error) {
      console.error("Error cargando exámenes:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (examId: number) => {
    if (!confirm('¿Estás seguro de eliminar este examen? Se eliminarán todas las notas asociadas.')) {
      return
    }

    try {
      setDeletingId(examId)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.exams.delete.replace(':exam', examId.toString())
      
      const response = await fetch(
        `${config.apiUrl}${endpoint}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error al eliminar el examen`)
      }

      console.log("Examen eliminado exitosamente")
      loadExams()
    } catch (error) {
      console.error("Error eliminando examen:", error)
      alert('Error al eliminar el examen. Por favor, inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (examData: ExamData) => {
    setEditingExam(examData)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingExam(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false)
    setEditingExam(null)
    if (success) {
      loadExams()
    }
  }

  const handleGrade = (examData: ExamData) => {
    setGradingExam(examData)
  }

  const handleGradesDialogClose = (success?: boolean) => {
    setGradingExam(null)
    if (success) {
      loadExams()
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

  const safeExams = Array.isArray(exams) ? exams : []
  
  const examsByModule = modules.map(module => ({
    module,
    exams: safeExams.filter(e => e.module.id === module.id)
  }))

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
          <h3 className="text-lg font-semibold">Gestión de Exámenes</h3>
          <p className="text-sm text-muted-foreground">
            Total: {safeExams.length} {safeExams.length === 1 ? 'examen' : 'exámenes'}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo examen
        </Button>
      </div>

      {examsByModule.map(({ module, exams: moduleExams }) => (
        <Card key={module.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Módulo {module.sort}: {module.title}
            </CardTitle>
            <CardDescription>
              {moduleExams.length} {moduleExams.length === 1 ? 'examen' : 'exámenes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {moduleExams.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay exámenes en este módulo
              </p>
            ) : (
              <div className="space-y-3">
                {moduleExams.map((examData) => (
                  <Card key={examData.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="py-4">
                      <div className="flex flex-col gap-3">
                        {/* Header del examen */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <FileCheck className="w-4 h-4 mt-1 text-blue-500 shrink-0" />
                              <div>
                                <h4 className="font-medium">{examData.title}</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDateTime(examData.start_time)}</span>
                                  </div>
                                  <span>-</span>
                                  <span>{new Date(examData.end_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {examData.exam_url && (
                                  <a 
                                    href={examData.exam_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Enlace del examen
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(examData)}
                              disabled={deletingId === examData.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(examData.id)}
                              disabled={deletingId === examData.id}
                            >
                              {deletingId === examData.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Botón de calificaciones */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGrade(examData)}
                          >
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Calificar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <ExamFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        groupId={groupId}
        modules={modules}
        editingExam={editingExam}
        token={token}
      />

      {gradingExam && (
        <ExamGradesDialog
          open={!!gradingExam}
          onClose={handleGradesDialogClose}
          examId={gradingExam.id}
          examTitle={gradingExam.title}
          token={token}
        />
      )}
    </div>
  )
}