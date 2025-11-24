// src/components/marketing/AlumnosResumen.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, BookOpen, CheckCircle, XCircle, UserX, GraduationCap, Users, Loader2 } from 'lucide-react';
import { fetchStudentStats, type StudentStatsForUI } from '../../services/marketing/studentStatsService';

const statsConfig = [
  {
    key: 'cursando' as const,
    label: 'Cursando',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900/50',
  },
  {
    key: 'pendientes' as const,
    label: 'Pendientes',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-900/50',
  },
  {
    key: 'completados' as const,
    label: 'Completados',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-900/50',
  },
  {
    key: 'egresados' as const,
    label: 'Egresados',
    icon: GraduationCap,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-900/50',
  },
  {
    key: 'desertores' as const,
    label: 'Desertores',
    icon: UserX,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900/50',
  },
  {
    key: 'reprobados' as const,
    label: 'Reprobados',
    icon: XCircle,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-900/50',
  },
];

export default function AlumnosResumen() {
  const [stats, setStats] = useState<StudentStatsForUI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchStudentStats();
        setStats(data);
      } catch (error) {
        console.error('[AlumnosResumen] Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-900 dark:text-white text-lg">
            Seguimiento de Alumnos
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
      <CardHeader className="pb-3">
        <CardTitle className="text-gray-900 dark:text-white text-lg">
          Seguimiento de Alumnos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Total de matriculados */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Matriculados</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.totalMatriculados || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de estados */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {statsConfig.map(s => {
            const Icon = s.icon;
            const value = stats ? stats[s.key] : 0;

            return (
              <div
                key={s.label}
                className={'p-3 rounded-lg border hover:shadow-md smooth-transition cursor-pointer group ' + s.bg + ' ' + s.border}
              >
                <div className="flex items-center gap-3">
                  <div className={'p-2 rounded-full ' + s.bg}>
                    <Icon className={'w-5 h-5 group-hover:scale-110 smooth-transition ' + s.color} />
                  </div>
                  <div>
                    <p className={'text-xl font-bold ' + s.color}>{value}</p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {s.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href="/marketing/alumnos"
            className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm text-center smooth-transition"
          >
            Ver reporte completo
          </a>
          <button
            className="py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm smooth-transition"
          >
            Exportar datos
          </button>
        </div>
      </CardContent>
    </Card>
  );
}