// app/auditoria/components/StatusUpdateDialog.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "./StatusBadge"

interface StatusUpdateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentStatus: string
    type: 'audit' | 'finding' | 'action'
    itemId: number
    itemName?: string
    onStatusUpdate: (id: number, newStatus: string) => Promise<boolean>
}

export function StatusUpdateDialog({
    open,
    onOpenChange,
    currentStatus,
    type,
    itemId,
    itemName,
    onStatusUpdate
}: StatusUpdateDialogProps) {
    const [loading, setLoading] = useState(false)
    const [newStatus, setNewStatus] = useState(currentStatus)

    const statusOptions = {
        audit: [
            { value: 'pending', label: 'Pendiente' },
            { value: 'in_progress', label: 'En Progreso' },
            { value: 'completed', label: 'Completada' },
            { value: 'cancelled', label: 'Cancelada' }
        ],
        finding: [
            { value: 'open', label: 'Abierto' },
            { value: 'in_progress', label: 'En Progreso' },
            { value: 'resolved', label: 'Resuelto' },
            { value: 'wont_fix', label: 'No se Corregirá' }
        ],
        action: [
            { value: 'pending', label: 'Pendiente' },
            { value: 'in_progress', label: 'En Progreso' },
            { value: 'completed', label: 'Completada' },
            { value: 'cancelled', label: 'Cancelada' }
        ]
    }

    const handleSubmit = async () => {
        if (newStatus === currentStatus) {
            onOpenChange(false)
            return
        }

        setLoading(true)
        const success = await onStatusUpdate(itemId, newStatus)
        setLoading(false)

        if (success) {
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Actualizar Estado</DialogTitle>
                    <DialogDescription>
                        Cambia el estado de {type === 'audit' ? 'la auditoría' :
                            type === 'finding' ? 'el hallazgo' : 'la acción'}
                        {itemName && `: ${itemName}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                        <Label>Estado actual:</Label>
                        <StatusBadge status={currentStatus} type={type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="newStatus">Nuevo estado</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions[type].map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {newStatus !== currentStatus && (
                        <div className="flex items-center gap-4">
                            <Label>Nuevo estado:</Label>
                            <StatusBadge status={newStatus} type={type} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Estado'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}