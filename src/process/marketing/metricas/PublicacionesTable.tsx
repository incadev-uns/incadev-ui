// src/components/marketing/metricas/PublicacionesTable.tsx
import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Share2, Eye, Calendar, Bookmark, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Publicacion {
  id: number;
  titulo: string;
  contenido: string;
  plataforma: string;
  tipo: string;
  campaignId: number;
  campaignNombre: string;
  fecha: string;
  estado: string;
  // Métricas (solo si está publicado)
  alcance: number;
  impresiones: number;
  vistas: number;
  engagement: number;
  likes: number;
  comentarios: number;
  compartidos: number;
  guardados: number;
  engagement_rate: number;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default function PublicacionesTable() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroPlataforma, setFiltroPlataforma] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCampaign, setFiltroCampaign] = useState('todas');

  useEffect(() => {
    async function loadPublicaciones() {
      try {
        setLoading(true);

        const {
          fetchAllCampaigns,
          fetchCampaignPosts,
          fetchPostMetrics
        } = await import('../../../services/marketing');

        const campaigns = await fetchAllCampaigns();
        const allPosts: Publicacion[] = [];

        for (const campaign of campaigns) {
          try {
            const posts = await fetchCampaignPosts(campaign.id);

            for (const post of posts) {
              let metricas = {
                alcance: 0,
                impresiones: 0,
                vistas: 0,
                likes: 0,
                comentarios: 0,
                compartidos: 0,
                guardados: 0,
                engagement: 0,
              };

              if (post.estado === 'published') {
                try {
                  const postMetrics = await fetchPostMetrics(post.id);
                  metricas = postMetrics.totales;
                } catch (error) {
                  console.warn(`No metrics for post ${post.id}`);
                }
              }

              const engagement_rate = metricas.alcance > 0
                ? (metricas.engagement / metricas.alcance) * 100
                : 0;

              allPosts.push({
                id: post.id,
                titulo: post.titulo,
                contenido: post.contenido,
                plataforma: post.plataforma,
                tipo: post.tipo,
                campaignId: campaign.id,
                campaignNombre: campaign.nombre,
                fecha: post.publicadoEn || post.programadoPara || post.fechaCreacion,
                estado: post.estado,
                ...metricas,
                engagement_rate,
              });
            }
          } catch (error) {
            console.warn(`No posts for campaign ${campaign.id}`);
          }
        }

        allPosts.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setPublicaciones(allPosts);

      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPublicaciones();
  }, []);

  const publicacionesFiltradas = publicaciones.filter((pub) => {
    const matchPlataforma = filtroPlataforma === 'todos' || pub.plataforma.toLowerCase() === filtroPlataforma;
    const matchEstado = filtroEstado === 'todos' || pub.estado === filtroEstado;
    const matchCampaign = filtroCampaign === 'todas' || String(pub.campaignId) === filtroCampaign;
    return matchPlataforma && matchEstado && matchCampaign;
  });

  const campaigns = Array.from(new Set(publicaciones.map(p => JSON.stringify({ id: p.campaignId, nombre: p.campaignNombre })))).map(c => JSON.parse(c));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Cargando publicaciones...</p>
      </div>
    );
  }

  if (publicaciones.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay publicaciones</h3>
        <p className="text-gray-600 dark:text-gray-400">Crea campañas y publicaciones para verlas aquí</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="scheduled">Programado</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroCampaign} onValueChange={setFiltroCampaign}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Campaña" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {publicacionesFiltradas.length} de {publicaciones.length}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {publicacionesFiltradas.map((pub) => (
          <Card key={pub.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge>{pub.plataforma}</Badge>
                  <Badge variant="outline">{pub.tipo}</Badge>
                  <Badge>{pub.estado}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{pub.titulo}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(pub.fecha).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {pub.engagement_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Engagement</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{pub.contenido}</p>
            </div>

            {pub.estado === 'published' && (
              <>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <Eye className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-blue-600">{formatNumber(pub.alcance)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Alcance</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-purple-600">{formatNumber(pub.impresiones)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Impresiones</p>
                  </div>
                  <div className="text-center p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                    <Eye className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-indigo-600">{formatNumber(pub.vistas)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Vistas</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-orange-600">{formatNumber(pub.engagement)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Engagement</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-pink-600" />
                      <span className="font-semibold">{formatNumber(pub.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{formatNumber(pub.comentarios)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">{formatNumber(pub.compartidos)}</span>
                    </div>
                    {pub.guardados > 0 && (
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold">{formatNumber(pub.guardados)}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/marketing/campañas/${pub.campaignId}`}>
                    Ver campaña
                  </Button>
                </div>
              </>
            )}

            {pub.estado !== 'published' && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                Sin métricas - {pub.estado === 'draft' ? 'Borrador' : 'Pendiente de publicación'}
              </div>
            )}
          </Card>
        ))}
      </div>

      {publicacionesFiltradas.length === 0 && publicaciones.length > 0 && (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No se encontraron publicaciones</h3>
          <Button variant="outline" onClick={() => { setFiltroPlataforma('todos'); setFiltroEstado('todos'); setFiltroCampaign('todas'); }}>
            Limpiar filtros
          </Button>
        </Card>
      )}
    </div>
  );
}