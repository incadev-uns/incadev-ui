import { useState, useEffect, useCallback } from "react"
import { auditService } from "../services/audit-service"
import type {
    Audit,
    AuditFormData,
    RecommendationFormData,
    Finding,
    FindingFormData,
    FindingStatusFormData,
    ActionItem,
    ActionFormData,
    ActionStatusFormData,
    PaginationMeta,
    PaginationLinks,
    AuditUser,
    AuditFilters,
    DashboardStatsData
} from "../types/audits"

interface UseAuditsReturn {
    // Estado principal
    audits: Audit[]
    meta: PaginationMeta | null
    links: PaginationLinks | null
    loading: boolean
    error: string | null

    // Estados adicionales
    users: AuditUser[]
    auditableTypes: string[]

    // Funciones de gestión de auditorías
    refresh: () => Promise<void>
    setPage: (page: number) => void
    setFilters: (filters: AuditFilters) => void
    createAudit: (data: AuditFormData) => Promise<boolean>
    updateAudit: (id: number, data: Partial<AuditFormData>) => Promise<boolean>
    deleteAudit: (id: number) => Promise<boolean>
    getAuditById: (id: number) => Promise<Audit | null>
    updateRecommendation: (id: number, data: RecommendationFormData) => Promise<boolean>

    // Funciones de hallazgos
    getFindings: (auditId: number) => Promise<Finding[]>
    createFinding: (auditId: number, data: FindingFormData) => Promise<boolean>
    updateFinding: (findingId: number, data: Partial<FindingFormData>) => Promise<boolean>
    updateFindingStatus: (findingId: number, data: FindingStatusFormData) => Promise<boolean>
    deleteFinding: (findingId: number) => Promise<boolean>

    // Funciones de evidencias
    uploadEvidence: (findingId: number, file: File) => Promise<boolean>
    deleteEvidence: (evidenceId: number) => Promise<boolean>

    // Funciones de acciones correctivas
    getActions: (findingId: number) => Promise<ActionItem[]>
    createAction: (findingId: number, data: ActionFormData) => Promise<boolean>
    updateAction: (actionId: number, data: Partial<ActionFormData>) => Promise<boolean>
    updateActionStatus: (actionId: number, data: ActionStatusFormData) => Promise<boolean>
    deleteAction: (actionId: number) => Promise<boolean>

    // Funciones de reportes
    generateReport: (auditId: number) => Promise<boolean>
    downloadReport: (auditId: number) => Promise<boolean>
    previewReport: (auditId: number) => Promise<boolean>

    // Dashboard
    getDashboardStats: () => Promise<DashboardStatsData | null>

    // Utilidades
    clearError: () => void
}

// Función para transformar los datos del dashboard a la estructura esperada
const transformDashboardData = (data: DashboardStatsData): DashboardStatsData => {
    return {
        audits: data.audits,
        findings: data.findings,
        actions: data.actions,
        audits_over_time: data.audits_over_time.map(item => ({
            month: item.month,
            count: item.count
        })),
    }
}

