// app/auditoria/components/AuditPanelPage.tsx
import { useState, useMemo } from "react"
import AuditLayout from "@/process/evaluation/AuditLayout"
import { useAudit } from "@/process/evaluation/audits/hooks/useAudit"
import { AuditToolbar } from "@/process/evaluation/audits/components/AuditToolbar"
import { AuditPanelTable } from "@/process/evaluation/audits/components/AuditPanelTable"
import { AuditFormDialog } from "@/process/evaluation/audits/components/AuditFormDialog"
import { AuditStartDialog } from "@/process/evaluation/audits/components/AuditStartDialog"
import { AuditFindingsDialog } from "@/process/evaluation/audits/components/AuditFindingsDialog"
import { AuditReportDialog } from "@/process/evaluation/audits/components/AuditReportDialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { Audit, AuditFormData } from "@/process/evaluation/audits/types/audit"

export default function AuditPanelPage() {
    const {
        audits,
        meta,
        links,
        loading,
        error,
        refresh,
        setPage,
        createAudit,
        updateAudit,
        startAudit,
        downloadReport,
        generateReport
    } = useAudit()

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    // Dialogs state
    const [formOpen, setFormOpen] = useState(false)
    const [startOpen, setStartOpen] = useState(false)
    const [findingsOpen, setFindingsOpen] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)
    const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)

    const filteredAudits = useMemo(() => {
        return audits.filter((audit) => {
            const matchSearch = !search ||
                audit.summary.toLowerCase().includes(search.toLowerCase()) ||
                audit.auditable_type?.toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter === "all" || audit.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [audits, search, statusFilter])


    const handleAuditCreated = () => {
        console.log("✅ Auditoría creada/actualizada exitosamente")
        refresh() // Recargar la lista de auditorías
        setFormOpen(false) // Cerrar el dialog
        setSelectedAudit(null) // Limpiar auditoría seleccionada
    }

    // Handlers
    const handleCreate = () => {
        setSelectedAudit(null)
        setFormOpen(true)
    }

    const handleEdit = (audit: Audit) => {
        setSelectedAudit(audit)
        setFormOpen(true)
    }

    const handleStart = (audit: Audit) => {
        setSelectedAudit(audit)
        setStartOpen(true)
    }

    const handleManageFindings = (audit: Audit) => {
        setSelectedAudit(audit)
        setFindingsOpen(true)
    }

    const handleGenerateReport = (audit: Audit) => {
        setSelectedAudit(audit)
        setReportOpen(true)
    }

    const handleFormSubmit = async (data: AuditFormData): Promise<boolean> => {
        if (selectedAudit) {
            return updateAudit(selectedAudit.id, data)
        }
        return createAudit(data)
    }

    const handleStartConfirm = async (id: number): Promise<boolean> => {
        return startAudit(id)
    }

    const handleReportGenerate = async (id: number): Promise<boolean> => {
        return generateReport(id)
    }

    const handlePageChange = (page: number) => {
        setPage(page)
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
        <AuditLayout title="Gestión de Auditorías - Responsables de Auditorías">
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Auditorías</h1>
                    <p className="text-muted-foreground">
                        Crea, gestiona y da seguimiento a las auditorías internas del sistema.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <AuditToolbar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onRefresh={refresh}
                    onCreate={handleCreate}
                    loading={loading}
                />

                {loading && audits.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <AuditPanelTable
                        audits={filteredAudits}
                        meta={meta || defaultMeta}
                        links={links || defaultLinks}
                        onEdit={handleEdit}
                        onStart={handleStart}
                        onManageFindings={handleManageFindings}
                        onGenerateReport={handleGenerateReport}
                        onDownloadReport={downloadReport}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                )}

                {/* Dialogs */}
                <AuditFormDialog
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    audit={selectedAudit}
                    onSuccess={handleAuditCreated}
                />

                <AuditStartDialog
                    open={startOpen}
                    onOpenChange={setStartOpen}
                    audit={selectedAudit}
                    onConfirm={handleStartConfirm}
                />

                <AuditFindingsDialog
                    open={findingsOpen}
                    onOpenChange={setFindingsOpen}
                    audit={selectedAudit}
                />

                <AuditReportDialog
                    open={reportOpen}
                    onOpenChange={setReportOpen}
                    audit={selectedAudit}
                    onGenerate={handleReportGenerate}
                    onDownload={downloadReport}
                />
            </div>
        </AuditLayout>
    )
}