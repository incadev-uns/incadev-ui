import { useEffect, useState } from 'react';
import { IconFileTypePdf, IconFileTypeDocx, IconFileTypeXls, IconFileText, IconDownload } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/utils/toast';

interface Document {
  id: number;
  name: string;
  type: string;
  version: number;
  created_at: string;
}

interface ExportData {
  documents: Document[];
  stats: {
    total_documents: number;
    uploaded_this_month: number;
    updated_this_month: number;
    academic_count: number;
    administrative_count: number;
    legal_count: number;
  };
  generated_at: string;
}


const getFileIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'PDF':
      return <IconFileTypePdf className="h-5 w-5 text-red-600" />;
    case 'DOCX':
    case 'DOC':
      return <IconFileTypeDocx className="h-5 w-5 text-blue-600" />;
    case 'XLSX':
    case 'XLS':
      return <IconFileTypeXls className="h-5 w-5 text-emerald-600" />;
    default:
      return <IconFileText className="h-5 w-5 text-slate-600" />;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Fecha no disponible';
  }
};

const generateDocumentId = (id: number): string => {
  return `DOC-${String(id).padStart(3, '0')}`;
};

export default function DocumentExportPDF() {
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('documentsExportData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('📦 Datos cargados:', parsedData);
        setData(parsedData);
      } catch (error) {
        console.error('❌ Error parsing export data:', error);
        toast.error('Error al cargar los datos', 'Error');
      }
    } else {
      console.error('❌ No hay datos en localStorage');
    }
    setLoading(false);
  }, []);

  const generatePDF = () => {
    if (!data) {
      toast.error('No hay datos disponibles para exportar', 'Error');
      return;
    }

    setGenerating(true);

    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // ========================================
      // HEADER
      // ========================================
      
      doc.setFillColor(0, 131, 201);
      doc.rect(0, 0, pageWidth, 45, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE DOCUMENTOS', pageWidth / 2, 18, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Gestión Documentaria Institucional', pageWidth / 2, 26, { align: 'center' });

      doc.setFontSize(9);
      doc.text(`Generado el: ${formatDate(data.generated_at)}`, pageWidth / 2, 35, { align: 'center' });

      yPosition = 55;

      // ========================================
      // ESTADÍSTICAS - 3 CAJAS
      // ========================================
      
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 35, 3, 3, 'F');

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN ESTADÍSTICO', margin + 5, yPosition + 8);

      const boxWidth = (pageWidth - (margin * 2) - 10) / 3;
      const boxY = yPosition + 13;
      const boxHeight = 18;

      // Total
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + 5, boxY, boxWidth, boxHeight, 2, 2, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('TOTAL', margin + 5 + boxWidth / 2, boxY + 5, { align: 'center' });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text((data.stats.total_documents || 0).toString(), margin + 5 + boxWidth / 2, boxY + 14, { align: 'center' });

      // Subidos este mes
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin + 10 + boxWidth, boxY, boxWidth, boxHeight, 2, 2, 'FD');
      doc.setTextColor(29, 78, 216);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('SUBIDOS ESTE MES', margin + 10 + boxWidth + boxWidth / 2, boxY + 5, { align: 'center' });
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text((data.stats.uploaded_this_month || 0).toString(), margin + 10 + boxWidth + boxWidth / 2, boxY + 14, { align: 'center' });

      // Actualizados
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(margin + 15 + boxWidth * 2, boxY, boxWidth, boxHeight, 2, 2, 'FD');
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('ACTUALIZADOS', margin + 15 + boxWidth * 2 + boxWidth / 2, boxY + 5, { align: 'center' });
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text((data.stats.updated_this_month || 0).toString(), margin + 15 + boxWidth * 2 + boxWidth / 2, boxY + 14, { align: 'center' });

      yPosition += 45;

      // ========================================
      // DESGLOSE POR TIPO DE DOCUMENTO
      // ========================================

      doc.setFillColor(250, 251, 252);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 28, 3, 3, 'F');

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DESGLOSE POR TIPO', margin + 5, yPosition + 8);

      const typeBoxWidth = (pageWidth - (margin * 2) - 20) / 3;
      const typeStartX = margin + 10;
      const typeY = yPosition + 15;

      // Académico
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Académico', typeStartX + typeBoxWidth / 2, typeY, { align: 'center' });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text((data.stats.academic_count || 0).toString(), typeStartX + typeBoxWidth / 2, typeY + 8, { align: 'center' });

      // Administrativo
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Administrativo', typeStartX + typeBoxWidth + typeBoxWidth / 2, typeY, { align: 'center' });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text((data.stats.administrative_count || 0).toString(), typeStartX + typeBoxWidth + typeBoxWidth / 2, typeY + 8, { align: 'center' });

      // Legal
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Legal', typeStartX + typeBoxWidth * 2 + typeBoxWidth / 2, typeY, { align: 'center' });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text((data.stats.legal_count || 0).toString(), typeStartX + typeBoxWidth * 2 + typeBoxWidth / 2, typeY + 8, { align: 'center' });

      yPosition += 38;

      // ========================================
      // TABLA DE DOCUMENTOS
      // ========================================

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`LISTADO DE DOCUMENTOS (${data.documents.length})`, margin, yPosition);
      yPosition += 10;

      const tableData = data.documents.map(doc => [
        generateDocumentId(doc.id),
        doc.name.length > 50 ? doc.name.substring(0, 50) + '...' : doc.name,
        doc.type || 'N/A',
        formatDate(doc.created_at),
        `v${doc.version || 1}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['ID', 'Nombre del Documento', 'Tipo', 'Fecha', 'Versión']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak',
          halign: 'left',
        },
        headStyles: {
          fillColor: [0, 131, 201],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 45, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: margin, right: margin },
      });

      // ========================================
      // FOOTER EN TODAS LAS PÁGINAS
      // ========================================
      
      const totalPages = (doc.internal.pages as any[]).length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        const footerY = pageHeight - 20;
        doc.setFillColor(0, 131, 201);
        doc.rect(0, footerY, pageWidth, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('INCADEV | Sistema de Gestión Administrativa', pageWidth / 2, footerY + 10, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Reporte oficial generado automáticamente', pageWidth / 2, footerY + 16, { align: 'center' });

        doc.setTextColor(203, 213, 225);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY + 22, { align: 'right' });
      }

      // ========================================
      // GUARDAR PDF
      // ========================================
      
      const fileName = `Reporte_Documentos_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setTimeout(() => {
        setGenerating(false);
        toast.success('El PDF se descargó correctamente', 'PDF Generado');
      }, 500);

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      setGenerating(false);
      toast.error(`Ocurrió un error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'Error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-lg font-semibold text-slate-700">Preparando datos...</p>
          <p className="text-sm text-slate-500 mt-2">Esto solo tomará un momento</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <IconFileTypePdf className="mx-auto mb-6 h-20 w-20 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No hay datos disponibles</h2>
          <p className="text-slate-600 mb-6">No se encontraron documentos para exportar</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Reporte de Documentos</h1>
                <p className="text-blue-100">Gestión Documentaria Institucional</p>
              </div>
              <IconFileTypePdf className="h-16 w-16 text-blue-200" />
            </div>
            <p className="text-sm text-blue-100">
              Generado el: {formatDate(data.generated_at)}
            </p>
          </div>

          {/* Stats - 3 CAJAS */}
          <div className="p-8 bg-slate-50 border-b-2 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen Estadístico</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border-2 border-slate-200 p-4 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{data.stats.total_documents || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 text-center">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Subidos este mes</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{data.stats.uploaded_this_month || 0}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-4 text-center">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Actualizados</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{data.stats.updated_this_month || 0}</p>
              </div>
            </div>

            {/* Desglose por tipo */}
            <div className="mt-6 bg-white rounded-xl border-2 border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Desglose por Tipo</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Académico</p>
                  <p className="text-2xl font-bold text-slate-900">{data.stats.academic_count || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Administrativo</p>
                  <p className="text-2xl font-bold text-slate-900">{data.stats.administrative_count || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Legal</p>
                  <p className="text-2xl font-bold text-slate-900">{data.stats.legal_count || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Vista Previa de Documentos ({data.documents.length})
            </h2>
            <div className="overflow-auto max-h-96 border-2 border-slate-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Nombre</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 text-sm">Tipo</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 text-sm">Fecha</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 text-sm">Versión</th>
                  </tr>
                </thead>
                <tbody>
                  {data.documents.slice(0, 10).map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-slate-700">
                        {generateDocumentId(doc.id)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.type)}
                          <span className="text-sm text-slate-900 truncate max-w-xs">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-slate-200 text-slate-700">
                          {doc.type || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-600">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-600">
                        v{doc.version || 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.documents.length > 10 && (
              <p className="text-center text-sm text-slate-500 mt-4">
                ... y {data.documents.length - 10} documentos más en el PDF completo
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="p-8 bg-slate-50 border-t-2 border-slate-200">
            <button
              onClick={generatePDF}
              disabled={generating}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <IconDownload className="h-5 w-5" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-3">
              El archivo se descargará automáticamente en tu computadora
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => window.close()}
            className="text-slate-600 hover:text-slate-900 font-medium text-sm underline"
          >
            Cerrar esta ventana
          </button>
        </div>
      </div>
    </div>
  );
}