export function useAudits() {
    const [audits, setAudits] = useState<Audit[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [links, setLinks] = useState<PaginationLinks | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<AuditUser[]>([])
    const [auditableTypes, setAuditableTypes] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFiltersState] = useState<AuditFilters>({})

    // Función principal para cargar auditorías
    const fetchAudits = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await auditService.listAll(currentPage, filters)
            setAudits(response.data)
            setMeta(response.meta)
            setLinks(response.links)
        } catch (e: any) {
            const errorMessage = e?.message || "No se pudieron cargar las auditorías"
            setError(errorMessage)
            console.error("Error fetching audits:", e)
        } finally {
            setLoading(false)
        }
    }, [currentPage, filters])

    // Cargar datos auxiliares
    const fetchAuxiliaryData = useCallback(async () => {
        try {
            // Cargar usuarios
            const usersResponse = await auditService.getUsers()
            setUsers(usersResponse.data || [])

            // Cargar tipos auditables
            const typesResponse = await auditService.getAuditableTypes()
            setAuditableTypes(typesResponse.data || [])
        } catch (e: any) {
            console.warn("Error loading auxiliary data:", e.message)
        }
    }, [])

    useEffect(() => {
        fetchAudits()
        fetchAuxiliaryData()
    }, [fetchAudits, fetchAuxiliaryData])

    const setPage = (page: number) => {
        setCurrentPage(page)
    }

    const setFilters = (newFilters: AuditFilters) => {
        setFiltersState(newFilters)
        setCurrentPage(1) // Reset to first page when filters change
    }

    const clearError = () => setError(null)

    // ==================== GESTIÓN DE AUDITORÍAS ====================

    const createAudit = async (data: AuditFormData): Promise<boolean> => {
        try {
            setError(null)
            await auditService.create(data)
            await fetchAudits()
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al crear la auditoría"
            setError(errorMessage)
            return false
        }
    }

    const updateAudit = async (id: number, data: Partial<AuditFormData>): Promise<boolean> => {
        try {
            setError(null)
            await auditService.update(id, data)
            await fetchAudits()
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al actualizar la auditoría"
            setError(errorMessage)
            return false
        }
    }

    const deleteAudit = async (id: number): Promise<boolean> => {
        try {
            setError(null)
            await auditService.delete(id)
            await fetchAudits()
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al eliminar la auditoría"
            setError(errorMessage)
            return false
        }
    }

    const getAuditById = async (id: number): Promise<Audit | null> => {
        try {
            setError(null)
            const response = await auditService.getById(id)
            return response.data
        } catch (e: any) {
            const errorMessage = e?.message || "Error al obtener la auditoría"
            setError(errorMessage)
            return null
        }
    }

    const updateRecommendation = async (id: number, data: RecommendationFormData): Promise<boolean> => {
        try {
            setError(null)
            await auditService.updateRecommendation(id, data)
            await fetchAudits()
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al actualizar la recomendación"
            setError(errorMessage)
            return false
        }
    }

    // ==================== GESTIÓN DE HALLAZGOS ====================

    const getFindings = async (auditId: number): Promise<Finding[]> => {
        try {
            setError(null)
            const response = await auditService.getFindings(auditId)
            return response.data
        } catch (e: any) {
            const errorMessage = e?.message || "Error al obtener los hallazgos"
            setError(errorMessage)
            return []
        }
    }

    const createFinding = async (auditId: number, data: FindingFormData): Promise<boolean> => {
        try {
            setError(null)
            await auditService.createFinding(auditId, data)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al crear el hallazgo"
            setError(errorMessage)
            return false
        }
    }

    const updateFinding = async (findingId: number, data: Partial<FindingFormData>): Promise<boolean> => {
        try {
            setError(null)
            // Para actualizar hallazgos, necesitaríamos un endpoint específico
            // Por ahora solo permitimos actualizar el estado
            console.warn("Update finding not implemented yet")
            return false
        } catch (e: any) {
            const errorMessage = e?.message || "Error al actualizar el hallazgo"
            setError(errorMessage)
            return false
        }
    }

    const updateFindingStatus = async (findingId: number, data: FindingStatusFormData): Promise<boolean> => {
        try {
            setError(null)
            await auditService.updateFindingStatus(findingId, data)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al actualizar el estado del hallazgo"
            setError(errorMessage)
            return false
        }
    }

    const deleteFinding = async (findingId: number): Promise<boolean> => {
        try {
            setError(null)
            await auditService.deleteFinding(findingId)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al eliminar el hallazgo"
            setError(errorMessage)
            return false
        }
    }

    // ==================== GESTIÓN DE EVIDENCIAS ====================

    const uploadEvidence = async (findingId: number, file: File): Promise<boolean> => {
        try {
            setError(null)
            await auditService.uploadEvidence(findingId, file)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al subir la evidencia"
            setError(errorMessage)
            return false
        }
    }

    const deleteEvidence = async (evidenceId: number): Promise<boolean> => {
        try {
            setError(null)
            await auditService.deleteEvidence(evidenceId)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al eliminar la evidencia"
            setError(errorMessage)
            return false
        }
    }

    // ==================== ACCIONES CORRECTIVAS ====================

    const getActions = async (findingId: number): Promise<ActionItem[]> => {
        try {
            setError(null)
            // Necesitaríamos un endpoint específico para obtener acciones por hallazgo
            // Por ahora retornamos array vacío
            return []
        } catch (e: any) {
            const errorMessage = e?.message || "Error al obtener las acciones"
            setError(errorMessage)
            return []
        }
    }

    const createAction = async (findingId: number, data: ActionFormData): Promise<boolean> => {
        try {
            setError(null)
            await auditService.createAction(findingId, data)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al crear la acción correctiva"
            setError(errorMessage)
            return false
        }
    }

    const updateAction = async (actionId: number, data: Partial<ActionFormData>): Promise<boolean> => {
        try {
            setError(null)
            // Para actualizar acciones, necesitaríamos un endpoint específico
            // Por ahora solo permitimos actualizar el estado
            console.warn("Update action not implemented yet")
            return false
        } catch (e: any) {
            const errorMessage = e?.message || "Error al actualizar la acción"
            setError(errorMessage)
            return false
        }
    }

    const updateActionStatus = async (actionId: number, data: ActionStatusFormData): Promise<boolean> => {
        try {
            setError(null)
            await auditService.updateActionStatus(actionId, data)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al actualizar el estado de la acción"
            setError(errorMessage)
            return false
        }
    }

    const deleteAction = async (actionId: number): Promise<boolean> => {
        try {
            setError(null)
            await auditService.deleteAction(actionId)
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al eliminar la acción"
            setError(errorMessage)
            return false
        }
    }

    // ==================== REPORTES ====================

    const generateReport = async (auditId: number): Promise<boolean> => {
        try {
            setError(null)
            const response = await auditService.generateReport(auditId)
            if (response.data.report_url) {
                // Si el backend devuelve una URL, abrir en nueva pestaña
                window.open(response.data.report_url, '_blank')
            }
            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al generar el reporte"
            setError(errorMessage)
            return false
        }
    }

    const downloadReport = async (auditId: number): Promise<boolean> => {
        try {
            setError(null)
            const blob = await auditService.downloadReport(auditId)

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.style.display = "none"
            a.href = url
            a.download = `reporte_auditoria_${auditId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al descargar el reporte"
            setError(errorMessage)
            return false
        }
    }

    const previewReport = async (auditId: number): Promise<boolean> => {
        try {
            setError(null)
            const blob = await auditService.previewReport(auditId)

            const url = window.URL.createObjectURL(blob)
            window.open(url, '_blank')
            setTimeout(() => window.URL.revokeObjectURL(url), 1000)

            return true
        } catch (e: any) {
            const errorMessage = e?.message || "Error al previsualizar el reporte"
            setError(errorMessage)
            return false
        }
    }

    // ==================== DASHBOARD ====================

    const getDashboardStats = async (): Promise<DashboardStatsData | null> => {
        try {
            setError(null)
            const response = await auditService.getDashboardStats()

            if (!response.success) {
                throw new Error(response.message || "Error al obtener las estadísticas")
            }

            return transformDashboardData(response.data)
        } catch (e: any) {
            const errorMessage = e?.message || "Error al obtener las estadísticas"
            setError(errorMessage)
            return null
        }
    }

    return {
        // Estado
        audits,
        meta,
        links,
        loading,
        error,
        users,
        auditableTypes,

        // Funciones principales
        refresh: fetchAudits,
        setPage,
        setFilters,
        createAudit,
        updateAudit,
        deleteAudit,
        getAuditById,
        updateRecommendation,

        // Hallazgos
        getFindings,
        createFinding,
        updateFinding,
        updateFindingStatus,
        deleteFinding,

        // Evidencias
        uploadEvidence,
        deleteEvidence,

        // Acciones correctivas
        getActions,
        createAction,
        updateAction,
        updateActionStatus,
        deleteAction,

        // Reportes
        generateReport,
        downloadReport,
        previewReport,

        // Dashboard
        getDashboardStats,

        // Utilidades
        clearError
    }
}

export type { UseAuditsReturn }