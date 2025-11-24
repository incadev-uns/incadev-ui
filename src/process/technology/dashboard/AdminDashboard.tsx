import { useState, useEffect } from "react";
import TechnologyLayout from "@/process/technology/TechnologyLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconUsers,
  IconShieldLock,
  IconKey,
  IconActivity,
  IconUserCheck,
  IconUserX,
  IconLock,
  IconLockOpen,
  IconMail,
  IconMailOff,
  IconLogin,
  IconAlertTriangle,
  IconRefresh
} from "@tabler/icons-react";
import { config } from "@/config/technology-config";

interface DashboardData {
  users: {
    total: number;
    with_roles: number;
    without_roles: number;
    with_2fa: number;
    without_2fa: number;
    verified_emails: number;
    unverified_emails: number;
    new_last_30_days: number;
    by_role: Array<{ role: string; count: number }>;
  };
  roles: {
    total: number;
    with_users: number;
    without_users: number;
    with_permissions: number;
    top_roles: Array<{
      id: number;
      name: string;
      users_count: number;
      permissions_count: number;
    }>;
  };
  permissions: {
    total: number;
    in_use: number;
    unused: number;
    by_category: Record<string, number>;
  };
  activity: {
    active_tokens: number;
    expired_tokens: number;
    users_with_sessions: number;
    tokens_created_today: number;
    tokens_used_last_7_days: number;
    active_last_24_hours: number;
  };
  recent_actions: {
    recent_events: Array<{
      id: number;
      event_type: string;
      severity: string;
      user: { id: number; name: string; email: string } | null;
      ip_address: string;
      metadata: Record<string, string>;
      created_at: string;
    }>;
    event_stats_7_days: Record<string, number>;
    critical_events_count: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay sesión activa");
        return;
      }

      const response = await fetch(`${config.apiUrl}/admin/dashboard`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          return;
        }
        throw new Error("Error al cargar el dashboard");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError("No se pudieron cargar los datos");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login_success":
        return <IconLogin className="h-4 w-4 text-green-500" />;
      case "login_failed":
        return <IconAlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <IconActivity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventBadge = (eventType: string, severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      info: "secondary",
      warning: "outline",
      error: "destructive",
      critical: "destructive",
    };

    const labels: Record<string, string> = {
      login_success: "Inicio exitoso",
      login_failed: "Inicio fallido",
      logout: "Cierre de sesión",
      password_changed: "Contraseña cambiada",
    };

    return (
      <Badge variant={variants[severity] || "secondary"} className="text-[10px]">
        {labels[eventType] || eventType}
      </Badge>
    );
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      teacher: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      student: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      support: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[roleName] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <TechnologyLayout title="Dashboard - Administración">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Panel de Administración</h2>
          <p className="text-muted-foreground">
            Gestiona usuarios, roles y permisos del sistema.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
        >
          <IconRefresh className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.users.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{data?.users.new_last_30_days || 0} últimos 30 días
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles Activos</CardTitle>
            <IconShieldLock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.roles.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.roles.with_users || 0} con usuarios asignados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permisos</CardTitle>
            <IconKey className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.permissions.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.permissions.in_use || 0} en uso
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <IconActivity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.activity.active_tokens || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.activity.active_last_24_hours || 0} activas últimas 24h
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Stats Detail */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <IconUserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : data?.users.with_roles || 0}</p>
                <p className="text-xs text-muted-foreground">Con roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <IconUserX className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : data?.users.without_roles || 0}</p>
                <p className="text-xs text-muted-foreground">Sin roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <IconLock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : data?.users.with_2fa || 0}</p>
                <p className="text-xs text-muted-foreground">Con 2FA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <IconMail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : data?.users.verified_emails || 0}</p>
                <p className="text-xs text-muted-foreground">Emails verificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos eventos de seguridad del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : data?.recent_actions.recent_events.length ? (
              <div className="space-y-3">
                {data.recent_actions.recent_events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="mt-0.5">{getEventIcon(event.event_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {event.user?.name || event.metadata?.email || "Usuario desconocido"}
                        </span>
                        {getEventBadge(event.event_type, event.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.user?.email || event.metadata?.email}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{formatDate(event.created_at)}</p>
                      <p className="text-[10px] text-muted-foreground/70">{event.ip_address}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Roles */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Roles Principales</CardTitle>
            <CardDescription>Distribución de usuarios por rol</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.roles.top_roles.length ? (
              <div className="space-y-2">
                {data.roles.top_roles.slice(0, 6).map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(role.name)}`}
                      >
                        {role.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{role.users_count} usuarios</span>
                      <span>{role.permissions_count} permisos</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>No hay roles configurados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access & Event Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Gestiona los recursos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/tecnologico/admin/usuarios"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <IconUsers className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Gestionar Usuarios</p>
                <p className="text-xs text-muted-foreground">Crear, editar y eliminar usuarios</p>
              </div>
            </a>

            <a
              href="/tecnologico/admin/roles"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <IconShieldLock className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Gestionar Roles</p>
                <p className="text-xs text-muted-foreground">Configurar roles del sistema</p>
              </div>
            </a>

            <a
              href="/tecnologico/admin/permisos"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <IconKey className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Gestionar Permisos</p>
                <p className="text-xs text-muted-foreground">Administrar permisos de acceso</p>
              </div>
            </a>
          </CardContent>
        </Card>

        {/* Event Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos (7 días)</CardTitle>
            <CardDescription>Estadísticas de eventos de seguridad</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data?.recent_actions.event_stats_7_days ? (
              <div className="space-y-3">
                {Object.entries(data.recent_actions.event_stats_7_days).map(([event, count]) => (
                  <div key={event} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event)}
                      <span className="text-sm capitalize">{event.replace(/_/g, " ")}</span>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
                {data.recent_actions.critical_events_count > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2">
                      <IconAlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        {data.recent_actions.critical_events_count} eventos críticos
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                <p>Sin eventos registrados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users by Role Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
            <CardDescription>Distribución de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : data?.users.by_role.length ? (
              <div className="space-y-3">
                {data.users.by_role.slice(0, 5).map((item) => {
                  const percentage = data.users.total > 0
                    ? Math.round((item.count / data.users.total) * 100)
                    : 0;
                  return (
                    <div key={item.role} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{item.role}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                <p>Sin datos de roles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>Información general del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">API REST</p>
                <p className="text-xs text-muted-foreground">Laravel Backend</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Conectado
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Autenticación</p>
                <p className="text-xs text-muted-foreground">Sanctum + 2FA</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Activo
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Tokens Activos</p>
                <p className="text-xs text-muted-foreground">Sesiones del sistema</p>
              </div>
              <span className="text-lg font-bold">{data?.activity.active_tokens || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Usuarios Conectados</p>
                <p className="text-xs text-muted-foreground">Con sesión activa</p>
              </div>
              <span className="text-lg font-bold">{data?.activity.users_with_sessions || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TechnologyLayout>
  );
}
