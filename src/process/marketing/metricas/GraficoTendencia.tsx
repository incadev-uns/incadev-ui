// src/components/marketing/metricas/GraficoTendencia.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

const tendenciaMock = [
  { fecha: '02/11', conversaciones: 38, leads: 18, respuestas_auto: 32, derivadas: 6 },
  { fecha: '03/11', conversaciones: 42, leads: 21, respuestas_auto: 36, derivadas: 6 },
  { fecha: '04/11', conversaciones: 45, leads: 23, respuestas_auto: 38, derivadas: 7 },
  { fecha: '05/11', conversaciones: 51, leads: 26, respuestas_auto: 44, derivadas: 7 },
  { fecha: '06/11', conversaciones: 47, leads: 22, respuestas_auto: 40, derivadas: 7 },
  { fecha: '07/11', conversaciones: 44, leads: 24, respuestas_auto: 37, derivadas: 7 },
  { fecha: '08/11', conversaciones: 45, leads: 22, respuestas_auto: 38, derivadas: 7 },
];

const preguntasFrecuentesMock = [
  { pregunta: 'precio', cantidad: 45 },
  { pregunta: 'duración', cantidad: 38 },
  { pregunta: 'certificado', cantidad: 32 },
  { pregunta: 'horarios', cantidad: 28 },
  { pregunta: 'requisitos', cantidad: 24 },
];

export default function GraficoTendencia() {
  const [metricaSeleccionada, setMetricaSeleccionada] = useState<'conversaciones' | 'leads' | 'respuestas_auto'>('conversaciones');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            🤖 Métricas de Chatbot
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Análisis de conversaciones y rendimiento del chatbot
          </p>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Conversaciones
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            312
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ↗️ +18% vs semana anterior
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Leads Generados
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            156
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ↗️ +12% vs semana anterior
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Respuestas Auto
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            265
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            85% del total
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Tasa Conversión
          </p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            50%
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            ↘️ -3% vs semana anterior
          </p>
        </Card>
      </div>

      {/* Selector de métrica */}
      <div className="flex gap-2">
        <Button
          variant={metricaSeleccionada === 'conversaciones' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMetricaSeleccionada('conversaciones')}
        >
          Conversaciones
        </Button>
        <Button
          variant={metricaSeleccionada === 'leads' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMetricaSeleccionada('leads')}
        >
          Leads
        </Button>
        <Button
          variant={metricaSeleccionada === 'respuestas_auto' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMetricaSeleccionada('respuestas_auto')}
        >
          Respuestas Automáticas
        </Button>
      </div>

      {/* Gráfico de líneas - Tendencia por día */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Tendencia Diaria - {metricaSeleccionada.charAt(0).toUpperCase() + metricaSeleccionada.slice(1)}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={tendenciaMock}>
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
              dataKey={metricaSeleccionada}
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 6, fill: '#3b82f6' }}
              activeDot={{ r: 8 }}
              name={metricaSeleccionada.charAt(0).toUpperCase() + metricaSeleccionada.slice(1)}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico combinado */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Conversaciones vs Leads - Últimos 7 días
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={tendenciaMock}>
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

      {/* Respuestas automáticas vs derivadas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🤖 Respuestas Automáticas vs Derivadas a Humano
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tendenciaMock}>
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
            <Bar dataKey="respuestas_auto" fill="#8b5cf6" name="Respuestas Automáticas" />
            <Bar dataKey="derivadas" fill="#f59e0b" name="Derivadas a Humano" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Preguntas más frecuentes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💬 Preguntas Más Frecuentes (Últimos 7 días)
        </h3>
        <div className="space-y-3">
          {preguntasFrecuentesMock.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                  #{idx + 1}
                </Badge>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {item.pregunta}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.cantidad}
                </p>
                <p className="text-xs text-gray-500">consultas</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
