// src/components/marketing/MetricasManager.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MessageSquare, Target, Filter, Eye, Heart, Share2, Bookmark } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PropuestaMetricasTable from './metricas/PropuestaMetricasTable';
import PublicacionesTable from './metricas/PublicacionesTable';
import GraficoComparativa from './metricas/GraficoComparativa';
import GraficoTendencia from './metricas/GraficoTendencia';

interface KPI {
  label: string;
  value: number | string;
  trend?: number;
  icon: any;
  color: string;
}

const colorMap: { [key: string]: string } = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  indigo: 'bg-indigo-500',
  yellow: 'bg-yellow-500',
};

type TabType = 'propuestas' | 'publicaciones' | 'comparativa' | 'chatbot';

export default function MetricasManager() {
  const [periodo, setPeriodo] = useState('7dias');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroCanal, setFiltroCanal] = useState('todos');
  const [activeTab, setActiveTab] = useState<TabType>('propuestas');
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // CARGAR MÉTRICAS GLOBALES
  // ============================================
  useEffect(() => {
    async function loadGlobalMetrics() {
      try {
        setLoading(true);
        console.log('[MetricasManager] Loading global metrics...');

        // Importar dinámicamente el servicio
        const { fetchGlobalMetrics } = await import('../../services/marketing');
        const metrics = await fetchGlobalMetrics();

        console.log('[MetricasManager] Metrics loaded:', metrics);

        // Formatear números grandes
        const formatNumber = (num: number): string => {
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
          return num.toString();
        };

        // Construir KPIs con datos reales
        const newKpis: KPI[] = [
          {
            label: 'Campañas Totales',
            value: metrics.totalCampaigns,
            icon: Target,
            color: 'blue'
          },
          {
            label: 'Campañas Activas',
            value: metrics.activeCampaigns,
            icon: Target,
            color: 'green'
          },
          {
            label: 'Publicaciones Totales',
            value: metrics.totalPosts,
            icon: MessageSquare,
            color: 'purple'
          },
          {
            label: 'Publicadas',
            value: metrics.publishedPosts,
            icon: TrendingUp,
            color: 'emerald'
          },
          {
            label: 'Alcance Total',
            value: formatNumber(metrics.totalReach),
            icon: Eye,
            color: 'blue'
          },
          {
            label: 'Total Likes',
            value: formatNumber(metrics.totalLikes),
            icon: Heart,
            color: 'pink'
          },
          {
            label: 'Total Comentarios',
            value: formatNumber(metrics.totalComments),
            icon: MessageSquare,
            color: 'cyan'
          },
          {
            label: 'Total Compartidos',
            value: formatNumber(metrics.totalShares),
            icon: Share2,
            color: 'green'
          },
          {
            label: 'Total Guardados',
            value: formatNumber(metrics.totalSaves),
            icon: Bookmark,
            color: 'yellow'
          },
          {
            label: 'Engagement Total',
            value: formatNumber(metrics.totalEngagement),
            icon: TrendingUp,
            color: 'orange'
          },
        ];

        setKpis(newKpis);
      } catch (error) {
        console.error('[MetricasManager] Error loading metrics:', error);

        // Mostrar KPIs vacíos en caso de error
        setKpis([
          {
            label: 'Error al cargar',
            value: '—',
            icon: Target,
            color: 'red'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadGlobalMetrics();
  }, [periodo]); // Recargar cuando cambie el periodo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Métricas y Analíticas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis de rendimiento de campañas y publicaciones
          </p>
        </div>

        {/* Filtros principales */}
        <div className="flex gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="7dias">Últimos 7 días</SelectItem>
              <SelectItem value="30dias">Últimos 30 días</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Más filtros
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando métricas...</p>
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colorMap[kpi.color]} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 text-${kpi.color}-600 dark:text-${kpi.color}-400`} />
                  </div>
                  {kpi.trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs ${kpi.trend > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                      }`}>
                      {kpi.trend > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(kpi.trend)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpi.value}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {kpi.label}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto">
        <Button
          variant={activeTab === 'propuestas' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('propuestas')}
        >
          Propuestas
        </Button>
        <Button
          variant={activeTab === 'publicaciones' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('publicaciones')}
        >
          Publicaciones
        </Button>
        <Button
          variant={activeTab === 'comparativa' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('comparativa')}
        >
          Comparativa
        </Button>
        <Button
          variant={activeTab === 'chatbot' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('chatbot')}
        >
          Chatbot
        </Button>
      </div>

      {/* Tab 1: Propuestas con métricas */}
      {activeTab === 'propuestas' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroCanal} onValueChange={setFiltroCanal}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los canales</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PropuestaMetricasTable />
        </div>
      )}

      {/* Tab 2: Publicaciones */}
      {activeTab === 'publicaciones' && (
        <div className="space-y-6">
          <PublicacionesTable />
        </div>
      )}

      {/* Tab 3: Comparativa */}
      {activeTab === 'comparativa' && (
        <div className="space-y-6">
          <GraficoComparativa />
        </div>
      )}

      {/* Tab 4: Chatbot */}
      {activeTab === 'chatbot' && (
        <div className="space-y-6">
          <GraficoTendencia />
        </div>
      )}
    </div>
  );
}