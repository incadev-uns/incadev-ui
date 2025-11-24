import React, { useState, useEffect } from 'react';
import AdministrativeLayout from '@/process/administrative/AdministrativeLayout';
import { config } from "@/config/administrative-config";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  IconFileDownload,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import KpiCard from './components/kpi-card';
import EditGoalModal from './components/edit-goal-modal';

interface KPI {
  id: number;
  name: string;
  display_name: string;
  goal_value: number;
  current_value: number;
  previous_value: number;
  trend: number;
  status: 'Requiere atención' | 'En camino' | 'Cumplido';
  updated_at: string;
}

// ← AGREGA ESTA FUNCIÓN AQUÍ
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Fecha no disponible';
  }
};

export default function IndicadoresManagement() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadKpis();
  }, []);

  const loadKpis = async () => {
    setLoading(true);
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.kpis}`;
      console.log('📊 Loading KPIs from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ KPIs loaded:', result);
      
      setKpis(result.data || []);
      setLastUpdated(result.last_updated || new Date().toISOString());
      setError(null);
    } catch (error) {
      console.error('❌ Error loading KPIs:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setKpis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.kpisRecalculate}`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al recalcular indicadores');

      await loadKpis();
      alert('Indicadores recalculados exitosamente');
    } catch (error) {
      console.error('Error recalculating KPIs:', error);
      alert('Error al recalcular los indicadores');
    }
  };

  const handleEditGoal = (kpi: KPI) => {
    setSelectedKpi(kpi);
    setIsEditModalOpen(true);
  };

  const handleGoalUpdated = () => {
    loadKpis();
    setIsEditModalOpen(false);
    setSelectedKpi(null);
  };

  const exportPDF = async () => {
    try {
      const url = `${config.apiUrl}/api/indicadores/export-data`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      localStorage.setItem('kpiExportData', JSON.stringify(data));

      const pdfWindow = window.open('/administrativo/indicadores/export-pdf', '_blank');
      if (!pdfWindow) {
        alert('Por favor, permite las ventanas emergentes para exportar el PDF');
      }
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert(`Error al exportar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <AdministrativeLayout title="Indicadores (KPIs)">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-100/90">Panel Principal</p>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Indicadores (KPIs)</h1>
                <p className="mt-2 max-w-xl text-sm text-slate-100/80">
                  Métricas clave de desempeño institucional
                </p>
              </div>
              <Button 
                onClick={exportPDF}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <IconFileDownload className="mr-2 h-4 w-4" />
                Exportar Informe PDF
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
                <p className="text-sm text-muted-foreground">Cargando indicadores...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <IconTrendingDown className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Error al cargar los indicadores</p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={loadKpis} variant="outline">Reintentar</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Última actualización: {formatDate(lastUpdated)}
                </div>
                <Button 
                  onClick={handleRecalculate}
                  variant="outline"
                  size="sm"
                >
                  <IconRefresh className="mr-2 h-4 w-4" />
                  Recalcular Indicadores
                </Button>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {kpis.map((kpi) => (
                  <KpiCard
                    key={kpi.id}
                    kpi={kpi}
                    onEditGoal={handleEditGoal}
                  />
                ))}
              </div>

              {/* Empty State */}
              {kpis.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <IconTrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    No hay indicadores disponibles
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Los indicadores se calcularán automáticamente cuando haya datos disponibles
                  </p>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Edit Goal Modal */}
        <EditGoalModal
          kpi={selectedKpi}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedKpi(null);
          }}
          onSuccess={handleGoalUpdated}
        />
      </div>
    </AdministrativeLayout>
  );
}