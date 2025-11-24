import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import { config } from "@/config/administrative-config";
import KpiCard from "@/process/administrative/dashboard/components/kpi-card";
import IndicadoresCard from "@/process/administrative/finances/components/indicadores-card";
import PasivosTable from "@/process/administrative/finances/components/passive-table";
import ActivosTable from "@/process/administrative/finances/components/actives-table";

import {
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  BookOpen,
  CreditCard,
  Activity,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interfaces TypeScript basadas en la respuesta real del API
interface BalanceGeneralData {
  resumen: {
    ingresos_verificados: number;
    pagos_pendientes: number;
    ingresos_mes_actual: number;
    gastos_nomina: number;
    patrimonio_neto: number;
    cursos_activos: number;
    matriculas_pagadas: number;
  };
  activos: Array<{
    id: string;
    curso: string;
    precio_curso: number;
    total_matriculas: number;
    ingresos_verificados: number;
    ingresos_pendientes: number;
    estudiantes_activos: number;
    estudiantes_completados: number;
  }>;
  pasivos: Array<{
    id: string;
    contrato: string;
    tipo: string;
    monto: number;
    fecha: string;
    descripcion: string;
    estado: string;
  }>;
  indicadores: {
    eficiencia_cobranza: number;
    margen_neto: number;
    ingreso_promedio_por_curso: number;
    tasa_retencion: number;
  };
}

// Función helper para formatear valores
const formatValue = (value: number, format: "currency" | "number" | "percentage" = "number"): string => {
  if (format === "currency") {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value);
  }
  if (format === "percentage") {
    return `${value.toFixed(1)}%`;
  }
  return value.toString();
};

// Componente Principal
export default function BalanceGeneralPage() {
  const [balanceData, setBalanceData] = useState<BalanceGeneralData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalanceData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // LLAMADA REAL AL API
      const apiUrl = `${config.apiUrl}${config.endpoints.balance_general}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success) {
        setBalanceData(result.data);
      } else {
        throw new Error(result.message || 'Error al cargar los datos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
      console.error('Error loading balance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalanceData();
  }, []);

  return (
    <AdministrativeLayout title="Finanzas | Balance General">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Cabecera con gradiente */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-sky-100/90">
                Módulo Financiero
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                Balance General
              </h1>
              <p className="mt-2 max-w-xl text-sm text-sky-100/80">
                Resumen financiero completo de ingresos y gastos
              </p>
            </div>
          </div>

          {/* Estados de Carga y Error */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500 dark:border-slate-800 dark:border-t-sky-400"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando balance general...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar el balance: {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifica la conexión con el servidor financiero
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={loadBalanceData}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : balanceData ? (
            <>
              {/* Grid de 7 KPIs principales usando tu KpiCard */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Ingresos Verificados"
                  value={formatValue(balanceData.resumen.ingresos_verificados, "currency")}
                  subtitle="Pagos confirmados"
                  icon={DollarSign}
                  iconColor="text-emerald-600 dark:text-emerald-400"
                />
                <KpiCard
                  title="Pagos Pendientes"
                  value={formatValue(balanceData.resumen.pagos_pendientes, "currency")}
                  subtitle="En proceso de verificación"
                  icon={Clock}
                  iconColor="text-amber-600 dark:text-amber-400"
                />
                <KpiCard
                  title="Ingresos del Mes"
                  value={formatValue(balanceData.resumen.ingresos_mes_actual, "currency")}
                  subtitle="Mes actual"
                  icon={DollarSign}
                  iconColor="text-sky-600 dark:text-sky-400"
                />
                <KpiCard
                  title="Gastos Nómina"
                  value={formatValue(balanceData.resumen.gastos_nomina, "currency")}
                  subtitle="Total gastos"
                  icon={Users}
                  iconColor="text-red-600 dark:text-red-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <KpiCard
                  title="Patrimonio Neto"
                  value={formatValue(balanceData.resumen.patrimonio_neto, "currency")}
                  subtitle="Ingresos - Gastos"
                  icon={TrendingUp}
                  iconColor={
                    balanceData.resumen.patrimonio_neto >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }
                />
                <KpiCard
                  title="Cursos Activos"
                  value={balanceData.resumen.cursos_activos.toString()}
                  subtitle="En ejecución"
                  icon={BookOpen}
                  iconColor="text-blue-600 dark:text-blue-400"
                />
                <KpiCard
                  title="Matrículas Pagadas"
                  value={balanceData.resumen.matriculas_pagadas.toString()}
                  subtitle="Total estudiantes"
                  icon={Users}
                  iconColor="text-purple-600 dark:text-purple-400"
                />
              </div>

              {/* Grid de detalles */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ActivosTable activos={balanceData.activos} />
                <PasivosTable pasivos={balanceData.pasivos} />

              </div>

              {/* Indicadores de salud */}
              <IndicadoresCard indicadores={balanceData.indicadores} />
            </>
          ) : null}
        </div>
      </div>
    </AdministrativeLayout>
  );
}