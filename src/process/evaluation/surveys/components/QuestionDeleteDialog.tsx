import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Question } from "@/process/evaluation/surveys/types/question"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: Question | null
  onConfirm: (id: number) => Promise<boolean>
}

export function QuestionDeleteDialog({ open, onOpenChange, question, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!question) return
    setDeleting(true)
    const ok = await onConfirm(question.id)
    setDeleting(false)
    if (ok) onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar la pregunta: "{question?.question}". 
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}