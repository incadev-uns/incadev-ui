import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  BookOpen
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// ============= INTERFACES =============
export interface Teacher {
  id: number
  name: string
  fullname: string
  email: string
  avatar: string | null
}

export interface Material {
  id: number
  type: "image" | "document" | "video" | "link"
  material_url: string
  created_at: string
}

export interface Attendance {
  status: "present" | "absent" | "late"
  recorded_at: string
}

export interface Class {
  id: number
  title: string
  start_time: string
  end_time: string
  meet_url: string
  materials: Material[]
  my_attendance: Attendance | null
  created_at: string
}

export interface Grade {
  grade: string
  feedback: string | null
  recorded_at: string
}

export interface Exam {
  id: number
  title: string
  start_time: string
  end_time: string
  exam_url: string
  my_grade: Grade | null
  created_at: string
}

export interface Module {
  id: number
  title: string
  description: string
  sort: number
  classes: Class[]
  exams: Exam[]
}

// ============= HELPER FUNCTIONS =============
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-PE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-PE', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ============= MATERIAL ICON COMPONENT =============
export function MaterialIcon({ type }: { type: Material['type'] }) {
  const icons = {
    image: <ImageIcon className="w-4 h-4" />,
    document: <FileText className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    link: <LinkIcon className="w-4 h-4" />
  }
  
  return icons[type] || <FileText className="w-4 h-4" />
}

// ============= ATTENDANCE BADGE COMPONENT =============
export function AttendanceBadge({ status }: { status: Attendance['status'] | null }) {
  if (!status) {
    return <Badge variant="secondary">Sin registro</Badge>
  }

  const statusConfig = {
    present: { icon: CheckCircle2, variant: "default" as const, label: "Presente" },
    absent: { icon: XCircle, variant: "destructive" as const, label: "Ausente" },
    late: { icon: AlertCircle, variant: "secondary" as const, label: "Tardanza" }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

// ============= TEACHERS SECTION COMPONENT =============
export function TeachersSection({ teachers }: { teachers: Teacher[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">👨‍🏫</AvatarFallback>
          </Avatar>
          Docentes del grupo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <Avatar>
                <AvatarImage src={teacher.avatar || undefined} />
                <AvatarFallback>
                  {getInitials(teacher.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{teacher.fullname}</p>
                <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============= CLASS CARD COMPONENT =============
export function ClassCard({ classData }: { classData: Class }) {
  const getMaterialTypeName = (type: Material['type']) => {
    const names = {
      image: "Imagen",
      document: "Documento",
      video: "Video",
      link: "Enlace"
    }
    return names[type]
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{classData.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(classData.start_time)} - {new Date(classData.end_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </CardDescription>
          </div>
          {classData.my_attendance && (
            <AttendanceBadge status={classData.my_attendance.status} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Botón de Meet */}
        {classData.meet_url && (
          <Button variant="outline" className="w-full" asChild>
            <a href={classData.meet_url} target="_blank" rel="noopener noreferrer">
              <Video className="w-4 h-4 mr-2" />
              Unirse a la clase
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        )}

        {/* Materiales */}
        {classData.materials.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Materiales ({classData.materials.length})
              </p>
              <div className="space-y-2">
                {classData.materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.material_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border rounded hover:bg-accent transition-colors text-sm"
                  >
                    <MaterialIcon type={material.type} />
                    <span className="flex-1">{getMaterialTypeName(material.type)}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============= EXAM CARD COMPONENT =============
export function ExamCard({ exam }: { exam: Exam }) {
  const isAvailable = new Date() >= new Date(exam.start_time) && new Date() <= new Date(exam.end_time)
  const isPast = new Date() > new Date(exam.end_time)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              {exam.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3" />
              {formatDateTime(exam.start_time)} - {formatDateTime(exam.end_time)}
            </CardDescription>
          </div>
          {exam.my_grade ? (
            <Badge variant="default" className="gap-1">
              <Trophy className="w-3 h-3" />
              Nota: {exam.my_grade.grade}
            </Badge>
          ) : isPast ? (
            <Badge variant="secondary">Finalizado</Badge>
          ) : isAvailable ? (
            <Badge variant="default" className="animate-pulse">Disponible</Badge>
          ) : (
            <Badge variant="outline">Próximamente</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Botón del examen */}
        <Button 
          variant={isAvailable ? "default" : "outline"} 
          className="w-full" 
          disabled={!isAvailable}
          asChild={isAvailable}
        >
          {isAvailable ? (
            <a href={exam.exam_url} target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4 mr-2" />
              Realizar examen
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              {isPast ? "Examen finalizado" : "Examen no disponible"}
            </>
          )}
        </Button>

        {/* Calificación y feedback */}
        {exam.my_grade && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Calificación:</span>
                <span className="font-bold text-lg">{exam.my_grade.grade}</span>
              </div>
              {exam.my_grade.feedback && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Retroalimentación:</p>
                  <p className="text-sm">{exam.my_grade.feedback}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Calificado el {formatDateTime(exam.my_grade.recorded_at)}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============= MODULE ACCORDION COMPONENT =============
export function ModulesAccordion({ modules }: { modules: Module[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Contenido del curso ({modules.length} módulos)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay módulos disponibles aún
          </p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {modules.map((module) => (
              <AccordionItem key={module.id} value={`module-${module.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="outline">Módulo {module.sort}</Badge>
                    <div>
                      <p className="font-semibold">{module.title}</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        {module.classes.length} clases · {module.exams.length} exámenes
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 pt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    
                    {/* Clases */}
                    {module.classes.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Clases
                        </h4>
                        <div className="space-y-3">
                          {module.classes.map((classData) => (
                            <ClassCard key={classData.id} classData={classData} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exámenes */}
                    {module.exams.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Evaluaciones
                        </h4>
                        <div className="space-y-3">
                          {module.exams.map((exam) => (
                            <ExamCard key={exam.id} exam={exam} />
                          ))}
                        </div>
                      </div>
                    )}

                    {module.classes.length === 0 && module.exams.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay contenido disponible en este módulo
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}