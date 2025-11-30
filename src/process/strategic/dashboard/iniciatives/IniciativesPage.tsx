import React, { useEffect, useMemo, useState } from "react";
import StrategicLayout from "../../StrategicLayout";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import {
  IniciativeTable,
  type IniciativeRow,
} from "@/process/strategic/components/iniciatives/IniciativeTable";
import { config } from "@/config/strategic-config";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  "propuesta",
  "en_revision",
  "aprobada",
  "rechazada",
  "en_ejecucion",
  "finalizada",
  "evaluada",
] as const;

type Status = (typeof STATUSES)[number];

const TRANSITIONS: Record<Status, Status[]> = {
  propuesta: ["en_revision"],
  en_revision: ["aprobada", "rechazada"],
  aprobada: ["en_ejecucion"],
  en_ejecucion: ["finalizada"],
  finalizada: ["evaluada"],
  rechazada: [],
  evaluada: [],
};

interface Iniciative extends IniciativeRow {
  summary: string;
  estimated_impact: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface IniciativeEvaluation {
  id: number;
  iniciative_id: number;
  evaluator_user: number | null;
  summary: string;
  score: number;
  document_id: number | null;
}

const emptyIniForm = {
  title: "",
  plan_id: "",
  summary: "",
  user_id: "",
  status: "propuesta" as Status,
  start_date: "",
  end_date: "",
  estimated_impact: "",
};

const emptyEvalForm = {
  iniciative_id: "",
  evaluator_user: "",
  summary: "",
  score: "",
  document_id: "",
};

export default function IniciativesPage() {
  const formatDate = (value?: string) =>
    value ? value.split("T")[0] ?? value : "-";

  const [token, setToken] = useState<string>("");
  const [iniciatives, setIniciatives] = useState<Iniciative[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    plan_id: "",
    user_id: "",
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(
    () => iniciatives.find((i) => i.id === selectedId) ?? null,
    [selectedId, iniciatives]
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(emptyIniForm);

  const [nextStatus, setNextStatus] = useState<Status | null>(null);

  const [evaluations, setEvaluations] = useState<IniciativeEvaluation[]>([]);
  const [evalOpen, setEvalOpen] = useState(false);
  const [evalMode, setEvalMode] = useState<"create" | "edit">("create");
  const [evalForm, setEvalForm] = useState(emptyEvalForm);
  const [editEvalId, setEditEvalId] = useState<number | null>(null);

  const [confirm, setConfirm] = useState<{
    open: boolean;
    message: string;
    onConfirm?: () => Promise<void>;
    loading?: boolean;
  }>({ open: false, message: "" });

  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(`Bearer ${storedToken}`);
  }, []);

  useEffect(() => {
    if (token) {
      fetchIniciatives();
    }
  }, [token]);

  useEffect(() => {
    if (selectedId) {
      fetchEvaluations(selectedId);
      const status = iniciatives.find((i) => i.id === selectedId)?.status as
        | Status
        | undefined;
      if (status) {
        const allowed = TRANSITIONS[status] ?? [];
        setNextStatus(allowed[0] ?? null);
      }
    } else {
      setEvaluations([]);
      setNextStatus(null);
    }
  }, [selectedId, iniciatives]);

  const openConfirm = (message: string, action: () => Promise<void>) => {
    setConfirm({ open: true, message, onConfirm: action, loading: false });
  };

  const handleConfirm = async () => {
    if (!confirm.onConfirm) return;
    try {
      setConfirm((prev) => ({ ...prev, loading: true }));
      await confirm.onConfirm();
      setConfirm({
        open: false,
        message: "",
        onConfirm: undefined,
        loading: false,
      });
    } catch (err: any) {
      toast({
        title: "Acción no completada",
        description: err?.message || "Ocurrió un error",
        variant: "destructive",
      });
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchIniciatives = async (url?: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.plan_id) params.set("plan_id", filters.plan_id);
    if (filters.user_id) params.set("user_id", filters.user_id);

    try {
      const response = await fetch(
        url
          ? url
          : `${config.apiUrl}${config.endpoints.iniciatives.list}${
              params.toString() ? `?${params.toString()}` : ""
            }`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      const sorted = (json.data as Iniciative[]).sort((a, b) => a.id - b.id);
      setIniciatives(sorted);
      setPagination({
        current_page: json.current_page,
        last_page: json.last_page,
        next_page_url: json.next_page_url,
        prev_page_url: json.prev_page_url,
        total: json.total,
      });

      if (sorted.length && !selectedId) {
        setSelectedId(sorted[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar iniciativas");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async (iniciativeId: number) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.iniciativeEvaluations.list}?iniciative_id=${iniciativeId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setEvaluations(json.data ?? []);
    } catch (err: any) {
      toast({
        title: "Error al cargar evaluaciones",
        description: err?.message || "No se pudieron cargar las evaluaciones.",
        variant: "destructive",
      });
    }
  };

  const openCreate = () => {
    setForm(emptyIniForm);
    setCreateOpen(true);
  };

  const openEdit = (id: number) => {
    const ini = iniciatives.find((i) => i.id === id);
    if (!ini) return;
    setSelectedId(id);
    setForm({
      title: ini.title ?? "",
      plan_id: ini.plan_id ? String(ini.plan_id) : "",
      summary: ini.summary ?? "",
      user_id: ini.user_id ? String(ini.user_id) : "",
      status: ini.status as Status,
      start_date: ini.start_date ? ini.start_date.split("T")[0] : "",
      end_date: ini.end_date ? ini.end_date.split("T")[0] : "",
      estimated_impact: ini.estimated_impact ?? "",
    });
    setEditOpen(true);
  };
  
  const handleCreateSubmit = () => {
    openConfirm("¿Crear la iniciativa?", async () => {
      const payload = {
        ...form,
        plan_id: form.plan_id ? Number(form.plan_id) : null,
        user_id: form.user_id ? Number(form.user_id) : null,
      };

      const res = await fetch(
        `${config.apiUrl}${config.endpoints.iniciatives.create}`,
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

      const json = await res.json();
      const created: Iniciative = json;
      setIniciatives((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      setCreateOpen(false);
      setForm(emptyIniForm);
      setSelectedId(created.id);
      toast({
        title: "Iniciativa creada",
        description: `Se creó la iniciativa ${created.title}.`,
      });
    });
  };

  const handleUpdateSubmit = () => {
    if (!selected) return;
    openConfirm("¿Guardar cambios de la iniciativa?", async () => {
      const payload = {
        ...form,
        plan_id: form.plan_id ? Number(form.plan_id) : null,
        user_id: form.user_id ? Number(form.user_id) : null,
      };

      const res = await fetch(
        `${config.apiUrl}${config.endpoints.iniciatives.update(selected.id)}`,
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

      const json = await res.json();
      const updated: Iniciative = json;
      setIniciatives((prev) =>
        prev.map((i) => (i.id === selected.id ? updated : i)).sort(
          (a, b) => a.id - b.id
        )
      );
      setEditOpen(false);
      toast({
        title: "Iniciativa actualizada",
        description: `Se actualizó la iniciativa ${updated.title}.`,
      });
    });
  };

  const handleDelete = (id: number) => {
    openConfirm(
      "¿Eliminar esta iniciativa? Se perderán los datos asociados.",
      async () => {
        const res = await fetch(
          `${config.apiUrl}${config.endpoints.iniciatives.delete(id)}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: token,
            },
          }
        );

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.message || `HTTP ${res.status}`);
        }

        setIniciatives((prev) => prev.filter((i) => i.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
        }
        toast({
          title: "Iniciativa eliminada",
          description: `Iniciativa ${id} eliminada.`,
        });
      }
    );
  };

  const handleTransition = () => {
    if (!selected || !nextStatus) return;
    openConfirm(
      `¿Cambiar estado a "${nextStatus.replaceAll("_", " ")}"?`,
      async () => {
        const res = await fetch(
          `${config.apiUrl}${config.endpoints.iniciatives.transition(selected.id)}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({ status: nextStatus }),
          }
        );

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.message || `HTTP ${res.status}`);
        }

        const updated = await res.json();
        setIniciatives((prev) =>
          prev.map((i) => (i.id === selected.id ? updated : i)).sort(
            (a, b) => a.id - b.id
          )
        );
        toast({
          title: "Estado actualizado",
          description: `Estado cambiado a ${nextStatus.replaceAll(
            "_",
            " "
          )}.`,
        });
      }
    );
  };

  const handleCreateEval = () => {
    if (!selected) return;
    setEvalMode("create");
    setEvalForm({
      ...emptyEvalForm,
      iniciative_id: String(selected.id),
    });
    setEvalOpen(true);
    setEditEvalId(null);
  };

  const handleEditEval = (id: number) => {
    const ev = evaluations.find((e) => e.id === id);
    if (!ev) return;
    setEvalMode("edit");
    setEditEvalId(id);
    setEvalForm({
      iniciative_id: String(ev.iniciative_id ?? selected?.id ?? ""),
      evaluator_user: ev.evaluator_user ? String(ev.evaluator_user) : "",
      summary: ev.summary ?? "",
      score: ev.score != null ? String(ev.score) : "",
      document_id: ev.document_id ? String(ev.document_id) : "",
    });
    setEvalOpen(true);
  };

  const submitEval = () => {
    if (!selected) return;
    const payload = {
      iniciative_id: Number(evalForm.iniciative_id || selected.id),
      evaluator_user: evalForm.evaluator_user
        ? Number(evalForm.evaluator_user)
        : null,
      summary: evalForm.summary,
      score: Number(evalForm.score),
      document_id: evalForm.document_id ? Number(evalForm.document_id) : null,
    };

    if (evalMode === "create") {
      openConfirm("¿Crear evaluación?", async () => {
        const res = await fetch(
          `${config.apiUrl}${config.endpoints.iniciativeEvaluations.create}`,
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

        const created = await res.json();
        setEvaluations((prev) =>
          [...prev, created].sort((a, b) => a.id - b.id)
        );
        setEvalOpen(false);
        toast({
          title: "Evaluación creada",
          description: "Se registró la evaluación.",
        });
        fetchIniciatives(); // para reflejar posible cambio a "evaluada"
      });
    } else if (evalMode === "edit" && editEvalId) {
      openConfirm("¿Actualizar evaluación?", async () => {
        const res = await fetch(
          `${config.apiUrl}${config.endpoints.iniciativeEvaluations.update(
            editEvalId
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

        const updated = await res.json();
        setEvaluations((prev) =>
          prev.map((e) => (e.id === editEvalId ? updated : e))
        );
        setEvalOpen(false);
        toast({
          title: "Evaluación actualizada",
          description: "Cambios guardados.",
        });
      });
    }
  };

  const handleDeleteEval = (id: number) => {
    openConfirm("¿Eliminar evaluación?", async () => {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.iniciativeEvaluations.delete(id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }

      setEvaluations((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Evaluación eliminada",
        description: `Evaluación ${id} eliminada.`,
      });
    });
  };

  const resetFilters = () => {
    setFilters({ status: "", plan_id: "", user_id: "" });
    fetchIniciatives();
  };

  const allowedTransitions = selected
    ? TRANSITIONS[selected.status as Status] ?? []
    : [];

  const statusBadge = (status?: string) => {
    if (!status) return null;
    const colorMap: Partial<Record<Status, string>> = {
      propuesta: "bg-blue-100 text-blue-700",
      en_revision: "bg-amber-100 text-amber-700",
      aprobada: "bg-emerald-100 text-emerald-700",
      en_ejecucion: "bg-indigo-100 text-indigo-700",
      finalizada: "bg-slate-100 text-slate-700",
      evaluada: "bg-green-100 text-green-700",
      rechazada: "bg-red-100 text-red-700",
    };
    return (
      <Badge className={`capitalize ${colorMap[status as Status] ?? ""}`}>
        {status.replaceAll("_", " ")}
      </Badge>
    );
  };

  return (
    <StrategicLayout title="Iniciativas y Mejora Continua">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <DashboardBreadcrumb
          items={[
            { label: "Inicio" },
            { label: "Iniciativas y Mejora Continua" },
          ]}
        />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Iniciativas</h1>
            <p className="text-muted-foreground text-sm">
              CRUD, filtros, transiciones y evaluaciones.
            </p>
          </div>
          <Button onClick={openCreate}>Nueva iniciativa</Button>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Estado</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                    {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                        {s.replaceAll("_", " ")}
                    </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan ID</Label>
              <Input
                value={filters.plan_id}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, plan_id: e.target.value }))
                }
                placeholder="Ej. 1"
              />
            </div>
            <div>
              <Label>Usuario ID</Label>
              <Input
                value={filters.user_id}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, user_id: e.target.value }))
                }
                placeholder="Ej. 5"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => fetchIniciatives()}>Aplicar</Button>
              <Button variant="outline" onClick={resetFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {loading ? (
          <p>Cargando iniciativas...</p>
        ) : (
          <IniciativeTable
            data={iniciatives}
            onSelect={(id) => setSelectedId(id)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}

        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.prev_page_url}
              onClick={() =>
                pagination.prev_page_url &&
                fetchIniciatives(pagination.prev_page_url)
              }
            >
              Anterior
            </Button>
            <span className="px-2 py-1 border rounded">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.next_page_url}
              onClick={() =>
                pagination.next_page_url &&
                fetchIniciatives(pagination.next_page_url)
              }
            >
              Siguiente
            </Button>
          </div>
        )}

        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3 rounded-lg border p-4 bg-card">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold">{selected.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    Plan {selected.plan_id ?? "-"} · Usuario{" "}
                    {selected.user_id ?? "-"}
                  </p>
                </div>
                {statusBadge(selected.status)}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selected.summary}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Inicio:</span>{" "}
                  {formatDate(selected.start_date)}
                </div>
                <div>
                  <span className="font-medium">Fin:</span>{" "}
                  {formatDate(selected.end_date)}
                </div>
                <div>
                  <span className="font-medium">Impacto estimado:</span>{" "}
                  {selected.estimated_impact}
                </div>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold">Transición de estado</h4>
                  </div>
                  {allowedTransitions.length === 0 && (
                    <Badge variant="outline">Sin transiciones</Badge>
                  )}
                </div>
                {allowedTransitions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={nextStatus ?? ""}
                      onValueChange={(v) => setNextStatus(v as Status)}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedTransitions.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleTransition} disabled={!nextStatus}>
                      Aplicar transición
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 rounded-lg border p-4 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Evaluaciones</h3>
                <Button size="sm" onClick={handleCreateEval}>
                  Añadir
                </Button>
              </div>
              {evaluations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin evaluaciones.
                </p>
              ) : (
                <div className="space-y-3">
                  {evaluations.map((ev) => (
                    <div
                      key={ev.id}
                      className="border rounded-md p-3 bg-background space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Eval #{ev.id}</div>
                        <div className="text-sm text-muted-foreground">
                          Score: {ev.score}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ev.summary}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Evaluator: {ev.evaluator_user ?? "-"}</span>
                        <span>Doc: {ev.document_id ?? "-"}</span>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEval(ev.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDeleteEval(ev.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva iniciativa</DialogTitle>
              <DialogDescription>
                Completa los datos y confirma.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Plan ID</Label>
                <Input
                  value={form.plan_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, plan_id: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label>Resumen</Label>
                <Textarea
                  value={form.summary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, summary: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Usuario ID</Label>
                <Input
                  value={form.user_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, user_id: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as Status }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Inicio</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Fin</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Impacto estimado</Label>
                <Input
                  value={form.estimated_impact}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      estimated_impact: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSubmit}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar iniciativa</DialogTitle>
              <DialogDescription>
                Confirma antes de guardar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Plan ID</Label>
                <Input
                  value={form.plan_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, plan_id: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label>Resumen</Label>
                <Textarea
                  value={form.summary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, summary: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Usuario ID</Label>
                <Input
                  value={form.user_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, user_id: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as Status }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Inicio</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Fin</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Impacto estimado</Label>
                <Input
                  value={form.estimated_impact}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      estimated_impact: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateSubmit}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={evalOpen} onOpenChange={setEvalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {evalMode === "create"
                  ? "Nueva evaluación"
                  : "Editar evaluación"}
              </DialogTitle>
              <DialogDescription>
                Confirma antes de guardar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Iniciativa ID</Label>
                <Input
                  value={evalForm.iniciative_id}
                  onChange={(e) =>
                    setEvalForm((f) => ({
                      ...f,
                      iniciative_id: e.target.value,
                    }))
                  }
                  disabled
                />
              </div>
              <div>
                <Label>Evaluador (user ID)</Label>
                <Input
                  value={evalForm.evaluator_user}
                  onChange={(e) =>
                    setEvalForm((f) => ({
                      ...f,
                      evaluator_user: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Resumen</Label>
                <Textarea
                  value={evalForm.summary}
                  onChange={(e) =>
                    setEvalForm((f) => ({
                      ...f,
                      summary: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Score (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={evalForm.score}
                  onChange={(e) =>
                    setEvalForm((f) => ({ ...f, score: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Documento ID (opcional)</Label>
                <Input
                  value={evalForm.document_id}
                  onChange={(e) =>
                    setEvalForm((f) => ({
                      ...f,
                      document_id: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEvalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitEval}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={confirm.open}
          onOpenChange={(open) =>
            setConfirm((prev) => ({
              ...prev,
              open,
            }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar acción</AlertDialogTitle>
              <AlertDialogDescription>
                {confirm.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={confirm.loading}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={confirm.loading}
              >
                {confirm.loading ? "Procesando..." : "Confirmar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StrategicLayout>
  );
}
