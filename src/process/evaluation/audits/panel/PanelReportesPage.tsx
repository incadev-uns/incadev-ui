// app/auditoria/components/AuditReportPage.tsx
import { useState, useMemo } from "react"
import AuditLayout from "@/process/evaluation/AuditLayout"
import { useAudit } from "@/process/evaluation/audits/hooks/useAudit"
import { AuditToolbar } from "@/process/evaluation/audits/components/AuditToolbar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Download } from "lucide-react"
import type { Audit } from "@/process/evaluation/audits/types/audit"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export default function AuditReportPage() {
    const {
        audits,
        meta,
        links,
        loading,
        error,
        refresh,
        setPage,
        downloadReport
    } = useAudit()

    const [search, setSearch] = useState("")

    // Filtrar solo auditorías completadas
    const completedAudits = useMemo(() => {
        const filtered = audits.filter(audit => audit.status === 'completed')

        // Aplicar búsqueda si existe
        if (search) {
            return filtered.filter(audit =>
                audit.summary.toLowerCase().includes(search.toLowerCase()) ||
                audit.auditable_type?.toLowerCase().includes(search.toLowerCase()) ||
                audit.auditable_id.toString().includes(search)
            )
        }

        return filtered
    }, [audits, search])

    const handlePageChange = (page: number) => {
        setPage(page)
    }

    const handleDownloadReport = async (auditId: number) => {
        try {
            await downloadReport(auditId)
        } catch (error) {
            console.error("Error descargando reporte:", error)
        }
    }

    const getStatusVariant = (status: string) => {
        const variants = {
            completed: "secondary",
        } as const
        return variants[status as keyof typeof variants] || "secondary"
    }

    const defaultMeta = {
        current_page: 1,
        from: 0,
        to: 0,
        per_page: 10,
        total: 0,
        last_page: 1
    }

    const defaultLinks = {
        first: "",
        last: "",
        prev: null,
        next: null
    }

    return (
        <AuditLayout title="Reportes de Auditorías - Jefe de Auditorias">
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Reportes de Auditorías</h1>
                    <p className="text-muted-foreground">
                        Descarga los reportes PDF de las auditorías finalizadas del sistema.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Toolbar simplificado solo para búsqueda */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 w-full sm:max-w-sm">
                        <input
                            type="text"
                            placeholder="Buscar auditorías..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <Button
                        onClick={refresh}
                        variant="outline"
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        Actualizar
                    </Button>
                </div>

                {loading && completedAudits.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : completedAudits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay reportes disponibles</h3>
                        <p className="text-muted-foreground mb-4">
                            {search
                                ? "No se encontraron auditorías finalizadas que coincidan con tu búsqueda."
                                : "No hay auditorías finalizadas en el sistema. Las auditorías completadas aparecerán aquí automáticamente."
                            }
                        </p>
                        {search && (
                            <Button
                                onClick={() => setSearch("")}
                                variant="outline"
                            >
                                Limpiar búsqueda
                            </Button>
                        )}
                    </div>
                ) : (
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
                                        <TableHead className="w-[120px] text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedAudits.map((audit) => (
                                        <TableRow key={audit.id}>
                                            <TableCell className="font-medium">
                                                {new Date(audit.audit_date).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <div className="line-clamp-2">
                                                    {audit.summary}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {audit.auditable_type?.replace('IncadevUns\\CoreDomain\\Models\\', '')}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
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
                                                    Completada
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadReport(audit.id)}
                                                        className="flex items-center gap-1"
                                                        disabled={!audit.path_report}
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        {audit.path_report ? "Descargar" : "No disponible"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {meta && meta.last_page > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (meta.current_page > 1) handlePageChange(meta.current_page - 1)
                                            }}
                                        />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (meta.current_page < meta.last_page) handlePageChange(meta.current_page + 1)
                                            }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}

                        {/* Información del total */}
                        <div className="text-sm text-muted-foreground text-center">
                            Mostrando {completedAudits.length} auditoría{completedAudits.length !== 1 ? 's' : ''} finalizada{completedAudits.length !== 1 ? 's' : ''}
                            {search && ` que coinciden con la búsqueda`}
                        </div>
                    </div>
                )}
            </div>
        </AuditLayout>
    )
}