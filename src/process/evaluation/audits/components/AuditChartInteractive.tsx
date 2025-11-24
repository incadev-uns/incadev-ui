"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

import { auditService } from "@/process/evaluation/audits/services/audit-service"

// Tipo para los datos mensuales de auditorías basado en tu API
interface MonthlyAuditData {
    month: string // Formato: "2025-10-01"
    count: number
}

interface DashboardStatsResponse {
    audits: {
        total: number
        pending: number
        in_progress: number
        completed: number
        cancelled: number
    }
    findings: {
        total: number
        open: number
        in_progress: number
        resolved: number
        wont_fix: number
    }
    actions: {
        total: number
        pending: number
        in_progress: number
        completed: number
        cancelled: number
    }
    audits_over_time: MonthlyAuditData[]
}

export function AuditChartInteractive() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")
    const [chartData, setChartData] = React.useState<MonthlyAuditData[]>([])
    const [mounted, setMounted] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // ------------------------------------------
    // 1️⃣ Fix Astro hydration
    // ------------------------------------------
    React.useEffect(() => {
        setMounted(true)
    }, [])

    // ------------------------------------------
    // 2️⃣ Fetch real data from dashboard stats
    // ------------------------------------------
    React.useEffect(() => {
        const fetchAuditData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Intentar obtener datos del dashboard
                const response = await auditService.getDashboardStats()
                console.log("📊 Dashboard response:", response)

                const data = response.data as DashboardStatsResponse;

                if (data && Array.isArray(data.audits_over_time)) {
                    setChartData(data.audits_over_time);
                } else {
                    await generateDataFromAudits();
                }

            } catch (err) {
                console.error("❌ Error fetching dashboard data:", err)
                // Si falla el dashboard, intentar generar datos desde las auditorías
                await generateDataFromAudits()
            } finally {
                setLoading(false)
            }
        }

        const generateDataFromAudits = async () => {
            try {
                const auditsResponse = await auditService.listAll(1)
                const audits = auditsResponse.data

                if (audits.length === 0) {
                    setChartData(generateSampleData())
                    return
                }

                // Agrupar auditorías por mes
                const monthlyCounts = audits.reduce((acc: { [key: string]: number }, audit) => {
                    const auditDate = new Date(audit.audit_date || audit.created_at)
                    const monthKey = `${auditDate.getFullYear()}-${String(auditDate.getMonth() + 1).padStart(2, '0')}-01`

                    acc[monthKey] = (acc[monthKey] || 0) + 1
                    return acc
                }, {})

                // Convertir a array y ordenar por fecha
                const generatedData = Object.entries(monthlyCounts)
                    .map(([month, count]) => ({ month, count: count as number }))
                    .sort((a, b) => a.month.localeCompare(b.month))

                setChartData(generatedData.length > 0 ? generatedData : generateSampleData())

            } catch (auditError) {
                console.error("❌ Error generating data from audits:", auditError)
                setError("No se pudieron cargar los datos de auditorías")
                setChartData(generateSampleData())
            }
        }

        fetchAuditData()
    }, [])

    // ------------------------------------------
    // 3️⃣ Generar datos de ejemplo como fallback
    // ------------------------------------------
    const generateSampleData = (): MonthlyAuditData[] => {
        const months: MonthlyAuditData[] = []
        const today = new Date()

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
            const count = Math.floor(Math.random() * 5) + 1 // 1-6 auditorías por mes

            months.push({ month, count })
        }

        return months
    }

    // ------------------------------------------
    // 4️⃣ Transformar datos para el gráfico
    // ------------------------------------------
    const transformedData = React.useMemo(() => {
        if (!chartData.length) return []

        return chartData
            .map(item => ({
                date: item.month, // Ya viene en formato "2025-10-01"
                audits: item.count,
                month: item.month,
            }))
            .sort((a, b) => a.date.localeCompare(b.date)) // Asegurar orden cronológico
    }, [chartData])

    // ------------------------------------------
    // 5️⃣ Filtrar según rango de tiempo
    // ------------------------------------------
    const filteredData = React.useMemo(() => {
        if (!transformedData.length) return transformedData

        const now = new Date()
        let cutoffDate = new Date()

        switch (timeRange) {
            case "7d":
                cutoffDate.setDate(now.getDate() - 7)
                break
            case "30d":
                cutoffDate.setDate(now.getDate() - 30)
                break
            case "90d":
            default:
                cutoffDate.setDate(now.getDate() - 90)
                break
        }

        return transformedData.filter(item => {
            const itemDate = new Date(item.date)
            return itemDate >= cutoffDate
        })
    }, [transformedData, timeRange])

    // ------------------------------------------
    // 6️⃣ Configuración del gráfico
    // ------------------------------------------
    const chartConfig = {
        audits: {
            label: "Auditorías",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    // ------------------------------------------
    // 7️⃣ Calcular estadísticas para el subtítulo
    // ------------------------------------------
    const chartStats = React.useMemo(() => {
        if (transformedData.length === 0) return { total: 0, period: '' }

        const total = transformedData.reduce((sum, item) => sum + item.audits, 0)

        // Calcular el período cubierto
        const firstDate = new Date(transformedData[0].date)
        const lastDate = new Date(transformedData[transformedData.length - 1].date)

        const period = firstDate.getFullYear() === lastDate.getFullYear()
            ? firstDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) +
            ' - ' +
            lastDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
            : firstDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) +
            ' - ' +
            lastDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

        return { total, period }
    }, [transformedData])

    // ------------------------------------------
    // 8️⃣ Loading y Error states
    // ------------------------------------------
    if (!mounted) {
        return (
            <Card className="h-[280px] mx-4 mt-4 animate-pulse bg-muted/30 rounded-xl" />
        )
    }

    if (loading) {
        return (
            <Card className="h-[280px] mx-4 mt-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Cargando datos...</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="@container/card mx-4 mt-4">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Evolución de Auditorías</CardTitle>
                        <CardDescription>
                            {transformedData.length > 0 ? (
                                <>
                                    {chartStats.total} auditorías registradas
                                    {chartStats.period && ` • ${chartStats.period}`}
                                </>
                            ) : (
                                "Actividad mensual de auditorías"
                            )}
                        </CardDescription>
                    </div>

                    <CardAction>
                        {/* Desktop Toggle */}
                        <ToggleGroup
                            value={timeRange}
                            onValueChange={setTimeRange}
                            type="single"
                            variant="outline"
                            className="hidden @[700px]/card:flex"
                        >
                            <ToggleGroupItem value="90d">90 días</ToggleGroupItem>
                            <ToggleGroupItem value="30d">30 días</ToggleGroupItem>
                            <ToggleGroupItem value="7d">7 días</ToggleGroupItem>
                        </ToggleGroup>

                        {/* Mobile Select */}
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="@[700px]/card:hidden w-32" size="sm">
                                <SelectValue placeholder="Rango" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="90d">90 días</SelectItem>
                                <SelectItem value="30d">30 días</SelectItem>
                                <SelectItem value="7d">7 días</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardAction>
                </div>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {error && (
                    <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                        {error} (mostrando datos de ejemplo)
                    </div>
                )}

                {filteredData.length === 0 && !loading ? (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                        No hay datos disponibles para el período seleccionado
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[260px] w-full"
                    >
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="fillAudits" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--primary)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--primary)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} className="opacity-40" />

                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString("es-PE", {
                                        month: "short",
                                        year: filteredData.length > 6 ? "2-digit" : undefined,
                                    })
                                }}
                            />

                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        labelFormatter={(value) => {
                                            const date = new Date(value)
                                            return date.toLocaleDateString("es-PE", {
                                                month: "long",
                                                year: "numeric",
                                            })
                                        }}
                                    />
                                }
                            />

                            <Area
                                type="monotone"
                                dataKey="audits"
                                stroke="var(--primary)"
                                fill="url(#fillAudits)"
                                strokeWidth={2}
                                dot={{
                                    r: 3,
                                    fill: "var(--primary)",
                                    strokeWidth: 2,
                                    stroke: "#fff"
                                }}
                                activeDot={{
                                    r: 5,
                                    fill: "var(--primary)",
                                    strokeWidth: 2,
                                    stroke: "#fff"
                                }}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}