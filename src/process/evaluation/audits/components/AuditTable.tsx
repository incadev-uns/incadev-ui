"use client"

import * as React from "react"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription
} from "@/components/ui/drawer"

import {
    IconDotsVertical,
    IconEye,
    IconDownload,
    IconEdit,
    IconTrash,
    IconChartPie,
    IconAlertTriangle,
    IconFileText,
    IconChecklist,
    IconUser,
    IconCalendar,
    IconPlus,
    IconCheck
} from "@tabler/icons-react"
import type { Audit } from "../types/audits"
import { userAuditAuth } from "../../hooks/userAuditAuth"
import { auditService } from "../services/audit-service"

// =========================
// FORMATO DE STATUS MEJORADO
// =========================
function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
        pending: {
            label: "Pendiente",
            variant: "outline"
        },
        in_progress: {
            label: "En Progreso",
            variant: "default"
        },
        completed: {
            label: "Completada",
            variant: "secondary"
        },
        cancelled: {
            label: "Cancelada",
            variant: "destructive"
        },
    }

    const config = statusConfig[status] || {
        label: status,
        variant: "outline"
    }

    return (
        <Badge variant={config.variant} className="capitalize">
            {config.label}
        </Badge>
    )
}

// =========================
// DRAWER PARA VER DETALLES MEJORADO
// =========================
function AuditDetailsDrawer({ audit, open, onOpenChange }: {
    audit: Audit;
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    const { user, role } = userAuditAuth()
    const [downloading, setDownloading] = React.useState(false)
    const [updatingStatus, setUpdatingStatus] = React.useState(false)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getAuditableTypeName = (type: string) => {
        return type.split("\\").pop() || type
    }

    const handleDownloadReport = async () => {
        try {
            setDownloading(true)
            await auditService.downloadReport(audit.id)
        } catch (error) {
            console.error("Error downloading report:", error)
        } finally {
            setDownloading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        try {
            setUpdatingStatus(true)
            // Recargar la página para ver los cambios
            window.location.reload()
        } catch (error) {
            console.error("Error updating status:", error)
        } finally {
            setUpdatingStatus(false)
        }
    }

    // ✅ AMBOS ROLES PUEDEN HACER LO MISMO
    const canChangeStatus = true
    const isOwnAudit = audit.auditor_id === user?.id

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconChartPie className="h-5 w-5" />
                        Detalles de Auditoría #{audit.id}
                    </DrawerTitle>
                    <DrawerDescription>
                        Información completa de la auditoría
                        {isOwnAudit && ' - Tu auditoría'}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Información Principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                    <IconFileText className="h-4 w-4" />
                                    Información General
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">Resumen</p>
                                        <p className="text-base mt-1">{audit.summary}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Estado</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <StatusBadge status={audit.status} />
                                            {isOwnAudit && (
                                                <Badge variant="outline" className="text-xs">
                                                    Tu auditoría
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {audit.recommendation && (
                                        <div>
                                            <p className="text-sm font-medium">Recomendación</p>
                                            <p className="text-base mt-1 text-muted-foreground">
                                                {audit.recommendation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                    <IconCalendar className="h-4 w-4" />
                                    Fechas y Metadatos
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">Fecha de Auditoría</p>
                                        <p className="text-base mt-1">{formatDate(audit.audit_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Tipo</p>
                                        <p className="text-base mt-1">{getAuditableTypeName(audit.auditable_type)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">ID del Auditado</p>
                                        <p className="text-base mt-1">#{audit.auditable_id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del Sistema */}
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-4 flex items-center gap-2">
                            <IconUser className="h-4 w-4" />
                            Información del Sistema
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="font-medium">Auditor ID</p>
                                <p className="text-muted-foreground mt-1">#{audit.auditor_id}</p>
                            </div>
                            <div>
                                <p className="font-medium">Creado</p>
                                <p className="text-muted-foreground mt-1">{formatDate(audit.created_at)}</p>
                            </div>
                            <div>
                                <p className="font-medium">Actualizado</p>
                                <p className="text-muted-foreground mt-1">{formatDate(audit.updated_at)}</p>
                            </div>
                            <div>
                                <p className="font-medium">Reporte</p>
                                <p className="mt-1">
                                    {audit.path_report ? (
                                        <Badge variant="secondary">Disponible</Badge>
                                    ) : (
                                        <Badge variant="outline">No generado</Badge>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Acciones Rápidas - Disponibles para ambos roles */}
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-4 flex items-center gap-2">
                            <IconChecklist className="h-4 w-4" />
                            Acciones Disponibles
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {/* ✅ Ambos pueden descargar reportes disponibles */}
                            {audit.path_report && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleDownloadReport}
                                    disabled={downloading}
                                >
                                    <IconDownload className="h-4 w-4 mr-2" />
                                    {downloading ? "Descargando..." : "Descargar Reporte"}
                                </Button>
                            )}

                            {/* ✅ Ambos pueden cambiar estado */}
                            {canChangeStatus && audit.status === 'pending' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusChange('in_progress')}
                                    disabled={updatingStatus}
                                >
                                    <IconPlus className="h-4 w-4 mr-2" />
                                    Iniciar Auditoría
                                </Button>
                            )}

                            {canChangeStatus && audit.status === 'in_progress' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusChange('completed')}
                                    disabled={updatingStatus}
                                >
                                    <IconCheck className="h-4 w-4 mr-2" />
                                    Completar Auditoría
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t p-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>

                    {/* ✅ Ambos pueden editar */}
                    <Button>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Editar Auditoría
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

// =========================
// COLUMNAS PRINCIPALES - SIN RESTRICCIONES DE ROL
// =========================
const getColumns = (role: string | null, userId?: number): ColumnDef<Audit>[] => [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
            <div className="font-mono text-sm font-medium">
                #{row.original.id}
            </div>
        ),
        size: 80,
    },
    {
        accessorKey: "summary",
        header: "Resumen",
        cell: ({ row }) => (
            <div className="max-w-[300px]">
                <p className="font-medium text-sm line-clamp-2 leading-tight">
                    {row.original.summary}
                </p>
                {row.original.recommendation && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        💡 {row.original.recommendation}
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    Auditor ID: #{row.original.auditor_id}
                    {row.original.auditor_id === userId && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-1 rounded text-xs">
                            Tu auditoría
                        </span>
                    )}
                </p>
            </div>
        ),
        size: 350,
    },
    {
        accessorKey: "audit_date",
        header: "Fecha",
        cell: ({ row }) => {
            const date = new Date(row.original.audit_date)
            const today = new Date()
            const isUpcoming = date > today
            const isToday = date.toDateString() === today.toDateString()

            return (
                <div className="text-sm">
                    <div className={`font-medium ${isUpcoming ? 'text-blue-600' : ''} ${isToday ? 'text-green-600' : ''}`}>
                        {date.toLocaleDateString('es-PE')}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )
        },
        size: 120,
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        size: 140,
    },
    {
        accessorKey: "auditable_type",
        header: "Tipo",
        cell: ({ row }) => {
            const type = row.original.auditable_type.split("\\").pop()
            return (
                <Badge variant="secondary" className="font-normal text-xs">
                    {type}
                </Badge>
            )
        },
        size: 120,
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            const [detailsOpen, setDetailsOpen] = React.useState(false)
            const { role, user } = userAuditAuth()
            const audit = row.original

            // ✅ TODOS LOS PERMISOS ACTIVOS PARA AMBOS ROLES
            const canViewDetails = true
            const canDownload = audit.path_report
            const canEdit = true
            const canDelete = true
            const canChangeStatus = true
            const isOwnAudit = audit.auditor_id === user?.id

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <IconDotsVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            {/* ✅ Ver detalles */}
                            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                                <IconEye className="h-4 w-4 mr-2" />
                                Ver detalles
                            </DropdownMenuItem>

                            {/* ✅ Descargar reportes */}
                            {canDownload && (
                                <DropdownMenuItem>
                                    <IconDownload className="h-4 w-4 mr-2" />
                                    Descargar reporte
                                </DropdownMenuItem>
                            )}

                            {/* ✅ Cambiar estado */}
                            {canChangeStatus && audit.status === 'pending' && (
                                <DropdownMenuItem>
                                    <IconPlus className="h-4 w-4 mr-2" />
                                    Iniciar Auditoría
                                </DropdownMenuItem>
                            )}

                            {canChangeStatus && audit.status === 'in_progress' && (
                                <DropdownMenuItem>
                                    <IconCheck className="h-4 w-4 mr-2" />
                                    Completar Auditoría
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* ✅ Editar */}
                            {canEdit && (
                                <DropdownMenuItem>
                                    <IconEdit className="h-4 w-4 mr-2" />
                                    {audit.status === 'pending' ? 'Editar' :
                                        audit.status === 'in_progress' ? 'Continuar' : 'Revisar'}
                                </DropdownMenuItem>
                            )}

                            {/* ✅ Eliminar */}
                            {canDelete && (
                                <DropdownMenuItem className="text-destructive">
                                    <IconTrash className="h-4 w-4 mr-2" />
                                    Eliminar
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AuditDetailsDrawer
                        audit={row.original}
                        open={detailsOpen}
                        onOpenChange={setDetailsOpen}
                    />
                </>
            )
        },
        size: 80,
    },
]

// =========================
// COMPONENTE PRINCIPAL - SIN FILTRADO POR ROL
// =========================
interface AuditTableProps {
    audits: Audit[]
    loading?: boolean
    showFilters?: boolean
}

export function AuditTable({ audits = [], loading = false, showFilters = true }: AuditTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [statusFilter, setStatusFilter] = React.useState<string>('all')

    const { user, role, mounted } = userAuditAuth()
    const columns = React.useMemo(() => getColumns(role, user?.id), [role, user?.id])

    // ✅ SIN FILTRADO POR ROL - AMBOS VEN TODAS LAS AUDITORÍAS
    const filteredAudits = React.useMemo(() => {
        if (!mounted || loading) {
            return []
        }

        if (!audits || audits.length === 0) {
            return []
        }

        if (statusFilter === 'all') {
            return audits
        }

        return audits.filter(audit => audit.status === statusFilter)
    }, [audits, statusFilter, mounted, loading])

    const table = useReactTable({
        data: filteredAudits,
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // Loading state
    if (loading || !mounted) {
        return (
            <div className="w-full">
                <div className="rounded-lg border">
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Cargando auditorías...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            {/* Header con Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredAudits.length} de {audits.length} auditoría{audits.length !== 1 ? 's' : ''}
                        {statusFilter !== 'all' && ` • Filtrado por: ${statusFilter}`}
                        {role && ` • Rol: ${role === 'audit_manager' ? 'Jefe de Auditorías' : 'Auditor'}`}
                    </p>
                </div>

                {showFilters && audits.length > 0 && (
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-md border border-input px-3 py-2 text-sm"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="in_progress">En progreso</option>
                            <option value="completed">Completadas</option>
                            <option value="cancelled">Canceladas</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Tabla */}
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        className="font-semibold"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="transition-colors group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <IconAlertTriangle className="h-12 w-12 text-muted-foreground/60" />
                                        <div>
                                            <p className="text-muted-foreground font-medium">
                                                {audits.length === 0
                                                    ? 'No hay auditorías registradas'
                                                    : `No hay auditorías con estado "${statusFilter}"`
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {audits.length === 0
                                                    ? 'El sistema no tiene auditorías registradas'
                                                    : 'Intenta con otro filtro o estado'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {table.getPageCount() > 1 && filteredAudits.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {table.getRowModel().rows.length} de {filteredAudits.length} auditorías
                        {pagination.pageSize > 0 && (
                            ` (página ${pagination.pageIndex + 1} de ${table.getPageCount()})`
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground px-2">
                                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}