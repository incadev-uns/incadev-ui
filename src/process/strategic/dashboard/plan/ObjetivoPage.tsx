import React, { useEffect, useState } from "react";
import { ObjetivoTable } from "../../components/plan/ObjetivoTable";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import { config as strategicConfig } from "@/config/strategic-config";
import { config as adminConfig } from "@/config/administrative-config";
import StrategicLayout from "../../StrategicLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DetailKpi {
  id?: number | string;
  name?: string;
  display_name?: string;
  goal_value?: number | string;
  current_value?: number | string;
  previous_value?: number | string;
  trend?: number | string;
  status?: string;
  updated_at?: string;
  unit?: string;
  target?: number;
}

interface Objetivo {
  id: number;
  plan_id: number;
  title: string;
  description: string;
  goal_value: string;
  weight: number;
  user_id: number;
  kpis: Array<DetailKpi | number | string | Array<number | string>>;
}

const normalizeNumber = (value: string | number | null | undefined) => {
  const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatTrend = (trend: number | string) => {
  const numeric = normalizeNumber(trend);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric}`;
};

const statusTone = (status: string) => {
  const normalized = status?.toLowerCase() || "";
  if (normalized.includes("atencion") || normalized.includes("ries"))
    return "bg-amber-100 text-amber-800";
  if (normalized.includes("ok") || normalized.includes("cumple"))
    return "bg-emerald-100 text-emerald-800";
  if (normalized.includes("alto")) return "bg-blue-100 text-blue-800";
  return "bg-slate-100 text-slate-800";
};

const extractKpiIds = (kpis: Objetivo["kpis"]) => {
  if (!Array.isArray(kpis)) return [];
  const flat = kpis.flat(3);
  return flat
    .map((k) => (typeof k === "number" ? k : Number(k)))
    .filter((id): id is number => Number.isFinite(id));
};

const filterKpisByIds = (list: DetailKpi[], ids: number[]) => {
  if (!ids.length) return [];
  return list.filter((k) => ids.includes(Number(k.id)));
};

const normalizeKpis = (kpis: DetailKpi[]) =>
  kpis.map((k) => ({
    id: Number(k.id) || 0,
    name: k.name || `kpi_${k.id ?? ""}`,
    display_name: k.display_name || k.name || `KPI ${k.id ?? ""}`,
    goal_value: normalizeNumber(k.goal_value),
    current_value: normalizeNumber(k.current_value),
    previous_value: normalizeNumber(k.previous_value),
    trend: normalizeNumber(k.trend),
    status: k.status || "Sin estado",
    updated_at: k.updated_at,
  }));

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [planId, setPlanId] = useState<string | null>(null);

  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [kpiObjective, setKpiObjective] = useState<string>("");
  const [kpis, setKpis] = useState<DetailKpi[]>([]);

  const { toast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Objetivo | null>(null);
  const [form, setForm] = useState({
    plan_id: "",
    title: "",
    description: "",
    goal_value: "",
    user_id: "",
    weight: "",
    kpisInput: "",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(`Bearer ${storedToken}`);

    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("planId");
    setPlanId(id);
  }, []);

  const fetchObjetivos = async () => {
    if (!token || !planId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicObjectives.list}?planId=${planId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      const sortedObjetivos = json.data.sort(
        (a: Objetivo, b: Objetivo) => a.id - b.id
      );

      setObjetivos(sortedObjetivos);
    } catch (err: any) {
      setError(err.message || "Error al cargar los objetivos");
    } finally {
      setLoading(false);
    }
  };

  const fetchKpisFromDetail = async (id: number) => {
    setKpiLoading(true);
    setKpiError(null);
    setKpis([]);

    try {
      const res = await fetch(
        `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicObjectives.get(id)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const detail = json?.data?.[0] ?? json?.data ?? json?.[0] ?? json?.["0"] ?? json;
      const rawKpis = detail?.kpis ?? json?.kpis ?? [];
      const ids = extractKpiIds(rawKpis as Objetivo["kpis"]);
      const detailedFromDetail = Array.isArray(detail?.["kpis-contend"])
        ? filterKpisByIds(detail["kpis-contend"] as DetailKpi[], ids)
        : [];
      const kpiObjects = Array.isArray(rawKpis)
        ? (rawKpis.flat(3).filter((k) => typeof k === "object") as DetailKpi[])
        : [];

      if (detailedFromDetail.length > 0) {
        setKpis(normalizeKpis(detailedFromDetail));
        return;
      }

      const filteredKpiObjects = filterKpisByIds(kpiObjects, ids);
      if (filteredKpiObjects.length > 0) {
        setKpis(normalizeKpis(filteredKpiObjects));
        return;
      }

      if (ids.length === 0) {
        setKpiError("Este objetivo no tiene KPIs asociados.");
        return;
      }

      // Fallback: pedir detalle de KPIs al servicio administrativo usando los IDs
      const query = `?ids=${ids.join(",")}`;
      const fallbackRes = await fetch(
        `${adminConfig.apiUrl}${adminConfig.endpoints.kpis}${query}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!fallbackRes.ok) throw new Error(`HTTP ${fallbackRes.status}`);
      const fallbackJson = await fallbackRes.json();
      const incoming = Array.isArray(fallbackJson.data) ? fallbackJson.data : [];
      setKpis(normalizeKpis(filterKpisByIds(incoming, ids)));
    } catch (err: any) {
      setKpiError(err?.message || "No se pudieron cargar los KPIs");
    } finally {
      setKpiLoading(false);
    }
  };

  const handleViewKpis = (id: number) => {
    const obj = objetivos.find((o) => o.id === id);
    if (!obj) return;

    if (!token) {
      toast({
        title: "No autorizado",
        description: "Token no disponible",
        variant: "destructive",
      });
      return;
    }

    setKpiObjective(obj.title || `Objetivo ${obj.id}`);
    setKpiModalOpen(true);
    fetchKpisFromDetail(id);
  };

  const handleEdit = (id: number) => {
    const obj = objetivos.find((o) => o.id === id) || null;
    setSelected(obj);
    if (obj) {
      setForm({
        plan_id: String(obj.plan_id ?? planId ?? ""),
        title: obj.title ?? "",
        description: obj.description ?? "",
        goal_value: String(obj.goal_value ?? ""),
        user_id: String(obj.user_id ?? ""),
        weight: String(obj.weight ?? ""),
        kpisInput:
          Array.isArray(obj.kpis) && obj.kpis.length
            ? extractKpiIds(obj.kpis).join(",")
            : "",
      });
    }
    setIsEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      toast({
        title: "No autorizado",
        description: "Token no disponible",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Desea eliminar este objetivo?")) return;

    try {
      const res = await fetch(
        `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicObjectives.delete(id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }

      setObjetivos((prev) => prev.filter((o) => o.id !== id));

      toast({
        title: "Objetivo eliminado",
        description: `El objetivo ${id} fue eliminado correctamente.`,
      });
    } catch (err: any) {
      toast({
        title: "Error al eliminar objetivo",
        description: err?.message || "No se pudo eliminar el objetivo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selected) return;
    if (!token) {
      toast({
        title: "No autorizado",
        description: "Token no disponible",
        variant: "destructive",
      });
      return;
    }

    const kpisArray = form.kpisInput
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));

    const payload = {
      plan_id: Number(form.plan_id),
      title: form.title,
      description: form.description,
      goal_value: Number(form.goal_value),
      user_id: Number(form.user_id),
      weight: Number(form.weight),
      kpis: kpisArray,
    };

    try {
      const res = await fetch(
        `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicObjectives.update(
          selected.id
        )}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }

      const json = await res.json().catch(() => null);

      setObjetivos((prev) =>
        prev.map((o) =>
          o.id === selected.id
            ? {
                ...o,
                plan_id: payload.plan_id,
                title: payload.title,
                description: payload.description,
                goal_value: String(payload.goal_value),
                user_id: payload.user_id,
                weight: payload.weight,
                kpis:
                  (json && (json.data?.kpis || json.kpis)) ??
                  payload.kpis.map((id) => ({ name: `KPI ${id}`, target: 0, unit: "" })),
              }
            : o
        )
      );

      setIsEditOpen(false);
      toast({
        title: "Objetivo actualizado",
        description: `Objetivo ${selected.id} actualizado correctamente.`,
      });
    } catch (err: any) {
      toast({
        title: "Error al actualizar",
        description: err?.message || "No se pudo actualizar el objetivo.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (token && planId) fetchObjetivos();
  }, [token, planId]);

  return (
    <StrategicLayout title="Dashboard - Gestion de Objetivos">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <DashboardBreadcrumb
          items={[
            { label: "Inicio" },
            { label: "Planes Estrategicos", href: "/estrategico/plan" },
            {
              label: `Plan ${planId}`,
              href: `/estrategico/plan/objetivos?planId=${planId}`,
            },
          ]}
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-gray-500">Objetivos vinculados al plan</p>
            <h1 className="text-2xl font-bold">Objetivos del Plan {planId}</h1>
          </div>
          <div className="flex gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">KPIs por objetivo</span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">Gestion rapida</span>
          </div>
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {loading ? (
          <p>Cargando objetivos...</p>
        ) : (
          <ObjetivoTable
            data={objetivos}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewKpis={handleViewKpis}
          />
        )}

        <Dialog open={kpiModalOpen} onOpenChange={setKpiModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>KPIs del objetivo</DialogTitle>
              <DialogDescription>
                {kpiObjective || "Revision de indicadores"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {kpiLoading && <p className="text-sm text-gray-600">Cargando KPIs...</p>}
              {kpiError && (
                <p className="text-sm text-red-600">{kpiError}</p>
              )}

              {!kpiLoading && !kpiError && kpis.length === 0 && (
                <p className="text-sm text-gray-600">No hay KPIs para mostrar.</p>
              )}

              {!kpiLoading && !kpiError && kpis.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {normalizeKpis(kpis).map((kpi) => (
                    <div
                      key={kpi.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">KPI #{kpi.id}</p>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {kpi.display_name || kpi.name}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(kpi.status)}`}>
                          {kpi.status}
                        </span>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-200">
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Meta</dt>
                          <dd className="text-base font-semibold">{normalizeNumber(kpi.goal_value)}</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Actual</dt>
                          <dd className="text-base font-semibold">{normalizeNumber(kpi.current_value)}</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Anterior</dt>
                          <dd className="text-base font-semibold">{normalizeNumber(kpi.previous_value)}</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Tendencia</dt>
                          <dd className="text-base font-semibold">{formatTrend(kpi.trend)}</dd>
                        </div>
                      </dl>

                      {kpi.updated_at && (
                        <p className="mt-3 text-xs text-gray-500">Actualizado: {new Date(kpi.updated_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Objetivo {selected?.id ?? ""}</DialogTitle>
              <DialogDescription>
                Modifique los campos y presione Guardar.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div>
                <Label>Titulo</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Descripcion</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Valor meta</Label>
                  <Input
                    value={form.goal_value}
                    onChange={(e) =>
                      setForm({ ...form, goal_value: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Peso</Label>
                  <Input
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>User ID</Label>
                  <Input
                    value={form.user_id}
                    onChange={(e) =>
                      setForm({ ...form, user_id: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>KPIs (IDs separados por coma)</Label>
                  <Input
                    value={form.kpisInput}
                    onChange={(e) =>
                      setForm({ ...form, kpisInput: e.target.value })
                    }
                    placeholder="e.g. 1,3,5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </StrategicLayout>
  );
}
