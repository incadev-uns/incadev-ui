// app/auditoria/components/AuditDetailDialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/process/evaluation/audits/components/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Download,
    CheckCircle,
    FileText,
    AlertTriangle,
    Clock,
    Shield,
    X,
    Loader2,
    AlertCircle,
    Plus,
    Edit,
    Calendar,
    FileBarChart,
    Target,
    Search,
    BarChart3,
    ExternalLink,
} from "lucide-react"
import { auditService } from "@/process/evaluation/audits/services/audit-service"
import type { Audit } from "../types/audit"

interface Finding {
    id: number
    audit_id: number
    description: string
    severity: "low" | "medium" | "high" | "critical"
    status: "open" | "in_progress" | "resolved" | "wont_fix"
    created_at: string
    updated_at: string
    evidences: Evidence[]
    actions: Action[]
}

interface Evidence {
    id: number
    audit_finding_id: number
    type: string
    path: string
    created_at: string
    updated_at: string
}

interface Action {
    id: number
    // Define según tu estructura real
}

interface AuditDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    audit: Audit | null
    onManageFindings?: (audit: Audit) => void
}

export function AuditDetailDialog({
    open,
    onOpenChange,
    audit,
    onManageFindings,
}: AuditDetailDialogProps) {
    const [findings, setFindings] = useState<Finding[]>([])
    const [loading, setLoading] = useState(false)
    const [recommendation, setRecommendation] = useState("")
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("overview")

    useEffect(() => {
        if (audit && open) {
            loadAuditData()
        } else {
            // Resetear estado cuando se cierra el dialog
            setFindings([])
            setRecommendation("")
            setError(null)
            setActiveTab("overview")
        }
    }, [audit, open])

    const loadAuditData = async () => {
        if (!audit) return

        try {
            setLoading(true)
            setError(null)

            setRecommendation(audit.recommendation || "")

            if (audit.findings && Array.isArray(audit.findings)) {
                setFindings(audit.findings)
            } else {
                console.log("🔄 Cargando hallazgos para auditoría:", audit.id)
                const findingsResponse = await auditService.getFindings(audit.id)

                if (findingsResponse && findingsResponse.data) {
                    setFindings(Array.isArray(findingsResponse.data) ? findingsResponse.data : [])
                } else {
                    setFindings([])
                }
            }
        } catch (error: any) {
            console.error("❌ Error cargando datos de auditoría:", error)
            setError(error?.message || "Error al cargar los datos de la auditoría")
            setFindings([])
        } finally {
            setLoading(false)
        }
    }

    const handleFinalizeAudit = async () => {
        if (!audit) return

        if (
            !confirm(
                "¿Estás seguro de que deseas finalizar esta auditoría? Esta acción no se puede deshacer."
            )
        ) {
            return
        }

        try {
            setUpdating(true)
            setError(null)

            await auditService.update(audit.id, {
                status: "completed",
                recommendation: recommendation,
            })

            await loadAuditData()
            alert("✅ Auditoría finalizada exitosamente")
        } catch (error: any) {
            console.error("Error finalizando auditoría:", error)
            setError(error?.message || "Error al finalizar la auditoría")
        } finally {
            setUpdating(false)
        }
    }

    const handleUpdateRecommendation = async () => {
        if (!audit) return

        try {
            setUpdating(true)
            setError(null)

            await auditService.updateRecommendation(audit.id, {
                recommendation: recommendation,
            })

            alert("✅ Recomendación actualizada exitosamente")
        } catch (error: any) {
            console.error("Error actualizando recomendación:", error)
            setError(error?.message || "Error al actualizar la recomendación")
        } finally {
            setUpdating(false)
        }
    }

    const handleUpdateStatus = async (
        newStatus: "pending" | "in_progress" | "completed" | "cancelled"
    ) => {
        if (!audit) return

        try {
            setUpdating(true)
            setError(null)

            await auditService.update(audit.id, {
                status: newStatus,
            })

            await loadAuditData()
            alert(`✅ Estado actualizado a: ${newStatus.replace("_", " ")}`)
        } catch (error: any) {
            console.error("Error actualizando estado:", error)
            setError(error?.message || "Error al actualizar el estado")
        } finally {
            setUpdating(false)
        }
    }

    const handleGenerateReport = async () => {
        if (!audit) return

        try {
            setError(null)
            console.log("📄 Generando reporte para auditoría:", audit.id)

            const response = await auditService.generateReport(audit.id)

            if (response.data?.report_url) {
                window.open(response.data.report_url, "_blank")
                alert("✅ Reporte generado exitosamente")
            } else {
                alert("✅ Reporte generado exitosamente")
            }
        } catch (error: any) {
            console.error("Error generando reporte:", error)
            setError(error?.message || "Error al generar el reporte")
        }
    }

    const handleDownloadReport = async () => {
        if (!audit) return

        try {
            setError(null)
            console.log("📥 Descargando reporte para auditoría:", audit.id)

            await auditService.downloadReport(audit.id)
        } catch (error: any) {
            console.error("Error descargando reporte:", error)
            setError(error?.message || "Error al descargar el reporte")
        }
    }

    const getStatusVariant = (status: string) => {
        const variants = {
            pending: "secondary",
            in_progress: "default",
            completed: "outline",
            cancelled: "destructive",
        } as const
        return variants[status as keyof typeof variants] || "secondary"
    }

    const getStatusIcon = (status: string) => {
        const icons = {
            pending: Clock,
            in_progress: AlertTriangle,
            completed: CheckCircle,
            cancelled: Shield,
        }
        return icons[status as keyof typeof icons] || Clock
    }

    const getSeverityVariant = (severity: string) => {
        const variants = {
            low: "outline",
            medium: "secondary",
            high: "destructive",
            critical: "destructive",
        } as const
        return variants[severity as keyof typeof variants] || "outline"
    }

    const getFindingStatusVariant = (status: string) => {
        const variants = {
            open: "secondary",
            in_progress: "default",
            resolved: "outline",
            wont_fix: "destructive",
        } as const
        return variants[status as keyof typeof variants] || "secondary"
    }

    const handleManageFindings = () => {
        if (audit && onManageFindings) {
            onOpenChange(false)
            setTimeout(() => onManageFindings(audit), 300)
        }
    }

    const stats = {
        totalFindings: findings.length,
        openFindings: findings.filter((f) => f.status === "open").length,
        inProgressFindings: findings.filter((f) => f.status === "in_progress").length,
        resolvedFindings: findings.filter(
            (f) => f.status === "resolved" || f.status === "wont_fix"
        ).length,
        totalEvidences: findings.reduce((total, finding) => total + finding.evidences.length, 0),
        totalActions: findings.reduce((total, finding) => total + finding.actions.length, 0),
        highSeverity: findings.filter((f) => f.severity === "high" || f.severity === "critical")
            .length,
    }

    if (!audit) return null

    const StatusIcon = getStatusIcon(audit.status)
    const canEdit = audit.status !== "completed" && audit.status !== "cancelled"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="p-0 rounded-xl"
            >
                <div className="flex h-full flex-col">
                    {/* Header fijo */}
                    <div className="flex-shrink-0 border-b border-border/40 bg-background/70 backdrop-blur-md">
                        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <StatusIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                    <div className="min-w-0 flex-1">
                                        <DialogTitle className="truncate text-base font-semibold sm:text-xl">
                                            {audit.summary || `Auditoría #${audit.id}`}
                                        </DialogTitle>
                                        <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(audit.audit_date).toLocaleDateString("es-PE")}
                                            </span>
                                            <span>•</span>
                                            <span>ID: {audit.id}</span>
                                            <span>•</span>
                                            <span className="truncate">
                                                {audit.auditable_type?.replace(
                                                    "IncadevUns\\CoreDomain\\Models\\",
                                                    ""
                                                )}{" "}
                                                - ID {audit.auditable_id}
                                            </span>
                                        </DialogDescription>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleManageFindings}
                                        className="gap-2"
                                    >
                                        <Search className="h-4 w-4" /> Hallazgos
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onOpenChange(false)}
                                        className="h-9 w-9 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    {/* Alert de errores */}
                    {error && (
                        <div className="flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3">
                            <Alert variant="destructive" className="py-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Tabs + contenido scrollable */}
                    <div className="flex min-h-0 flex-1 flex-col">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="flex-shrink-0 border-b bg-muted/30 px-4 sm:px-6">
                                <TabsList className="flex w-full justify-start gap-1 bg-transparent p-0">
                                    <TabsTrigger
                                        value="overview"
                                        className="flex items-center gap-2 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Resumen</span>
                                        <span className="inline sm:hidden">Dashboard</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="findings"
                                        className="flex items-center gap-2 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm"
                                    >
                                        <Target className="h-4 w-4" />
                                        <span>Hallazgos</span>
                                        {findings.length > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-1 h-5 min-w-5 px-1 text-[10px] sm:text-xs"
                                            >
                                                {findings.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="recommendation"
                                        className="flex items-center gap-2 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        <FileText className="h-4 w-4" />
                                        <span className="hidden sm:inline">Recomendación</span>
                                        <span className="inline sm:hidden">Recom.</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="reports"
                                        className="flex items-center gap-2 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        <FileBarChart className="h-4 w-4" />
                                        <span className="hidden sm:inline">Reportes</span>
                                        <span className="inline sm:hidden">Reports</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="space-y-6 p-4 sm:p-6">
                                    {/* Pestaña Resumen */}
                                    <TabsContent value="overview" className="mt-0 space-y-6">
                                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                            {/* Información de la auditoría */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <Calendar className="h-4 w-4" />
                                                        Información General
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Estado
                                                            </label>
                                                            <div>
                                                                <Badge
                                                                    variant={getStatusVariant(audit.status)}
                                                                    className="capitalize"
                                                                >
                                                                    {audit.status.replace("_", " ")}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Auditor ID
                                                            </label>
                                                            <p className="text-sm font-medium">{audit.auditor_id}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Tipo
                                                            </label>
                                                            <p className="truncate text-sm font-medium">
                                                                {audit.auditable_type?.replace(
                                                                    "IncadevUns\\CoreDomain\\Models\\",
                                                                    ""
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Elemento ID
                                                            </label>
                                                            <p className="text-sm font-medium">{audit.auditable_id}</p>
                                                        </div>
                                                    </div>
                                                    <Separator />
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                            Resumen
                                                        </label>
                                                        <p className="min-h-[60px] rounded-md bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                                                            {audit.summary ||
                                                                "No se ha proporcionado un resumen para esta auditoría."}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Gestión de estado */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <CheckCircle className="h-4 w-4" />
                                                        Gestión de Estado
                                                    </CardTitle>
                                                    <CardDescription className="text-sm">
                                                        Controle el progreso de la auditoría
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {canEdit ? (
                                                        <div className="space-y-3">
                                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                                {audit.status === "pending" && (
                                                                    <Button
                                                                        onClick={() => handleUpdateStatus("in_progress")}
                                                                        disabled={updating}
                                                                        className="min-w-0 flex-1"
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Iniciar Auditoría
                                                                    </Button>
                                                                )}
                                                                {audit.status === "in_progress" && (
                                                                    <Button
                                                                        onClick={handleFinalizeAudit}
                                                                        disabled={updating}
                                                                        className="min-w-0 flex-1"
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Finalizar Auditoría
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleUpdateStatus("cancelled")}
                                                                disabled={updating}
                                                                className="w-full"
                                                            >
                                                                <X className="mr-2 h-4 w-4" />
                                                                Cancelar Auditoría
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Alert>
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription className="text-sm">
                                                                Esta auditoría está{" "}
                                                                <strong className="capitalize">
                                                                    {audit.status.replace("_", " ")}
                                                                </strong>{" "}
                                                                y no puede ser modificada.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* Pestaña Hallazgos */}
                                    <TabsContent value="findings" className="mt-0 space-y-6">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="space-y-3 text-center">
                                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                                    <p className="text-sm text-muted-foreground">Cargando hallazgos...</p>
                                                </div>
                                            </div>
                                        ) : findings.length === 0 ? (
                                            <Card className="text-center">
                                                <CardContent className="py-12">
                                                    <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                                    <h3 className="mb-2 text-lg font-semibold">
                                                        No hay hallazgos registrados
                                                    </h3>
                                                    <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                                                        No se han identificado hallazgos en esta auditoría. Puede comenzar
                                                        agregando el primer hallazgo.
                                                    </p>
                                                    <Button onClick={handleManageFindings} size="lg">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Agregar Primer Hallazgo
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <h3 className="text-lg font-semibold">Hallazgos Identificados</h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-muted-foreground">
                                                            {findings.length} hallazgos encontrados
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleManageFindings}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Gestionar
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4">
                                                    {findings.map((finding) => (
                                                        <Card
                                                            key={finding.id}
                                                            className="group border-l-4 border-l-blue-500 transition-all duration-200 hover:shadow-md"
                                                        >
                                                            <CardHeader className="pb-3">
                                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                    <div className="min-w-0 flex-1 space-y-2">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <CardTitle className="text-base font-semibold text-foreground">
                                                                                Hallazgo #{finding.id}
                                                                            </CardTitle>
                                                                            <Badge
                                                                                variant={getFindingStatusVariant(finding.status)}
                                                                                className="text-xs capitalize"
                                                                            >
                                                                                {finding.status.replace("_", " ")}
                                                                            </Badge>
                                                                        </div>
                                                                        <CardDescription className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
                                                                            {finding.description}
                                                                        </CardDescription>
                                                                    </div>
                                                                    <Badge
                                                                        variant={getSeverityVariant(finding.severity)}
                                                                        className="flex-shrink-0 capitalize"
                                                                    >
                                                                        {finding.severity}
                                                                    </Badge>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="pt-0">
                                                                <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                                                    <div className="flex flex-wrap items-center gap-4">
                                                                        <span className="flex items-center gap-1.5">
                                                                            <FileText className="h-3.5 w-3.5" />
                                                                            {finding.evidences.length} evidencias
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5">
                                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                                            {finding.actions.length} acciones
                                                                        </span>
                                                                        <span className="text-xs">
                                                                            Creado:{" "}
                                                                            {new Date(finding.created_at).toLocaleDateString("es-PE")}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Pestaña Recomendación */}
                                    <TabsContent value="recommendation" className="mt-0">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <FileText className="h-4 w-4" />
                                                    Recomendación General
                                                </CardTitle>
                                                <CardDescription className="text-sm">
                                                    Recomendaciones y observaciones finales de la auditoría
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        Recomendaciones
                                                    </label>
                                                    <Textarea
                                                        value={recommendation}
                                                        onChange={(e) => setRecommendation(e.target.value)}
                                                        placeholder="Ingrese las recomendaciones y observaciones generales de esta auditoría. Incluya aspectos a mejorar, buenas prácticas identificadas y sugerencias para futuras auditorías..."
                                                        className="min-h-[140px] resize-vertical text-sm leading-relaxed"
                                                        disabled={!canEdit}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                    <Button
                                                        onClick={handleUpdateRecommendation}
                                                        disabled={updating || !recommendation.trim() || !canEdit}
                                                        size="sm"
                                                        className="sm:flex-1"
                                                    >
                                                        {updating && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                        {updating ? "Guardando..." : "Guardar Recomendación"}
                                                    </Button>

                                                    {audit.status === "in_progress" && (
                                                        <Button
                                                            variant="default"
                                                            onClick={handleFinalizeAudit}
                                                            disabled={updating}
                                                            size="sm"
                                                            className="sm:flex-1"
                                                        >
                                                            <CheckCircle className="mr-2 h-3 w-3" />
                                                            Finalizar Auditoría
                                                        </Button>
                                                    )}
                                                </div>
                                                {!canEdit && (
                                                    <Alert>
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription className="text-sm">
                                                            No se pueden modificar las recomendaciones en una auditoría{" "}
                                                            <strong className="capitalize">
                                                                {audit.status.replace("_", " ")}
                                                            </strong>
                                                            .
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Pestaña Reportes */}
                                    <TabsContent value="reports" className="mt-0">
                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <FileBarChart className="h-4 w-4" />
                                                        Generar Reportes
                                                    </CardTitle>
                                                    <CardDescription className="text-sm">
                                                        Genere y descargue reportes de la auditoría
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="space-y-3">
                                                        <Button
                                                            onClick={handleGenerateReport}
                                                            className="w-full justify-start"
                                                            size="sm"
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Generar Reporte Completo
                                                            <ExternalLink className="ml-auto h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleDownloadReport}
                                                            className="w-full justify-start"
                                                            size="sm"
                                                            disabled={!audit.path_report}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Descargar PDF
                                                            {!audit.path_report && (
                                                                <Badge variant="secondary" className="ml-auto text-xs">
                                                                    No disponible
                                                                </Badge>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <Target className="h-4 w-4" />
                                                        Acciones Rápidas
                                                    </CardTitle>
                                                    <CardDescription className="text-sm">
                                                        Gestionar hallazgos y evidencias
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <Button
                                                        onClick={handleManageFindings}
                                                        variant="outline"
                                                        className="w-full justify-start"
                                                        size="sm"
                                                    >
                                                        <Search className="mr-2 h-4 w-4" />
                                                        Gestionar Hallazgos
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Card className="mt-6">
                                            <CardHeader>
                                                <CardTitle className="text-base">Información del Reporte</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 gap-6 text-sm text-muted-foreground md:grid-cols-2">
                                                    <ul className="space-y-3">
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                            <span>Todos los hallazgos identificados con su severidad</span>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                            <span>Recomendaciones generales y específicas</span>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                            <span>Estado de las acciones correctivas</span>
                                                        </li>
                                                    </ul>
                                                    <ul className="space-y-3">
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                            <span>Fechas, responsables y auditor asignado</span>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                            <span>Evidencias documentadas y referencias</span>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                                            <span>Análisis detallado de severidad e impacto</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
