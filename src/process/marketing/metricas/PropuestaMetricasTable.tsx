// src/components/marketing/metricas/PropuestaMetricasTable.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Eye, Heart, MessageSquare, Share2, Bookmark, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PropuestaMetrica {
  id: number;
  nombre: string;
  estado: 'borrador' | 'activa' | 'pausada' | 'aprobada' | 'rechazada';
  publicaciones: number;
  alcance: number;
  impresiones: number;
  vistas: number;
  engagement: number;
  likes: number;
  comentarios: number;
  compartidos: number;
  guardados: number;
  score: number;
  campañasActivas: number;
  detalles?: {
    campanias: Array<{
      id: number;
      nombre: string;
      alcance: number;
      likes: number;
      comentarios: number;
      engagement: number;
    }>;
  };
}

const estadoConfig = {
  borrador: { label: 'Borrador', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  activa: { label: 'Activa', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  pausada: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' },
  aprobada: { label: 'Aprobada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  rechazada: { label: 'Archivada', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
};

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Calcular score basado en métricas sociales
const calcularScore = (propuesta: PropuestaMetrica): number => {
  if (propuesta.alcance === 0) return 0;

  const engagementRate = (propuesta.engagement / propuesta.alcance) * 100;
  const likesRate = (propuesta.likes / propuesta.alcance) * 100;
  const commentsRate = (propuesta.comentarios / propuesta.alcance) * 100;

  // Score ponderado (0-10)
  let score = 0;

  // Engagement rate (40% del score)
  if (engagementRate >= 10) score += 4;
  else if (engagementRate >= 5) score += 3;
  else if (engagementRate >= 2) score += 2;
  else score += 1;

  // Likes rate (30% del score)
  if (likesRate >= 5) score += 3;
  else if (likesRate >= 2) score += 2;
  else score += 1;

  // Comments rate (30% del score)
  if (commentsRate >= 1) score += 3;
  else if (commentsRate >= 0.5) score += 2;
  else score += 1;

  return Math.min(score, 10);
};

export default function PropuestaMetricasTable() {
  const [propuestas, setPropuestas] = useState<PropuestaMetrica[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // CARGAR PROPUESTAS CON MÉTRICAS
  // ============================================
  useEffect(() => {
    async function loadPropuestasConMetricas() {
      try {
        setLoading(true);
        console.log('[PropuestaMetricasTable] Loading proposals with metrics...');

        // Importar servicios
        const {
          fetchProposals,
          fetchCampaignsByProposal,
          fetchCampaignMetrics,
          fetchCampaignPosts
        } = await import('../../../services/marketing');

        // Obtener todas las propuestas
        const allProposals = await fetchProposals();
        console.log('[PropuestaMetricasTable] Proposals loaded:', allProposals.length);

        // Procesar cada propuesta para obtener sus métricas
        const propuestasConMetricas: PropuestaMetrica[] = await Promise.all(
          allProposals.map(async (propuesta) => {
            try {
              // Obtener campañas de esta propuesta
              const campañas = await fetchCampaignsByProposal(propuesta.id);

              let totalAlcance = 0;
              let totalImpresiones = 0;
              let totalVistas = 0;
              let totalEngagement = 0;
              let totalLikes = 0;
              let totalComentarios = 0;
              let totalCompartidos = 0;
              let totalGuardados = 0;
              let totalPublicaciones = 0;
              let campañasActivas = 0;

              const detallesCampañas = [];

              // Iterar sobre cada campaña
              for (const campaña of campañas) {
                try {
                  // Obtener métricas de la campaña
                  const metrics = await fetchCampaignMetrics(campaña.id);
                  totalAlcance += metrics.totalReach;
                  totalLikes += metrics.totalLikes;
                  totalComentarios += metrics.totalComments;
                  totalEngagement += metrics.totalInteractions;

                  // Obtener posts para contar publicaciones
                  const posts = await fetchCampaignPosts(campaña.id);
                  totalPublicaciones += posts.length;

                  if (campaña.estado === 'activa') {
                    campañasActivas++;
                  }

                  detallesCampañas.push({
                    id: campaña.id,
                    nombre: campaña.nombre,
                    alcance: metrics.totalReach,
                    likes: metrics.totalLikes,
                    comentarios: metrics.totalComments,
                    engagement: metrics.totalInteractions
                  });

                } catch (error) {
                  console.warn(`[PropuestaMetricasTable] No metrics for campaign ${campaña.id}`);
                }
              }

              const propuestaConMetricas: PropuestaMetrica = {
                id: propuesta.id,
                nombre: propuesta.tema,
                estado: propuesta.estado,
                publicaciones: totalPublicaciones,
                alcance: totalAlcance,
                impresiones: totalImpresiones,
                vistas: totalVistas,
                engagement: totalEngagement,
                likes: totalLikes,
                comentarios: totalComentarios,
                compartidos: totalCompartidos,
                guardados: totalGuardados,
                score: 0, // Se calculará después
                campañasActivas,
                detalles: detallesCampañas.length > 0 ? {
                  campanias: detallesCampañas
                } : undefined
              };

              // Calcular score
              propuestaConMetricas.score = calcularScore(propuestaConMetricas);

              return propuestaConMetricas;

            } catch (error) {
              console.error(`[PropuestaMetricasTable] Error loading metrics for proposal ${propuesta.id}:`, error);

              // Retornar propuesta sin métricas
              return {
                id: propuesta.id,
                nombre: propuesta.tema,
                estado: propuesta.estado,
                publicaciones: 0,
                alcance: 0,
                impresiones: 0,
                vistas: 0,
                engagement: 0,
                likes: 0,
                comentarios: 0,
                compartidos: 0,
                guardados: 0,
                score: 0,
                campañasActivas: 0
              };
            }
          })
        );

        // Ordenar por score descendente
        propuestasConMetricas.sort((a, b) => b.score - a.score);

        setPropuestas(propuestasConMetricas);
        console.log('[PropuestaMetricasTable] Proposals with metrics loaded:', propuestasConMetricas.length);

      } catch (error) {
        console.error('[PropuestaMetricasTable] Error loading proposals:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPropuestasConMetricas();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando propuestas con métricas...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (propuestas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay propuestas
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Crea una propuesta para comenzar a ver métricas
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {propuestas.map((propuesta) => (
        <Card key={propuesta.id} className="overflow-hidden">
          {/* Header - Info principal */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleExpand(propuesta.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  {expandedId === propuesta.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {propuesta.nombre}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={estadoConfig[propuesta.estado].color}>
                      {estadoConfig[propuesta.estado].label}
                    </Badge>
                    {propuesta.campañasActivas > 0 && (
                      <Badge variant="outline" className="text-green-600 dark:text-green-400">
                        {propuesta.campañasActivas} campaña{propuesta.campañasActivas !== 1 ? 's' : ''} activa{propuesta.campañasActivas !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(propuesta.score)}`}>
                    {propuesta.score.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            </div>

            {/* Métricas principales en grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Posts</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {propuesta.publicaciones}
                </p>
              </div>

              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Alcance</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(propuesta.alcance)}
                </p>
              </div>

              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Engagement</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(propuesta.engagement)}
                </p>
              </div>

              <div className="text-center p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Likes</p>
                <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                  {formatNumber(propuesta.likes)}
                </p>
              </div>

              <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Comentarios</p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  {formatNumber(propuesta.comentarios)}
                </p>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Share2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Compartidos</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatNumber(propuesta.compartidos)}
                </p>
              </div>

              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Bookmark className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Guardados</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatNumber(propuesta.guardados)}
                </p>
              </div>

              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Eng. Rate</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {propuesta.alcance > 0
                    ? ((propuesta.engagement / propuesta.alcance) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>

              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.location.href = `/marketing/propuestas/${propuesta.id}`}
                >
                  Ver más
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Barra de progreso del score */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rendimiento Social
                </span>
                <span className={`text-sm font-bold ${getScoreColor(propuesta.score)}`}>
                  {propuesta.score.toFixed(1)}/10
                </span>
              </div>
              <Progress value={propuesta.score * 10} className="h-2" />
            </div>
          </div>

          {/* Detalles expandibles */}
          {expandedId === propuesta.id && propuesta.detalles && (
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                📊 Campañas Asociadas
              </h4>
              <div className="space-y-2">
                {propuesta.detalles.campanias.map((campaña) => (
                  <div
                    key={campaña.id}
                    className="p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {campaña.nombre}
                      </h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/marketing/campañas/${campaña.id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Alcance</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {formatNumber(campaña.alcance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Likes</p>
                        <p className="font-bold text-pink-600 dark:text-pink-400">
                          {formatNumber(campaña.likes)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Comentarios</p>
                        <p className="font-bold text-cyan-600 dark:text-cyan-400">
                          {formatNumber(campaña.comentarios)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Engagement</p>
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          {formatNumber(campaña.engagement)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 Engagement Rate promedio: {propuesta.alcance > 0
                    ? ((propuesta.engagement / propuesta.alcance) * 100).toFixed(2)
                    : '0.00'}%
                </p>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}