import { useState, useEffect } from 'react';
import { config } from '@/config/administrative-config';

interface Payment {
  id: number;
  enrollment_id: number;
  operation_number: string;
  agency_number: string;
  operation_date: string;
  amount: number;
  evidence_path: string;
  status: string;
  student_name?: string | null;
}

interface PaymentsExportData {
  payments: Payment[];
}

export default function PaymentExportPDF() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (!loading && payments.length >= 0) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, payments]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      let data: PaymentsExportData;

      try {
        const response = await fetch(`${config.apiUrl}/api/pagos/export-data`, {
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

        const storedData = localStorage.getItem('paymentsExportData');
        if (storedData) {
          data = JSON.parse(storedData);
          localStorage.removeItem('paymentsExportData');
        } else {
          throw new Error('No se pudieron obtener los datos del reporte');
        }
      }

      setPayments(data.payments);
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
      'approved': 'Aprobado',
      'pending': 'Pendiente',
      'rejected': 'Rechazado'
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const calculateStats = () => {
    let totalIncome = 0;
    let completedCount = 0;
    let pendingCount = 0;

    payments.forEach((payment) => {
      if (payment.status === 'approved') {
        totalIncome += parseFloat(String(payment.amount));
        completedCount++;
      } else if (payment.status === 'pending') {
        pendingCount++;
      }
    });

    return { totalIncome, completedCount, pendingCount };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600">Cargando reporte de pagos...</p>
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
      <div className="flex justify-between items-start mb-8 pb-5 border-b-[3px] border-sky-500">
        <div className="flex-1">
          <h1 className="text-[28px] font-bold text-sky-700 mb-1 tracking-tight">INCADEV</h1>
          <div className="text-xs text-slate-600 uppercase tracking-widest">
            Instituto de Capacitación y Desarrollo
          </div>
        </div>
        <div className="text-right flex-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Reporte de Pagos</h2>
          <div className="text-xs text-slate-600">
            <div><strong className="text-slate-700">Fecha:</strong> {getCurrentDateTime()}</div>
            <div><strong className="text-slate-700">Total registros:</strong> {payments.length}</div>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Total Ingresos
            </div>
            <div className="text-xl font-bold text-sky-800">
              {formatCurrency(stats.totalIncome)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Pagos Completados
            </div>
            <div className="text-xl font-bold text-slate-800">
              {stats.completedCount}
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
              Pagos Pendientes
            </div>
            <div className="text-xl font-bold text-slate-800">
              {stats.pendingCount}
            </div>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm mb-2">No hay pagos registrados</p>
          <p className="text-xs">No se encontraron datos para mostrar en este reporte</p>
        </div>
      ) : (
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-sky-500" style={{ width: '60px' }}>
                ID
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-sky-500">
                Estudiante
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-sky-500">
                N° Operación
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-sky-500">
                Agencia
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-sky-500" style={{ width: '90px' }}>
                Monto
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-sky-500" style={{ width: '90px' }}>
                Fecha Operación
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-2.5 text-left border-b-2 border-sky-500" style={{ width: '90px' }}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border-b border-slate-200 font-semibold text-sky-700">
                  #{payment.id}
                </td>
                <td className="p-2 border-b border-slate-200 font-medium">
                  {payment.student_name || 'Sin asignar'}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600">
                  {payment.operation_number}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600">
                  {payment.agency_number}
                </td>
                <td className="p-2 border-b border-slate-200 font-semibold text-green-700">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="p-2 border-b border-slate-200 text-slate-600">
                  {payment.operation_date ? formatDate(payment.operation_date) : 'Sin fecha'}
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span className={`inline-block px-2 py-0.5 rounded-xl text-[9px] font-semibold uppercase tracking-wide border ${payment.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : payment.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : payment.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                    {getStatusBadge(payment.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-8 pt-4 border-t-2 border-slate-200 text-center text-[10px] text-slate-500">
        <strong className="text-slate-700">INCADEV</strong> - Instituto de Capacitación y Desarrollo |
        Reporte generado automáticamente |
        Para consultas contactar a tesorería
      </div>
    </div>
  );
}
