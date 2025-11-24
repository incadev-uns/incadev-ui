// components/AuditDeleteDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { Audit } from "../types/audit"

interface AuditDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  audit?: Audit | null
  onConfirm?: () => void
}

export function AuditDeleteDialog({
  open,
  onOpenChange,
  audit,
  onConfirm
}: AuditDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Auditoría
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar la auditoría #{audit?.id}?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}