import React, { useEffect, useMemo, useState } from "react";
import { PlanTable } from "@/process/strategic/components/plan/PlanTable";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { config } from "@/config/strategic-config";
import StrategicLayout from "../../StrategicLayout";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Plan {
  id: number;
  title: string;
  description: string;
  status: string;
  objectives_count: number;
  iniciatives_count: number;
  start_date: string;
  end_date: string;
  user_id?: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

const initialFormState = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "",
};

export default function PlanPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  const { toast } = useToast();


  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  // Obtener token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(`Bearer ${storedToken}`);
  }, []);

  // Obtener usuario autenticado para usar su ID
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${config.apiUrl}${config.endpoints.user.me}`, {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data?.id) setUserId(Number(data.id));
      } catch (err) {
        console.error("No se pudo obtener el usuario", err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch planes
  const fetchPlanes = async (url?: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        url || `${config.apiUrl}${config.endpoints.strategicPlans.list}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      // Ordenar de menor a mayor ID
      const sortedPlanes = json.data.sort((a: Plan, b: Plan) => a.id - b.id);

      setPlanes(sortedPlanes);
      setPagination({
        current_page: json.current_page,
        last_page: json.last_page,
        next_page_url: json.next_page_url,
        prev_page_url: json.prev_page_url,
        total: json.total,
      });
    } catch (err: any) {
      setError(err.message || "Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlanes();
  }, [token]);

  const openCreateModal = () => {
    setSelectedPlan(null);
    setForm(initialFormState);
    setIsCreateOpen(true);
  };

  const handleEdit = (id: number) => {
    const pl = planes.find((p) => p.id === id) || null;
    setSelectedPlan(pl);
    if (pl) {
      setForm({
        title: pl.title ?? "",
        description: pl.description ?? "",
        start_date: pl.start_date ? pl.start_date.split("T")[0] : "",
        end_date: pl.end_date ? pl.end_date.split("T")[0] : "",
        status: pl.status ?? "",
      });
    }
    setIsEditOpen(true);
    console.log("Editar plan", id);
  };

  // Actualizar plan (PUT)
  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedPlan) return;
    if (!token) {
      toast({
        title: "No autorizado",
        description: "Token no disponible",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
      user_id: userId ?? selectedPlan.user_id ?? undefined,
    };

    setSaving(true);
    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.strategicPlans.update(selectedPlan.id)}`,
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

      // Actualizar estado local: reemplazar plan editado
      setPlanes((prev) =>
        prev.map((p) =>
          p.id === selectedPlan.id
            ? {
                ...p,
                title: payload.title,
                description: payload.description,
                start_date: payload.start_date,
                end_date: payload.end_date,
                status: payload.status,
                user_id: payload.user_id,
              }
            : p
        )
      );

      setIsEditOpen(false);
      toast({
        title: "Plan actualizado",
        description: `Plan ${selectedPlan.id} actualizado correctamente.`,
      });
    } catch (err: any) {
      toast({
        title: "Error al actualizar",
        description: err?.message || "No se pudo actualizar el plan.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

    // Confirmación opcional
    if (!confirm("¿Desea eliminar este plan?")) return;

    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.strategicPlans.delete(id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Eliminado response:", JSON.stringify(res));

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }

      // Actualizar estado local eliminando el plan
      setPlanes((prev) => prev.filter((p) => p.id !== id));

      toast({
        title: "Plan eliminado",
        description: `El plan ${id} fue eliminado correctamente.`,
      });
    } catch (err: any) {
      toast({
        title: "Error al eliminar",
        description: err?.message || "No se pudo eliminar el plan.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (url: string | null) => {
    if (url) fetchPlanes(url);
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token) {
      toast({
        title: "No autorizado",
        description: "Token no disponible",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
      user_id: userId ?? undefined,
    };

    setSaving(true);
    try {
      const res = await fetch(
        `${config.apiUrl}${config.endpoints.strategicPlans.create}`,
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

      const created = await res.json().catch(() => null);
      await fetchPlanes();
      setIsCreateOpen(false);
      setForm(initialFormState);
      toast({
        title: "Plan registrado",
        description:
          created?.title || created?.id
            ? `Plan ${created?.title || created?.id} creado correctamente.`
            : "Plan creado correctamente.",
      });
    } catch (err: any) {
      toast({
        title: "Error al registrar",
        description: err?.message || "No se pudo crear el plan.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderFormFields = () => (
    <>
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
          <Label>Fecha inicio</Label>
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm({ ...form, start_date: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Fecha fin</Label>
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) =>
              setForm({ ...form, end_date: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Estado</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="">Seleccione estado</option>
            <option value="borrador">Borrador</option>
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
      </div>
    </>
  );

  const statusStats = useMemo(
    () =>
      planes.reduce(
        (acc, plan) => {
          const key = (plan.status || "").toLowerCase();
          if (key === "borrador") acc.borrador += 1;
          if (key === "activo") acc.activo += 1;
          if (key === "cerrado") acc.cerrado += 1;
          return acc;
        },
        { total: planes.length, borrador: 0, activo: 0, cerrado: 0 }
      ),
    [planes]
  );

  const filteredPlanes = useMemo(() => {
    const term = search.toLowerCase().trim();
    return planes.filter((plan) => {
      const matchSearch =
        term.length === 0 ||
        plan.title.toLowerCase().includes(term) ||
        plan.description?.toLowerCase().includes(term) ||
        plan.status?.toLowerCase().includes(term);
      const matchStatus =
        !statusFilter ||
        (plan.status || "").toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [planes, search, statusFilter]);

  return (
    <StrategicLayout title="Dashboard - Gestión de Planes">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <DashboardBreadcrumb
          items={[{ label: "Inicio" }, { label: "Planes Estratégicos" }]}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Planes Estratégicos</h1>
          <div className="flex flex-col w-full gap-2 md:flex-row md:w-auto md:items-center">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por título, descripción o estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64"
              />
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <Button onClick={openCreateModal} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Registrar plan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-b-4 border-b-slate-300 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{statusStats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-b-4 border-b-amber-400 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Borrador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{statusStats.borrador}</p>
            </CardContent>
          </Card>
          <Card className="border-b-4 border-b-green-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{statusStats.activo}</p>
            </CardContent>
          </Card>
          <Card className="border-b-4 border-b-rose-400 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Cerrados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{statusStats.cerrado}</p>
            </CardContent>
          </Card>
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        {loading ? (
          <p>Cargando planes...</p>
        ) : (
          <>
            <PlanTable
              data={filteredPlanes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Paginación */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.prev_page_url)}
                  disabled={!pagination.prev_page_url}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>

                <span className="px-2 py-1 border rounded">
                  {pagination.current_page}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.next_page_url)}
                  disabled={!pagination.next_page_url}
                >
                  Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}


        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setForm(initialFormState);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar nuevo plan</DialogTitle>
              <DialogDescription>
                Complete los campos para registrar un plan.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              {renderFormFields()}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Crear plan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Plan {selectedPlan?.id ?? ""}</DialogTitle>
              <DialogDescription>
                Modifique los campos y presione Guardar.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              {renderFormFields()}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </StrategicLayout>
  );
}
