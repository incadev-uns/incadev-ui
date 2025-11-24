import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  FileText, 
  Video, 
  Link as LinkIcon,
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  X
} from "lucide-react"
import { config } from "@/config/academic-config"
import { MaterialFormDialog } from "./MaterialFormDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Material {
  id: number
  class_id: number
  type: string
  material_url: string
  created_at: string
  updated_at: string
}

interface MaterialsManagementProps {
  classId: number
  className: string
  token: string
}

export function MaterialsManagement({ classId, className, token }: MaterialsManagementProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (dialogOpen) {
      loadMaterials()
    }
  }, [dialogOpen, classId, token])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.materials.listAll.replace(':class', classId.toString())
      
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
      console.log("Materiales cargados:", data)
      
      // Manejar diferentes estructuras de respuesta
      let materialsData: Material[] = []
      if (Array.isArray(data)) {
        materialsData = data
      } else if (data.data && Array.isArray(data.data)) {
        materialsData = data.data
      } else if (data.materials && Array.isArray(data.materials)) {
        materialsData = data.materials
      }
      
      setMaterials(materialsData)
    } catch (error) {
      console.error("Error cargando materiales:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (materialId: number) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) {
      return
    }

    try {
      setDeletingId(materialId)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const endpoint = config.endpoints.materials.delete.replace(':material', materialId.toString())
      
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
        throw new Error(`Error al eliminar el material`)
      }

      console.log("Material eliminado exitosamente")
      loadMaterials()
    } catch (error) {
      console.error("Error eliminando material:", error)
      alert('Error al eliminar el material. Por favor, inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setFormDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingMaterial(null)
    setFormDialogOpen(true)
  }

  const handleFormDialogClose = (success?: boolean) => {
    setFormDialogOpen(false)
    setEditingMaterial(null)
    if (success) {
      loadMaterials()
    }
  }

  const getMaterialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return <Video className="w-4 h-4 text-red-500" />
      case "document":
      case "pdf":
        return <FileText className="w-4 h-4 text-blue-500" />
      case "link":
      case "url":
        return <LinkIcon className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getMaterialTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      video: "bg-red-100 text-red-800 border-red-200",
      document: "bg-blue-100 text-blue-800 border-blue-200",
      pdf: "bg-blue-100 text-blue-800 border-blue-200",
      link: "bg-green-100 text-green-800 border-green-200",
      url: "bg-green-100 text-green-800 border-green-200"
    }

    return (
      <Badge variant="outline" className={colors[type.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    )
  }

  const getUrlDisplay = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url.length > 30 ? url.substring(0, 30) + "..." : url
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Materiales ({materials.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Materiales de la clase</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{className}</p>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && materials.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay materiales en esta clase</p>
                <p className="text-sm mt-1">Haz clic en "Agregar" para crear uno</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && materials.length > 0 && (
            <div className="space-y-3">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getMaterialIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getMaterialTypeBadge(material.type)}
                          </div>
                          <a
                            href={material.material_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                          >
                            <span>{getUrlDisplay(material.material_url)}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <p className="text-xs text-muted-foreground mt-1">
                            Agregado: {new Date(material.created_at).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(material)}
                          disabled={deletingId === material.id}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                          disabled={deletingId === material.id}
                        >
                          {deletingId === material.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <MaterialFormDialog
          open={formDialogOpen}
          onClose={handleFormDialogClose}
          classId={classId}
          editingMaterial={editingMaterial}
          token={token}
        />
      </DialogContent>
    </Dialog>
  )
}