// src/components/marketing/chatbot/EstadisticasChatbot.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  periodo: string;
  resumen: {
    total_conversaciones: number;
    tasa_bot: number;
    leads_generados: number;
    atendidas_humano: number;
    tiempo_respuesta_promedio: string;
    satisfaccion: number;
  };
  por_canal: Array<{
    canal: string;
    conversaciones: number;
    porcentaje: number;
  }>;
  por_dia: Array<{
    fecha: string;
    conversaciones: number;
    leads: number;
  }>;
  palabras_clave: Array<{
    palabra: string;
    veces: number;
  }>;
  automatizaciones_usadas: Array<{
    nombre: string;
    veces: number;
  }>;
}

const estadisticasMock: Stats = {
  periodo: 'ultimos_7_dias',
  resumen: {
    total_conversaciones: 312,
    tasa_bot: 89,
    leads_generados: 156,
    atendidas_humano: 34,
    tiempo_respuesta_promedio: '2.5 min',
    satisfaccion: 95,
  },
  por_canal: [
    { canal: 'WhatsApp', conversaciones: 209, porcentaje: 67 },
    { canal: 'Messenger', conversaciones: 103, porcentaje: 33 },
  ],
  por_dia: [
    { fecha: '02/11', conversaciones: 38, leads: 18 },
    { fecha: '03/11', conversaciones: 42, leads: 21 },
    { fecha: '04/11', conversaciones: 45, leads: 23 },
    { fecha: '05/11', conversaciones: 51, leads: 26 },
    { fecha: '06/11', conversaciones: 47, leads: 22 },
    { fecha: '07/11', conversaciones: 44, leads: 24 },
    { fecha: '08/11', conversaciones: 45, leads: 22 },
  ],
  palabras_clave: [
    { palabra: 'curso', veces: 234 },
    { palabra: 'inscripción', veces: 189 },
    { palabra: 'precio', veces: 156 },
    { palabra: 'certificado', veces: 134 },
    { palabra: 'modalidad', veces: 98 },
  ],
  automatizaciones_usadas: [
    { nombre: 'Consulta Curso Existente', veces: 234 },
    { nombre: 'Saludo Inicial', veces: 456 },
    { nombre: 'Horarios de Atención', veces: 89 },
    { nombre: 'Curso NO Disponible', veces: 12 },
  ],
};

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function EstadisticasChatbot() {
  const [periodo, setPeriodo] = useState<'hoy' | '7dias' | '30dias'>('7dias');
  const [stats] = useState<Stats>(estadisticasMock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Estadísticas del Chatbot
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis de rendimiento y métricas clave
          </p>
        </div>

        {/* Filtro de período */}
        <div className="flex gap-2">
          <Button
            variant={periodo === 'hoy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriodo('hoy')}
          >
            Hoy
          </Button>
          <Button
            variant={periodo === '7dias' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriodo('7dias')}
          >
            7 días
          </Button>
          <Button
            variant={periodo === '30dias' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriodo('30dias')}
          >
            30 días
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.resumen.total_conversaciones}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Conversaciones
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.resumen.tasa_bot}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Bot Rate
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.resumen.leads_generados}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Leads
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.resumen.atendidas_humano}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Por humano
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
            {stats.resumen.tiempo_respuesta_promedio}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            T. Respuesta
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
            {stats.resumen.satisfaccion}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Satisfacción
          </p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversaciones por día */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conversaciones y Leads por Día
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.por_dia}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis
                dataKey="fecha"
                className="text-xs"
                stroke="#9ca3af"
              />
              <YAxis className="text-xs" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="conversaciones"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Conversaciones"
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#10b981"
                strokeWidth={2}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Conversaciones por canal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conversaciones por Canal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.por_canal}
                dataKey="conversaciones"
                nameKey="canal"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.canal}: ${entry.porcentaje}%`}
              >
                {stats.por_canal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Palabras más buscadas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔥 Top 5 Palabras Más Buscadas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.palabras_clave} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis type="number" className="text-xs" stroke="#9ca3af" />
              <YAxis
                dataKey="palabra"
                type="category"
                className="text-xs"
                stroke="#9ca3af"
              />
              <Tooltip />
              <Bar dataKey="veces" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Automatizaciones más usadas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🤖 Automatizaciones Más Usadas
          </h3>
          <div className="space-y-4">
            {stats.automatizaciones_usadas.map((auto, index) => {
              const total = stats.automatizaciones_usadas.reduce((sum, a) => sum + a.veces, 0);
              const porcentaje = Math.round((auto.veces / total) * 100);

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {auto.nombre}
                    </span>
                    <Badge variant="secondary">{auto.veces}x</Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Embudo de Conversión
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Conversaciones Iniciadas
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.resumen.total_conversaciones}
                </span>
              </div>
              <div className="w-full bg-blue-600 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                100%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Leads Generados
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.resumen.leads_generados}
                </span>
              </div>
              <div
                className="bg-purple-600 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                style={{ width: '50%' }}
              >
                50%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Matrículas (estimado)
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  36
                </span>
              </div>
              <div
                className="bg-green-600 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                style={{ width: '23%' }}
              >
                23%
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
