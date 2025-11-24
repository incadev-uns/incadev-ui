import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Calendar, User } from "lucide-react"

// Tipo para el teacher del API
interface Teacher {
  id: number
  name: string
  fullname: string
  email: string
  avatar: string | null
}

// Tipo para los datos del API
export interface APIGroupData {
  id: number
  name: string
  course_name: string
  course_version: string
  course_version_name: string
  price: string
  start_date: string
  end_date: string
  status: string
  teachers: Teacher[]
  created_at: string
}

// Tipo para el componente (compatible con ambas estructuras)
export interface GroupData {
  id: string
  name: string
  course: string
  teacher: string
  image: string
  schedule: string
  enrolled: number
  capacity: number
  startDate: string
  endDate?: string
  status?: "available" | "joined" | "completed" | "teaching"
  progress?: number
  price?: string
  teachers?: Teacher[]
}

interface GroupCardProps {
  group: GroupData
  variant?: "available" | "joined" | "completed" | "teaching"
  onAction: (groupId: string) => void
  actionLabel: string
  actionDisabled?: boolean
  actionVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function GroupCard({ 
  group, 
  variant = "available", 
  onAction, 
  actionLabel,
  actionDisabled = false,
  actionVariant = "default"
}: GroupCardProps) {
  const getStatusBadge = () => {
    switch (variant) {
      case "completed":
        return <Badge variant="secondary">Completado</Badge>
      case "joined":
        return <Badge variant="default">En curso</Badge>
      case "teaching":
        return <Badge variant="outline">Docente</Badge>
      default:
        return <Badge variant="outline">Disponible</Badge>
    }
  }

  const getActionButton = () => {
    if (!onAction || !actionLabel) return null
    
    return (
      <Button 
        onClick={() => onAction(group.id)}
        className="w-full"
        variant={actionVariant}
        disabled={actionDisabled}
      >
        {actionLabel}
      </Button>
    )
  }

  // Formatear fechas
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden bg-linear-to-br from-blue-500 to-purple-600">
        {group.image ? (
          <img 
            src={group.image} 
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
        {group.price && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-white/90 text-gray-900 hover:bg-white">
              S/ {group.price}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-tight">{group.name}</h3>
          <p className="text-sm text-muted-foreground">{group.course}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Mostrar docentes */}
        {group.teachers && group.teachers.length > 0 ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              {group.teachers.map((teacher, idx) => (
                <span key={teacher.id}>
                  {teacher.name}
                  {idx < group.teachers!.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{group.teacher}</span>
          </div>
        )}

        {/* Fechas */}
        {group.schedule ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{group.schedule}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(group.startDate)} - {group.endDate && formatDate(group.endDate)}
            </span>
          </div>
        )}

        {/* Capacidad */}
        {group.enrolled !== undefined && group.capacity !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{group.enrolled} / {group.capacity} estudiantes</span>
          </div>
        )}

        {/* Progreso para grupos completados */}
        {variant === "completed" && group.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{group.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${group.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Progreso para grupos unidos */}
        {variant === "joined" && group.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{group.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${group.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      {getActionButton() && (
        <CardFooter className="pt-3">
          {getActionButton()}
        </CardFooter>
      )}
    </Card>
  )
}

// Función helper para convertir datos del API al formato del componente
export function mapAPIGroupToGroupData(apiGroup: APIGroupData): GroupData {
  return {
    id: apiGroup.id.toString(),
    name: apiGroup.name,
    course: apiGroup.course_name,
    teacher: apiGroup.teachers.map(t => t.name).join(", "),
    image: "",
    schedule: "", // Se mostrará el rango de fechas en su lugar
    enrolled: 0, // No disponible en el API por ahora
    capacity: 30, // Valor por defecto
    startDate: apiGroup.start_date,
    endDate: apiGroup.end_date,
    status: "available",
    price: apiGroup.price,
    teachers: apiGroup.teachers
  }
}