import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import type { Survey, SurveyFormData, SurveyEvent } from "@/process/evaluation/surveys/types/survey"
import { SURVEY_EVENTS } from "@/process/evaluation/surveys/types/survey"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey?: Survey | null
  onSubmit: (data: SurveyFormData) => Promise<boolean>
}

const defaultForm: SurveyFormData = {
  title: "",
  description: "",
  event: "satisfaction",
  mapping_description: "",
}

export function SurveyFormDialog({ open, onOpenChange, survey, onSubmit }: Props) {
  const [form, setForm] = useState<SurveyFormData>(defaultForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (survey) {
      setForm({
        title: survey.title,
        description: survey.description,
        event: survey.mapping.event, // Cambiado aquí
        mapping_description: survey.mapping.description, // Cambiado aquí
      })
    } else {
      setForm(defaultForm)
    }
  }, [survey, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await onSubmit(form)
    setSubmitting(false)
    if (ok) onOpenChange(false)
  }

  const isEdit = !!survey

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Encuesta" : "Nueva Encuesta"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Modifica los datos de la encuesta" : "Completa los campos para crear una nueva encuesta"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Encuesta de satisfacción"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe el propósito de la encuesta..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event">Tipo de Evento</Label>
              <Select
                value={form.event}
                onValueChange={(v) => setForm({ ...form, event: v as SurveyEvent })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SURVEY_EVENTS.map((evt) => (
                    <SelectItem key={evt.value} value={evt.value}>
                      {evt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mapping_description">Descripción de Mapeo</Label>
              <Textarea
                id="mapping_description"
                value={form.mapping_description}
                onChange={(e) => setForm({ ...form, mapping_description: e.target.value })}
                placeholder="Describe cómo se mapean los datos..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}