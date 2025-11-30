import React, { useEffect, useState } from "react";
import { ObjetivoTable } from "../../components/plan/ObjetivoTable";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import { config } from "@/config/strategic-config";
import StrategicLayout from "../../StrategicLayout";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Kpi {
  name: string;
  unit: string;
  target: number;
}

interface Objetivo {
  id: number;
  plan_id: number;
  title: string;
  description: string;
  goal_value: string;
  weight: number;
  user_id: number;
  kpis: Kpi[];
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [planId, setPlanId] = useState<string | null>(null);

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
        `${config.apiUrl}${config.endpoints.strategicObjectives.list}?planId=${planId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );
      //console.log("Fetch objetivos response:", response.body); 

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      // ✅ Ordenar objetivos de menor a mayor ID
      const sortedObjetivos = json.data.sort(
        (a: Objetivo, b: Objetivo) => a.id - b.id
      );

      console.log("Objetivos obtenidos:", sortedObjetivos);



      setObjetivos(sortedObjetivos);
    } catch (err: any) {
      setError(err.message || "Error al cargar los objetivos");
    } finally {
      setLoading(false);
    }
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
        // si los KPIs no traen id(s), dejar que el usuario los especifique como "1,3,5"
        kpisInput: Array.isArray(obj.kpis) && obj.kpis.length
          ? obj.kpis.map((k, i) => String(i + 1)).join(",")
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

    if (!confirm("¿Desea eliminar este objetivo?")) return;

    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.strategicObjectives.delete(id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Eliminar objetivo response:", res);

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }

      // Actualizar estado local eliminando el objetivo
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
        `${config.apiUrl}${config.endpoints.strategicObjectives.update(
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

      console.log("Actualizar objetivo response:", res);

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
    <StrategicLayout title="Dashboard - Gestión de Objetivos">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <DashboardBreadcrumb
          items={[
            { label: "Inicio" },
            { label: "Planes Estratégicos", href: "/estrategico/plan" },
            {
              label: `Plan ${planId}`,
              href: `/estrategico/plan/objetivos?planId=${planId}`,
            },
          ]}
        />

        <h1 className="text-2xl font-bold mb-4">Objetivos del Plan {planId}</h1>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {loading ? (
          <p>Cargando objetivos...</p>
        ) : (
          <ObjetivoTable
            data={objetivos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}


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
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Descripción</Label>
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
