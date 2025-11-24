import React, { useEffect, useState } from "react";
import { ObjetivoTable } from "../../components/plan/ObjetivoTable";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import { config } from "@/config/strategic-config";
import StrategicLayout from "../../StrategicLayout";

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

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      // ✅ Ordenar objetivos de menor a mayor ID
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
          <ObjetivoTable data={objetivos} />
        )}
      </div>
    </StrategicLayout>
  );
}
