import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Send, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { CreateTicketData, TicketType, TicketPriority } from "@/types/support"

// Validation schema
const ticketSchema = z.object({
  title: z.string()
    .min(1, "El título es requerido")
    .max(255, "El título no puede exceder 255 caracteres"),
  type: z.enum(["technical", "academic", "administrative", "inquiry"] as const).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"] as const, {
    required_error: "La prioridad es requerida"
  }),
  content: z.string()
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .max(5000, "El contenido no puede exceder 5000 caracteres"),
})

type TicketFormData = z.infer<typeof ticketSchema>

export default function CreateTicketPage() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: "medium",
    },
  })

  const selectedType = watch("type")
  const selectedPriority = watch("priority")

  const onSubmit = async (data: TicketFormData) => {
    setSubmitting(true)
    setError("")

    try {
      const ticketData: CreateTicketData = {
        title: data.title,
        type: data.type,
        priority: data.priority,
        content: data.content,
      }

      const response = await technologyApi.support.tickets.create(ticketData)

      if (response.status === "success") {
        toast.success("Ticket creado exitosamente")
        const ticketId = response.data?.ticket?.id
        if (ticketId) {
          window.location.href = `/tecnologico/support/tickets/detail?id=${ticketId}`
        } else {
          window.location.href = "/tecnologico/support/tickets"
        }
      } else {
        setError(response.message || "Error al crear el ticket")
        toast.error("Error al crear el ticket")
      }
    } catch (err: any) {
      console.error("Error creating ticket:", err)
      setError(err.message || "Error al crear el ticket. Por favor, intenta de nuevo.")
      toast.error("Error al crear el ticket")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    window.location.href = "/tecnologico/support/tickets"
  }

  if (authLoading) {
    return (
      <TechnologyLayout title="Crear Ticket">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Crear Ticket">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Ticket</h1>
            <p className="text-sm text-gray-600 mt-1">
              Describe tu problema o solicitud de soporte
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Ticket</CardTitle>
            <CardDescription>
              Proporciona toda la información necesaria para que podamos ayudarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Breve descripción del problema"
                  disabled={submitting}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Ticket</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => setValue("type", value as TicketType)}
                    disabled={submitting}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Seleccionar tipo (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="academic">Académico</SelectItem>
                      <SelectItem value="administrative">Administrativo</SelectItem>
                      <SelectItem value="inquiry">Consulta</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">
                    Prioridad <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedPriority}
                    onValueChange={(value) => setValue("priority", value as TicketPriority)}
                    disabled={submitting}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-red-500">{errors.priority.message}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Describe detalladamente tu problema o solicitud. Incluye pasos para reproducir el problema, mensajes de error, o cualquier información relevante."
                  rows={8}
                  disabled={submitting}
                  className={errors.content ? "border-red-500" : ""}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Mínimo 10 caracteres, máximo 5000 caracteres
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Consejos para un mejor soporte:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Sé específico y detallado en tu descripción</li>
                  <li>Incluye pasos para reproducir el problema</li>
                  <li>Menciona mensajes de error exactos si los hay</li>
                  <li>Indica qué has intentado hacer para resolver el problema</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Crear Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </TechnologyLayout>
  )
}
