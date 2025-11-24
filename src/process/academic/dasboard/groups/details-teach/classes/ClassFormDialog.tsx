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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { config } from "@/config/academic-config"

// Actualizar la interfaz para que coincida con ClassesManagement.tsx
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

interface ClassFormDialogProps {
  open: boolean
  onClose: (success?: boolean) => void
  groupId: string
  modules: Module[]
  editingClass: ClassData | null
  token: string
}

export function ClassFormDialog({
  open,
  onClose,
  groupId,
  modules,
  editingClass,
  token
}: ClassFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    module_id: "",
    start_time: "",
    end_time: "",
    meet_url: ""
  })

  useEffect(() => {
    if (editingClass) {
      // Convertir datetime a formato input datetime-local
      const formatDateTimeLocal = (datetime: string) => {
        const date = new Date(datetime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        title: editingClass.title,
        module_id: editingClass.module.id.toString(), // Cambiar aquí
        start_time: formatDateTimeLocal(editingClass.start_time),
        end_time: formatDateTimeLocal(editingClass.end_time),
        meet_url: editingClass.meet_url || ""
      })
    } else {
      setFormData({
        title: "",
        module_id: modules.length > 0 ? modules[0].id.toString() : "",
        start_time: "",
        end_time: "",
        meet_url: ""
      })
    }
  }, [editingClass, modules, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.module_id || !formData.start_time || !formData.end_time) {
      alert('Por favor, completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      
      const formatToMySQL = (datetime: string) => {
        const date = new Date(datetime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      const body = {
        title: formData.title,
        start_time: formatToMySQL(formData.start_time),
        end_time: formatToMySQL(formData.end_time),
        meet_url: formData.meet_url || null
      }

      let endpoint: string
      let method: string

      if (editingClass) {
        endpoint = config.endpoints.classes.update.replace(':class', editingClass.id.toString())
        method = 'PUT'
      } else {
        endpoint = config.endpoints.classes.create
          .replace(':group', groupId)
          .replace(':module', formData.module_id)
        method = 'POST'
      }

      const response = await fetch(
        `${config.apiUrl}${endpoint}`,
        {
          method,
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

      console.log("Clase guardada exitosamente")
      onClose(true)
    } catch (error) {
      console.error("Error guardando clase:", error)
      alert(error instanceof Error ? error.message : 'Error al guardar la clase')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingClass ? 'Editar clase' : 'Nueva clase'}
          </DialogTitle>
          <DialogDescription>
            {editingClass 
              ? 'Modifica los datos de la clase' 
              : 'Completa los datos para crear una nueva clase'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej: Introducción a Machine Learning"
                required
              />
            </div>

            {!editingClass && (
              <div className="grid gap-2">
                <Label htmlFor="module">
                  Módulo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.module_id}
                  onValueChange={(value) => handleChange('module_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id.toString()}>
                        Módulo {module.sort}: {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="start_time">
                Fecha y hora de inicio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end_time">
                Fecha y hora de fin <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meet_url">
                Enlace de reunión (opcional)
              </Label>
              <Input
                id="meet_url"
                type="url"
                value={formData.meet_url}
                onChange={(e) => handleChange('meet_url', e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                editingClass ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}