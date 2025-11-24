"use client";

import { useState, useEffect } from "react";
import TechnologyLayout from "@/process/technology/TechnologyLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Server,
  HardDrive,
  Package,
  Key,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
  Shield,
  Cpu,
  MemoryStick,
  Wrench,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { config } from "@/config/technology-config";
import { routes } from "@/process/technology/technology-site";
import { toast } from "sonner";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return token.replace(/^"|"$/g, "");
};

interface DashboardStats {
  totalAssets: number;
  assetsInUse: number;
  assetsInRepair: number;
  assetsDisposed: number;
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  expiringLicenses: number;
  totalSoftware: number;
  totalHardware: number;
}

interface RecentActivity {
  id: number;
  type: "asset" | "license" | "software";
  action: string;
  name: string;
  date: string;
}

export default function InfrastructureDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    assetsInUse: 0,
    assetsInRepair: 0,
    assetsDisposed: 0,
    totalLicenses: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
    expiringLicenses: 0,
    totalSoftware: 0,
    totalHardware: 0,
  });
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [expiringLicenses, setExpiringLicenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch all data in parallel
      const [assetsRes, licensesRes, softwareRes, hardwareRes] = await Promise.all([
        fetch(`${config.apiUrl}${config.endpoints.infrastructure.assets.list}`, {
          headers,
          credentials: "include",
        }),
        fetch(`${config.apiUrl}${config.endpoints.infrastructure.licenses.list}`, {
          headers,
          credentials: "include",
        }),
        fetch(`${config.apiUrl}${config.endpoints.infrastructure.software.list}`, {
          headers,
          credentials: "include",
        }),
        fetch(`${config.apiUrl}${config.endpoints.infrastructure.hardware.list}`, {
          headers,
          credentials: "include",
        }),
      ]);

      // Check for auth errors
      if (!assetsRes.ok || !licensesRes.ok || !softwareRes.ok || !hardwareRes.ok) {
        const hasAuthError = [assetsRes, licensesRes, softwareRes, hardwareRes].some(
          (res) => res.status === 401 || res.status === 403
        );
        if (hasAuthError) {
          toast.error("Sesión expirada o sin permisos. Por favor, inicia sesión nuevamente.");
        }
      }

      const assetsData = assetsRes.ok ? await assetsRes.json() : { data: [] };
      const licensesData = licensesRes.ok ? await licensesRes.json() : { data: [] };
      const softwareData = softwareRes.ok ? await softwareRes.json() : { data: [] };
      const hardwareData = hardwareRes.ok ? await hardwareRes.json() : { data: [] };

      const assetsList = assetsData.data || assetsData || [];
      const licensesList = licensesData.data || licensesData || [];
      const softwareList = softwareData.data || softwareData || [];
      const hardwareList = hardwareData.data || hardwareData || [];

      const assets = Array.isArray(assetsList) ? assetsList : [];
      const licenses = Array.isArray(licensesList) ? licensesList : [];
      const software = Array.isArray(softwareList) ? softwareList : [];
      const hardware = Array.isArray(hardwareList) ? hardwareList : [];

      // Calculate stats
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const calculatedStats: DashboardStats = {
        totalAssets: assets.length,
        assetsInUse: assets.filter((a: any) => a.status === "in_use").length,
        assetsInRepair: assets.filter((a: any) => a.status === "in_repair").length,
        assetsDisposed: assets.filter((a: any) => a.status === "disposed").length,
        totalLicenses: licenses.length,
        activeLicenses: licenses.filter((l: any) => l.status === "active").length,
        expiredLicenses: licenses.filter((l: any) => l.status === "expired" || (l.expiration_date && new Date(l.expiration_date) < now)).length,
        expiringLicenses: licenses.filter((l: any) => {
          if (!l.expiration_date) return false;
          const expDate = new Date(l.expiration_date);
          return expDate > now && expDate <= thirtyDaysFromNow;
        }).length,
        totalSoftware: software.length,
        totalHardware: hardware.length,
      };

      setStats(calculatedStats);

      // Recent assets (last 5)
      const sortedAssets = [...assets].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      setRecentAssets(sortedAssets);

      // Expiring licenses (next 30 days)
      const expiring = licenses
        .filter((l: any) => {
          if (!l.expiration_date) return false;
          const expDate = new Date(l.expiration_date);
          return expDate > now && expDate <= thirtyDaysFromNow;
        })
        .sort((a: any, b: any) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())
        .slice(0, 5);
      setExpiringLicenses(expiring);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilExpiration = (dateString: string) => {
    const now = new Date();
    const expDate = new Date(dateString);
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      in_use: { label: "En uso", variant: "default" },
      in_storage: { label: "Almacenado", variant: "secondary" },
      in_repair: { label: "En reparación", variant: "outline" },
      disposed: { label: "Dado de baja", variant: "destructive" },
      lost: { label: "Perdido", variant: "destructive" },
      active: { label: "Activa", variant: "default" },
      expired: { label: "Expirada", variant: "destructive" },
      revoked: { label: "Revocada", variant: "destructive" },
    };
    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = "default",
    href,
  }: {
    title: string;
    value: number;
    subtitle?: string;
    icon: any;
    variant?: "default" | "success" | "warning" | "danger" | "info";
    href?: string;
  }) => {
    const variantStyles = {
      default: "border-border",
      success: "border-emerald-500/30 bg-emerald-500/5",
      warning: "border-amber-500/30 bg-amber-500/5",
      danger: "border-red-500/30 bg-red-500/5",
      info: "border-blue-500/30 bg-blue-500/5",
    };

    const iconStyles = {
      default: "bg-primary/10 text-primary",
      success: "bg-emerald-500/10 text-emerald-500",
      warning: "bg-amber-500/10 text-amber-500",
      danger: "bg-red-500/10 text-red-500",
      info: "bg-blue-500/10 text-blue-500",
    };

    return (
      <Card className={`${variantStyles[variant]} transition-all hover:shadow-md`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? "..." : value}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${iconStyles[variant]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          {href && (
            <Button variant="ghost" size="sm" className="mt-4 w-full justify-between" asChild>
              <a href={href}>
                Ver detalles
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <TechnologyLayout breadcrumbs={[{ label: "Dashboard de Infraestructura" }]}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Infraestructura</h1>
          <p className="text-muted-foreground mt-1">
            Gestión y monitoreo de activos tecnológicos, licencias y software
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Activos"
          value={stats.totalAssets}
          subtitle={`${stats.assetsInUse} en uso`}
          icon={Package}
          variant="info"
          href={routes.infrastructure.assets}
        />
        <StatCard
          title="Licencias Activas"
          value={stats.activeLicenses}
          subtitle={`${stats.totalLicenses} total`}
          icon={Key}
          variant="success"
          href={routes.infrastructure.licenses}
        />
        <StatCard
          title="Software Registrado"
          value={stats.totalSoftware}
          icon={HardDrive}
          variant="default"
          href={routes.infrastructure.software}
        />
        <StatCard
          title="Hardware"
          value={stats.totalHardware}
          icon={Cpu}
          variant="default"
          href={routes.infrastructure.assets}
        />
      </div>

      {/* Alerts Row */}
      {(stats.expiredLicenses > 0 || stats.expiringLicenses > 0 || stats.assetsInRepair > 0) && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {stats.expiredLicenses > 0 && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{stats.expiredLicenses} licencias expiradas</p>
                  <p className="text-sm text-muted-foreground">Requieren atención inmediata</p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.expiringLicenses > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{stats.expiringLicenses} próximas a vencer</p>
                  <p className="text-sm text-muted-foreground">En los próximos 30 días</p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.assetsInRepair > 0 && (
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Wrench className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{stats.assetsInRepair} en reparación</p>
                  <p className="text-sm text-muted-foreground">Activos fuera de servicio</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Activos Recientes</CardTitle>
              <CardDescription>Últimos activos registrados</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={routes.infrastructure.assets}>
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentAssets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay activos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{asset.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {asset.type} · {formatDate(asset.created_at)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(asset.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Licenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Licencias por Vencer</CardTitle>
              <CardDescription>Próximos 30 días</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={routes.infrastructure.licenses}>
                Ver todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : expiringLicenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-emerald-500 opacity-50" />
                <p>No hay licencias por vencer próximamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringLicenses.map((license) => {
                  const daysLeft = getDaysUntilExpiration(license.expiration_date);
                  return (
                    <div
                      key={license.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${daysLeft <= 7 ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                            <Key className={`h-4 w-4 ${daysLeft <= 7 ? "text-red-500" : "text-amber-500"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{license.provider || "Licencia"}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {license.key_code?.substring(0, 20)}...
                            </p>
                          </div>
                        </div>
                        <Badge variant={daysLeft <= 7 ? "destructive" : "outline"}>
                          {daysLeft} días
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Vence: {formatDate(license.expiration_date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a las funciones más usadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <a href={routes.infrastructure.assets}>
                <Package className="h-5 w-5 text-primary" />
                <span>Gestionar Activos</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <a href={routes.infrastructure.licenses}>
                <Key className="h-5 w-5 text-emerald-500" />
                <span>Gestionar Licencias</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <a href={routes.infrastructure.software}>
                <HardDrive className="h-5 w-5 text-blue-500" />
                <span>Catálogo de Software</span>
              </a>
            </Button>
            {/* TODO: Descomentar cuando el backend de servidores esté listo
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <a href={routes.infrastructure.servers}>
                <Server className="h-5 w-5 text-purple-500" />
                <span>Ver Servidores</span>
              </a>
            </Button>
            */}
          </div>
        </CardContent>
      </Card>
    </TechnologyLayout>
  );
}
