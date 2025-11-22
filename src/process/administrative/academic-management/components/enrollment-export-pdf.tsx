import { useState, useEffect } from 'react';
import { config } from '@/config/administrative-config';

interface EnrollmentRecord {
  id: number;
  student_name: string;
  student_dni: string;
  student_email: string;
  course_name: string;
  group_name: string;
  price: number;
  payment_status: string;
  academic_status: string;
  enrollment_date: string;
}

interface Stats {
  total_enrollments: number;
  pending_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  pending_payments: number;
  total_revenue: number;
  pending_revenue: number;
  completion_rate: number;
}

interface EnrollmentExportData {
  enrollments: EnrollmentRecord[];
  stats: Stats;
  generated_at?: string;
}

export default function EnrollmentExportPDF() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (!loading && enrollments.length >= 0) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, enrollments]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      let data: EnrollmentExportData;
      
      try {
        const response = await fetch(`${config.apiUrl}${config.endpoints.enrollments}/export-data`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(`Error ${response.status}`);
        }
      } catch (fetchError) {
        console.error('Error al obtener datos del backend:', fetchError);
        
        const storedData = localStorage.getItem('enrollmentsExportData');
        if (storedData) {
          data = JSON.parse(storedData);
          localStorage.removeItem('enrollmentsExportData');
        } else {
          throw new Error('No se pudieron obtener los datos del reporte');
        }
      }

      setEnrollments(data.enrollments);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'paid': 'Pagado',
      'pending': 'Pendiente',
      'partial': 'Parcial',
      'overdue': 'Vencido'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'partial':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getAcademicStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'active': 'Activo',
      'inactive': 'Inactivo',
      'completed': 'Completado',
      'failed': 'Reprobado'
    };
    return statusMap[status] || status;
  };

  const getAcademicStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'completed':
        return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'inactive':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' - ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600">Cargando reporte de matrículas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Error al cargar el reporte</p>
          <p className="text-sm text-slate-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-10 bg-white text-slate-900" style={{ fontSize: '10px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-5 border-b-[3px] border-blue-500">
        <div className="flex-1">
          <h1 className="text-[28px] font-bold text-blue-700 mb-1 tracking-tight">INCADEV</h1>
          <div className="text-xs text-slate-600 uppercase tracking-widest">
            Instituto de Capacitación y Desarrollo
          </div>
        </div>
        <div className="text-right flex-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Reporte de Matrículas</h2>
          <div className="text-xs text-slate-600">
            <div><strong className="text-slate-700">Fecha:</strong> {getCurrentDateTime()}</div>
            <div><strong className="text-slate-700">Total registros:</strong> {enrollments.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Matrículas
            </div>
            <div className="text-xl font-bold text-blue-800">
              {stats.total_enrollments}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Activas
            </div>
            <div className="text-xl font-bold text-emerald-800">
              {stats.active_enrollments}
            </div>
            <div className="text-[8px] text-slate-600 mt-1">
              {stats.pending_enrollments} pendientes
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Pagos Pendientes
            </div>
            <div className="text-xl font-bold text-amber-800">
              {stats.pending_payments}
            </div>
            <div className="text-[8px] text-slate-600 mt-1">
              ${(Number(stats.pending_revenue ?? 0)).toFixed(2)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Ingresos Totales
            </div>
            <div className="text-lg font-bold text-indigo-800">
              ${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[8px] text-slate-600 mt-1">
              {stats.completion_rate}% completadas
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {enrollments.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm mb-2">No hay matrículas disponibles</p>
          <p className="text-xs">No se encontraron datos para mostrar en este reporte</p>
        </div>
      ) : (
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-left border-b-2 border-blue-500" style={{ width: '50px' }}>
                ID
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-left border-b-2 border-blue-500">
                Estudiante
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-left border-b-2 border-blue-500">
                Curso / Grupo
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '70px' }}>
                Fecha<br/>Matrícula
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-right border-b-2 border-blue-500" style={{ width: '60px' }}>
                Monto
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '70px' }}>
                Estado<br/>Pago
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '70px' }}>
                Estado<br/>Académico
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment, index) => (
              <tr key={enrollment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border-b border-slate-200 font-mono text-[9px] font-semibold text-blue-700">
                  #{enrollment.id}
                </td>
                <td className="p-2 border-b border-slate-200">
                  <div className="font-medium">{enrollment.student_name}</div>
                  <div className="text-[8px] text-slate-500">
                    {enrollment.student_dni && <span>DNI: {enrollment.student_dni} | </span>}
                    {enrollment.student_email}
                  </div>
                </td>
                <td className="p-2 border-b border-slate-200">
                  <div className="font-medium text-[9px]">{enrollment.course_name}</div>
                  <div className="text-[8px] text-slate-500">{enrollment.group_name}</div>
                </td>
                <td className="p-2 border-b border-slate-200 text-center text-[9px] text-slate-600">
                  {enrollment.enrollment_date}
                </td>
                <td className="p-2 border-b border-slate-200 text-right">
                  <span className="font-bold text-blue-700">
                    ${(Number(enrollment.price ?? 0)).toFixed(2)}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-xl text-[8px] font-semibold uppercase tracking-wide border ${getPaymentStatusColor(enrollment.payment_status)}`}>
                    {getPaymentStatusBadge(enrollment.payment_status)}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-xl text-[8px] font-semibold uppercase tracking-wide border ${getAcademicStatusColor(enrollment.academic_status)}`}>
                    {getAcademicStatusBadge(enrollment.academic_status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Summary Footer */}
      {enrollments.length > 0 && stats && (
        <div className="mt-6 grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
              Total Matrículas
            </div>
            <div className="text-lg font-bold text-blue-700">
              {stats.total_enrollments}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
              Completadas
            </div>
            <div className="text-lg font-bold text-violet-700">
              {stats.completed_enrollments}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
              Tasa de Completación
            </div>
            <div className="text-lg font-bold text-emerald-700">
              {(Number(stats.completion_rate ?? 0)).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
              Ingresos Totales
            </div>
            <div className="text-lg font-bold text-indigo-700">
              ${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Breakdown */}
      {enrollments.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-[10px] font-semibold text-slate-700 mb-2 uppercase tracking-wide">
            Resumen de Pagos
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-[8px] text-slate-600">Pagados</div>
              <div className="text-base font-bold text-emerald-700">
                {enrollments.filter(e => e.payment_status === 'paid').length}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-slate-600">Pendientes</div>
              <div className="text-base font-bold text-amber-700">
                {enrollments.filter(e => e.payment_status === 'pending').length}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-slate-600">Parciales</div>
              <div className="text-base font-bold text-blue-700">
                {enrollments.filter(e => e.payment_status === 'partial').length}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-slate-600">Vencidos</div>
              <div className="text-base font-bold text-red-700">
                {enrollments.filter(e => e.payment_status === 'overdue').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-slate-200 text-center text-[10px] text-slate-500">
        <strong className="text-slate-700">INCADEV</strong> - Instituto de Capacitación y Desarrollo | 
        Reporte generado automáticamente | 
        Para consultas contactar a administración académica
      </div>
    </div>
  );
}