// app/auditoria/components/AuditReportDialog.tsx
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Audit } from "../types/audit"
import { FileText, Download, AlertTriangle, CheckCircle } from "lucide-react"
import { config } from "@/config/evaluation-config"

interface AuditReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    audit: Audit | null
    onGenerate: (id: number) => Promise<boolean>
    onDownload: (id: number) => void
}

export function AuditReportDialog({
    open,
    onOpenChange,
    audit,
    onGenerate,
    onDownload
}: AuditReportDialogProps) {
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (!audit) return

        setGenerating(true)
        setError(null)

        try {
            const success = await onGenerate(audit.id)
            if (!success) {
                setError('Error al generar el reporte. Verifica que la auditoría esté completada.')
            }
        } catch (err) {
            console.error('Error generando reporte:', err)
            setError('Error inesperado al generar el reporte')
        } finally {
            setGenerating(false)
        }
    }

    const handleDownload = async () => {
        if (!audit) return

        setError(null)
        try {
            // ✅ Agregar token para la descarga
            const token = localStorage.getItem("token")?.replace(/"/g, "")
            if (!token) {
                setError('No estás autenticado. Por favor, inicia sesión.')
                return
            }

            // Crear URL con token para descarga
            const downloadUrl = `${config.apiUrl}/api/audits/${audit.id}/report/download?token=${token}`

            // Abrir en nueva pestaña
            window.open(downloadUrl, '_blank')

        } catch (err) {
            console.error('Error descargando reporte:', err)
            setError('Error al descargar el reporte')
        }
    }

    // Función alternativa para descarga directa
    const handleDownloadDirect = async () => {
        if (!audit) return

        setError(null)
        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "")
            if (!token) {
                setError('No estás autenticado.')
                return
            }

            const response = await fetch(`${config.apiUrl}/api/audits/${audit.id}/report/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.style.display = 'none'
                a.href = url
                a.download = `auditoria_${audit.id}_reporte.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                setError('Error al descargar el reporte')
            }
        } catch (err) {
            console.error('Error descargando:', err)
            setError('Error de conexión')
        }
    }

    if (!audit) return null

    const hasReport = !!audit.path_report

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Reporte de Auditoría</DialogTitle>
                    <DialogDescription>
                        Gestión de reportes para la auditoría seleccionada.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {!hasReport ? (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Esta auditoría no tiene un reporte generado.
                                Puedes generar el reporte en formato PDF.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                El reporte ya ha sido generado y está listo para descargar.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1">
                                <h4 className="font-semibold">Reporte de Auditoría</h4>
                                <p className="text-sm text-muted-foreground">
                                    {hasReport
                                        ? 'Reporte PDF generado y disponible para descarga'
                                        : 'Genera el reporte para obtener un resumen completo'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasReport && (
                        <div className="rounded-lg bg-muted p-3">
                            <h5 className="font-medium text-sm mb-2">Información del Reporte</h5>
                            <div className="text-sm space-y-1">
                                <p><strong>Estado:</strong> Generado</p>
                                <p><strong>Formato:</strong> PDF</p>
                                <p><strong>Disponible:</strong> Para descarga</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    {!hasReport ? (
                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full sm:w-auto"
                        >
                            {generating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generar Reporte PDF
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownload}
                                className="w-full sm:w-auto"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                            </Button>
                            <Button
                                onClick={handleDownloadDirect}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descarga Directa
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}