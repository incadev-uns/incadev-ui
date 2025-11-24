import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Video, Clock, Edit, Trash2, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { config } from "@/config/academic-config"
import { ClassFormDialog } from "./ClassFormDialog"
import { MaterialsManagement } from "./MaterialsManagement"

interface ClassData {
  id: number
  title: string
  start_time: string
  end_time: string
  meet_url: string | null
  materials: any[]
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

interface ClassesManagementProps {
  groupId: string
  modules: Module[]
  token: string
}

export function ClassesManagement({ groupId, modules, token }: ClassesManagementProps) {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    loadClasses()
  }, [groupId, token])

  const loadClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.classes.listAll.replace(':group', groupId)
      
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
      console.log("Clases cargadas:", data)
      
      let classesData: ClassData[] = []
      
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
      console.error("Error cargando clases:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (classId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) {
      return
    }

    try {
      setDeletingId(classId)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.classes.delete.replace(':class', classId.toString())
      
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
        throw new Error(`Error al eliminar la clase`)
      }

      console.log("Clase eliminada exitosamente")
      loadClasses()
    } catch (error) {
      console.error("Error eliminando clase:", error)
      alert('Error al eliminar la clase. Por favor, inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (classData: ClassData) => {
    setEditingClass(classData)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingClass(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false)
    setEditingClass(null)
    if (success) {
      loadClasses()
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

  const safeClasses = Array.isArray(classes) ? classes : []
  
  const classesByModule = modules.map(module => ({
    module,
    classes: safeClasses.filter(c => c.module.id === module.id)
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
          <h3 className="text-lg font-semibold">Gestión de Clases</h3>
          <p className="text-sm text-muted-foreground">
            Total: {safeClasses.length} {safeClasses.length === 1 ? 'clase' : 'clases'}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva clase
        </Button>
      </div>

      {classesByModule.map(({ module, classes: moduleClasses }) => (
        <Card key={module.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Módulo {module.sort}: {module.title}
            </CardTitle>
            <CardDescription>
              {moduleClasses.length} {moduleClasses.length === 1 ? 'clase' : 'clases'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {moduleClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay clases en este módulo
              </p>
            ) : (
              <div className="space-y-3">
                {moduleClasses.map((classData) => (
                  <Card key={classData.id} className="border-l-4 border-l-primary">
                    <CardContent className="py-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <Video className="w-4 h-4 mt-1 text-primary shrink-0" />
                              <div>
                                <h4 className="font-medium">{classData.title}</h4>
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
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(classData)}
                              disabled={deletingId === classData.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(classData.id)}
                              disabled={deletingId === classData.id}
                            >
                              {deletingId === classData.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Botón de materiales */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <MaterialsManagement
                            classId={classData.id}
                            className={classData.title}
                            token={token}
                          />
                          {classData.materials && classData.materials.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {classData.materials.length} material{classData.materials.length !== 1 ? 'es' : ''}
                            </Badge>
                          )}
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

      <ClassFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        groupId={groupId}
        modules={modules}
        editingClass={editingClass}
        token={token}
      />
    </div>
  )
}