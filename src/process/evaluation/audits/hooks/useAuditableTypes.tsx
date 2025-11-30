// hooks/useAuditableTypes.ts
import { useState, useEffect } from "react"
import { auditService } from "@/process/evaluation/audits/services/audit-service"

export function useAuditableTypes() {
    const [auditableTypes, setAuditableTypes] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadAuditableTypes()
    }, [])

    const loadAuditableTypes = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await auditService.getAuditableTypes()
            setAuditableTypes(response.data || {})
        } catch (error: any) {
            console.error("Error cargando tipos auditables:", error)
            setError(error?.message || "Error al cargar los tipos auditables")
        } finally {
            setLoading(false)
        }
    }

    const getAuditableSubtypes = async (type: string) => {
        try {
            const response = await auditService.getAuditableSubtypes(type)
            return response.data || {}
        } catch (error: any) {
            console.error("Error cargando subtipos:", error)
            return {}
        }
    }

    return {
        auditableTypes,
        loading,
        error,
        refetch: loadAuditableTypes,
        getAuditableSubtypes
    }
}