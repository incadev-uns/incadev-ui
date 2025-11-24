import React, { useEffect, useState } from "react";
import { PlanTable } from "@/process/strategic/components/plan/PlanTable";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { config } from "@/config/strategic-config";
import StrategicLayout from "../../StrategicLayout";

interface Plan {
  id: number;
  title: string;
  description: string;
  status: string;
  objectives_count: number;
  iniciatives_count: number;
  start_date: string;
  end_date: string;
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
    console.log("Editar plan", id);
  };

  const handleDelete = (id: number) => {
    console.log("Eliminar plan", id);
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
      </div>
    </StrategicLayout>
  );
}
