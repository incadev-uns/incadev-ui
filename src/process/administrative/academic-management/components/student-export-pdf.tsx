import { useState, useEffect } from 'react';
import { config } from '@/config/administrative-config';

interface Student {
  id: number;
  fullname: string;
  dni: string;
  email: string;
  phone?: string | null;
  created_at: string;
  total_enrollments: number;
  active_enrollments: number;
  status: string;
}

interface Stats {
  total_students: number;
  active_students: number;
  inactive_students: number;
}

interface StudentsExportData {
  students: Student[];
  stats: Stats;
}

export default function StudentExportPDF() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
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
      let data: StudentsExportData;
      
      try {
        const response = await fetch(`${config.apiUrl}/api/gestion-academica/estudiantes/export-data`, {
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
        
        const storedData = localStorage.getItem('studentsExportData');
        if (storedData) {
          data = JSON.parse(storedData);
          localStorage.removeItem('studentsExportData');
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
      'inactive': 'Inactivo'
    };
    return statusMap[status] || status;
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
          <p className="text-slate-600">Cargando reporte de estudiantes...</p>
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
    <div className="max-w-[1000px] mx-auto p-10 bg-white text-slate-900" style={{ fontSize: '11px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-5 border-b-[3px] border-indigo-500">
        <div className="flex-1">
          <h1 className="text-[28px] font-bold text-indigo-700 mb-1 tracking-tight">INCADEV</h1>
          <div className="text-xs text-slate-600 uppercase tracking-widest">
            Instituto de Capacitación y Desarrollo
          </div>
        </div>
        <div className="text-right flex-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Reporte de Estudiantes</h2>
          <div className="text-xs text-slate-600">
            <div><strong className="text-slate-700">Fecha:</strong> {getCurrentDateTime()}</div>
            <div><strong className="text-slate-700">Total registros:</strong> {students.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Estudiantes
            </div>
            <div className="text-xl font-bold text-indigo-800">
              {stats.total_students}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Estudiantes Activos
            </div>
            <div className="text-xl font-bold text-emerald-800">
              {stats.active_students}
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Estudiantes Inactivos
            </div>
            <div className="text-xl font-bold text-slate-800">
              {stats.inactive_students}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {students.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm mb-2">No hay estudiantes registrados</p>
          <p className="text-xs">No se encontraron datos para mostrar en este reporte</p>
        </div>
      ) : (
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500" style={{ width: '50px' }}>
                ID
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500">
                Nombre Completo
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500" style={{ width: '70px' }}>
                DNI
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500">
                Email
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500" style={{ width: '85px' }}>
                Teléfono
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-indigo-500" style={{ width: '70px' }}>
                Matrículas
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500" style={{ width: '70px' }}>
                Estado
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500" style={{ width: '80px' }}>
                Registro
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border-b border-slate-200 font-semibold text-indigo-700">
                  #{student.id}
                </td>
                <td className="p-2 border-b border-slate-200 font-medium">
                  {student.fullname}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600">
                  {student.dni}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600 text-[10px]">
                  {student.email}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600">
                  {student.phone || 'Sin teléfono'}
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="font-semibold text-indigo-700">
                    {student.total_enrollments}
                  </span>
                  {student.active_enrollments > 0 && (
                    <span className="text-[9px] text-emerald-600 ml-1">
                      ({student.active_enrollments} activas)
                    </span>
                  )}
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span className={`inline-block px-2 py-0.5 rounded-xl text-[9px] font-semibold uppercase tracking-wide border ${
                    student.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {getStatusBadge(student.status)}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600">
                  {formatDate(student.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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