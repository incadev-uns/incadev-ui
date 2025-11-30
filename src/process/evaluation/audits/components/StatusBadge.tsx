// app/auditoria/components/StatusBadge.tsx
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: string
    type: 'audit' | 'finding' | 'action'
    className?: string
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
    // Configuración de estados con tipos seguros
    const statusConfig = {
        audit: {
            pending: { label: 'Pendiente', variant: 'secondary' as const },
            in_progress: { label: 'En Progreso', variant: 'default' as const },
            completed: { label: 'Completada', variant: 'success' as const },
            cancelled: { label: 'Cancelada', variant: 'destructive' as const }
        },
        finding: {
            open: { label: 'Abierto', variant: 'secondary' as const },
            in_progress: { label: 'En Progreso', variant: 'default' as const },
            resolved: { label: 'Resuelto', variant: 'success' as const },
            wont_fix: { label: 'No se Corregirá', variant: 'destructive' as const }
        },
        action: {
            pending: { label: 'Pendiente', variant: 'secondary' as const },
            in_progress: { label: 'En Progreso', variant: 'default' as const },
            completed: { label: 'Completada', variant: 'success' as const },
            cancelled: { label: 'Cancelada', variant: 'destructive' as const }
        }
    } as const

    // ✅ Solución segura para TypeScript
    const getStatusConfig = () => {
        const typeConfig = statusConfig[type]

        // Verificar si el status existe en la configuración
        if (status in typeConfig) {
            return typeConfig[status as keyof typeof typeConfig]
        }

        // Fallback para estados desconocidos
        return { label: status, variant: 'outline' as const }
    }

    const config = getStatusConfig()

    return (
        <Badge variant={config.variant} className={cn("capitalize", className)}>
            {config.label}
        </Badge>
    )
}