// app/auditoria/components/EvidenceUploadDialog.tsx
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { AuditFinding } from "../types/audit"
import { Upload, FileText, Image, Video, File } from "lucide-react"
import { config } from "@/config/evaluation-config"

interface EvidenceUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    finding: AuditFinding | null
    onSuccess: () => void
}

export function EvidenceUploadDialog({
    open,
    onOpenChange,
    finding,
    onSuccess
}: EvidenceUploadDialogProps) {
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !finding) return

        setLoading(true)
        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "")

            if (!token) {
                alert('No estás autenticado. Por favor, inicia sesión.')
                return
            }

            const formData = new FormData()
            formData.append('file', file)

            console.log('🔐 Token:', token)
            console.log('📤 Subiendo archivo:', file.name)
            console.log('🎯 Finding ID:', finding.id)

            const response = await fetch(`${config.apiUrl}/api/findings/${finding.id}/evidences`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                    // ❌ NO incluir 'Content-Type' para FormData - el navegador lo setea automáticamente
                },
                body: formData
            })

            console.log('📡 Response status:', response.status)
            console.log('📡 Response ok:', response.ok)

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Evidencia subida:', data)
                onSuccess()
                onOpenChange(false)
                setFile(null)
            } else {
                const errorText = await response.text()
                console.error('❌ Error del servidor:', errorText)

                // Manejar diferentes tipos de errores
                if (response.status === 401) {
                    alert('Sesión expirada. Por favor, inicia sesión nuevamente.')
                    localStorage.removeItem("token")
                    window.location.href = '/login'
                } else if (response.status === 413) {
                    alert('El archivo es demasiado grande. Máximo 5MB permitido.')
                } else {
                    alert('Error al subir la evidencia: ' + errorText)
                }
            }
        } catch (error) {
            console.error('💥 Error de conexión:', error)
            alert('Error de conexión. Verifica tu internet.')
        } finally {
            setLoading(false)
        }
    }

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <Image className="h-8 w-8" />
        } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
            return <Video className="h-8 w-8" />
        } else if (['pdf'].includes(ext || '')) {
            return <FileText className="h-8 w-8" />
        } else {
            return <File className="h-8 w-8" />
        }
    }

    if (!finding) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Subir Evidencia</DialogTitle>
                    <DialogDescription>
                        Adjunta un archivo como evidencia para este hallazgo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="file">Archivo</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        {getFileIcon(file.name)}
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFile(null)}
                                        >
                                            Cambiar archivo
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Arrastra un archivo o haz clic para seleccionar
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PDF, imágenes, videos o documentos (máx. 5MB)
                                            </p>
                                        </div>
                                        <Input
                                            id="file"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.doc,.docx"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('file')?.click()}
                                        >
                                            Seleccionar archivo
                                        </Button>
                                    </div>
                                )}
                            </div>
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
                        <Button
                            type="submit"
                            disabled={loading || !file}
                        >
                            {loading ? 'Subiendo...' : 'Subir Evidencia'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}