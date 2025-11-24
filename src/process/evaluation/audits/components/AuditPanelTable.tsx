// app/auditoria/components/AuditTable.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import type { Audit, AuditMeta, AuditLinks } from "../types/audit"
import { MoreHorizontal, FileText, Play, AlertCircle, Download, Eye, Edit } from "lucide-react"
import { AuditDetailDialog } from "./AuditDetailDialog"
import { useState } from "react"

interface AuditPanelTableProps {
    audits: Audit[]
    meta: AuditMeta
    links: AuditLinks
    onEdit: (audit: Audit) => void
    onStart: (audit: Audit) => void
    onManageFindings: (audit: Audit) => void
    onGenerateReport: (audit: Audit) => void
    onDownloadReport: (id: number) => void
    onPageChange: (page: number) => void
    loading: boolean
}

export function AuditPanelTable({
    audits,
    meta,
    links,
    onEdit,
    onStart,
    onManageFindings,
    onGenerateReport,
    onDownloadReport,
    onPageChange,
    loading
}: AuditPanelTableProps) {
    const getStatusVariant = (status: string) => {
        const variants = {
            pending: "secondary",
            in_progress: "default",
            completed: "default",
            cancelled: "destructive"
        } as const
        return variants[status as keyof typeof variants] || "secondary"
    }

    const getStatusText = (status: string) => {
        const texts = {
            pending: "Pendiente",
            in_progress: "En Progreso",
            completed: "Completada",
            cancelled: "Cancelada"
        }

        return texts[status as keyof typeof texts] || status
    }

    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)

    const handleViewDetail = (audit: Audit) => {
        setSelectedAudit(audit)
        setDetailDialogOpen(true)
    }

    const getAuditableTypeName = (type: string) => {
        return type.split("\\").pop() || type
    }

    const canStartAudit = (audit: Audit) => {
        return audit.status === 'pending'
    }

    const canManageFindings = (audit: Audit) => {
        return audit.status === 'in_progress' || audit.status === 'completed'
    }

    const canGenerateReport = (audit: Audit) => {
        return audit.status === 'in_progress' || audit.status === 'completed'
    }


    if (audits.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No hay auditorías</h3>
                <p className="text-muted-foreground mb-4">
                    Comienza creando tu primera auditoría.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Resumen</TableHead>
                            <TableHead>Auditable</TableHead>
                            <TableHead>Hallazgos</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {audits.map((audit) => (
                            <TableRow key={audit.id}>
                                <TableCell className="font-medium">
                                    {new Date(audit.audit_date).toLocaleDateString('es-ES')}
                                </TableCell>
                                <TableCell className="max-w-md truncate">
                                    {audit.summary}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{getAuditableTypeName(audit.auditable_type)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            ID: {audit.auditable_id}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {audit.findings_count || 0} hallazgos
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(audit.status)}>
                                        {getStatusText(audit.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewDetail(audit)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver Detalle
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => onEdit(audit)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </DropdownMenuItem>

                                            {canStartAudit(audit) && (
                                                <DropdownMenuItem onClick={() => onStart(audit)}>
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Iniciar Auditoría
                                                </DropdownMenuItem>
                                            )}

                                            {canManageFindings(audit) && (
                                                <DropdownMenuItem onClick={() => onManageFindings(audit)}>
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    Gestionar Hallazgos
                                                </DropdownMenuItem>
                                            )}

                                            {canGenerateReport(audit) && (
                                                <>
                                                    <DropdownMenuItem onClick={() => onGenerateReport(audit)}>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Generar Reporte
                                                    </DropdownMenuItem>
                                                    {audit.path_report && (
                                                        <DropdownMenuItem onClick={() => onDownloadReport(audit.id)}>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Descargar Reporte
                                                        </DropdownMenuItem>
                                                    )}
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {meta && meta.last_page > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (meta.current_page > 1) onPageChange(meta.current_page - 1)
                                }}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (meta.current_page < meta.last_page) onPageChange(meta.current_page + 1)
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* 🔍 Modal de Detalle de Auditoría */}
            {selectedAudit && (
                <AuditDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    audit={selectedAudit}
                    onManageFindings={onManageFindings}
                />
            )}

        </div>
    )
}