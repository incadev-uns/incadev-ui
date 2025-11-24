// app/auditoria/components/FindingFormDialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { AuditFinding } from "../types/audit"
import { config } from "@/config/evaluation-config"

interface FindingFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    auditId: number | undefined
    finding: AuditFinding | null
    onSuccess: () => void
}

export function FindingFormDialog({
    open,
    onOpenChange,
    auditId,
    finding,
    onSuccess
}: FindingFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        description: '',
        severity: 'medium' as 'low' | 'medium' | 'high' | 'critical'
    })

    useEffect(() => {
        if (finding) {
            setFormData({
                description: finding.description,
                severity: finding.severity
            })
        } else {
            setFormData({
                description: '',
                severity: 'medium'
            })
        }
    }, [finding, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!auditId) return

        setLoading(true)
        try {
            const url = `${config.apiUrl}/api/audits/${auditId}/findings`
            const token = localStorage.getItem("token")?.replace(/"/g, "")

            if (!token) {
                alert('No estás autenticado. Por favor, inicia sesión.')
                return
            }

            // ✅ ENVIAR DIRECTAMENTE los valores en inglés (sin mapeo)
            const backendData = {
                description: formData.description,
                severity: formData.severity // ← 'low', 'medium', 'high', 'critical'
            }

            console.log('📤 Enviando datos:', backendData)

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(backendData)
            })

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Hallazgo creado:', data)
                onSuccess()
                onOpenChange(false)
            } else {
                const errorText = await response.text()
                console.error('❌ Error del servidor:', errorText)
                alert('Error al crear el hallazgo: ' + errorText)
            }
        } catch (error) {
            console.error('💥 Error de conexión:', error)
            alert('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {finding ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}
                    </DialogTitle>
                    <DialogDescription>
                        {finding
                            ? 'Modifica los detalles del hallazgo.'
                            : 'Describe el hallazgo identificado durante la auditoría.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="severity">Severidad</Label>
                            <Select
                                value={formData.severity}
                                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => // ← Corregir tipos
                                    handleChange('severity', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="critical">Crítica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Describe detalladamente el hallazgo encontrado..."
                                required
                                rows={5}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : (finding ? 'Actualizar' : 'Crear')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}