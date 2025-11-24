// src/components/marketing/PropuestasPreview.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Edit, XCircle, Loader2 } from 'lucide-react';
import { fetchProposals } from '../../services/marketing/proposalService';
import type { ProposalForUI } from '../../services/marketing/types';

const estadoConfig = {
  borrador: {
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-900/50',
    label: 'Borrador',
    icon: Edit,
  },
  activa: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/50',
    label: 'Activa',
    icon: Clock,
  },
  pausada: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-900/50',
    label: 'Pausada',
    icon: AlertCircle,
  },
  aprobada: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900/50',
    label: 'Aprobada',
    icon: CheckCircle,
  },
  rechazada: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900/50',
    label: 'Rechazada',
    icon: XCircle,
  },
};

const prioridadColor = {
  alta: 'border-l-4 border-l-red-500',
  media: 'border-l-4 border-l-yellow-500',
  baja: 'border-l-4 border-l-green-500',
};

export default function PropuestasPreview() {
  const [propuestas, setPropuestas] = useState<ProposalForUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProposals() {
      try {
        const data = await fetchProposals();
        // Mostrar solo las últimas 3 propuestas
        setPropuestas(data.slice(0, 3));
      } catch (error) {
        console.error('[PropuestasPreview] Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProposals();
  }, []);

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Propuestas de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Propuestas de Contenido
        </CardTitle>
        <a
          href="/marketing/propuestas"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline smooth-transition"
        >
          Ver todas →
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {propuestas.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No hay propuestas registradas
            </p>
          ) : (
            propuestas.map(p => {
              const estadoInfo = estadoConfig[p.estado as keyof typeof estadoConfig] || estadoConfig.borrador;
              const StatusIcon = estadoInfo.icon;
              const prioridadClass = prioridadColor[p.prioridad as keyof typeof prioridadColor] || '';

              return (
                <a
                  key={p.id}
                  href={'/marketing/propuestas/' + p.id}
                  className={
                    'flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg smooth-transition border border-gray-200 dark:border-gray-800 group ' +
                    prioridadClass
                  }
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 smooth-transition">
                        {p.tema}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{p.departamento}</span>
                      <span>•</span>
                      <span>{new Date(p.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  <div className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ' + estadoInfo.bg + ' ' + estadoInfo.text + ' ' + estadoInfo.border}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {estadoInfo.label}
                  </div>
                </a>
              );
            })
          )}

          <a
            href="/marketing/propuestas"
            className="flex items-center justify-center w-full mt-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 smooth-transition group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:scale-110 smooth-transition" />
            Nueva Propuesta
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
