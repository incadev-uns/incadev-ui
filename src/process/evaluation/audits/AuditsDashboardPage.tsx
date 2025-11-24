"use client"

import AuditLayout from "@/process/evaluation/AuditLayout"
import { AuditSectionCards } from "./components/AuditSectionCards"
import { useEffect, useState } from "react"
import { auditService } from "@/process/evaluation/audits/services/audit-service"
import { AuditTable } from "@/process/evaluation/audits/components/AuditTable"
import { AuditChartInteractive } from "./components/AuditChartInteractive"
import { userAuditAuth } from "../hooks/userAuditAuth"
import type { Audit, DashboardStatsData } from "./types/audits"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

const defaultStats: DashboardStatsData = {
    audits: {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
    },
    findings: {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        wont_fix: 0
    },
    actions: {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
    },
    audits_over_time: []
}

export default function AuditsDashboardPage() {
    const [stats, setStats] = useState<DashboardStatsData>(defaultStats)
    const [audits, setAudits] = useState<Audit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const { role, user, mounted } = userAuditAuth()

    useEffect(() => {
        const fetchData = async () => {
            if (!mounted) return

            try {
                setLoading(true)
                setError(null)

                // Estadísticas solo para audit_manager
                if (role === "audit_manager") {
                    const response = await auditService.getDashboardStats()

                    if (response?.success && response.data) {
                        setStats(response.data)
                    } else {
                        setStats(defaultStats)
                    }
                }

                // Lista de auditorías para ambos roles
                try {
                    const auditsResponse = await auditService.listAll()

                    let auditsData: Audit[] = []

                    if (Array.isArray(auditsResponse)) {
                        auditsData = auditsResponse
                    } else if (auditsResponse?.data && Array.isArray(auditsResponse.data)) {
                        auditsData = auditsResponse.data
                    } else {
                        auditsData = []
                    }

                    setAudits(auditsData)
                } catch (auditsError: any) {
                    console.error("❌ Error cargando auditorías:", auditsError)
                    setError(`Error al cargar las auditorías: ${auditsError.message}`)
                    setAudits([])
                }
            } catch (err: any) {
                console.error("❌ Error general del dashboard:", err)
                setError(err?.message || "Error desconocido al cargar el dashboard")
            } finally {
                setLoading(false)
            }
        }

        if (mounted) {
            fetchData()
        }
    }, [retryCount, role, mounted, user?.id])

    const handleRetry = () => {
        setRetryCount(prev => prev + 1)
        setError(null)
    }

    const getDashboardTitle = () => {
        return role === "audit_manager" ? "Jefe de Auditorías" : "Auditor"
    }

    const getDashboardDescription = () => {
        if (role === "audit_manager") {
            return `Resumen completo del sistema - ${stats.audits.total} auditorías en total`
        }
        return `Sistema de auditorías - ${audits.length} auditoría${audits.length !== 1 ? "s" : ""} disponibles`
    }

    if (loading || !mounted) {
        return (
            <AuditLayout title={`Dashboard de Auditorías - ${getDashboardTitle()}`}>
                <div className="flex flex-1 items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Cargando dashboard...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {role === "audit_manager"
                                ? "Cargando estadísticas completas del sistema"
                                : "Cargando auditorías del sistema"}
                        </p>
                    </div>
                </div>
            </AuditLayout>
        )
    }

    return (
        <AuditLayout title={`Dashboard de Auditorías - ${getDashboardTitle()}`}>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {error && (
                            <div className="px-4 lg:px-6">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <span className="flex-1">{error}</span>
                                        <button
                                            onClick={handleRetry}
                                            className="px-3 py-1 text-sm text-destructive rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                                        >
                                            Reintentar Carga
                                        </button>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <div className="px-4 lg:px-6">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Dashboard de Auditorías
                                </h1>
                                <p className="text-muted-foreground mt-2">
                                    {getDashboardDescription()}
                                </p>
                                {user && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {getDashboardTitle()} • ID: {user.id} •{" "}
                                        {user.name || user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {role === "audit_manager" && (
                            <>
                                <div className="px-4 lg:px-6">
                                    <AuditSectionCards stats={stats} />
                                </div>

                                {stats.audits_over_time.length > 0 && (
                                    <div className="px-4 lg:px-6">
                                        {/* Ajusta según props de tu componente */}
                                        <AuditChartInteractive />
                                    </div>
                                )}
                            </>
                        )}

                        <div className="px-4 lg:px-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">
                                        {role === "audit_manager"
                                            ? "Todas las Auditorías del Sistema"
                                            : "Auditorías Disponibles"}
                                    </h2>
                                    <div className="text-sm text-muted-foreground">
                                        {audits.length} auditoría{audits.length !== 1 ? "s" : ""} en total
                                    </div>
                                </div>

                                <AuditTable audits={audits} loading={loading} />
                            </div>
                        </div>

                        {/* resto de bloques de responsabilidades e info del sistema los puedes dejar igual */}
                    </div>
                </div>
            </div>
        </AuditLayout>
    )
}
