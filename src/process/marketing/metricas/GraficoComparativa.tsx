// src/components/marketing/metricas/GraficoComparativa.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const dataMock = [
  { nombre: 'Python ML', leads: 34, engagement: 2156, conversaciones: 67 },
  { nombre: 'Kotlin Avanz.', leads: 23, engagement: 1234, conversaciones: 45 },
  { nombre: 'React Native', leads: 15, engagement: 735, conversaciones: 28 },
  { nombre: 'Flutter', leads: 12, engagement: 471, conversaciones: 22 },
  { nombre: 'Java Spring', leads: 2, engagement: 234, conversaciones: 8 },
];

const rankingMock = [
  { pos: 1, nombre: 'Python ML', leads: 34, engagement: 11.2, score: 9.2, estado: 'aprobado' },
  { pos: 2, nombre: 'Kotlin Avanzado', leads: 23, engagement: 9.8, score: 8.5, estado: 'pendiente' },
  { pos: 3, nombre: 'React Native', leads: 15, engagement: 7.5, score: 7.8, estado: 'pendiente' },
  { pos: 4, nombre: 'Flutter', leads: 12, engagement: 6.2, score: 6.5, estado: 'pendiente' },
  { pos: 5, nombre: 'Java Spring', leads: 2, engagement: 2.5, score: 3.1, estado: 'archivado' },
];

export default function GraficoComparativa() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de barras - Leads */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comparativa - Leads por Propuesta
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataMock} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis type="number" className="text-xs" stroke="#9ca3af" />
            <YAxis
              dataKey="nombre"
              type="category"
              className="text-xs"
              stroke="#9ca3af"
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="leads" fill="#3b82f6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico de barras - Engagement */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comparativa - Engagement Total
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataMock} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis type="number" className="text-xs" stroke="#9ca3af" />
            <YAxis
              dataKey="nombre"
              type="category"
              className="text-xs"
              stroke="#9ca3af"
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="engagement" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabla de ranking */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🏆 Top 5 Propuestas con Mejor Desempeño
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pos
                </th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Propuesta
                </th>
                <th className="text-center p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Leads
                </th>
                <th className="text-center p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Engagement %
                </th>
                <th className="text-center p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Score
                </th>
                <th className="text-center p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {rankingMock.map((item) => (
                <tr
                  key={item.pos}
                  className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <td className="p-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      item.pos === 1
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                        : item.pos === 2
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        : item.pos === 3
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                        : 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-500'
                    }`}>
                      {item.pos}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {item.nombre}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {item.leads}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {item.engagement}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-lg font-bold ${
                      item.score >= 8
                        ? 'text-green-600 dark:text-green-400'
                        : item.score >= 6
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {item.score}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {item.estado === 'aprobado' ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                        ✅ Aprobado
                      </Badge>
                    ) : item.estado === 'archivado' ? (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                        ❌ Archivado
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                        🟡 Pendiente
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
