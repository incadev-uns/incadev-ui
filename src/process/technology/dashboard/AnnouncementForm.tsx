import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { technologyApi } from "@/services/tecnologico/api"
import type { Announcement, AnnouncementItemType, AnnouncementStatus } from "@/types/developer-web"
import { Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface AnnouncementFormProps {
  announcement: Announcement | null
  onSuccess: () => void
  onCancel: () => void
}

export function AnnouncementForm({ announcement, onSuccess, onCancel }: AnnouncementFormProps) {
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    item_type: "banner" as AnnouncementItemType,
    status: "active" as AnnouncementStatus,
    start_date: "",
    end_date: "",
    target_page: "",
    link_url: "",
    button_text: "",
    priority: 5,
  })

  // Obtener fecha y hora actual en formato YYYY-MM-DDTHH:mm
  const getCurrentDateTime = () => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  }

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    return getCurrentDateTime()
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  const formatDateForBackend = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().slice(0, 19).replace('T', ' ')
  }

  // Función para validar que la fecha no sea anterior a hoy
  const validateDate = (dateString: string, fieldName: string): boolean => {
    if (!dateString) return true
    
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Establecer a inicio del día
    
    if (selectedDate < today) {
      toast.error(`La ${fieldName} no puede ser anterior a hoy`)
      return false
    }
    return true
  }

  useEffect(() => {
    if (announcement) {
      console.log('🔍 DEBUG AnnouncementForm - Datos del anuncio:', announcement)
      console.log('🔍 DEBUG AnnouncementForm - Target page original:', announcement.target_page)
      console.log('🔍 DEBUG AnnouncementForm - Estado original:', announcement.status)
      console.log('🔍 DEBUG AnnouncementForm - Tipo original:', announcement.item_type)

      // Simular un pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        setFormData({
          title: announcement.title || "",
          content: announcement.content || "",
          image_url: announcement.image_url || "",
          item_type: announcement.item_type || "banner",
          status: announcement.status || "active",
          start_date: announcement.start_date ? formatDateForInput(announcement.start_date) : "",
          end_date: announcement.end_date ? formatDateForInput(announcement.end_date) : "",
          target_page: announcement.target_page || "",
          link_url: announcement.link_url || "",
          button_text: announcement.button_text || "",
          priority: announcement.priority || 5,
        })
        setFormLoading(false)
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      // En creación, establecer fecha mínima como hoy
      const today = getCurrentDateTime()
      setFormData(prev => ({
        ...prev,
        start_date: today,
        end_date: today
      }))
      setFormLoading(false)
    }
  }, [announcement])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error("El título es requerido")
      return
    }
    if (!formData.content.trim()) {
      toast.error("El contenido es requerido")
      return
    }
    if (!formData.start_date) {
      toast.error("La fecha de inicio es requerida")
      return
    }
    if (!formData.end_date) {
      toast.error("La fecha de fin es requerida")
      return
    }

    // Validar que las fechas no sean anteriores a hoy
    if (!validateDate(formData.start_date, "fecha de inicio")) return
    if (!validateDate(formData.end_date, "fecha de fin")) return

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio")
      return
    }

    setLoading(true)

    try {
      const dataToSend: any = {
        title: formData.title,
        content: formData.content,
        item_type: formData.item_type,
        status: formData.status,
        start_date: formatDateForBackend(formData.start_date),
        end_date: formatDateForBackend(formData.end_date),
        priority: formData.priority,
        ...(formData.image_url && { image_url: formData.image_url }),
        ...(formData.target_page && { target_page: formData.target_page }),
        ...(formData.link_url && { link_url: formData.link_url }),
        ...(formData.button_text && { button_text: formData.button_text }),
      }

      let response
      if (announcement) {
        response = await technologyApi.developerWeb.announcements.update(announcement.id, dataToSend)
        if (response.success) {
          toast.success("Anuncio actualizado correctamente")
          onSuccess()
        } else {
          toast.error(response.message || "Error al actualizar anuncio")
        }
      } else {
        response = await technologyApi.developerWeb.announcements.create(dataToSend)
        if (response.success) {
          toast.success("Anuncio creado correctamente")
          onSuccess()
        } else {
          toast.error(response.message || "Error al crear anuncio")
        }
      }
    } catch (error: any) {
      console.error("Error al guardar anuncio:", error)
      toast.error(error.message || "Error al guardar anuncio")
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar cambio de fecha con validación
  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    if (value && !validateDate(value, field === 'start_date' ? 'fecha de inicio' : 'fecha de fin')) {
      return // No actualizar si la fecha no es válida
    }
    setFormData({ ...formData, [field]: value })
  }

  // Mostrar loading mientras se cargan los datos del formulario
  if (formLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Título <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ingresa el título del anuncio"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">
            Contenido <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Escribe el contenido del anuncio"
            rows={6}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item_type">
              Tipo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.item_type}
              onValueChange={(value: AnnouncementItemType) => setFormData({ ...formData, item_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popup">Popup</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="modal">Modal</SelectItem>
                <SelectItem value="notification">Notificación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: AnnouncementStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">
              Fecha de Inicio <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className="pl-10"
                min={getMinDate()} // ← Agregar atributo min
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              No se permiten fechas anteriores a hoy
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">
              Fecha de Fin <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                className="pl-10"
                min={formData.start_date || getMinDate()} // ← Mínimo debe ser start_date o hoy
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Debe ser posterior a la fecha de inicio
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">
            Prioridad <span className="text-red-500">*</span>
          </Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="10"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Mayor prioridad (1-10) aparece primero. Recomendado: 5
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="image_url">Imagen</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target_page">Página destino</Label>
            <Select
              value={formData.target_page}
              onValueChange={(value) => setFormData({ ...formData, target_page: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Inicio</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="contact">Contacto</SelectItem>
                <SelectItem value="about">Acerca de</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="button_text">Texto del botón</Label>
            <Input
              id="button_text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              placeholder="Ver más"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="link_url">URL del enlace</Label>
          <Input
            id="link_url"
            type="url"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            placeholder="https://ejemplo.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            announcement ? "Actualizar Anuncio" : "Crear Anuncio"
          )}
        </Button>
      </div>
    </form>
  )
}