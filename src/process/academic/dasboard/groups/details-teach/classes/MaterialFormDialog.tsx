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
import { Loader2, FileText, Video, Link as LinkIcon, Image as ImageIcon, FileSpreadsheet, Presentation, Music, File } from "lucide-react"
import { config } from "@/config/academic-config"
import CloudinaryUploader from "@/services/academico/CloudinaryUploader"
import DriveUploader from "@/services/academico/DriveUploader"

interface Material {
  id: number
  class_id: number
  type: string
  material_url: string
  created_at: string
  updated_at: string
}

interface MaterialFormDialogProps {
  open: boolean
  onClose: (success?: boolean) => void
  classId: number
  editingMaterial: Material | null
  token: string
}

// Actualizar los tipos para que coincidan con el backend
const MATERIAL_TYPES = [
  { value: "document", label: "Documento", icon: FileText, description: "Documentos PDF, Word, etc.", useDriver: true },
  { value: "video", label: "Video", icon: Video, description: "Videos multimedia", useCloudinary: true },
  { value: "audio", label: "Audio", icon: Music, description: "Archivos de audio", useCloudinary: true },
  { value: "image", label: "Imagen", icon: ImageIcon, description: "Imágenes", useCloudinary: true },
  { value: "scorm", label: "SCORM", icon: Presentation, description: "Paquetes SCORM", useDriver: true },
  { value: "link", label: "Enlace", icon: LinkIcon, description: "URL externa", isLink: true },
  { value: "other", label: "Otro", icon: File, description: "Otros tipos de archivos", useDriver: true },
]

export function MaterialFormDialog({
  open,
  onClose,
  classId,
  editingMaterial,
  token
}: MaterialFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "video",
    material_url: ""
  })

  useEffect(() => {
    if (editingMaterial) {
      setFormData({
        type: editingMaterial.type,
        material_url: editingMaterial.material_url
      })
    } else {
      setFormData({
        type: "video",
        material_url: ""
      })
    }
  }, [editingMaterial, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.material_url) {
      alert('Por favor, completa todos los campos')
      return
    }

    // Validar que sea una URL válida si es tipo link
    if (formData.type === "link") {
      try {
        new URL(formData.material_url)
      } catch {
        alert('Por favor, ingresa una URL válida')
        return
      }
    }

    try {
      setLoading(true)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      
      const body = {
        type: formData.type,
        material_url: formData.material_url
      }

      console.log("Enviando datos:", body) // Para debug

      let endpoint: string
      let method: string

      if (editingMaterial) {
        // Actualizar
        endpoint = config.endpoints.materials.update.replace(':material', editingMaterial.id.toString())
        method = 'PUT'
      } else {
        // Crear
        endpoint = config.endpoints.materials.create.replace(':class', classId.toString())
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
        // Obtener más detalles del error de validación
        const errorData = await response.json().catch(() => null)
        console.error("Error response:", errorData) // Para debug
        throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Material guardado exitosamente:", result)
      onClose(true)
    } catch (error) {
      console.error("Error guardando material:", error)
      alert(error instanceof Error ? error.message : 'Error al guardar el material')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value, material_url: "" }))
  }

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, material_url: url }))
  }

  const currentType = MATERIAL_TYPES.find(t => t.value === formData.type)

  const getHelperText = () => {
    if (formData.type === "link") {
      return "Introduce una URL válida de una página o recurso en línea."
    } else if (["video", "audio", "image"].includes(formData.type)) {
      return `Los ${formData.type === 'audio' ? 'audios' : formData.type + 's'} se almacenan en Cloudinary.`
    } else {
      return "Los documentos se suben automáticamente a tu Google Drive."
    }
  }

  // Determinar qué uploader usar según el tipo
  const getUploaderComponent = () => {
    if (formData.type === "link") {
      return (
        <Input
          id="material_url"
          type="url"
          placeholder="https://ejemplo.com/recurso"
          value={formData.material_url}
          onChange={(e) => handleUrlChange(e.target.value)}
          required
        />
      )
    } else if (["video", "audio", "image"].includes(formData.type)) {
      return (
        <CloudinaryUploader
          onUpload={handleUrlChange}
          label={`Subir ${formData.type === 'audio' ? 'audio' : formData.type}`}
          acceptType={
            formData.type === "image" ? "image" : 
            formData.type === "video" ? "video" : 
            "both"
          }
        />
      )
    } else {
      // document, scorm, other
      return (
        <DriveUploader
          onUpload={handleUrlChange}
          label={`Subir ${currentType?.label.toLowerCase() || 'archivo'}`}
        />
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {editingMaterial ? 'Editar material' : 'Nuevo material'}
          </DialogTitle>
          <DialogDescription>
            {editingMaterial 
              ? 'Modifica el tipo y archivo del material' 
              : 'Agrega un recurso educativo para esta clase'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">
                Tipo de material <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={handleSelectChange}
                required
                disabled={!!editingMaterial}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {editingMaterial && (
                <p className="text-xs text-muted-foreground">
                  No se puede cambiar el tipo al editar. Elimina y crea uno nuevo si necesitas cambiar el tipo.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="material_url">
                {formData.type === "link" ? "Enlace del material" : "Archivo del material"} <span className="text-destructive">*</span>
              </Label>

              {getUploaderComponent()}

              <p className="text-xs text-muted-foreground">
                {getHelperText()}
              </p>
            </div>

            {formData.material_url && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Archivo cargado:</p>
                    <a
                      href={formData.material_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {currentType && <currentType.icon className="w-3 h-3 shrink-0" />}
                      <span className="truncate">
                        {formData.material_url.split('/').pop() || 'Archivo'}
                      </span>
                    </a>
                  </div>
                  {!editingMaterial && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUrlChange("")}
                      className="shrink-0"
                    >
                      Cambiar
                    </Button>
                  )}
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={loading || !formData.material_url}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                editingMaterial ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}