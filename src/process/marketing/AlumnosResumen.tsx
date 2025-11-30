// src/components/marketing/AlumnosResumen.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, BookOpen, CheckCircle, XCircle, UserX, GraduationCap, Users, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchAlumnosData, type StudentStatsForUI, type AlumnoForUI } from '../../services/marketing/studentStatsService';

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
  const [alumnos, setAlumnos] = useState<AlumnoForUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchAlumnosData();
        setStats(data.stats);
        setAlumnos(data.alumnos);
      } catch (error) {
        console.error('[AlumnosResumen] Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Calcular insights de asistencias y rendimiento
  const insights = React.useMemo(() => {
    if (alumnos.length === 0) return null;

    const alumnosConAsistencias = alumnos.filter(a => a.asistencias !== null);
    const alumnosConNotas = alumnos.filter(a => a.rendimiento !== null);

    const promedioAsistencia = alumnosConAsistencias.length > 0
      ? alumnosConAsistencias.reduce((sum, a) => sum + (a.asistencias?.porcentaje || 0), 0) / alumnosConAsistencias.length
      : 0;

    const promedioNotas = alumnosConNotas.length > 0
      ? alumnosConNotas.reduce((sum, a) => sum + (a.rendimiento?.promedioNotas || 0), 0) / alumnosConNotas.length
      : 0;

    const alumnosConBajaAsistencia = alumnosConAsistencias.filter(a => (a.asistencias?.porcentaje || 0) < 70).length;
    const alumnosEnRiesgo = alumnosConNotas.filter(a => (a.rendimiento?.promedioNotas || 0) < 60).length;

    return {
      promedioAsistencia,
      promedioNotas,
      alumnosConBajaAsistencia,
      alumnosEnRiesgo,
      totalConDatos: alumnosConAsistencias.length,
    };
  }, [alumnos]);

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

        {/* Insights de Rendimiento y Asistencias */}
        {insights && insights.totalConDatos > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Insights de Rendimiento
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Promedio de Asistencia */}
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Asistencia Promedio</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {insights.promedioAsistencia.toFixed(1)}%
                  </p>
                  {insights.promedioAsistencia >= 80 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : insights.promedioAsistencia < 70 ? (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {insights.alumnosConBajaAsistencia > 0
                    ? `${insights.alumnosConBajaAsistencia} con baja asistencia`
                    : 'Todos sobre 70%'
                  }
                </p>
              </div>

              {/* Promedio de Notas */}
              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Promedio General</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {insights.promedioNotas.toFixed(1)}
                  </p>
                  {insights.promedioNotas >= 75 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : insights.promedioNotas < 60 ? (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {insights.alumnosEnRiesgo > 0
                    ? `${insights.alumnosEnRiesgo} en riesgo académico`
                    : 'Todos sobre 60 pts'
                  }
                </p>
              </div>
            </div>

            {/* Alertas si hay alumnos en riesgo 
            {(insights.alumnosConBajaAsistencia > 0 || insights.alumnosEnRiesgo > 0) && (
              <div className="mt-3 p-2.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}*/}
          </div>
        )}

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