import React, { useEffect, useState } from "react";
import { PlanTable } from "@/process/strategic/components/plan/PlanTable";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { config } from "@/config/strategic-config";
import StrategicLayout from "../../StrategicLayout";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

export default function PlanPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  const { toast } = useToast();


  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "",
    user_id: "",
  });


  // Obtener token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(`Bearer ${storedToken}`);
  }, []);

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
        user_id: pl.user_id ? String(pl.user_id) : "",
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
      user_id: Number(form.user_id),
    };

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

  return (
    <StrategicLayout title="Dashboard - Gestión de Planes">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <DashboardBreadcrumb
          items={[{ label: "Inicio" }, { label: "Planes Estratégicos" }]}
        />

        <h1 className="text-2xl font-bold mb-4">Planes Estratégicos</h1>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        {loading ? (
          <p>Cargando planes...</p>
        ) : (
          <>
            <PlanTable
              data={planes}
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


        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Plan {selectedPlan?.id ?? ""}</DialogTitle>
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
                  <Input
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    placeholder="e.g. active"
                  />
                </div>

                <div>
                  <Label>User ID</Label>
                  <Input
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
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
