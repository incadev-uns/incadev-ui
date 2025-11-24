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
import type { News, NewsCategory } from "@/types/developer-web"
import { Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface NewsFormProps {
  news: News | null
  categories: NewsCategory[]
  onSuccess: () => void
  onCancel: () => void
}

export function NewsForm({ news, categories, onSuccess, onCancel }: NewsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    image_url: "",
    status: "draft" as "draft" | "published" | "archived" | "scheduled",
    category: categories.length > 0 ? categories[0].key : "",
    item_type: "article" as "article" | "press-release" | "update" | "feature",
    seo_title: "",
    seo_description: "",
    tags: [] as string[],
    published_date: "",
  })

  // Función para formatear fecha a YYYY-MM-DDTHH:mm (formato datetime-local)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      // Asegurarnos de que la fecha sea válida
      if (isNaN(date.getTime())) return ""
      return date.toISOString().slice(0, 16)
    } catch (error) {
      console.error('Error formateando fecha:', error)
      return ""
    }
  }

  // Función para formatear fecha a YYYY-MM-DD HH:mm:ss (formato backend)
  const formatDateForBackend = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().slice(0, 19).replace('T', ' ')
    } catch (error) {
      console.error('Error formateando fecha para backend:', error)
      return ""
    }
  }

  // Actualizar category cuando categories cambie
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].key }))
    }
  }, [categories, formData.category])

  useEffect(() => {
    if (news) {
      console.log('🔍 DEBUG NewsForm - Datos de la noticia:', news)
      console.log('🔍 DEBUG NewsForm - published_date original:', news.published_date)
      console.log('🔍 DEBUG NewsForm - published_date formateado:', news.published_date ? formatDateForInput(news.published_date) : "")
  
      setFormData({
        title: news.title || "",
        content: news.content || "",
        summary: news.summary || "",
        image_url: news.image_url || "",
        status: news.status || "draft",
        category: news.category || (categories.length > 0 ? categories[0].key : ""),
        item_type: news.item_type || "article",
        seo_title: news.seo_title || "",
        seo_description: news.seo_description || "",
        tags: news.tags || [],
        // CAMBIO AQUÍ: usar published_date en lugar de published_at
        published_date: news.published_date ? formatDateForInput(news.published_date) : "",
      })
      setFormLoading(false)
    } else {
      setFormLoading(false)
    }
  }, [news, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!formData.title.trim()) {
      toast.error("El título es requerido")
      return
    }
    if (!formData.summary.trim()) {
      toast.error("El resumen es requerido")
      return
    }
    if (!formData.content.trim()) {
      toast.error("El contenido es requerido")
      return
    }
    if (!formData.category) {
      toast.error("La categoría es requerida")
      return
    }

    // Validar fecha si está programado
    if (formData.status === "scheduled" && !formData.published_date) {
      toast.error("La fecha de publicación es requerida para noticias programadas")
      return
    }

    setLoading(true)

    try {
      console.log('Enviando datos:', formData)
      
      // Preparar datos para enviar
      const dataToSend: any = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        status: formData.status,
        category: formData.category,
        item_type: formData.item_type,
        // Campos opcionales - solo enviar si tienen valor
        ...(formData.image_url && { image_url: formData.image_url }),
        ...(formData.seo_title && { seo_title: formData.seo_title }),
        ...(formData.seo_description && { seo_description: formData.seo_description }),
        ...(formData.tags.length > 0 && { tags: formData.tags }),
      }

      // Agregar fecha de publicación si está programado o tiene fecha
      if (formData.status === "scheduled" && formData.published_date) {
        dataToSend.published_date = formatDateForBackend(formData.published_date)
      } else if (formData.status === "published" && !formData.published_date) {
        // Si se publica sin fecha, usar fecha actual
        dataToSend.published_date = formatDateForBackend(new Date().toISOString())
      } else if (formData.published_date) {
        // Si hay fecha pero no está programado, enviarla igual
        dataToSend.published_date = formatDateForBackend(formData.published_date)
      }

      console.log('Datos a enviar:', dataToSend)

      let response
      if (news) {
        response = await technologyApi.developerWeb.news.update(news.id, dataToSend)
        console.log('Respuesta actualización:', response)
        if (response.success) {
          toast.success("Noticia actualizada correctamente")
          onSuccess()
        } else {
          toast.error(response.message || "Error al actualizar noticia")
        }
      } else {
        response = await technologyApi.developerWeb.news.create(dataToSend)
        console.log('Respuesta creación:', response)
        if (response.success) {
          toast.success("Noticia creada correctamente")
          onSuccess()
        } else {
          toast.error(response.message || "Error al crear noticia")
        }
      }
    } catch (error: any) {
      console.error("Error al guardar noticia:", error)
      toast.error(error.message || "Error al guardar noticia")
    } finally {
      setLoading(false)
    }
  }

  console.log('🔍 DEBUG NewsForm - Categorías disponibles:', categories)
  console.log('🔍 DEBUG NewsForm - Datos del formulario:', formData)

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
            placeholder="Ingresa el título de la noticia"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">
            Resumen <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Breve resumen de la noticia"
            rows={3}
            required
          />
          <p className="text-xs text-muted-foreground">
            Resumen corto que aparecerá en las vistas previas (mínimo 10 caracteres)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">
            Contenido <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Escribe el contenido completo de la noticia"
            rows={10}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={categories.length > 0 ? "Selecciona una categoría" : "Cargando categorías..."} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.key}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Cargando categorías...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-yellow-600">
                No hay categorías disponibles. Contacta al administrador.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_type">
              Tipo de Noticia <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.item_type}
              onValueChange={(value: any) => setFormData({ ...formData, item_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Artículo</SelectItem>
                <SelectItem value="update">Actualización</SelectItem>
                <SelectItem value="feature">Característica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Imagen destacada</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <p className="text-xs text-muted-foreground">
            URL de la imagen principal de la noticia
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campo de fecha - siempre visible pero con lógica condicional */}
          <div className="space-y-2">
            <Label htmlFor="published_date">
              Fecha de publicación
              {formData.status === "scheduled" && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="published_date"
                type="datetime-local"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                className="pl-10"
                min={new Date().toISOString().slice(0, 16)} // No permitir fechas pasadas
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.status === "scheduled" 
                ? "Fecha y hora en que se publicará automáticamente"
                : "Opcional: fecha de publicación específica"
              }
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Configuración SEO</Label>
            <p className="text-sm text-muted-foreground">
              Optimiza la noticia para motores de búsqueda
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seo_title">Meta título</Label>
            <Input
              id="seo_title"
              value={formData.seo_title}
              onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              placeholder="Título optimizado para SEO"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo_description">Meta descripción</Label>
            <Textarea
              id="seo_description"
              value={formData.seo_description}
              onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              placeholder="Descripción optimizada para SEO"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !formData.category || (formData.status === "scheduled" && !formData.published_date)}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            news ? "Actualizar Noticia" : "Crear Noticia"
          )}
        </Button>
      </div>
    </form>
  )
}