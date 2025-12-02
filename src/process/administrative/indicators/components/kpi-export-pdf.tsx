import { useEffect, useState } from 'react';
import { IconFileTypePdf, IconDownload } from '@tabler/icons-react';

interface KPI {
  id: number;
  name: string;
  display_name: string;
  goal_value: number;
  current_value: number;
  previous_value: number;
  trend: number;
  status: 'Requiere atención' | 'En camino' | 'Cumplido';
}

interface ExportData {
  kpis: KPI[];
  generated_at: string;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
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

const getStatusColor = (status: string) => {
  const colors = {
    'Cumplido': { rgb: [16, 185, 129] as [number, number, number] },
    'En camino': { rgb: [59, 130, 246] as [number, number, number] },
    'Requiere atención': { rgb: [239, 68, 68] as [number, number, number] },
  };
  return colors[status as keyof typeof colors] || colors['Requiere atención'];
};

// ========================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ========================================
export const generateKpisPDF = async (data: ExportData) => {
  try {
    // ✅ IMPORTACIÓN DINÁMICA
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // ========================================
    // HEADER CON LOGO Y TÍTULO
    // ========================================
    
    doc.setFillColor(0, 131, 201);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INDICADORES', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Key Performance Indicators (KPIs)', pageWidth / 2, 26, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Generado el: ${formatDate(data.generated_at)}`, pageWidth / 2, 35, { align: 'center' });

    yPosition = 55;

    // ========================================
    // RESUMEN EJECUTIVO
    // ========================================
    
    const cumplidos = data.kpis.filter(k => k.status === 'Cumplido').length;
    const enCamino = data.kpis.filter(k => k.status === 'En camino').length;
    const requierenAtencion = data.kpis.filter(k => k.status === 'Requiere atención').length;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 35, 3, 3, 'F');

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', margin + 5, yPosition + 8);

    const boxWidth = (pageWidth - (margin * 2) - 15) / 4;
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
    doc.text(data.kpis.length.toString(), margin + 5 + boxWidth / 2, boxY + 14, { align: 'center' });

    // Cumplidos
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin + 10 + boxWidth, boxY, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('CUMPLIDOS', margin + 10 + boxWidth + boxWidth / 2, boxY + 5, { align: 'center' });
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(cumplidos.toString(), margin + 10 + boxWidth + boxWidth / 2, boxY + 14, { align: 'center' });

    // En Camino
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin + 15 + boxWidth * 2, boxY, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('EN CAMINO', margin + 15 + boxWidth * 2 + boxWidth / 2, boxY + 5, { align: 'center' });
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(enCamino.toString(), margin + 15 + boxWidth * 2 + boxWidth / 2, boxY + 14, { align: 'center' });

    // Requieren Atención
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin + 20 + boxWidth * 3, boxY, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('EN RIESGO', margin + 20 + boxWidth * 3 + boxWidth / 2, boxY + 5, { align: 'center' });
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(requierenAtencion.toString(), margin + 20 + boxWidth * 3 + boxWidth / 2, boxY + 14, { align: 'center' });

    yPosition += 45;

    // ========================================
    // DETALLE DE KPIs
    // ========================================

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE INDICADORES', margin, yPosition);
    yPosition += 8;

    data.kpis.forEach((kpi, index) => {
      if (yPosition > pageHeight - 70) {
        doc.addPage();
        yPosition = margin;
      }

      const progress = kpi.goal_value > 0 ? (kpi.current_value / kpi.goal_value) * 100 : 0;
      const statusColor = getStatusColor(kpi.status);
      const cardHeight = 50;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), cardHeight, 3, 3, 'FD');

      doc.setFillColor(0, 131, 201);
      doc.circle(margin + 7, yPosition + 8, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text((index + 1).toString(), margin + 7, yPosition + 9.5, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.display_name, margin + 15, yPosition + 10);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      
      const valuesY = yPosition + 18;
      doc.text(`Meta: `, margin + 15, valuesY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${kpi.goal_value.toFixed(0)}%`, margin + 27, valuesY);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Actual: `, margin + 50, valuesY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${kpi.current_value.toFixed(0)}%`, margin + 64, valuesY);

