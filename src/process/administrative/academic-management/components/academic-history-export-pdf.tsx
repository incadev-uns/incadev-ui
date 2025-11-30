import { useState, useEffect } from 'react';
import { config } from '@/config/administrative-config';

interface StudentRecord {
  id: number;
  code: string;
  fullname: string;
  email: string;
  dni: string;
  phone: string;
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  failed_courses: number;
  average_grade: number;
  total_credits: number;
  earned_credits: number;
  completion_percentage: number;
  certificates_count: number;
  academic_status: string;
  payment_status: string;
  registration_date: string;
}

interface Stats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  average_completion_rate: number;
  total_certificates_issued: number;
}

interface AcademicHistoryExportData {
  students: StudentRecord[];
  stats: Stats;
  export_date?: string;
  total_records?: number;
}

export default function AcademicHistoryExportPDF() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (!loading && students.length >= 0) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, students]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      let data: AcademicHistoryExportData;
      
      try {
        const response = await fetch(`${config.apiUrl}${config.endpoints.academicHistoryExportData}`, {
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
        
        const storedData = localStorage.getItem('academicHistoryExportData');
        if (storedData) {
          data = JSON.parse(storedData);
          localStorage.removeItem('academicHistoryExportData');
        } else {
          throw new Error('No se pudieron obtener los datos del reporte');
        }
      }

      setStudents(data.students);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'graduated': 'Graduado',
      'suspended': 'Suspendido'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'graduated':
        return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'paid': 'Al día',
      'pending': 'Pendiente',
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
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
          <p className="text-slate-600">Cargando reporte de historial académico...</p>
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Historial Académico</h2>
          <div className="text-xs text-slate-600">
            <div><strong className="text-slate-700">Fecha:</strong> {getCurrentDateTime()}</div>
            <div><strong className="text-slate-700">Total registros:</strong> {students.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Estudiantes
            </div>
            <div className="text-xl font-bold text-blue-800">
              {stats.total_students}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Activos
            </div>
            <div className="text-xl font-bold text-emerald-800">
              {stats.active_students}
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Graduados
            </div>
            <div className="text-xl font-bold text-violet-800">
              {stats.graduated_students}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Tasa Finalización
            </div>
            <div className="text-xl font-bold text-indigo-800">
              {stats.average_completion_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {students.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm mb-2">No hay registros académicos disponibles</p>
          <p className="text-xs">No se encontraron datos para mostrar en este reporte</p>
        </div>
      ) : (
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-left border-b-2 border-blue-500" style={{ width: '80px' }}>
                Código
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-left border-b-2 border-blue-500">
                Estudiante
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '50px' }}>
                Total<br/>Cursos
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '50px' }}>
                Compl.
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '50px' }}>
                En Prog.
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '50px' }}>
                Promedio
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '50px' }}>
                Avance
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-center border-b-2 border-blue-500" style={{ width: '45px' }}>
                Cert.
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-left border-b-2 border-blue-500" style={{ width: '70px' }}>
                Estado
              </th>
              <th className="text-[9px] uppercase tracking-wider font-semibold p-2 text-left border-b-2 border-blue-500" style={{ width: '70px' }}>
                Pagos
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border-b border-slate-200 font-mono text-[9px] font-semibold text-blue-700">
                  {student.code}
                </td>
                <td className="p-2 border-b border-slate-200">
                  <div className="font-medium">{student.fullname}</div>
                  <div className="text-[8px] text-slate-500">{student.email}</div>
                </td>
                <td className="p-2 border-b border-slate-200 text-center font-semibold text-blue-700">
                  {student.total_courses}
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="font-semibold text-emerald-700">
                    {student.completed_courses}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="font-semibold text-blue-700">
                    {student.in_progress_courses}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className={`font-bold ${
                    student.average_grade >= 18 ? 'text-emerald-700' :
                    student.average_grade >= 14 ? 'text-blue-700' :
                    student.average_grade >= 11 ? 'text-amber-700' :
                    'text-red-700'
                  }`}>
                    {student.average_grade > 0 ? student.average_grade.toFixed(1) : '--'}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${student.completion_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-semibold">
                      {student.completion_percentage.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 font-semibold text-[8px]">
                    {student.certificates_count}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span className={`inline-block px-2 py-0.5 rounded-xl text-[8px] font-semibold uppercase tracking-wide border ${getStatusColor(student.academic_status)}`}>
                    {getStatusBadge(student.academic_status)}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span className={`inline-block px-2 py-0.5 rounded-xl text-[8px] font-semibold uppercase tracking-wide border ${getPaymentStatusColor(student.payment_status)}`}>
                    {getPaymentStatusBadge(student.payment_status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Summary Footer */}
      {students.length > 0 && stats && (
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
              Promedio General
            </div>
            <div className="text-lg font-bold text-blue-700">
              {(students.reduce((sum, s) => sum + s.average_grade, 0) / students.length).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
              Total Certificados
            </div>
            <div className="text-lg font-bold text-violet-700">
              {stats.total_certificates_issued}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
              Cursos Completados
            </div>
            <div className="text-lg font-bold text-emerald-700">
              {students.reduce((sum, s) => sum + s.completed_courses, 0)}
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