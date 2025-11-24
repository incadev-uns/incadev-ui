// src/components/marketing/metricas/ScoreViabilidad.tsx
import React from 'react';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface PropuestaPendiente {
  id: number;
  nombre: string;
  score: number;
  leads: number;
  roi: number;
  detalles: {
    engagementRedes: number;
    leadsGenerados: number;
    calidadLeads: number;
    costoLead: number;
    interesChatbot: number;
    tendenciaBusqueda: number;
  };
  factoresPositivos: string[];
  factoresRiesgo: string[];
  recomendacion: 'aprobar' | 'revisar' | 'archivar';
  inscripcionesEstimadas: string;
}

const propuestasPendientesMock: PropuestaPendiente[] = [
  {
    id: 1,
    nombre: 'Kotlin Avanzado',
    score: 8.5,
    leads: 23,
    roi: 3.2,
    detalles: {
      engagementRedes: 9,
      leadsGenerados: 8,
      calidadLeads: 9,
      costoLead: 7,
      interesChatbot: 9,
      tendenciaBusqueda: 8,
    },
    factoresPositivos: [
      'Alto engagement (>8%)',
      '23 leads en 7 días (meta: 15)',
      'Baja tasa de rebote en chatbot',
      'Preguntas específicas sobre inscripción',
    ],
    factoresRiesgo: [
      'Costo por lead ligeramente alto (S/12 vs meta S/10)',
    ],
    recomendacion: 'aprobar',
    inscripcionesEstimadas: '18-25 alumnos',
  },
  {
    id: 2,
    nombre: 'Flutter Development',
    score: 6.5,
    leads: 12,
    roi: 2.1,
    detalles: {
      engagementRedes: 6,
      leadsGenerados: 6,
      calidadLeads: 7,
      costoLead: 6,
      interesChatbot: 7,
      tendenciaBusqueda: 7,
    },
    factoresPositivos: [
      'Engagement moderado (6.2%)',
      'Interés consistente durante 7 días',
    ],
    factoresRiesgo: [
      'Leads por debajo de meta (12 vs 15)',
      'ROI límite (2.1x vs meta 2.5x)',
    ],
    recomendacion: 'revisar',
    inscripcionesEstimadas: '10-15 alumnos',
  },
];

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getRecomendacionConfig = (recomendacion: string) => {
  switch (recomendacion) {
    case 'aprobar':
      return {
        label: 'APROBAR',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      };
    case 'archivar':
      return {
        label: 'NO ABRIR',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
      };
    default:
      return {
        label: 'REVISAR',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
      };
  }
};

export default function ScoreViabilidad() {
  return (
    <div className="space-y-4">
      {propuestasPendientesMock.map((propuesta) => {
        const recomendacion = getRecomendacionConfig(propuesta.recomendacion);
        const RecomendacionIcon = recomendacion.icon;

        return (
          <Card key={propuesta.id} className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {propuesta.nombre}
                </h4>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{propuesta.leads} leads</Badge>
                  <Badge variant="secondary">ROI: {propuesta.roi}x</Badge>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor(propuesta.score)}`}>
                  {propuesta.score}/10
                </p>
                <p className="text-xs text-gray-500">Score Total</p>
              </div>
            </div>

            {/* Score detallado con barras */}
            <div className="space-y-3 mb-4">
              {Object.entries(propuesta.detalles).map(([key, value]) => {
                const labels: { [key: string]: string } = {
                  engagementRedes: 'Engagement en redes',
                  leadsGenerados: 'Leads generados',
                  calidadLeads: 'Calidad de leads',
                  costoLead: 'Costo por lead',
                  interesChatbot: 'Interés en chatbot',
                  tendenciaBusqueda: 'Tendencia de búsqueda',
                };

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {labels[key]}
                      </span>
                      <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                        {value}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          value >= 8
                            ? 'bg-green-600 dark:bg-green-500'
                            : value >= 6
                            ? 'bg-yellow-600 dark:bg-yellow-500'
                            : 'bg-red-600 dark:bg-red-500'
                        }`}
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Factores */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <p className="font-semibold text-green-900 dark:text-green-100 mb-2 text-sm">
                  ✅ Factores Positivos
                </p>
                <ul className="space-y-1">
                  {propuesta.factoresPositivos.map((factor, idx) => (
                    <li key={idx} className="text-xs text-green-800 dark:text-green-200">
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2 text-sm">
                  ⚠️ Factores de Riesgo
                </p>
                <ul className="space-y-1">
                  {propuesta.factoresRiesgo.map((factor, idx) => (
                    <li key={idx} className="text-xs text-orange-800 dark:text-orange-200">
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recomendación del sistema */}
            <div className={`p-4 rounded-lg border-2 mb-4 ${
              propuesta.recomendacion === 'aprobar'
                ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                : propuesta.recomendacion === 'archivar'
                ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
            }`}>
              <div className="flex items-start gap-3">
                <RecomendacionIcon className={`w-6 h-6 ${
                  propuesta.recomendacion === 'aprobar'
                    ? 'text-green-600 dark:text-green-400'
                    : propuesta.recomendacion === 'archivar'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
                <div className="flex-1">
                  <p className={`font-bold mb-1 ${
                    propuesta.recomendacion === 'aprobar'
                      ? 'text-green-900 dark:text-green-100'
                      : propuesta.recomendacion === 'archivar'
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-yellow-900 dark:text-yellow-100'
                  }`}>
                    Recomendación del sistema: {recomendacion.label}
                  </p>
                  <p className={`text-sm ${
                    propuesta.recomendacion === 'aprobar'
                      ? 'text-green-800 dark:text-green-200'
                      : propuesta.recomendacion === 'archivar'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {propuesta.recomendacion === 'aprobar'
                      ? `Abrir curso con modalidad híbrida. Inscripciones estimadas: ${propuesta.inscripcionesEstimadas}. ROI proyectado: ${propuesta.roi}x`
                      : propuesta.recomendacion === 'archivar'
                      ? 'No se recomienda abrir el curso debido al bajo interés y ROI insuficiente.'
                      : `Solicitar más datos o extender período de análisis. Actualmente en el límite de viabilidad.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de decisión */}
            <div className="grid grid-cols-4 gap-2">
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4" />
                Aprobar
              </Button>
              <Button variant="destructive" className="gap-2">
                <XCircle className="w-4 h-4" />
                Archivar
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Más datos
              </Button>
              <Button variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                Posponer
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
