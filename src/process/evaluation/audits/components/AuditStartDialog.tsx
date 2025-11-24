// app/auditoria/components/AuditStartDialog.tsx
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { Audit } from "../types/audit"
import { useState } from "react"

interface AuditStartDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    audit: Audit | null
    onConfirm: (id: number) => Promise<boolean>
}

export function AuditStartDialog({
    open,
    onOpenChange,
    audit,
    onConfirm
}: AuditStartDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        if (!audit) return

        setLoading(true)
        const success = await onConfirm(audit.id)
        if (success) {
            onOpenChange(false)
        }
        setLoading(false)
    }

    if (!audit) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Iniciar Auditoría</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas iniciar esta auditoría?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Una vez iniciada, la auditoría cambiará a estado "En Progreso"
                            y podrás comenzar a registrar hallazgos.
                        </AlertDescription>
                    </Alert>

                    <div className="rounded-lg border p-3">
                        <h4 className="font-medium mb-2">Detalles de la auditoría:</h4>
                        <p className="text-sm text-muted-foreground">
                            <strong>Fecha:</strong> {new Date(audit.audit_date).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>Resumen:</strong> {audit.summary}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>Auditable:</strong> {audit.auditable_type} (ID: {audit.auditable_id})
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Auditoría'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}