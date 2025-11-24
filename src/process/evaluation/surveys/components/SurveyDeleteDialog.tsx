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
import type { Survey } from "@/process/evaluation/surveys/types/survey"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey: Survey | null
  onConfirm: (id: number) => Promise<boolean>
}

export function SurveyDeleteDialog({ open, onOpenChange, survey, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!survey) return
    setDeleting(true)
    const ok = await onConfirm(survey.id)
    setDeleting(false)
    if (ok) onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar encuesta?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar la encuesta "{survey?.title}". 
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