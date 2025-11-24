import { useState, useEffect } from "react"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Loader2,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  LogOut,
  MailWarning,
  ShieldAlert,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import type { SecurityEvent, SecurityEventStatistics, SecurityEventSeverity } from "@/types/security"
import {
  SecurityEventSeverityLabels,
  SecurityEventTypeLabels,
} from "@/types/security"

export default function SecurityEventsPage() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [statistics, setStatistics] = useState<SecurityEventStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [filterSeverity, setFilterSeverity] = useState<SecurityEventSeverity | "all">("all")
  const [statsPeriod, setStatsPeriod] = useState(30)

  useEffect(() => {
    if (!authLoading && user) {
      fetchEvents()
      fetchStatistics()
    }
  }, [authLoading, user, page])

  useEffect(() => {
    if (!authLoading && user) {
      fetchStatistics()
    }
  }, [statsPeriod])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await technologyApi.security.events.list(perPage, page)
      if (response.success && response.data) {
        setEvents(response.data)
        if (response.pagination) {
          setTotalPages(response.pagination.last_page || 1)
        }
      } else {
        toast.error("Error al cargar eventos de seguridad")
      }
    } catch (error: any) {
      console.error("Error fetching events:", error)
      toast.error(error.message || "Error al cargar eventos de seguridad")
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await technologyApi.security.events.statistics(statsPeriod)
      if (response.success && response.data) {
        setStatistics(response.data)
      }
    } catch (error: any) {
      console.error("Error fetching statistics:", error)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login_success": return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
      case "login_failed": return <XCircle className="w-4 h-4 text-destructive" />
      case "logout": return <LogOut className="w-4 h-4 text-muted-foreground" />
      case "token_created": return <Key className="w-4 h-4 text-primary" />
      case "token_revoked": return <Key className="w-4 h-4 text-orange-500 dark:text-orange-400" />
      case "session_terminated": return <UserX className="w-4 h-4 text-purple-500 dark:text-purple-400" />
      case "password_reset_requested": return <MailWarning className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
      case "password_changed": return <Lock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
      case "suspicious_activity": return <AlertTriangle className="w-4 h-4 text-destructive" />
      case "anomaly_detected": return <ShieldAlert className="w-4 h-4 text-destructive" />
      default: return <Activity className="w-4 h-4 text-muted-foreground" />
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

  const filteredEvents = filterSeverity === "all"
    ? events
    : events.filter(event => event.severity === filterSeverity)

  if (authLoading) {
    return (
      <TechnologyLayout title="Eventos de Seguridad">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Eventos de Seguridad">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary" />
              Eventos de Seguridad
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Historial completo de eventos de seguridad del sistema
            </p>
          </div>

          <Button onClick={() => { fetchEvents(); fetchStatistics(); }} variant="outline">
            <Loader2 className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Estadísticas */}
        {statistics && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Resumen de Eventos</h2>
              <Select
                value={statsPeriod.toString()}
                onValueChange={(value) => setStatsPeriod(parseInt(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Ultimos 7 dias</SelectItem>
                  <SelectItem value="30">Ultimos 30 dias</SelectItem>
                  <SelectItem value="90">Ultimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{statistics.total_events}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ultimos {statsPeriod} dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Eventos Criticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{statistics.critical_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.total_events > 0
                      ? `${Math.round((statistics.critical_count / statistics.total_events) * 100)}% del total`
                      : "0% del total"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Advertencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{statistics.warning_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.total_events > 0
                      ? `${Math.round((statistics.warning_count / statistics.total_events) * 100)}% del total`
                      : "0% del total"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Informativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{statistics.info_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.total_events > 0
                      ? `${Math.round((statistics.info_count / statistics.total_events) * 100)}% del total`
                      : "0% del total"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-foreground">Severidad:</label>
                <Select
                  value={filterSeverity}
                  onValueChange={(value) => setFilterSeverity(value as SecurityEventSeverity | "all")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Severidades</SelectItem>
                    <SelectItem value="critical">Critico</SelectItem>
                    <SelectItem value="warning">Advertencia</SelectItem>
                    <SelectItem value="info">Informacion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Eventos */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Eventos</CardTitle>
              <CardDescription>
                Mostrando {filteredEvents.length} evento(s) de {events.length} total(es)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm text-foreground">
                        {new Date(event.created_at).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.event_type)}
                          <span className="text-sm font-medium text-foreground">
                            {SecurityEventTypeLabels[event.event_type]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(event.severity)}>
                          {SecurityEventSeverityLabels[event.severity]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.user ? (
                          <div>
                            <div className="font-medium text-foreground">{event.user.name}</div>
                            <div className="text-xs text-muted-foreground">{event.user.email}</div>
                          </div>
                        ) : event.user_id ? (
                          <div>
                            <div className="font-medium text-foreground">Usuario ID: {event.user_id}</div>
                            <div className="text-xs text-muted-foreground">Sin datos de usuario</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-foreground">
                        {event.ip_address || <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.metadata && Object.keys(event.metadata).length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-primary hover:text-primary/80">
                              Ver metadata
                            </summary>
                            <pre className="text-xs mt-2 p-2 bg-muted rounded max-w-xs overflow-auto text-foreground">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-muted-foreground">Sin detalles</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Pagina {page} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              {filterSeverity !== "all"
                ? `No hay eventos con severidad "${SecurityEventSeverityLabels[filterSeverity as SecurityEventSeverity]}"`
                : "No hay eventos de seguridad"
              }
            </p>
          </div>
        )}
      </div>
    </TechnologyLayout>
  )
}
