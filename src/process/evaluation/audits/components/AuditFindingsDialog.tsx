// app/auditoria/components/AuditFindingsDialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Audit, AuditFinding, FindingEvidence, AuditAction } from "../types/audit"
import { Plus, FileText, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { EvidenceUploadDialog } from "./EvidenceUploadDialog"
import { ActionFormDialog } from "./ActionFormDialog"
import { FindingFormDialog } from "./FindingFormDialog"
import { config } from "@/config/evaluation-config"

interface AuditFindingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    audit: Audit | null
}

export function AuditFindingsDialog({
    open,
    onOpenChange,
    audit
}: AuditFindingsDialogProps) {
    const [findings, setFindings] = useState<AuditFinding[]>([])
    const [loading, setLoading] = useState(false)
    const [findingFormOpen, setFindingFormOpen] = useState(false)
    const [evidenceUploadOpen, setEvidenceUploadOpen] = useState(false)
    const [actionFormOpen, setActionFormOpen] = useState(false)
    const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null)

    useEffect(() => {
        if (audit && open) {
            fetchFindings()
        }
    }, [audit, open])

    const fetchFindings = async () => {
        if (!audit) return

        setLoading(true)

        const token = localStorage.getItem("token")

        // ✅ Limpiar y verificar token
        const cleanToken = token?.replace(/"/g, "").trim()

        if (!cleanToken) {
            console.error("❌ No hay token disponible")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${config.apiUrl}/api/audits/${audit.id}/findings`, {
                headers: {
                    "Authorization": `Bearer ${cleanToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                credentials: 'include' // ← Importante para cookies
            })

            console.log("📡 Response status:", response.status)

            if (response.status === 401) {
                console.error("❌ Token inválido o expirado")
                // Limpiar token expirado
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                // Redirigir al login
                setTimeout(() => window.location.href = '/login', 2000)
                return
            }

            if (response.ok) {
                const data = await response.json()
                setFindings(data)
            } else {
                const errorText = await response.text()
                console.error("❌ Error del servidor:", errorText)
            }
        } catch (error) {
            console.error('💥 Error de conexión:', error)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityVariant = (severity: string) => {
        const variants = {
            Baja: "outline",
            Media: "secondary",
            Alta: "destructive"
        } as const
        return variants[severity as keyof typeof variants] || "outline"
    }

    const getStatusVariant = (status: string) => {
        const variants = {
            open: "secondary",
            in_progress: "default",
            resolved: "success",
            wont_fix: "destructive"
        } as const
        return variants[status as keyof typeof variants] || "secondary"
    }

    const getStatusIcon = (status: string) => {
        const icons = {
            open: Clock,
            in_progress: AlertTriangle,
            resolved: CheckCircle,
            wont_fix: XCircle
        }
        return icons[status as keyof typeof icons] || Clock
    }

    const handleAddFinding = () => {
        setSelectedFinding(null)
        setFindingFormOpen(true)
    }

    const handleAddEvidence = (finding: AuditFinding) => {
        setSelectedFinding(finding)
        setEvidenceUploadOpen(true)
    }

    const handleAddAction = (finding: AuditFinding) => {
        setSelectedFinding(finding)
        setActionFormOpen(true)
    }

    if (!audit) return null

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Gestión de Hallazgos</DialogTitle>
                        <DialogDescription>
                            Auditoría: {audit.summary}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Hallazgos Registrados</h3>
                                <p className="text-sm text-muted-foreground">
                                    {findings.length} hallazgos encontrados
                                </p>
                            </div>
                            <Button onClick={handleAddFinding} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Hallazgo
                            </Button>
                        </div>

                        <Tabs defaultValue="all" className="flex-1 overflow-hidden">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="all">Todos</TabsTrigger>
                                <TabsTrigger value="open">Abiertos</TabsTrigger>
                                <TabsTrigger value="in_progress">En Progreso</TabsTrigger>
                                <TabsTrigger value="resolved">Resueltos</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="h-[500px] overflow-auto">
                                <FindingsList
                                    findings={findings}
                                    onAddEvidence={handleAddEvidence}
                                    onAddAction={handleAddAction}
                                    getSeverityVariant={getSeverityVariant}
                                    getStatusVariant={getStatusVariant}
                                    getStatusIcon={getStatusIcon}
                                />
                            </TabsContent>

                            <TabsContent value="open" className="h-[500px] overflow-auto">
                                <FindingsList
                                    findings={findings.filter(f => f.status === 'open')}
                                    onAddEvidence={handleAddEvidence}
                                    onAddAction={handleAddAction}
                                    getSeverityVariant={getSeverityVariant}
                                    getStatusVariant={getStatusVariant}
                                    getStatusIcon={getStatusIcon}
                                />
                            </TabsContent>

                            <TabsContent value="in_progress" className="h-[500px] overflow-auto">
                                <FindingsList
                                    findings={findings.filter(f => f.status === 'in_progress')}
                                    onAddEvidence={handleAddEvidence}
                                    onAddAction={handleAddAction}
                                    getSeverityVariant={getSeverityVariant}
                                    getStatusVariant={getStatusVariant}
                                    getStatusIcon={getStatusIcon}
                                />
                            </TabsContent>

                            <TabsContent value="resolved" className="h-[500px] overflow-auto">
                                <FindingsList
                                    findings={findings.filter(f => f.status === 'resolved' || f.status === 'wont_fix')}
                                    onAddEvidence={handleAddEvidence}
                                    onAddAction={handleAddAction}
                                    getSeverityVariant={getSeverityVariant}
                                    getStatusVariant={getStatusVariant}
                                    getStatusIcon={getStatusIcon}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sub-dialogs */}
            <FindingFormDialog
                open={findingFormOpen}
                onOpenChange={setFindingFormOpen}
                auditId={audit?.id}
                finding={selectedFinding}
                onSuccess={fetchFindings}
            />

            <EvidenceUploadDialog
                open={evidenceUploadOpen}
                onOpenChange={setEvidenceUploadOpen}
                finding={selectedFinding}
                onSuccess={fetchFindings}
            />

            <ActionFormDialog
                open={actionFormOpen}
                onOpenChange={setActionFormOpen}
                finding={selectedFinding}
                onSuccess={fetchFindings}
            />
        </>
    )
}

// Componente auxiliar para lista de hallazgos
interface FindingsListProps {
    findings: AuditFinding[]
    onAddEvidence: (finding: AuditFinding) => void
    onAddAction: (finding: AuditFinding) => void
    getSeverityVariant: (severity: string) => any
    getStatusVariant: (status: string) => any
    getStatusIcon: (status: string) => any
}

function FindingsList({
    findings,
    onAddEvidence,
    onAddAction,
    getSeverityVariant,
    getStatusVariant,
    getStatusIcon
}: FindingsListProps) {
    if (findings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-32 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay hallazgos registrados</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {findings.map((finding) => {
                const StatusIcon = getStatusIcon(finding.status)
                return (
                    <Card key={finding.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <StatusIcon className="h-4 w-4" />
                                        Hallazgo #{finding.id}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {finding.description}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={getSeverityVariant(finding.severity)}>
                                        {finding.severity}
                                    </Badge>
                                    <Badge variant={getStatusVariant(finding.status)}>
                                        {finding.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                    <span>
                                        {finding.evidences?.length || 0} evidencias
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {finding.actions?.length || 0} acciones
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAddEvidence(finding)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Evidencia
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAddAction(finding)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Acción
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}