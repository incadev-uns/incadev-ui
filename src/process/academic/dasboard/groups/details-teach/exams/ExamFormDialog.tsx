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

interface ExamFormDialogProps {
  open: boolean
  onClose: (success?: boolean) => void
  groupId: string
  modules: Module[]
  editingExam: ExamData | null
  token: string
}

export function ExamFormDialog({
  open,
  onClose,
  groupId,
  modules,
  editingExam,
  token
}: ExamFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    module_id: "",
    start_time: "",
    end_time: "",
    exam_url: ""
  })

  useEffect(() => {
    if (editingExam) {
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
        title: editingExam.title,
        module_id: editingExam.module.id.toString(),
        start_time: formatDateTimeLocal(editingExam.start_time),
        end_time: formatDateTimeLocal(editingExam.end_time),
        exam_url: editingExam.exam_url || ""
      })
    } else {
      setFormData({
        title: "",
        module_id: modules.length > 0 ? modules[0].id.toString() : "",
        start_time: "",
        end_time: "",
        exam_url: ""
      })
    }
  }, [editingExam, modules, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.module_id || !formData.start_time || !formData.end_time) {
      alert('Por favor, completa todos los campos requeridos')
      return
    }

    // Validar URL si se proporciona
    if (formData.exam_url) {
      try {
        new URL(formData.exam_url)
      } catch {
        alert('Por favor, ingresa una URL válida para el examen')
        return
      }
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
        exam_url: formData.exam_url || null
      }

      let endpoint: string
      let method: string

      if (editingExam) {
        endpoint = config.endpoints.exams.update.replace(':exam', editingExam.id.toString())
        method = 'PUT'
      } else {
        endpoint = config.endpoints.exams.create
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

      console.log("Examen guardado exitosamente")
      onClose(true)
    } catch (error) {
      console.error("Error guardando examen:", error)
      alert(error instanceof Error ? error.message : 'Error al guardar el examen')
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
            {editingExam ? 'Editar examen' : 'Nuevo examen'}
          </DialogTitle>
          <DialogDescription>
            {editingExam 
              ? 'Modifica los datos del examen' 
              : 'Completa los datos para crear un nuevo examen'}
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
                placeholder="Ej: Examen Final - Unidad 1"
                required
              />
            </div>

            {!editingExam && (
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
              <Label htmlFor="exam_url">
                Enlace del examen (opcional)
              </Label>
              <Input
                id="exam_url"
                type="url"
                value={formData.exam_url}
                onChange={(e) => handleChange('exam_url', e.target.value)}
                placeholder="https://forms.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Enlace de Google Forms, Moodle, u otra plataforma de exámenes
              </p>
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
                editingExam ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}