      if (kpi.previous_value > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Anterior: `, margin + 87, valuesY);
        doc.setFont('helvetica', 'bold');
        doc.text(`${kpi.previous_value.toFixed(0)}%`, margin + 106, valuesY);
      }

      if (kpi.trend !== 0) {
        const trendX = pageWidth - margin - 35;
        const trendY = yPosition + 6;
        const trendColor = kpi.trend > 0 ? [16, 185, 129] : [239, 68, 68];
        const trendBg = kpi.trend > 0 ? [236, 253, 245] : [254, 242, 242];
        
        doc.setFillColor(trendBg[0], trendBg[1], trendBg[2]);
        doc.roundedRect(trendX, trendY, 30, 8, 2, 2, 'F');
        
        doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const trendText = `${kpi.trend > 0 ? '↑' : '↓'} ${Math.abs(kpi.trend).toFixed(1)}%`;
        doc.text(trendText, trendX + 15, trendY + 5.5, { align: 'center' });
      }

      const progressBarY = yPosition + 26;
      const progressBarWidth = pageWidth - (margin * 2) - 20;
      const progressBarX = margin + 10;

      doc.setFillColor(226, 232, 240);
      doc.roundedRect(progressBarX, progressBarY, progressBarWidth, 6, 3, 3, 'F');

      const progressWidth = (progressBarWidth * Math.min(progress, 100)) / 100;
      doc.setFillColor(statusColor.rgb[0], statusColor.rgb[1], statusColor.rgb[2]);
      doc.roundedRect(progressBarX, progressBarY, progressWidth, 6, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      if (progressWidth > 20) {
        doc.text(`${progress.toFixed(1)}%`, progressBarX + progressWidth - 2, progressBarY + 4.5, { align: 'right' });
      } else {
        doc.setTextColor(71, 85, 105);
        doc.text(`${progress.toFixed(1)}%`, progressBarX + progressWidth + 3, progressBarY + 4.5);
      }

      const statusX = margin + 10;
      const statusY = yPosition + 38;
      const statusWidth = 45;
      
      doc.setFillColor(statusColor.rgb[0], statusColor.rgb[1], statusColor.rgb[2]);
      doc.setDrawColor(statusColor.rgb[0], statusColor.rgb[1], statusColor.rgb[2]);
      doc.roundedRect(statusX, statusY, statusWidth, 7, 2, 2, 'FD');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.status.toUpperCase(), statusX + statusWidth / 2, statusY + 5, { align: 'center' });

      yPosition += cardHeight + 6;
    });

    // ========================================
    // FOOTER
    // ========================================
    
    const footerY = pageHeight - 20;
    doc.setFillColor(0, 131, 201);
    doc.rect(0, footerY, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INCADEV | Sistema de Gestión Administrativa', pageWidth / 2, footerY + 10, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es un reporte oficial generado automáticamente', pageWidth / 2, footerY + 16, { align: 'center' });

    const totalPages = (doc.internal.pages as any[]).length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY + 22, { align: 'right' });
    }

    // ========================================
    // GUARDAR PDF
    // ========================================
    
    const fileName = `Reporte_KPIs_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    throw error;
  }
};

// ========================================
// ✅ COMPONENTE REACT (DEFAULT EXPORT)
// ========================================
const KpiExportPDF = () => {
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
      }
    }
    setLoading(false);
  }, []);

  const handleGeneratePDF = async () => {
    if (!data) return;
    
    try {
      await generateKpisPDF(data);
      setTimeout(() => window.close(), 500);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el PDF');
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
          Reporte de Indicadores (KPIs)
        </h1>
        <p className="text-gray-600 mb-6">
          Se generará un PDF con {data.kpis.length} indicador(es)
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

export default KpiExportPDF;