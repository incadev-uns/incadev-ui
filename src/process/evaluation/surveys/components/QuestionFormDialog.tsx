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
import type { Question, QuestionFormData } from "@/process/evaluation/surveys/types/question"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  question?: Question | null
  nextOrder: number
  onSubmit: (data: QuestionFormData) => Promise<boolean>
}

export function QuestionFormDialog({ 
  open, 
  onOpenChange, 
  question, 
  nextOrder,
  onSubmit 
}: Props) {
  const [form, setForm] = useState<QuestionFormData>({ question: "", order: 1 })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (question) {
      setForm({ question: question.question, order: question.order })
    } else {
      setForm({ question: "", order: nextOrder })
    }
  }, [question, nextOrder, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question.trim()) return
    
    setSubmitting(true)
    const ok = await onSubmit(form)
    setSubmitting(false)
    if (ok) onOpenChange(false)
  }

  const isEdit = !!question

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
            <DialogDescription>
              {isEdit 
                ? "Modifica el texto de la pregunta" 
                : "Escribe la pregunta que deseas agregar a la encuesta"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Pregunta</Label>
              <Textarea
                id="question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Ej: ¿Cómo calificaría el servicio recibido?"
                rows={3}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground">
                Define el orden en que aparecerá esta pregunta
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !form.question.trim()}>
              {submitting ? "Guardando..." : isEdit ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}