import React, { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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

interface PlanningUser {
  id: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  roles?: Array<string | { name?: string; id?: string; role?: string }>;
}

const normalizeNumber = (value: string | number | null | undefined) => {
  const numeric =
    typeof value === "string" ? Number.parseFloat(value) : Number(value);
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

const isKpiCompleted = (kpi: any) => {
  const goal = normalizeNumber(kpi?.goal_value ?? kpi?.target);
  const current = normalizeNumber(
    kpi?.current_value ?? kpi?.value ?? kpi?.actual ?? kpi?.progress
  );
  if (goal <= 0) return false;
  return current >= goal;
};

const isObjectiveCompleted = (obj: Objetivo) => {
  if (!Array.isArray(obj.kpis) || obj.kpis.length === 0) return false;
  const kpiObjects = obj.kpis.filter(
    (k) => typeof k === "object"
  ) as DetailKpi[];
  if (kpiObjects.length === 0) return false;
  return kpiObjects.every((k) => isKpiCompleted(k));
};

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
  const [search, setSearch] = useState("");
  const [completionFilter, setCompletionFilter] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [kpiOptions, setKpiOptions] = useState<DetailKpi[]>([]);
  const [kpiOptionsLoading, setKpiOptionsLoading] = useState(false);
  const [kpiOptionsError, setKpiOptionsError] = useState<string | null>(null);
  const [planningUsers, setPlanningUsers] = useState<PlanningUser[]>([]);
  const [planningUsersLoading, setPlanningUsersLoading] = useState(false);
  const [planningUsersError, setPlanningUsersError] = useState<string | null>(
    null
  );

  const { toast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Objetivo | null>(null);
  const [editForm, setEditForm] = useState<{
    plan_id: string;
    title: string;
    description: string;
    goal_value: string;
    user_id: string;
    weight: string;
    kpis: number[];
  }>({
    plan_id: "",
    title: "",
    description: "",
    goal_value: "",
    user_id: "",
    weight: "",
    kpis: [],
  });
  const [createForm, setCreateForm] = useState<{
    plan_id: string;
    title: string;
    description: string;
    goal_value: string;
    user_id: string;
    weight: string;
    kpis: number[];
  }>({
    plan_id: "",
    title: "",
    description: "",
    goal_value: "",
    user_id: "",
    weight: "",
    kpis: [],
  });
  const [savingObjective, setSavingObjective] = useState(false);
  const [updatingObjective, setUpdatingObjective] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [kpiSearch, setKpiSearch] = useState("");
  const [editKpiSearch, setEditKpiSearch] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(`Bearer ${storedToken}`);

    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("planId");
    setPlanId(id);
  }, []);

  useEffect(() => {
    if (planId) {
      setCreateForm((prev) => ({
        ...prev,
        plan_id: prev.plan_id || planId,
      }));
      setEditForm((prev) => ({
        ...prev,
        plan_id: prev.plan_id || planId,
      }));
    }
  }, [planId]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(
          `${strategicConfig.apiUrl}${strategicConfig.endpoints.user.me}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: token,
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data?.id) setUserId(Number(data.id));
      } catch (err) {
        console.error("No se pudo obtener el usuario", err);
      }
    };
    fetchUser();
  }, [token]);

  useEffect(() => {
    if (userId) {
      setCreateForm((prev) =>
        prev.user_id
          ? prev
          : {
              ...prev,
              user_id: String(userId),
            }
      );
      setEditForm((prev) =>
        prev.user_id
          ? prev
          : {
              ...prev,
              user_id: String(userId),
            }
      );
    }
  }, [userId]);

  const fetchObjetivos = async () => {
    if (!token || !planId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          strategicConfig.apiUrl
        }${strategicConfig.endpoints.strategicObjectives.list(planId)}`,
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

  const fetchKpiOptions = async () => {
    if (!token) return;
    setKpiOptionsLoading(true);
    setKpiOptionsError(null);

    try {
      const res = await fetch(
        `${adminConfig.apiUrl}${adminConfig.endpoints.kpis}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const incoming = Array.isArray(json?.data) ? json.data : [];
      setKpiOptions(incoming);
    } catch (err: any) {
      setKpiOptionsError(err?.message || "No se pudieron cargar los KPIs");
      setKpiOptions([]);
    } finally {
      setKpiOptionsLoading(false);
    }
  };

  const fetchPlanningUsers = async () => {
    if (!token) return;
    setPlanningUsersLoading(true);
    setPlanningUsersError(null);

    try {
      const rolesParam = "roles=continuous_improvement,planner_admin,planner";
      const res = await fetch(
        `${strategicConfig.apiUrl}${strategicConfig.endpoints.planningUsers}?${rolesParam}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const incoming = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.users)
        ? json.users
        : Array.isArray(json)
        ? json
        : [];

      const allowedRoles = new Set([
        "continuous_improvement",
        "planner_admin",
        "planner",
      ]);
      const filteredUsers = incoming.filter((user: PlanningUser) => {
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        if (!roles.length) return true;

        return roles.some((role: any) => {
          if (typeof role === "string")
            return allowedRoles.has(role.toLowerCase());
          const roleName = role?.name || role?.id || role?.role;
          return (
            typeof roleName === "string" &&
            allowedRoles.has(roleName.toLowerCase())
          );
        });
      });

      setPlanningUsers(filteredUsers);
    } catch (err: any) {
      setPlanningUsersError(
        err?.message || "No se pudieron cargar los usuarios"
      );
      setPlanningUsers([]);
    } finally {
      setPlanningUsersLoading(false);
    }
  };

  const fetchKpisFromDetail = async (id: number) => {
    if (!planId) {
      setKpiError("Plan no disponible para cargar KPIs.");
      setKpiLoading(false);
      return;
    }

    setKpiLoading(true);
    setKpiError(null);
    setKpis([]);

    try {
      const res = await fetch(
        `${
          strategicConfig.apiUrl
        }${strategicConfig.endpoints.strategicObjectives.get(planId, id)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const detail =
        json?.data?.[0] ?? json?.data ?? json?.[0] ?? json?.["0"] ?? json;
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
      const incoming = Array.isArray(fallbackJson.data)
        ? fallbackJson.data
        : [];
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
      setEditForm({
        plan_id: String(obj.plan_id ?? planId ?? ""),
        title: obj.title ?? "",
        description: obj.description ?? "",
        goal_value: String(obj.goal_value ?? ""),
        user_id: String(obj.user_id ?? ""),
        weight:
          obj.weight === null || obj.weight === undefined
            ? ""
            : String(obj.weight),
        kpis: extractKpiIds(obj.kpis),
      });
      setEditKpiSearch("");
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

    const targetPlanId = objetivos.find((o) => o.id === id)?.plan_id || planId;
    if (!targetPlanId) {
      toast({
        title: "Plan no disponible",
        description: "No se pudo determinar el plan para eliminar el objetivo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(
        `${
          strategicConfig.apiUrl
        }${strategicConfig.endpoints.strategicObjectives.delete(
          targetPlanId,
          id
        )}`,
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

    const effectivePlanId = Number(editForm.plan_id || planId);
    const effectiveUserId = Number(editForm.user_id || userId);
    const goalValue = Number(editForm.goal_value);
    const weightValue = editForm.weight === "" ? null : Number(editForm.weight);

    if (
      !effectivePlanId ||
      !editForm.title.trim() ||
      !editForm.description.trim() ||
      !Number.isFinite(goalValue) ||
      !effectiveUserId
    ) {
      toast({
        title: "Campos requeridos",
        description:
          "Plan, titulo, descripcion, meta y usuario son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      plan_id: effectivePlanId,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      goal_value: goalValue,
      user_id: effectiveUserId,
      weight: Number.isFinite(weightValue) ? weightValue : null,
      kpis: editForm.kpis,
    };

    setUpdatingObjective(true);
    try {
      const res = await fetch(
        `${
          strategicConfig.apiUrl
        }${strategicConfig.endpoints.strategicObjectives.update(
          effectivePlanId,
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
                weight: payload.weight ?? o.weight,
                kpis:
                  (json && (json.data?.kpis || json.kpis)) ??
                  payload.kpis.map((id) => ({
                    name: `KPI ${id}`,
                    target: 0,
                    unit: "",
                  })),
              }
            : o
        )
      );

      setIsEditOpen(false);
      setSelected(null);
      setEditForm({
        plan_id: planId ?? "",
        title: "",
        description: "",
        goal_value: "",
        user_id: userId ? String(userId) : "",
        weight: "",
        kpis: [],
      });
      setEditKpiSearch("");

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
    } finally {
      setUpdatingObjective(false);
    }
  };

  const handleCreateObjective = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!token) {
      toast({
        title: "No autorizado",
        description: "Token no disponible",
        variant: "destructive",
      });
      return;
    }

    const effectivePlanId = Number(createForm.plan_id || planId);
    const effectiveUserId = Number(createForm.user_id || userId);
    const goalValue = Number(createForm.goal_value);

    if (
      !effectivePlanId ||
      !createForm.title.trim() ||
      !createForm.description.trim() ||
      !Number.isFinite(goalValue) ||
      !effectiveUserId
    ) {
      toast({
        title: "Campos requeridos",
        description:
          "Plan, titulo, descripcion, meta y usuario son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const weightValue =
      createForm.weight === "" ? null : Number(createForm.weight);

    const payload = {
      plan_id: effectivePlanId,
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      goal_value: goalValue,
      user_id: effectiveUserId,
      weight: Number.isFinite(weightValue) ? weightValue : null,
      kpis: createForm.kpis,
    };

    setSavingObjective(true);
    try {
      const res = await fetch(
        `${
          strategicConfig.apiUrl
        }${strategicConfig.endpoints.strategicObjectives.create(
          effectivePlanId
        )}`,
        {
          method: "POST",
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

      await fetchObjetivos();

      setCreateForm({
        plan_id: planId ?? "",
        title: "",
        description: "",
        goal_value: "",
        user_id: userId ? String(userId) : "",
        weight: "",
        kpis: [],
      });

      setKpiSearch("");
      setIsCreateOpen(false);

      toast({
        title: "Objetivo registrado",
        description: `Se registro el objetivo "${payload.title}".`,
      });
    } catch (err: any) {
      toast({
        title: "Error al registrar",
        description: err?.message || "No se pudo crear el objetivo.",
        variant: "destructive",
      });
    } finally {
      setSavingObjective(false);
    }
  };

  useEffect(() => {
    if (token && planId) fetchObjetivos();
  }, [token, planId]);

  useEffect(() => {
    if (token) fetchKpiOptions();
  }, [token]);

  useEffect(() => {
    if (token) fetchPlanningUsers();
  }, [token]);

  useEffect(() => {
    if (!planningUsers.length) return;
    const preferredId =
      (userId && String(userId)) ||
      (planningUsers[0]?.id !== undefined ? String(planningUsers[0].id) : "");

    if (!preferredId) return;

    setCreateForm((prev) =>
      prev.user_id ? prev : { ...prev, user_id: preferredId }
    );
    setEditForm((prev) =>
      prev.user_id ? prev : { ...prev, user_id: preferredId }
    );
  }, [planningUsers, userId]);

  const filteredCreateKpiOptions = useMemo(() => {
    const term = kpiSearch.toLowerCase().trim();
    if (!term) return kpiOptions;
    return kpiOptions.filter((kpi) => {
      const display = `${kpi.display_name || ""} ${
        kpi.name || ""
      }`.toLowerCase();
      return display.includes(term) || String(kpi.id ?? "").includes(term);
    });
  }, [kpiOptions, kpiSearch]);
  const filteredEditKpiOptions = useMemo(() => {
    const term = editKpiSearch.toLowerCase().trim();
    if (!term) return kpiOptions;
    return kpiOptions.filter((kpi) => {
      const display = `${kpi.display_name || ""} ${
        kpi.name || ""
      }`.toLowerCase();
      return display.includes(term) || String(kpi.id ?? "").includes(term);
    });
  }, [kpiOptions, editKpiSearch]);

  const kpiStats = useMemo(() => {
    const completed = objetivos.filter((o) => isObjectiveCompleted(o)).length;
    return {
      total: objetivos.length,
      completed,
      pending: Math.max(objetivos.length - completed, 0),
    };
  }, [objetivos]);

  const filteredObjetivos = useMemo(() => {
    const term = search.toLowerCase().trim();
    return objetivos.filter((o) => {
      const matchSearch =
        term.length === 0 ||
        o.title.toLowerCase().includes(term) ||
        o.description?.toLowerCase().includes(term);

      const completed = isObjectiveCompleted(o);
      const matchFilter =
        completionFilter === "all" ||
        (completionFilter === "completed" && completed) ||
        (completionFilter === "pending" && !completed);

      return matchSearch && matchFilter;
    });
  }, [objetivos, search, completionFilter]);

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
            <p className="text-sm text-gray-500">
              Objetivos vinculados al plan
            </p>
            <h1 className="text-2xl font-bold">Objetivos del Plan {planId}</h1>
          </div>
          <div className="flex flex-col w-full gap-2 md:flex-row md:w-auto md:items-center">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Buscar por titulo o descripcion"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64"
              />
              <select
                value={completionFilter}
                onChange={(e) => setCompletionFilter(e.target.value as any)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">Todos</option>
                <option value="completed">Completados</option>
                <option value="pending">No completados</option>
              </select>
            </div>

            <div className="flex gap-2 text-sm text-gray-500 justify-end items-center">
              <Button onClick={() => setIsCreateOpen(true)} className="ml-auto">
                Registrar objetivo
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border-b-4 border-b-slate-300 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total objetivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{kpiStats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-b-4 border-b-green-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{kpiStats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-b-4 border-b-amber-400 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                No completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{kpiStats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {loading ? (
          <p>Cargando objetivos...</p>
        ) : (
          <ObjetivoTable
            data={filteredObjetivos}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewKpis={handleViewKpis}
          />
        )}

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setCreateForm({
                plan_id: planId ?? "",
                title: "",
                description: "",
                goal_value: "",
                user_id: userId ? String(userId) : "",
                weight: "",
                kpis: [],
              });
              setKpiSearch("");
            }
          }}
        >
          <DialogContent className="max-w-3xl w-[96vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar objetivo estrategico</DialogTitle>
              <DialogDescription>
                Complete los campos y seleccione indicadores asociados.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleCreateObjective}
              className="space-y-4 md:space-y-5 mt-2"
            >
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-2">
                  <Label className="md:col-start-1">Usuario responsable</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchPlanningUsers}
                    disabled={planningUsersLoading}
                    className="px-0 justify-end md:col-start-2"
                  >
                    Recargar
                  </Button>
                </div>
                <select
                  value={createForm.user_id}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, user_id: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  required
                  disabled={planningUsersLoading || planningUsers.length === 0}
                >
                  <option value="">
                    {planningUsersLoading
                      ? "Cargando usuarios..."
                      : "Seleccione un usuario"}
                  </option>
                  {planningUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name ||
                        user.name ||
                        user.email ||
                        (user.id ? `Usuario ${user.id}` : "Usuario")}
                    </option>
                  ))}
                </select>
                {planningUsersError && (
                  <p className="text-xs text-red-600">{planningUsersError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <Label>Titulo</Label>
                  <Input
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor meta</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={createForm.goal_value}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        goal_value: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  required
                  className="min-h-[96px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Peso (opcional)</Label>
                <Input
                  type="number"
                  min="0"
                  value={createForm.weight}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, weight: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-3">
                <Label>KPIs asociados</Label>
                <Input
                  placeholder="Buscar indicador..."
                  value={kpiSearch}
                  onChange={(e) => setKpiSearch(e.target.value)}
                />
                <div className="flex flex-col gap-2 rounded-lg border border-input p-3 max-h-72 min-h-[220px] overflow-y-auto bg-background/60">
                  {kpiOptionsLoading && (
                    <p className="text-sm text-muted-foreground">
                      Cargando indicadores...
                    </p>
                  )}
                  {kpiOptionsError && (
                    <p className="text-sm text-red-600">{kpiOptionsError}</p>
                  )}
                  {!kpiOptionsLoading &&
                    !kpiOptionsError &&
                    filteredCreateKpiOptions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No hay KPIs que coincidan con la busqueda.
                      </p>
                    )}
                  {!kpiOptionsLoading &&
                    !kpiOptionsError &&
                    filteredCreateKpiOptions.map((kpi) => {
                      const idNumber = Number(kpi.id);
                      const checked = createForm.kpis.includes(idNumber);
                      return (
                        <label
                          key={kpi.id}
                          className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(state) => {
                              const next = state
                                ? [...createForm.kpis, idNumber]
                                : createForm.kpis.filter((v) => v !== idNumber);
                              setCreateForm({ ...createForm, kpis: next });
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {kpi.display_name || kpi.name || `KPI ${kpi.id}`}
                            </p>
                            {kpi.name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {kpi.name}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
                  <span>Seleccione múltiples KPIs con las casillas.</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchKpiOptions}
                    disabled={kpiOptionsLoading}
                    className="px-0"
                  >
                    Recargar KPIs
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={savingObjective}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={savingObjective}
                  className="sm:min-w-[180px]"
                >
                  {savingObjective ? "Guardando..." : "Registrar objetivo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={kpiModalOpen} onOpenChange={setKpiModalOpen}>
          <DialogContent className="w-[95vw] max-w-5xl">
            <DialogHeader>
              <DialogTitle>KPIs del objetivo</DialogTitle>
              <DialogDescription>
                {kpiObjective || "Revision de indicadores"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {kpiLoading && (
                <p className="text-sm text-gray-600">Cargando KPIs...</p>
              )}
              {kpiError && <p className="text-sm text-red-600">{kpiError}</p>}

              {!kpiLoading && !kpiError && kpis.length === 0 && (
                <p className="text-sm text-gray-600">
                  No hay KPIs para mostrar.
                </p>
              )}

              {!kpiLoading && !kpiError && kpis.length > 0 && (
                <div
                  className="grid gap-3 w-full"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  }}
                >
                  {normalizeKpis(kpis).map((kpi) => (
                    <div
                      key={kpi.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 flex flex-col gap-3 min-w-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            KPI #{kpi.id}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                            {kpi.display_name || kpi.name}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(
                            kpi.status
                          )}`}
                        >
                          {kpi.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span>Avance</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {normalizeNumber(kpi.goal_value) > 0
                              ? Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Math.round(
                                      (normalizeNumber(kpi.current_value) /
                                        normalizeNumber(kpi.goal_value || 1)) *
                                        100
                                    )
                                  )
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all"
                            style={{
                              width: `${
                                normalizeNumber(kpi.goal_value) > 0
                                  ? Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        Math.round(
                                          (normalizeNumber(kpi.current_value) /
                                            normalizeNumber(
                                              kpi.goal_value || 1
                                            )) *
                                            100
                                        )
                                      )
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <dl className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-200">
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Meta</dt>
                          <dd className="text-base font-semibold">
                            {normalizeNumber(kpi.goal_value)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Actual</dt>
                          <dd className="text-base font-semibold">
                            {normalizeNumber(kpi.current_value)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Anterior</dt>
                          <dd className="text-base font-semibold">
                            {normalizeNumber(kpi.previous_value)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <dt className="text-xs text-gray-500">Tendencia</dt>
                          <dd className="text-base font-semibold">
                            {formatTrend(kpi.trend)}
                          </dd>
                        </div>
                      </dl>

                      {kpi.updated_at && (
                        <p className="text-xs text-gray-500">
                          Actualizado:{" "}
                          {new Date(kpi.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              setSelected(null);
              setEditForm({
                plan_id: planId ?? "",
                title: "",
                description: "",
                goal_value: "",
                user_id: userId ? String(userId) : "",
                weight: "",
                kpis: [],
              });
              setEditKpiSearch("");
            }
          }}
        >
          <DialogContent className="max-w-3xl w-[96vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar objetivo estrategico</DialogTitle>
              <DialogDescription>
                Modifique los campos y presione Guardar.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleUpdate}
              className="space-y-4 md:space-y-5 mt-2"
            >
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-2">
                  <Label className="md:col-start-1">Usuario responsable</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchPlanningUsers}
                    disabled={planningUsersLoading}
                    className="px-0 justify-end md:col-start-2"
                  >
                    Recargar
                  </Button>
                </div>
                <select
                  value={editForm.user_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, user_id: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  required
                  disabled={planningUsersLoading || planningUsers.length === 0}
                >
                  <option value="">
                    {planningUsersLoading
                      ? "Cargando usuarios..."
                      : "Seleccione un usuario"}
                  </option>
                  {planningUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name ||
                        user.name ||
                        user.email ||
                        (user.id ? `Usuario ${user.id}` : "Usuario")}
                    </option>
                  ))}
                </select>
                {planningUsersError && (
                  <p className="text-xs text-red-600">{planningUsersError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <Label>Titulo</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor meta</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.goal_value}
                    onChange={(e) =>
                      setEditForm({ ...editForm, goal_value: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  required
                  className="min-h-[96px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Peso (opcional)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm({ ...editForm, weight: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-3">
                <Label>KPIs asociados</Label>
                <Input
                  placeholder="Buscar indicador..."
                  value={editKpiSearch}
                  onChange={(e) => setEditKpiSearch(e.target.value)}
                />
                <div className="flex flex-col gap-2 rounded-lg border border-input p-3 max-h-72 min-h-[220px] overflow-y-auto bg-background/60">
                  {kpiOptionsLoading && (
                    <p className="text-sm text-muted-foreground">
                      Cargando indicadores...
                    </p>
                  )}
                  {kpiOptionsError && (
                    <p className="text-sm text-red-600">{kpiOptionsError}</p>
                  )}
                  {!kpiOptionsLoading &&
                    !kpiOptionsError &&
                    filteredEditKpiOptions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No hay KPIs que coincidan con la busqueda.
                      </p>
                    )}
                  {!kpiOptionsLoading &&
                    !kpiOptionsError &&
                    filteredEditKpiOptions.map((kpi) => {
                      const idNumber = Number(kpi.id);
                      const checked = editForm.kpis.includes(idNumber);
                      return (
                        <label
                          key={kpi.id}
                          className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(state) => {
                              const next = state
                                ? [...editForm.kpis, idNumber]
                                : editForm.kpis.filter((v) => v !== idNumber);
                              setEditForm({ ...editForm, kpis: next });
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {kpi.display_name || kpi.name || `KPI ${kpi.id}`}
                            </p>
                            {kpi.name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {kpi.name}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
                  <span>Seleccione mǧltiples KPIs con las casillas.</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchKpiOptions}
                    disabled={kpiOptionsLoading}
                    className="px-0"
                  >
                    Recargar KPIs
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditOpen(false)}
                  disabled={updatingObjective}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updatingObjective}
                  className="sm:min-w-[180px]"
                >
                  {updatingObjective ? "Guardando..." : "Actualizar objetivo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </StrategicLayout>
  );
}
