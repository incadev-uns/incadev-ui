// components/AuditFormDialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { auditService } from "@/process/evaluation/audits/services/audit-service"

interface AuditFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    audit?: any
    onSuccess: () => void
}

export function AuditFormDialog({
    open,
    onOpenChange,
    audit,
    onSuccess
}: AuditFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 👇 CORREGIDO: Estructura simplificada según tu API
    const [formData, setFormData] = useState({
        audit_date: "",
        summary: "",
        auditable_type: "",
        auditable_id: ""
    })

    const [auditableTypes, setAuditableTypes] = useState<Record<string, string>>({})

    // Cargar tipos auditables
    useEffect(() => {
        if (open) {
            loadAuditableTypes()
        }
    }, [open])

    // Reset form cuando se abre/cierra
    useEffect(() => {
        if (open && audit) {
            // Modo edición
            setFormData({
                audit_date: audit.audit_date ? audit.audit_date.split('T')[0] : "",
                summary: audit.summary || "",
                auditable_type: audit.auditable_type || "",
                auditable_id: audit.auditable_id?.toString() || ""
            })
        } else if (open) {
            // Modo creación - valores por defecto
            const today = new Date().toISOString().split('T')[0]
            setFormData({
                audit_date: today,
                summary: "",
                auditable_type: "",
                auditable_id: ""
            })
        }
    }, [open, audit])

    const loadAuditableTypes = async () => {
        try {
            setLoading(true)
            const response = await auditService.getAuditableTypes()
            setAuditableTypes(response.data || {})
        } catch (error: any) {
            console.error("Error cargando tipos auditables:", error)
            setError("Error al cargar los tipos auditables")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 👇 CORREGIDO: Validaciones según campos requeridos
        if (!formData.audit_date || !formData.summary || !formData.auditable_type || !formData.auditable_id) {
            setError("Por favor complete todos los campos requeridos")
            return
        }

        // Validar que auditable_id sea un número válido
        const auditableId = parseInt(formData.auditable_id)
        if (isNaN(auditableId) || auditableId <= 0) {
            setError("El ID del elemento debe ser un número válido")
            return
        }

        try {
            setSaving(true)
            setError(null)

            // 👇 CORREGIDO: Estructura exacta que espera tu API
            const auditData = {
                audit_date: formData.audit_date,
                summary: formData.summary,
                auditable_type: formData.auditable_type,
                auditable_id: auditableId
            }

            console.log("📤 Enviando datos de auditoría:", auditData)

            if (audit) {
                // Editar auditoría existente
                await auditService.update(audit.id, auditData)
            } else {
                // Crear nueva auditoría
                await auditService.create(auditData)
            }

            onSuccess()
            onOpenChange(false)

        } catch (error: any) {
            console.error("❌ Error guardando auditoría:", error)
            setError(error?.message || "Error al guardar la auditoría")
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError(null)
    }

    // 👇 CORREGIDO: Función para generar resumen automático
    const generateSummary = () => {
        if (formData.auditable_type && !formData.summary) {
            const typeName = auditableTypes[formData.auditable_type] || formData.auditable_type
            const summary = `Auditoría del ${typeName}`
            setFormData(prev => ({ ...prev, summary }))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {audit ? 'Editar Auditoría' : 'Nueva Auditoría'}
                    </DialogTitle>
                    <DialogDescription>
                        Complete la información para {audit ? 'editar' : 'crear'} la auditoría
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Fecha de Auditoría */}
                    <div className="space-y-2">
                        <Label htmlFor="audit_date">Fecha de Auditoría *</Label>
                        <Input
                            id="audit_date"
                            type="date"
                            value={formData.audit_date}
                            onChange={(e) => handleInputChange('audit_date', e.target.value)}
                            required
                        />
                    </div>

                    {/* Tipo Auditable */}
                    <div className="space-y-2">
                        <Label htmlFor="auditable_type">Tipo a Auditar *</Label>
                        <Select
                            value={formData.auditable_type}
                            onValueChange={(value) => {
                                handleInputChange('auditable_type', value)
                                // Generar resumen automático cuando se selecciona tipo
                                setTimeout(generateSummary, 100)
                            }}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione el tipo a auditar" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(auditableTypes).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {loading && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Cargando tipos...
                            </p>
                        )}
                    </div>

                    {/* ID del Auditable */}
                    <div className="space-y-2">
                        <Label htmlFor="auditable_id">ID del Elemento *</Label>
                        <Input
                            id="auditable_id"
                            type="number"
                            min="1"
                            value={formData.auditable_id}
                            onChange={(e) => handleInputChange('auditable_id', e.target.value)}
                            placeholder="Ingrese el ID numérico del elemento"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            ID numérico del elemento que se va a auditar
                        </p>
                    </div>

                    {/* Resumen */}
                    <div className="space-y-2">
                        <Label htmlFor="summary">Resumen *</Label>
                        <Textarea
                            id="summary"
                            value={formData.summary}
                            onChange={(e) => handleInputChange('summary', e.target.value)}
                            placeholder="Describa brevemente el propósito de esta auditoría..."
                            rows={3}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Resumen descriptivo de la auditoría
                        </p>
                    </div>

                    {/* Información adicional */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Información del Sistema</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• La auditoría se creará con estado "Pendiente"</li>
                            <li>• Podrá iniciar la auditoría desde la tabla principal</li>
                            <li>• El ID debe corresponder a un elemento existente en el sistema</li>
                        </ul>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving || !formData.audit_date || !formData.summary || !formData.auditable_type || !formData.auditable_id}
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {audit ? 'Actualizar' : 'Crear'} Auditoría
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}