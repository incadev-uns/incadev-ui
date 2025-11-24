// AuditSectionCards.tsx
import {
    IconTrendingUp,
    IconTrendingDown,
    IconAlertTriangle,
    IconChecklist,
    IconShieldCheck,
    IconProgress
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
    CardAction,
    CardFooter,
    CardContent,
} from "@/components/ui/card"
import type { DashboardStatsData } from "../types/audits"

interface Props {
    stats: DashboardStatsData
}

export function AuditSectionCards({ stats }: Props) {
    const { audits, findings, actions } = stats

    const auditCompletionRate =
        audits.total > 0 ? Math.round((audits.completed / audits.total) * 100) : 0

    const findingsResolutionRate =
        findings.total > 0 ? Math.round((findings.resolved / findings.total) * 100) : 0

    const actionsCompletionRate =
        actions.total > 0 ? Math.round((actions.completed / actions.total) * 100) : 0

    return (
        <div className="
            grid grid-cols-1 gap-6
            @xl/main:grid-cols-2 
            @4xl/main:grid-cols-4
            px-4 lg:px-6
        ">
            {/* CARD 1: AUDITORÍAS */}
            <Card className="@container/card group hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="flex items-center gap-2 text-sm font-medium">
                            <IconChecklist className="size-4" />
                            Auditorías Totales
                        </CardDescription>
                        <CardAction>
                            <Badge variant="secondary">
                                <IconTrendingUp className="size-3" />
                                Sistema
                            </Badge>
                        </CardAction>
                    </div>

                    <CardTitle className="text-3xl font-bold tabular-nums mt-2">
                        {audits.total}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pb-3">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completadas</span>
                            <span className="font-semibold">{audits.completed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">En Progreso</span>
                            <span className="font-semibold">{audits.in_progress}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pendientes</span>
                            <span className="font-semibold">{audits.pending}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full text-xs">
                        <span className="text-muted-foreground">Tasa de finalización</span>
                        <Badge variant="outline">{auditCompletionRate}%</Badge>
                    </div>
                </CardFooter>
            </Card>

            {/* CARD 2: HALLAZGOS */}
            <Card className="@container/card group hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="flex items-center gap-2 text-sm font-medium">
                            <IconAlertTriangle className="size-4" />
                            Hallazgos
                        </CardDescription>
                        <CardAction>
                            <Badge variant="secondary">
                                <IconTrendingDown className="size-3" />
                                Identificados
                            </Badge>
                        </CardAction>
                    </div>

                    <CardTitle className="text-3xl font-bold tabular-nums mt-2">
                        {findings.total}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pb-3">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Resueltos</span>
                            <span className="font-semibold">{findings.resolved}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">En Progreso</span>
                            <span className="font-semibold">{findings.in_progress}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Abiertos</span>
                            <span className="font-semibold">{findings.open}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full text-xs">
                        <span className="text-muted-foreground">Tasa de resolución</span>
                        <Badge variant="outline">{findingsResolutionRate}%</Badge>
                    </div>
                </CardFooter>
            </Card>

            {/* CARD 3: ACCIONES */}
            <Card className="@container/card group hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="flex items-center gap-2 text-sm font-medium">
                            <IconProgress className="size-4" />
                            Acciones Correctivas
                        </CardDescription>
                        <CardAction>
                            <Badge variant="secondary">
                                <IconTrendingUp className="size-3" />
                                Seguimiento
                            </Badge>
                        </CardAction>
                    </div>

                    <CardTitle className="text-3xl font-bold tabular-nums mt-2">
                        {actions.total}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pb-3">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completadas</span>
                            <span className="font-semibold">{actions.completed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">En Progreso</span>
                            <span className="font-semibold">{actions.in_progress}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pendientes</span>
                            <span className="font-semibold">{actions.pending}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full text-xs">
                        <span className="text-muted-foreground">Tasa de implementación</span>
                        <Badge variant="outline">{actionsCompletionRate}%</Badge>
                    </div>
                </CardFooter>
            </Card>

            {/* CARD 4: EFICIENCIA GENERAL */}
            <Card className="@container/card group hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="flex items-center gap-2 text-sm font-medium">
                            <IconShieldCheck className="size-4" />
                            Eficiencia General
                        </CardDescription>
                        <CardAction>
                            <Badge variant="secondary">
                                <IconTrendingUp className="size-3" />
                                Sistema
                            </Badge>
                        </CardAction>
                    </div>

                    <CardTitle className="text-3xl font-bold tabular-nums mt-2">
                        {Math.round((auditCompletionRate + findingsResolutionRate + actionsCompletionRate) / 3)}%
                    </CardTitle>
                </CardHeader>

                <CardContent className="pb-3">
                    {/* barras de progreso si quieres */}
                </CardContent>

                <CardFooter className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                        <IconShieldCheck className="size-3" />
                        <span>Promedio general del sistema</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
