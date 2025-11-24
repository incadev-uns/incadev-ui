import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { technologyApi } from "@/services/tecnologico/api"
import type { FAQ, FAQCategory } from "@/types/developer-web"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FAQFormProps {
  faq: FAQ | null
  categories: FAQCategory[]
  onSuccess: () => void
  onCancel: () => void
}

export function FAQForm({ faq, categories, onSuccess, onCancel }: FAQFormProps) {
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(true)
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general" as "general" | "academico" | "tecnico" | "pagos" | "soporte",
    active: true,
  })

  useEffect(() => {
    console.log('🔍 DEBUG FAQForm - FAQ recibida:', faq)
    
    if (faq) {
      setFormData({
        question: faq.question || "",
        answer: faq.answer || "",
        category: faq.category || "general",
        active: faq.active !== undefined ? faq.active : true,
      })
      setKeywords(faq.keywords || [])
      console.log('🔍 DEBUG FAQForm - Datos cargados:', {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        active: faq.active,
        keywords: faq.keywords
      })
    } else {
      // Resetear formulario para creación
      setFormData({
        question: "",
        answer: "",
        category: "general",
        active: true,
      })
      setKeywords([])
    }
    
    setFormLoading(false)
  }, [faq])

  const addKeyword = () => {
    if (newKeyword.trim() && keywords.length < 10) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.question.trim()) {
      toast.error("La pregunta es requerida")
      return
    }
    if (!formData.answer.trim()) {
      toast.error("La respuesta es requerida")
      return
    }

    setLoading(true)

    try {
      const dataToSend: any = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        active: formData.active,
        ...(keywords.length > 0 && { keywords }),
      }

      console.log('🔍 DEBUG FAQForm - Datos a enviar:', dataToSend)

      let response
      if (faq) {
        response = await technologyApi.developerWeb.faqs.update(faq.id, dataToSend)
        if (response.success) {
          toast.success("FAQ actualizada correctamente")
          onSuccess()
        } else {
          toast.error(response.message || "Error al actualizar FAQ")
        }
      } else {
        response = await technologyApi.developerWeb.faqs.create(dataToSend)
        if (response.success) {
          toast.success("FAQ creada correctamente")
          onSuccess()
        } else {
          toast.error(response.message || "Error al crear FAQ")
        }
      }
    } catch (error: any) {
      console.error("Error al guardar FAQ:", error)
      toast.error(error.message || "Error al guardar FAQ")
    } finally {
      setLoading(false)
    }
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
          <Label htmlFor="question">
            Pregunta <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="¿Cuál es el horario de atención?"
            rows={3}
            maxLength={1000}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.question.length}/1000 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer">
            Respuesta <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="answer"
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            rows={5}
            placeholder="Nuestro horario es de lunes a viernes..."
            maxLength={5000}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.answer.length}/5000 caracteres
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="category">
            Categoría <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="keywords">Palabras Clave</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Agregar palabra clave..."
                maxLength={50}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addKeyword}
                disabled={!newKeyword.trim() || keywords.length >= 10}
              >
                Agregar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Máximo 10 palabras clave, 50 caracteres cada una
            </p>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-2 rounded-lg border p-4">
          <Checkbox
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, active: checked as boolean })
            }
          />
          <div className="space-y-0.5">
            <label
              htmlFor="active"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              FAQ Activa
            </label>
            <p className="text-sm text-muted-foreground">
              Las FAQs inactivas no serán utilizadas por el chatbot
            </p>
          </div>
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
            faq ? "Actualizar FAQ" : "Crear FAQ"
          )}
        </Button>
      </div>
    </form>
  )
}