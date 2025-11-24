// src/process/marketing/DashboardStats.tsx
import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { fetchProposals } from '../../services/marketing/proposalService';
import { fetchAllCampaigns } from '../../services/marketing/campaignService';
import { fetchCourses } from '../../services/marketing/courseService';
import { fetchStudentStats } from '../../services/marketing/studentStatsService';

interface DashboardStatsData {
  propuestasActivas: number;
  propuestasAprobadas: number;
  cursosActivos: number;
  totalMatriculados: number;
  campanasActivas: number;
  tasaAprobacion: number;
  totalPropuestas: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Cargar datos en paralelo
        const [proposals, campaigns, courses, studentStats] = await Promise.all([
          fetchProposals(),
          fetchAllCampaigns(),
          fetchCourses(),
          fetchStudentStats()
        ]);

        // Calcular estadísticas de propuestas
        const propuestasActivas = proposals.filter(
          p => p.estado === 'activa' || p.estado === 'borrador'
        ).length;
        const propuestasAprobadas = proposals.filter(
          p => p.estado === 'aprobada'
        ).length;

        // Calcular campañas activas
        const campanasActivas = campaigns.filter(
          c => c.estado === 'activa'
        ).length;

        // Cursos activos
        const cursosActivos = courses.length;

        // Total matriculados desde el nuevo endpoint
        const totalMatriculados = studentStats.totalMatriculados;

        // Tasa de aprobación
        const totalPropuestas = propuestasActivas + propuestasAprobadas;
        const tasaAprobacion = totalPropuestas > 0
          ? (propuestasAprobadas / totalPropuestas) * 100
          : 0;

        setStats({
          propuestasActivas,
          propuestasAprobadas,
          cursosActivos,
          totalMatriculados,
          campanasActivas,
          tasaAprobacion,
          totalPropuestas
        });
      } catch (error) {
        console.error('[DashboardStats] Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-6 bg-gray-100 dark:bg-gray-800 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400">
        Error al cargar estadísticas
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        title="Propuestas Activas"
        value={stats.propuestasActivas}
        icon="file-text"
        color="blue"
      />

      <StatCard
        title="Propuestas Aprobadas"
        value={stats.propuestasAprobadas}
        icon="file-text"
        color="green"
      />

      <StatCard
        title="Cursos Activos"
        value={stats.cursosActivos}
        icon="calendar"
        color="purple"
      />

      <StatCard
        title="Matriculados"
        value={stats.totalMatriculados}
        icon="users"
        color="orange"
      />

      <StatCard
        title="Campañas Activas"
        value={stats.campanasActivas}
        icon="megaphone"
        color="blue"
      />
    </div>
  );
}

// Componente para la sección de Tasa de Aprobación
export function ApprovalRateSection() {
  const [data, setData] = useState<{ rate: number; approved: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const proposals = await fetchProposals();
        const approved = proposals.filter(p => p.estado === 'aprobada').length;
        const activas = proposals.filter(
          p => p.estado === 'activa' || p.estado === 'borrador'
        ).length;
        const total = approved + activas;
        const rate = total > 0 ? (approved / total) * 100 : 0;

        setData({ rate, approved, total });
      } catch (error) {
        console.error('[ApprovalRateSection] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-900/50 p-6 animate-pulse h-24" />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
            Tasa de Aprobación de Propuestas
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              {data.rate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.approved} de {data.total} propuestas aprobadas
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Promedio histórico: 38% | Meta: 45%
          </p>
        </div>
        <div className="text-right">
          <svg
            className="w-16 h-16 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
