import { useEffect, useState } from 'react';
import { IconFileTypePdf, IconFileTypeDocx, IconFileTypeXls, IconFileText, IconDownload } from '@tabler/icons-react';
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

// ========================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ========================================
export const generateDocumentsPDF = async (data: ExportData) => {
  try {
    // ✅ IMPORTACIÓN DINÁMICA
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

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

    return true;
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    throw error;
  }
};

// ========================================
// ✅ COMPONENTE REACT (NUEVO - DEFAULT EXPORT)
// ========================================
const DocumentExportPDF = () => {
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setData(parsedData);
      } catch (error) {
        console.error('Error parsing data:', error);
        toast.error('Error al cargar los datos');
      }
    }
    setLoading(false);
  }, []);

  const handleGeneratePDF = async () => {
    if (!data) return;
    
    try {
      await generateDocumentsPDF(data);
      toast.success('PDF generado correctamente');
      setTimeout(() => window.close(), 500);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">No se encontraron datos para exportar</p>
          <button 
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <IconFileTypePdf className="w-20 h-20 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Reporte de Documentos
        </h1>
        <p className="text-gray-600 mb-6">
          Se generará un PDF con {data.documents.length} documento(s)
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleGeneratePDF}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconDownload className="w-5 h-5" />
            Generar PDF
          </button>
          
          <button
            onClick={() => window.close()}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentExportPDF;