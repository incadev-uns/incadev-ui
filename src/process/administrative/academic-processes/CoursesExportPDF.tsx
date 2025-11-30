import { useState, useEffect } from 'react';

interface Course {
  id: number;
  name: string;
  description: string | null;
  versions_count: number;
  active_versions: number;
  total_students: number;
  created_at: string;
}

interface CoursesExportData {
  courses: Course[];
  stats: {
    total_courses: number;
    total_versions: number;
    total_students: number;
    active_courses: number;
  };
  generated_at: string;
}

export default function CoursesExportPDF() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CoursesExportData['stats'] | null>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (!loading && courses.length >= 0) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, courses]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      let data: CoursesExportData;
      
      try {
        const response = await fetch('/api/courses/export-data', {
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
        
        const storedData = localStorage.getItem('coursesExportData');
        if (storedData) {
          data = JSON.parse(storedData);
          localStorage.removeItem('coursesExportData');
        } else {
          throw new Error('No se pudieron obtener los datos del reporte');
        }
      }

      setCourses(data.courses);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
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
          <p className="text-slate-600">Cargando reporte de cursos...</p>
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Reporte de Cursos</h2>
          <div className="text-xs text-slate-600">
            <div><strong className="text-slate-700">Fecha:</strong> {getCurrentDateTime()}</div>
            <div><strong className="text-slate-700">Total registros:</strong> {courses.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Cursos
            </div>
            <div className="text-xl font-bold text-indigo-800">
              {stats.total_courses}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Cursos Activos
            </div>
            <div className="text-xl font-bold text-emerald-800">
              {stats.active_courses}
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Versiones
            </div>
            <div className="text-xl font-bold text-violet-800">
              {stats.total_versions}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Estudiantes
            </div>
            <div className="text-xl font-bold text-blue-800">
              {stats.total_students}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {courses.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm mb-2">No hay cursos registrados</p>
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
                Nombre del Curso
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500">
                Descripción
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-indigo-500" style={{ width: '80px' }}>
                Versiones
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-indigo-500" style={{ width: '70px' }}>
                Activas
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-indigo-500" style={{ width: '90px' }}>
                Estudiantes
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-indigo-500" style={{ width: '100px' }}>
                Fecha Creación
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={course.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border-b border-slate-200 font-semibold text-indigo-700">
                  #{course.id}
                </td>
                <td className="p-2 border-b border-slate-200 font-medium">
                  {course.name}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600 text-[10px]">
                  {course.description || 'Sin descripción'}
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-lg text-[9px] font-semibold bg-violet-100 text-violet-800 border border-violet-300">
                    {course.versions_count}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-lg text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {course.active_versions}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center font-bold text-indigo-700">
                  {course.total_students}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600">
                  {formatDate(course.created_at)}
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
        Para consultas contactar a gestión académica
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
}