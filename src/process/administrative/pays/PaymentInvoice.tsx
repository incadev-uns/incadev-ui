import { useState, useEffect } from 'react';
import { config } from '@/config/administrative-config';

interface InvoiceData {
  id: number;
  operation_number: string;
  operation_date: string;
  status: string;
  student_name: string;
  document_number: string;
  email: string;
  agency_number: string;
  amount: number | string | null;
}

interface PaymentInvoiceProps {
  paymentId?: string;
}

export default function PaymentInvoice({ paymentId: propPaymentId }: PaymentInvoiceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(propPaymentId || null);
  const [autoDownload, setAutoDownload] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      const storedId = localStorage.getItem('invoicePaymentId');
      const shouldAutoDownload = localStorage.getItem('invoiceAutoDownload') === 'true';
      if (storedId) {
        setPaymentId(storedId);
        setAutoDownload(shouldAutoDownload);
        localStorage.removeItem('invoicePaymentId');
        localStorage.removeItem('invoiceAutoDownload');
      } else {
        setError('No se proporcionó ID de pago');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (paymentId) {
      loadInvoiceData();
    }
  }, [paymentId]);

  useEffect(() => {
    if (!loading && invoiceData) {
      if (autoDownload) {
        setTimeout(() => {
          window.print();
          setTimeout(() => window.close(), 500);
        }, 500);
      } else {
        setTimeout(() => window.print(), 500);
      }
    }
  }, [loading, invoiceData, autoDownload]);

  const loadInvoiceData = async () => {
    if (!paymentId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/pagos/${paymentId}/invoice-data`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const payload = await response.json();
      const invoiceData: InvoiceData = (payload && payload.data) ? payload.data : payload;
      setInvoiceData(invoiceData as InvoiceData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar factura:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'approved': 'Aprobado',
      'pending': 'Pendiente',
      'rejected': 'Rechazado'
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount?: number | string | null) => {
    const value = amount === null || amount === undefined ? 0 : Number(amount);
    if (Number.isNaN(value)) return 'S/0.00';
    return `S/${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error al cargar la factura</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return null;
  }

  return (
    <div className="max-w-[800px] mx-auto p-10 bg-white text-slate-900" style={{ fontSize: '12px' }}>
      <div className="relative flex justify-between items-start mb-12 pr-[180px] min-h-[120px]">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-1 text-slate-900">INCADEV</h1>
          <div className="text-xs uppercase tracking-wider text-slate-600">
            Instituto de Capacitación y Desarrollo
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[180px] text-right">
          <div className="text-xs uppercase tracking-wider mb-2 text-slate-600 font-semibold">
            Factura
          </div>
          <div className="text-slate-700 leading-relaxed">
            <div><strong>Número:</strong> {invoiceData.operation_number || 'N/D'}</div>
            <div><strong>Emitida:</strong> {invoiceData.operation_date ? formatDate(invoiceData.operation_date) : 'N/D'}</div>
            <div><strong>Generada:</strong> {getCurrentDateTime()}</div>
            <div className="inline-block mt-2 px-2 py-1 rounded-xl text-[10px] uppercase tracking-wider bg-sky-100 text-sky-700">
              {getStatusText(invoiceData.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="text-xs uppercase tracking-wider mb-2 text-slate-600 font-semibold">
            Facturar a
          </div>
          <div className="leading-relaxed">
            <div className="font-bold">{invoiceData.student_name || 'Estudiante'}</div>
            {invoiceData.document_number && <div>Documento: {invoiceData.document_number}</div>}
            {invoiceData.email && <div>Email: {invoiceData.email}</div>}
          </div>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="text-xs uppercase tracking-wider mb-2 text-slate-600 font-semibold">
            Detalles del pago
          </div>
          <div className="leading-relaxed">
            <div>ID Pago: #{invoiceData.id}</div>
            <div>Agencia: {invoiceData.agency_number}</div>
            {invoiceData.operation_date && <div>Fecha de operación: {formatDate(invoiceData.operation_date)}</div>}
            <div>Estado del pago: {getStatusText(invoiceData.status)}</div>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse mt-6">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left text-[10px] uppercase tracking-wider text-slate-600 p-2">
              Descripción
            </th>
            <th className="text-left text-[10px] uppercase tracking-wider text-slate-600 p-2">
              Cantidad
            </th>
            <th className="text-left text-[10px] uppercase tracking-wider text-slate-600 p-2">
              Precio unitario
            </th>
            <th className="text-left text-[10px] uppercase tracking-wider text-slate-600 p-2">
              Importe
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="p-2">Servicios educativos - Matrícula y mensualidad</td>
            <td className="p-2">1</td>
            <td className="p-2">{formatCurrency(invoiceData.amount)}</td>
            <td className="p-2">{formatCurrency(invoiceData.amount)}</td>
          </tr>
        </tbody>
      </table>

      <div className="w-[220px] ml-auto mt-6 border-t-2 border-slate-900">
        <div className="flex justify-between py-1.5">
          <span>Subtotal</span>
          <span className="font-bold">{formatCurrency(invoiceData.amount)}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span>IGV (0%)</span>
          <span className="font-bold">S/0.00</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span>Total</span>
          <span className="font-bold">{formatCurrency(invoiceData.amount)}</span>
        </div>
      </div>

      <div className="mt-10 text-[10px] text-center text-slate-600">
        Gracias por su pago. Ante cualquier consulta comunicarse con tesorería. Este documento ha sido generado electrónicamente mediante INCADEV.
      </div>
    </div>
  );
}
