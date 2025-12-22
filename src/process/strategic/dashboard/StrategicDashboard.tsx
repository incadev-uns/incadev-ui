import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconMap2,
  IconTargetArrow,
  IconHandClick,
  IconBuildingCommunity,
  IconFolder,
  IconShieldCheck,
  IconActivity,
  IconChartBar,
  IconCalendarEvent,
} from "@tabler/icons-react";
import StrategicLayout from "../StrategicLayout";
import { config } from "@/config/strategic-config";

interface Counts {
  plans: number;
  objectives: number;
  agreements: number;
  organizations: number;
  documents: number;
  quality: number;
}

const initialCounts: Counts = {
  plans: 0,
  objectives: 0,
  agreements: 0,
  organizations: 0,
  documents: 0,
  quality: 0,
};

interface RecentItem {
  title: string;
  detail: string;
  when: string;
  icon: JSX.Element;
}

export default function StrategicDashboard() {
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay sesión activa para obtener el resumen.");
        setLoading(false);
        return;
      }

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const safeCount = async (path: string) => {
        try {
          const res = await fetch(`${config.apiUrl}${path}`, { headers });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          return json?.total ?? (Array.isArray(json?.data) ? json.data.length : 0) ?? 0;
        } catch (err) {
          console.error("Error cargando conteo", path, err);
          return 0;
        }
      };

      const fetchFirstPlanId = async () => {
        try {
          const res = await fetch(`${config.apiUrl}${config.endpoints.strategicPlans.list}`, {
            headers,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const first = Array.isArray(json?.data) ? json.data[0] : null;
          return first?.id ?? null;
        } catch (err) {
          console.error("Error obteniendo plan estratégico base", err);
          return null;
        }
      };

      const firstPlanId = await fetchFirstPlanId();

      const objectivesPromise = firstPlanId
        ? safeCount(config.endpoints.strategicObjectives.list(firstPlanId))
        : Promise.resolve(0);

      const [plans, objectives, agreements, organizations, documents, quality] = await Promise.all([
        safeCount(config.endpoints.strategicPlans.list),
        objectivesPromise,
        safeCount(config.endpoints.agreements.list),
        safeCount(config.endpoints.organizations.list),
        safeCount(config.endpoints.strategicDocuments.list),
        safeCount(config.endpoints.qualityStandards.list),
      ]);

      setCounts({ plans, objectives, agreements, organizations, documents, quality });

      const safeFirst = async (
        path: string,
        formatter: (item: any) => RecentItem | null
      ) => {
        try {
          const res = await fetch(`${config.apiUrl}${path}`, { headers });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const first = Array.isArray(json?.data) ? json.data[0] : null;
          return first ? formatter(first) : null;
        } catch (err) {
          console.error("Error cargando actividad", path, err);
          return null;
        }
      };

      const fmtDate = (value?: string) => {
        if (!value) return "Reciente";
        const d = new Date(value);
        return isNaN(d.getTime()) ? "Reciente" : d.toLocaleDateString("es-ES");
      };

      const [recentPlan, recentObjective, recentAgreement] = await Promise.all([
        safeFirst(config.endpoints.strategicPlans.list, (item) => ({
          title: item?.title || "Plan estratégico",
          detail: item?.description || "Actualización de plan",
          when: fmtDate(item?.updated_at || item?.created_at),
          icon: <IconMap2 className="h-5 w-5 text-orange-500" />,
        })),
        firstPlanId
          ? safeFirst(config.endpoints.strategicObjectives.list(firstPlanId), (item) => ({
              title: item?.title || "Objetivo estratégico",
              detail: item?.description || "Actualización de objetivo",
              when: fmtDate(item?.updated_at || item?.created_at),
              icon: <IconTargetArrow className="h-5 w-5 text-blue-500" />,
            }))
          : Promise.resolve(null),
        safeFirst(config.endpoints.agreements.list, (item) => ({
          title: item?.name || "Convenio",
          detail: item?.purpose || "Actualización de convenio",
          when: fmtDate(item?.updated_at || item?.created_at),
          icon: <IconHandClick className="h-5 w-5 text-purple-500" />,
        })),
      ]);

      setRecentItems(
        [recentPlan, recentObjective, recentAgreement].filter(Boolean) as RecentItem[]
      );
      setLoading(false);
    };

    fetchCounts();
  }, []);

  const summary = [
    { label: "Planes estratégicos", value: counts.plans, hint: "Activos en desarrollo", icon: <IconMap2 className="h-4 w-4 text-muted-foreground" /> },
    { label: "Objetivos", value: counts.objectives, hint: "Definidos y alineados", icon: <IconTargetArrow className="h-4 w-4 text-muted-foreground" /> },
    { label: "Convenios", value: counts.agreements, hint: "Vigentes y en curso", icon: <IconHandClick className="h-4 w-4 text-muted-foreground" /> },
    { label: "Organizaciones", value: counts.organizations, hint: "Instituciones vinculadas", icon: <IconBuildingCommunity className="h-4 w-4 text-muted-foreground" /> },
    { label: "Documentos", value: counts.documents, hint: "Repositorios y evidencias", icon: <IconFolder className="h-4 w-4 text-muted-foreground" /> },
    { label: "Calidad", value: counts.quality, hint: "Estándares evaluados", icon: <IconShieldCheck className="h-4 w-4 text-muted-foreground" /> },
  ];

  return (
    <StrategicLayout title="Dashboard - Gestión Estratégica">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Panel estratégico</h2>
          <p className="text-muted-foreground">
            Resumen de planes, objetivos, convenios, organizaciones, documentos y calidad.
          </p>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="py-3">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summary.map((item) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>Últimas actualizaciones en los módulos clave</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {loading ? (
                  [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : recentItems.length ? (
                  recentItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-4 rounded-md border p-4"
                    >
                      {item.icon}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.when}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Accesos rápidos</CardTitle>
              <CardDescription>Gestión rápida de cada módulo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/estrategico/admin/organizaciones"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconBuildingCommunity className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Organizaciones</p>
                  <p className="text-xs text-muted-foreground">Gestionar organizaciones vinculadas</p>
                </div>
              </a>

              <a
                href="/estrategico/admin/convenios"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconHandClick className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Convenios</p>
                  <p className="text-xs text-muted-foreground">Administrar convenios estratégicos</p>
                </div>
              </a>

              <a
                href="/estrategico/planning/planes-estrategicos"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconMap2 className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Planes estratégicos</p>
                  <p className="text-xs text-muted-foreground">Crear y gestionar planes</p>
                </div>
              </a>

              <a
                href="/estrategico/planning/objetivos"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconTargetArrow className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Objetivos</p>
                  <p className="text-xs text-muted-foreground">Definir y medir objetivos</p>
                </div>
              </a>

              <a
                href="/estrategico/admin/documentos"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconFolder className="h-5 w-5 text-indigo-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Documentos</p>
                  <p className="text-xs text-muted-foreground">Repositorio y evidencias</p>
                </div>
              </a>

              <a
                href="/estrategico/calidadeducativa"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <IconShieldCheck className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Calidad</p>
                  <p className="text-xs text-muted-foreground">Estándares y evaluaciones</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Estado del sistema estratégico</CardTitle>
            <CardDescription>Información general y próximas acciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Sistema</p>
                    <p className="text-xs text-muted-foreground">Gestión Estratégica v2.1</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Activo
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Base de datos</p>
                    <p className="text-xs text-muted-foreground">Conexión estable</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Conectado
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Usuarios activos</p>
                    <p className="text-xs text-muted-foreground">Sesiones en 24h</p>
                  </div>
                  <span className="text-sm font-bold">127</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Próximas reuniones</p>
                    <p className="text-xs text-muted-foreground">Esta semana</p>
                  </div>
                  <span className="text-sm font-bold">5</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Reportes pendientes</p>
                    <p className="text-xs text-muted-foreground">Por revisar</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">3</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Alertas</p>
                    <p className="text-xs text-muted-foreground">Indicadores críticos</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StrategicLayout>
  );
}
