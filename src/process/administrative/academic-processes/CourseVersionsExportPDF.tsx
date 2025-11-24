import { useState, useEffect } from 'react';

interface CourseVersion {
  id: number;
  course_name: string;
  version: string;
  name: string;
  price: string;
  status: string;
  modules_count: number;
  groups_count: number;
  students_count: number;
  created_at: string;
}

interface VersionsExportData {
  versions: CourseVersion[];
  stats: {
    total_versions: number;
    published_versions: number;
    draft_versions: number;
    archived_versions: number;
  };
  generated_at: string;
}

export default function CourseVersionsExportPDF() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [stats, setStats] = useState<VersionsExportData['stats'] | null>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (!loading && versions.length >= 0) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, versions]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Intentar obtener datos desde localStorage
      const storedData = localStorage.getItem('courseVersionsExportData');
      if (storedData) {
        const data: VersionsExportData = JSON.parse(storedData);
        setVersions(data.versions);
        setStats(data.stats);
        localStorage.removeItem('courseVersionsExportData');
        setError(null);
      } else {
        throw new Error('No se pudieron obtener los datos del reporte');
      }
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

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'Publicado': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'Borrador': 'bg-amber-100 text-amber-800 border-amber-300',
      'Archivado': 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return statusMap[status] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600">Cargando reporte de versiones...</p>
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
    <div className="max-w-[1200px] mx-auto p-10 bg-white text-slate-900" style={{ fontSize: '11px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-5 border-b-[3px] border-violet-500">
        <div className="flex-1">
          <h1 className="text-[28px] font-bold text-violet-700 mb-1 tracking-tight">INCADEV</h1>
          <div className="text-xs text-slate-600 uppercase tracking-widest">
            Instituto de Capacitación y Desarrollo
          </div>
        </div>
        <div className="text-right flex-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Reporte de Versiones de Cursos</h2>
          <div className="text-xs text-slate-600">
            <div><strong className="text-slate-700">Fecha:</strong> {getCurrentDateTime()}</div>
            <div><strong className="text-slate-700">Total registros:</strong> {versions.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Versiones
            </div>
            <div className="text-xl font-bold text-violet-800">
              {stats.total_versions}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Publicadas
            </div>
            <div className="text-xl font-bold text-emerald-800">
              {stats.published_versions}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Borradores
            </div>
            <div className="text-xl font-bold text-amber-800">
              {stats.draft_versions}
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Archivadas
            </div>
            <div className="text-xl font-bold text-slate-800">
              {stats.archived_versions}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {versions.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm mb-2">No hay versiones registradas</p>
          <p className="text-xs">No se encontraron datos para mostrar en este reporte</p>
        </div>
      ) : (
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-violet-500" style={{ width: '50px' }}>
                ID
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-violet-500">
                Curso
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-violet-500" style={{ width: '80px' }}>
                Versión
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-violet-500">
                Nombre
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-right border-b-2 border-violet-500" style={{ width: '90px' }}>
                Precio
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-violet-500" style={{ width: '90px' }}>
                Estado
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-violet-500" style={{ width: '70px' }}>
                Módulos
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-violet-500" style={{ width: '70px' }}>
                Grupos
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-center border-b-2 border-violet-500" style={{ width: '80px' }}>
                Estudiantes
              </th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version, index) => (
              <tr key={version.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border-b border-slate-200 font-semibold text-violet-700">
                  #{version.id}
                </td>
                <td className="p-2 border-b border-slate-200 font-medium text-[10px]">
                  {version.course_name}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-700 font-mono text-[10px]">
                  {version.version}
                </td>
                <td className="p-2 border-b border-slate-200 font-medium">
                  {version.name}
                </td>
                <td className="p-2 border-b border-slate-200 text-right font-bold text-violet-700">
                  S/. {version.price}
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-semibold border ${getStatusBadgeClass(version.status)}`}>
                    {version.status}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-lg text-[9px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                    {version.modules_count}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-lg text-[9px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                    {version.groups_count}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 text-center font-bold text-violet-700">
                  {version.students_count}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-slate-100 to-slate-50 font-bold">
              <td colSpan={6} className="p-2.5 border-t-2 border-slate-300 text-right text-slate-700">
                TOTALES:
              </td>
              <td className="p-2.5 border-t-2 border-slate-300 text-center text-violet-700">
                {versions.reduce((sum, v) => sum + v.modules_count, 0)}
              </td>
              <td className="p-2.5 border-t-2 border-slate-300 text-center text-violet-700">
                {versions.reduce((sum, v) => sum + v.groups_count, 0)}
              </td>
              <td className="p-2.5 border-t-2 border-slate-300 text-center text-violet-700">
                {versions.reduce((sum, v) => sum + v.students_count, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      {/* Summary by Status */}
      {versions.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Versiones Publicadas
            </div>
            <div className="text-lg font-bold text-emerald-800">
              {versions.filter(v => v.status === 'Publicado').length}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Versiones en Borrador
            </div>
            <div className="text-lg font-bold text-amber-800">
              {versions.filter(v => v.status === 'Borrador').length}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Versiones Archivadas
            </div>
            <div className="text-lg font-bold text-slate-800">
              {versions.filter(v => v.status === 'Archivado').length}
            </div>
          </div>
        </div>
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