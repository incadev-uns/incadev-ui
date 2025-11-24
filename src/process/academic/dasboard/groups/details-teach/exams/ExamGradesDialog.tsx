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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Users, Save, CheckCircle2 } from "lucide-react"
import { config } from "@/config/academic-config"
import { Textarea } from "@/components/ui/textarea"

interface GradeData {
  id: number
  grade: number
  feedback: string | null
  created_at: string
  updated_at: string
}

interface Student {
  enrollment_id: number
  user_id: number
  name: string
  email: string
  avatar: string | null
  grade: GradeData | null
}

interface ExamInfo {
  id: number
  title: string
  start_time: string
  end_time: string
  exam_url: string | null
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

interface GradeFormData {
  enrollment_id: number
  grade: string
  feedback: string
}

interface ExamGradesDialogProps {
  open: boolean
  onClose: (success?: boolean) => void
  examId: number
  examTitle: string
  token: string
}

export function ExamGradesDialog({
  open,
  onClose,
  examId,
  examTitle,
  token
}: ExamGradesDialogProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null)
  const [grades, setGrades] = useState<GradeFormData[]>([])

  useEffect(() => {
    if (open) {
      loadExamInfo()
    }
  }, [open, examId, token])

  const loadExamInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.exams.info.replace(':exam', examId.toString())
      
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
      console.log("Información del examen cargada:", data)
      
      // La respuesta viene con { data: ExamInfo }
      const examData: ExamInfo = data.data

      setExamInfo(examData)
      
      // Inicializar formulario de notas con los datos existentes o vacíos
      const initialGrades = examData.students.map((student: Student) => ({
        enrollment_id: student.enrollment_id,
        grade: student.grade !== null ? student.grade.grade.toString() : "",
        feedback: student.grade?.feedback || ""
      }))
      setGrades(initialGrades)
    } catch (error) {
      console.error("Error cargando información del examen:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (enrollmentId: number, field: 'grade' | 'feedback', value: string) => {
    setGrades(prev => 
      prev.map(g => 
        g.enrollment_id === enrollmentId 
          ? { ...g, [field]: value }
          : g
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que todas las notas sean números válidos entre 0 y 20
    const invalidGrades = grades.filter(g => {
      if (g.grade === "") return false // Permitir notas vacías
      const gradeNum = parseFloat(g.grade)
      return isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20
    })

    if (invalidGrades.length > 0) {
      alert('Por favor, ingresa notas válidas entre 0 y 20')
      return
    }

    try {
      setSaving(true)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.exams.registerGrades.replace(':exam', examId.toString())
      
      // Filtrar solo las notas que tienen valor
      const gradesData = grades
        .filter(g => g.grade !== "")
        .map(g => ({
          enrollment_id: g.enrollment_id,
          grade: parseFloat(g.grade),
          feedback: g.feedback || ""
        }))

      if (gradesData.length === 0) {
        alert('Por favor, ingresa al menos una nota')
        return
      }

      const body = { grades: gradesData }

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

      console.log("Notas guardadas exitosamente")
      alert('Notas guardadas exitosamente')
      onClose(true)
    } catch (error) {
      console.error("Error guardando notas:", error)
      alert(error instanceof Error ? error.message : 'Error al guardar las notas')
    } finally {
      setSaving(false)
    }
  }

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground"
    if (grade >= 14) return "text-green-600"
    if (grade >= 11) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradedCount = () => {
    if (!examInfo) return 0
    return examInfo.students.filter(s => s.grade !== null).length
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !examInfo) {
    return (
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[700px]">
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

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calificar Examen</DialogTitle>
          <DialogDescription>{examTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del examen */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{examInfo.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {examInfo.module.title} • {examInfo.group.name}
                  </p>
                </div>
                <Badge variant={getGradedCount() === examInfo.students.length ? "default" : "secondary"}>
                  {getGradedCount()} / {examInfo.students.length} calificados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {examInfo.students.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay estudiantes inscritos en este grupo para calificar
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                {examInfo.students.map((student, index) => {
                  const gradeData = grades.find(g => g.enrollment_id === student.enrollment_id)
                  const studentGrade = student.grade?.grade || null
                  
                  return (
                    <Card key={student.enrollment_id}>
                      <CardContent className="py-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                </div>
                              </div>
                            </div>
                            {studentGrade !== null && (
                              <Badge variant="outline" className={getGradeColor(studentGrade)}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {studentGrade}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`grade-${student.enrollment_id}`}>
                                Nota (0-20)
                              </Label>
                              <Input
                                id={`grade-${student.enrollment_id}`}
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                placeholder="Ej: 15.5"
                                value={gradeData?.grade || ""}
                                onChange={(e) => handleGradeChange(student.enrollment_id, 'grade', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`feedback-${student.enrollment_id}`}>
                                Retroalimentación (opcional)
                              </Label>
                              <Textarea
                                id={`feedback-${student.enrollment_id}`}
                                placeholder="Comentarios sobre el desempeño..."
                                value={gradeData?.feedback || ""}
                                onChange={(e) => handleGradeChange(student.enrollment_id, 'feedback', e.target.value)}
                                rows={2}
                              />
                            </div>
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
                      Guardar notas
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