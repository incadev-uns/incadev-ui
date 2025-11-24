import { config } from "@/config/evaluation-config"
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
    AuditDashboardResponse,
    DashboardStatsData,
    ListResponse,
    ApiResponse,
    AuditListResponse,
    AuditUser
} from "@/process/evaluation/audits/types/audits"

/* ================================
   🔐 TOKEN / HEADERS
================================ */
const getAuthToken = (): string => {
    const token = localStorage.getItem("token") || ""
    return token.replace(/^"|"$/g, "")
}

const getHeaders = (contentType: string = "application/json") => {
    const headers: HeadersInit = {
        "Authorization": `Bearer ${getAuthToken()}`,
    }

    // No agregar Content-Type para FormData (el navegador lo hace automáticamente)
    if (contentType !== "multipart/form-data") {
        headers["Content-Type"] = contentType
    }

    return headers
}

/* ================================
   📌 UTILIDADES
================================ */
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: `Error ${response.status}: ${response.statusText}`
        }))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }
    return response.json()
}

const buildUrl = (endpoint: string, params: Record<string, string | number> = {}) => {
    let url = `${config.apiUrl}${endpoint}`
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, String(params[key]))
    })
    return url
}

/* ================================
   📌 SERVICE PRINCIPAL
================================ */
export const auditService = {
    /* -----------------------------------------
       🔹 LISTAR TODAS LAS AUDITORÍAS (con paginación)
    ----------------------------------------- */
    async listAll(page: number = 1, filters?: any): Promise<AuditListResponse> {
        const params = new URLSearchParams()
        params.append('page', page.toString())

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params.append(key, value.toString())
                }
            })
        }

        const url = `${config.apiUrl}${config.endpoints.audits.list}?${params.toString()}`
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders()
        })
        return handleResponse<AuditListResponse>(response)
    },

    /* -----------------------------------------
       🔹 OBTENER UNA AUDITORÍA POR ID
    ----------------------------------------- */
    async getById(id: number): Promise<ApiResponse<Audit>> {
        const url = buildUrl(config.endpoints.audits.getById, { id })
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders()
        })
        return handleResponse<ApiResponse<Audit>>(response)
    },

    /* -----------------------------------------
       🔹 CREAR AUDITORÍA (solo audit_manager)
    ----------------------------------------- */
    async create(data: AuditFormData): Promise<ApiResponse<Audit>> {
        const url = buildUrl(config.endpoints.audits.create)
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ApiResponse<Audit>>(response)
    },

    /* -----------------------------------------
       🔹 ACTUALIZAR AUDITORÍA
    ----------------------------------------- */
    async update(id: number, data: Partial<AuditFormData>): Promise<ApiResponse<Audit>> {
        const url = buildUrl(config.endpoints.audits.getById, { id })
        const response = await fetch(url, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ApiResponse<Audit>>(response)
    },

    /* -----------------------------------------
       🔹 ELIMINAR AUDITORÍA
    ----------------------------------------- */
    async delete(id: number): Promise<ApiResponse<{ message: string }>> {
        const url = buildUrl(config.endpoints.audits.getById, { id })
        const response = await fetch(url, {
            method: "DELETE",
            headers: getHeaders(),
        })
        return handleResponse<ApiResponse<{ message: string }>>(response)
    },

    /* -----------------------------------------
       🔹 ACTUALIZAR RECOMENDACIÓN
    ----------------------------------------- */
    async updateRecommendation(id: number, data: RecommendationFormData): Promise<ApiResponse<Audit>> {
        const url = buildUrl(config.endpoints.audits.updateRecommendation, { id })
        const response = await fetch(url, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ApiResponse<Audit>>(response)
    },

    /* -----------------------------------------
       🔹 OBTENER HALLAZGOS DE AUDITORÍA
    ----------------------------------------- */
    async getFindings(auditId: number): Promise<ApiResponse<Finding[]>> {
        const url = buildUrl(config.endpoints.audits.getFindings, { id: auditId })
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders()
        })
        return handleResponse<ApiResponse<Finding[]>>(response)
    },

    /* -----------------------------------------
       🔹 CREAR HALLAZGO
    ----------------------------------------- */
    async createFinding(auditId: number, data: FindingFormData): Promise<ApiResponse<Finding>> {
        const url = buildUrl(config.endpoints.audits.createFinding, { id: auditId })
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ApiResponse<Finding>>(response)
    },

    /* -----------------------------------------
       🔹 ACTUALIZAR ESTADO DE HALLAZGO
    ----------------------------------------- */
    async updateFindingStatus(findingId: number, data: FindingStatusFormData): Promise<ApiResponse<Finding>> {
        const url = buildUrl(config.endpoints.audits.updateFindingStatus, { id: findingId })
        const response = await fetch(url, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ApiResponse<Finding>>(response)
    },

    /* -----------------------------------------
       🔹 ELIMINAR HALLAZGO
    ----------------------------------------- */
    async deleteFinding(findingId: number): Promise<ApiResponse<{ message: string }>> {
        const url = buildUrl(config.endpoints.audits.updateFindingStatus.replace('/status', ''), { id: findingId })
        const response = await fetch(url, {
            method: "DELETE",
            headers: getHeaders(),
        })
        return handleResponse<ApiResponse<{ message: string }>>(response)
    },

    /* -----------------------------------------
       🔹 SUBIR EVIDENCIA (archivo)
    ----------------------------------------- */
    async uploadEvidence(findingId: number, file: File): Promise<ApiResponse<any>> {
        const url = buildUrl(config.endpoints.audits.uploadEvidence, { id: findingId })

        const formData = new FormData()
        formData.append("file", file)
        formData.append("finding_id", findingId.toString())

        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders("multipart/form-data"),
            body: formData,
        })
        return handleResponse<ApiResponse<any>>(response)
    },

    /* -----------------------------------------
       🔹 ELIMINAR EVIDENCIA
    ----------------------------------------- */
    async deleteEvidence(evidenceId: number): Promise<ApiResponse<{ message: string }>> {
        const url = `${config.apiUrl}/api/evidences/${evidenceId}`
        const response = await fetch(url, {
            method: "DELETE",
            headers: getHeaders(),
        })
        return handleResponse<ApiResponse<{ message: string }>>(response)
    },

    /* -----------------------------------------
       🔹 CREAR ACCIÓN CORRECTIVA
    ----------------------------------------- */
    async createAction(findingId: number, data: ActionFormData): Promise<ApiResponse<ActionItem>> {
        const url = buildUrl(config.endpoints.audits.createAction, { id: findingId })
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ApiResponse<ActionItem>>(response)
    },

    /* -----------------------------------------
       🔹 ACTUALIZAR ESTADO DE ACCIÓN CORRECTIVA
    ----------------------------------------- */
    async updateActionStatus(actionId: number, data: ActionStatusFormData): Promise<ApiResponse<ActionItem>> {
        const url = buildUrl(config.endpoints.audits.updateActionStatus, { id: actionId })
        const response = await fetch(url, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ApiResponse<ActionItem>>(response)
    },

    /* -----------------------------------------
       🔹 ELIMINAR ACCIÓN CORRECTIVA
    ----------------------------------------- */
    async deleteAction(actionId: number): Promise<ApiResponse<{ message: string }>> {
        const url = buildUrl(config.endpoints.audits.updateActionStatus.replace('/status', ''), { id: actionId })
        const response = await fetch(url, {
            method: "DELETE",
            headers: getHeaders(),
        })
        return handleResponse<ApiResponse<{ message: string }>>(response)
    },

    /* -----------------------------------------
       🔹 REPORTES (PDF)
    ----------------------------------------- */
    async generateReport(auditId: number): Promise<ApiResponse<{ message: string; report_url?: string }>> {
        const url = buildUrl(config.endpoints.audits.generateReport, { id: auditId })
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders()
        })
        return handleResponse<ApiResponse<{ message: string; report_url?: string }>>(response)
    },

    async previewReport(auditId: number): Promise<Blob> {
        const url = buildUrl(config.endpoints.audits.previewReport, { id: auditId })
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
        })

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener la vista previa del reporte`)
        }
        return response.blob()
    },

    async downloadReport(auditId: number): Promise<Blob> {
        const url = buildUrl(config.endpoints.audits.downloadReport, { id: auditId })
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
        })

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo descargar el reporte`)
        }
        return response.blob()
    },

    /* -----------------------------------------
       🔹 DASHBOARD (solo audit_manager)
    ----------------------------------------- */
    async getDashboardStats(): Promise<AuditDashboardResponse> {
        // Verifica que el endpoint exista en la configuración
        const endpoint = config.endpoints.audits.dashboardStats || '/api/audits/dashboard'
        const url = buildUrl(endpoint)

        console.log('📊 Solicitando estadísticas del dashboard desde:', url)

        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Error en dashboard stats:', response.status, errorText)
            throw new Error(`Error ${response.status}: No se pudieron obtener las estadísticas del dashboard`)
        }

        const data = await response.json()
        console.log('📊 Datos recibidos del dashboard:', data)
        return data
    },

    /* -----------------------------------------
       🔹 OBTENER USUARIOS (para asignaciones)
    ----------------------------------------- */
    async getUsers(): Promise<ApiResponse<AuditUser[]>> {
        const url = `${config.apiUrl}/api/users?role=auditor`
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<ApiResponse<AuditUser[]>>(response)
    },

    /* -----------------------------------------
       🔹 OBTENER TIPOS AUDITABLES
    ----------------------------------------- */
    async getAuditableTypes(): Promise<ApiResponse<Record<string, string>>> {
        const url = `${config.apiUrl}/api/auditable-types`
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<ApiResponse<Record<string, string>>>(response)
    },

    async getAuditableSubtypes(type: string): Promise<ApiResponse<Record<string, string>>> {
        const url = `${config.apiUrl}/api/auditable-types/${type}/subtypes`
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<ApiResponse<Record<string, string>>>(response)
    }
}