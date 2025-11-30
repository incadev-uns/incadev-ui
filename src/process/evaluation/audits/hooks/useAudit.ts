// app/auditoria/hooks/useAudit.ts
import { useState, useEffect } from 'react'
import { config } from "@/config/evaluation-config"
import { userAuditAuth } from '@/process/evaluation/hooks/userAuditAuth' // Ajusta la ruta según donde esté
import type { Audit, AuditFormData, AuditResponse } from '../types/audit'

export const useAudit = () => {
    const [audits, setAudits] = useState<Audit[]>([])
    const [meta, setMeta] = useState<any>(null)
    const [links, setLinks] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const BASE_URL = config.apiUrl
    const { token, user, role, mounted } = userAuditAuth()

    // Helper para las headers comunes
    const getAuthHeaders = (): HeadersInit => {
        if (!token) {
            throw new Error('No hay token de autenticación')
        }

        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.replace(/"/g, "")}`,
            'X-Requested-With': 'XMLHttpRequest'
        }
    }

    const fetchAudits = async (page = 1) => {
        // Esperar a que la autenticación esté lista
        if (!mounted) return

        setLoading(true)
        setError(null)

        try {
            // Verificar autenticación
            if (!token) {
                throw new Error('No autenticado')
            }

            const url = `${BASE_URL}/api/audits?page=${page}`
            const response = await fetch(url, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                if (response.status === 401) {
                    handleAuthError('Sesión expirada')
                    return
                }
                throw new Error(`Error ${response.status} al cargar auditorías`)
            }

            const data: AuditResponse = await response.json()
            setAudits(data.data)
            setMeta(data.meta)
            setLinks(data.links)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
            setError(errorMessage)

            if (errorMessage === 'No autenticado') {
                handleAuthError('Debes iniciar sesión')
            }
        } finally {
            setLoading(false)
        }
    }

    const createAudit = async (data: AuditFormData): Promise<boolean> => {
        try {
            if (!token) {
                handleAuthError('No autenticado')
                return false
            }

            const url = `${BASE_URL}/api/audits`
            const response = await fetch(url, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            })

            if (response.ok) {
                await fetchAudits(meta?.current_page || 1)
                return true
            }

            if (response.status === 401) {
                handleAuthError('Sesión expirada')
            }
            return false
        } catch (err) {
            setError('Error al crear auditoría')
            return false
        }
    }

    const updateAudit = async (id: number, data: AuditFormData): Promise<boolean> => {
        try {
            if (!token) {
                handleAuthError('No autenticado')
                return false
            }

            const url = `${BASE_URL}/api/audits/${id}`
            const response = await fetch(url, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            })

            if (response.ok) {
                await fetchAudits(meta?.current_page || 1)
                return true
            }

            if (response.status === 401) {
                handleAuthError('Sesión expirada')
            }
            return false
        } catch (err) {
            setError('Error al actualizar auditoría')
            return false
        }
    }

    const startAudit = async (id: number): Promise<boolean> => {
        try {
            if (!token) {
                handleAuthError('No autenticado')
                return false
            }

            const url = `${BASE_URL}/api/audits/${id}/start`
            const response = await fetch(url, {
                method: 'PUT',
                headers: getAuthHeaders()
            })

            if (response.ok) {
                await fetchAudits(meta?.current_page || 1)
                return true
            } else {
                if (response.status === 401) {
                    handleAuthError('Sesión expirada')
                    return false
                }

                // Manejar error específico de auditoría ya iniciada
                const errorText = await response.text()
                console.error('Error detallado:', errorText)

                try {
                    const errorData = JSON.parse(errorText)
                    // Este es el mensaje específico del servidor
                    setError(errorData.message)

                    // Si es porque ya está iniciada, refrescar los datos
                    if (errorData.message.includes('ya fue iniciada')) {
                        await fetchAudits(meta?.current_page || 1) // ← Refrescar datos
                    }
                } catch {
                    setError(`Error ${response.status}: No se pudo iniciar la auditoría`)
                }
                return false
            }
        } catch (err) {
            console.error('Error completo:', err)
            setError('Error de conexión al iniciar auditoría')
            return false
        }
    }

    // En useAudit.ts
    const generateReport = async (id: number): Promise<boolean> => {
        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "")
            const response = await fetch(`${BASE_URL}/api/audits/${id}/report/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.ok
        } catch (err) {
            console.error('Error generando reporte:', err)
            return false
        }
    }

    const downloadReport = async (id: number) => {
        try {
            if (!token) {
                handleAuthError('No autenticado')
                return
            }

            const url = `${BASE_URL}/api/audits/${id}/report/download?token=${token}`
            window.open(url, "_blank")
        } catch (err) {
            setError('Error al descargar reporte')
        }
    }

    // Función centralizada para manejar errores de auth
    const handleAuthError = (message: string = 'Error de autenticación') => {
        setError(message)
        // Limpiar localStorage
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("role")
        // Redirigir al login después de un breve delay
        setTimeout(() => {
            window.location.href = '/login'
        }, 2000)
    }

    useEffect(() => {
        if (mounted && token) {
            fetchAudits(1)
        } else if (mounted && !token) {
            setError('No autenticado. Redirigiendo...')
            setTimeout(() => {
                window.location.href = '/login'
            }, 1000)
        }
    }, [mounted, token])

    return {
        audits,
        meta,
        links,
        loading,
        error,
        user,
        role,
        token,
        refresh: () => fetchAudits(meta?.current_page || 1),
        setPage: fetchAudits,
        createAudit,
        updateAudit,
        startAudit,
        generateReport,
        downloadReport
    }
}