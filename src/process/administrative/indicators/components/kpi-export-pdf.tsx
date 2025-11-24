import { useEffect, useState } from 'react';
import { IconFileTypePdf, IconTrendingUp, IconTrendingDown, IconMinus, IconDownload } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from '@/utils/toast'; // ← IMPORTAR EL TOAST

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

export default function KpiExportPDF() {
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('kpiExportData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (error) {
        console.error('Error parsing data:', error);
        toast.error('Error al cargar los datos', 'Error de datos');
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

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
      'Cumplido': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', rgb: [16, 185, 129] as [number, number, number] },
      'En camino': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', rgb: [59, 130, 246] as [number, number, number] },
      'Requiere atención': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', rgb: [239, 68, 68] as [number, number, number] },
    };
    return colors[status as keyof typeof colors] || colors['Requiere atención'];
  };

  const generatePDF = () => {
    if (!data || !data.kpis) {
      toast.error('No hay datos disponibles para exportar', 'Error');
      return;
    }

    setGenerating(true);

    try {
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

      setTimeout(() => {
        setGenerating(false);
        // ✅ USAR TOAST EN VEZ DE ALERT
        toast.success('El PDF se descargó correctamente', 'PDF Generado');
      }, 500);

    } catch (error) {
      console.error('Error generando PDF:', error);
      setGenerating(false);
      // ❌ USAR TOAST PARA ERRORES
      toast.error('Ocurrió un error al generar el PDF', 'Error');
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

  if (!data || !data.kpis) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <IconFileTypePdf className="mx-auto mb-6 h-20 w-20 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No hay datos disponibles</h2>
          <p className="text-slate-600 mb-6">No se encontraron indicadores para exportar</p>
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

  const cumplidos = data.kpis.filter(k => k.status === 'Cumplido').length;
  const enCamino = data.kpis.filter(k => k.status === 'En camino').length;
  const requierenAtencion = data.kpis.filter(k => k.status === 'Requiere atención').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Reporte de Indicadores</h1>
                <p className="text-blue-100">Key Performance Indicators (KPIs)</p>
              </div>
              <IconFileTypePdf className="h-16 w-16 text-blue-200" />
            </div>
            <p className="text-sm text-blue-100">
              Generado el: {formatDate(data.generated_at)}
            </p>
          </div>

          <div className="p-8 bg-slate-50 border-b-2 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen Ejecutivo</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border-2 border-slate-200 p-4 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{data.kpis.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-4 text-center">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Cumplidos</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{cumplidos}</p>
              </div>
              <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 text-center">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">En Camino</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{enCamino}</p>
              </div>
              <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4 text-center">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">En Riesgo</p>
                <p className="mt-2 text-3xl font-bold text-red-700">{requierenAtencion}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Vista Previa de Indicadores</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.kpis.slice(0, 3).map((kpi, index) => {
                const progress = kpi.goal_value > 0 ? (kpi.current_value / kpi.goal_value) * 100 : 0;
                const statusColor = getStatusColor(kpi.status);
                
                return (
                  <div key={kpi.id} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{kpi.display_name}</h3>
                          <p className="text-sm text-slate-600">
                            Meta: {kpi.goal_value.toFixed(0)}% | Actual: {kpi.current_value.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
                        {kpi.status}
                      </span>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-slate-200">
                      <div 
                        className="absolute h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-right">{progress.toFixed(1)}%</p>
                  </div>
                );
              })}
              {data.kpis.length > 3 && (
                <p className="text-center text-sm text-slate-500 py-2">
                  ... y {data.kpis.length - 3} indicadores más
                </p>
              )}
            </div>
          </div>

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