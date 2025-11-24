import { useState, useEffect } from "react"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Shield,
  Monitor,
  AlertTriangle,
  Activity,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import type { SecurityDashboardData } from "@/types/security"
import {
  SecurityEventSeverityLabels,
  SecurityEventTypeLabels,
} from "@/types/security"

export default function AdminSecurityDashboard() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard()
    }
  }, [authLoading, user])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await technologyApi.security.dashboard()
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        toast.error("Error al cargar dashboard de seguridad")
      }
    } catch (error: any) {
      console.error("Error fetching security dashboard:", error)
      toast.error(error.message || "Error al cargar dashboard de seguridad")
    } finally {
      setLoading(false)
    }
  }

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (authLoading) {
    return (
      <TechnologyLayout title="Dashboard de Seguridad">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Dashboard de Seguridad">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Dashboard de Seguridad
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoreo de sesiones, eventos y alertas del sistema
            </p>
          </div>

          <Button onClick={fetchDashboard} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : dashboardData ? (
          <>
            {/* Alertas Críticas */}
            {dashboardData.alerts && (
              dashboardData.alerts.has_critical_events ||
              dashboardData.alerts.has_suspicious_sessions ||
              dashboardData.alerts.has_inactive_tokens
            ) && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas de Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dashboardData.alerts.has_critical_events && (
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-destructive/50">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-medium text-destructive">
                          Eventos criticos detectados ({dashboardData.events.critical_count})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = "/tecnologico/admin/eventos"}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  )}

                  {dashboardData.alerts.has_suspicious_sessions && (
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-orange-500/20">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        <span className="font-medium text-orange-500 dark:text-orange-400">
                          Sesiones sospechosas detectadas
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = "/tecnologico/admin/sesiones"}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  )}

                  {dashboardData.alerts.has_inactive_tokens && (
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                        <span className="font-medium text-yellow-500 dark:text-yellow-400">
                          Tokens inactivos detectados
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resumen de Sesiones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sesiones Activas */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sesiones Activas
                  </CardTitle>
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardData.sessions.total_active}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboardData.sessions.unique_ips} IP{dashboardData.sessions.unique_ips !== 1 ? "s" : ""} unica{dashboardData.sessions.unique_ips !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>

              {/* Sesiones Sospechosas */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sesiones Sospechosas
                  </CardTitle>
                  <AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">
                    {dashboardData.sessions.suspicious_count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboardData.sessions.has_suspicious ? "Requiere atencion" : "Sin alertas"}
                  </p>
                </CardContent>
              </Card>

              {/* Eventos (últimos 30 días) */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Eventos (30d)
                  </CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardData.events.total_last_30_days}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboardData.events.critical_count} critico{dashboardData.events.critical_count !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>

              {/* Eventos de Advertencia */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Advertencias
                  </CardTitle>
                  <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                    {dashboardData.events.warning_count}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ultimos 30 dias
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Eventos Críticos Recientes */}
            {dashboardData.events.recent_critical && dashboardData.events.recent_critical.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Eventos Criticos Recientes
                  </CardTitle>
                  <CardDescription>Ultimos 7 dias - Requieren atencion inmediata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.events.recent_critical.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityVariant(event.severity)}>
                              {SecurityEventSeverityLabels[event.severity]}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                              {SecurityEventTypeLabels[event.event_type]}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1">
                            {event.ip_address && (
                              <p>IP: {event.ip_address}</p>
                            )}
                            {event.user && (
                              <p>Usuario: {event.user.name} ({event.user.email})</p>
                            )}
                            <p>
                              {new Date(event.created_at).toLocaleString("es-ES", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {dashboardData.events.recent_critical.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => window.location.href = "/tecnologico/admin/eventos"}
                    >
                      Ver Todos los Eventos Criticos ({dashboardData.events.recent_critical.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rapidas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  onClick={() => window.location.href = "/tecnologico/admin/sesiones"}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Gestionar Sesiones
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/tecnologico/admin/eventos"}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Ver Eventos de Seguridad
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/tecnologico/admin/usuarios"}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gestionar Usuarios
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No hay datos de seguridad disponibles</p>
          </div>
        )}
      </div>
    </TechnologyLayout>
  )
}
