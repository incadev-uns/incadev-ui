import { useEffect, useState } from 'react';
import AdministrativeLayout from '@/process/administrative/AdministrativeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconCheck, IconX, IconEye, IconChevronDown, IconChevronUp, IconArrowsSort, IconUser, IconSearch, IconFilter } from '@tabler/icons-react';
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

export default function PaymentApproval() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceError, setEvidenceError] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [checkingEvidence, setCheckingEvidence] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Payment | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const handleSort = (column: keyof Payment) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortedPayments = () => {
    let filtered = [...payments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.operation_number.toLowerCase().includes(query) ||
        (p.student_name && p.student_name.toLowerCase().includes(query)) ||
        p.agency_number.toLowerCase().includes(query) ||
        p.id.toString().includes(query)
      );
    }

    if (!sortColumn) return filtered;

    return filtered.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue || '');
      const bString = String(bValue || '');

      if (sortDirection === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  };

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const apiUrl = `${config.apiUrl}${config.endpoints.pagos}`;
      const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      const all: Payment[] = data.payments || [];
      const pending = all.filter((p) => (p.status || '').toLowerCase() === 'pending');
      setPayments(pending);
      setError(null);
    } catch (err) {
      console.error('Carga de pagos fallida', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatusOptimistic = (id: number, newStatus: string) => {
    setPayments((prev) => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const confirmMsg = action === 'approve' ? '¿Aprobar este pago y validar la matrícula?' : '¿Rechazar este pago?';
    if (!window.confirm(confirmMsg)) return;

    updatePaymentStatusOptimistic(id, action === 'approve' ? 'approved' : 'rejected');

    try {
      const url = `${config.apiUrl}/api/pagos/${id}/${action}`;
      const res = await fetch(url, { method: 'POST', headers: { 'Accept': 'application/json' } });
      if (!res.ok) {
        await loadPendingPayments();
        throw new Error(`Operación fallida ${res.status}`);
      }
      setPayments((prev) => prev.filter(p => p.id !== id));
      setShowEvidenceModal(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error('Error al actualizar estado del pago', err);
      setError(err instanceof Error ? err.message : 'Error al realizar la acción');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusMap: Record<string, { text: string; className: string }> = {
      approved: { text: 'Aprobado', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
      pending: { text: 'Pendiente', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
      rejected: { text: 'Rechazado', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' }
    };
    const statusInfo = statusMap[statusLower] || { text: status, className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' };
    return <Badge variant="outline" className={statusInfo.className}>{statusInfo.text}</Badge>;
  };

  const openEvidenceModal = async (payment: Payment) => {
    setSelectedPayment(payment);
    setShowEvidenceModal(true);
    setEvidenceError(false);
    setEvidenceUrl(null);
    setCheckingEvidence(true);

    try {
      const response = await fetch(`${config.apiUrl}/api/pagos/${payment.id}/check-evidence`);
      const data = await response.json();

      if (data.exists && data.url) {
        setEvidenceUrl(data.url);
      } else {
        setEvidenceError(true);
      }
    } catch (error) {
      console.error('Error al verificar evidencia:', error);
      setEvidenceError(true);
    } finally {
      setCheckingEvidence(false);
    }
  };

  return (
    <AdministrativeLayout title="Validar Pagos">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-sky-100/90">Pagos Académicos</p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Validar Pagos</h1>
              <p className="mt-2 max-w-xl text-sm text-sky-100/80">Revisa y aprueba los pagos pendientes de validación</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Validación de Pagos</CardTitle>
                  <CardDescription>Lista de pagos pendientes registrados por estudiantes</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por estudiante o N° operación..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center">Cargando pagos pendientes...</div>
              ) : error ? (
                <div className="py-8 text-center text-sm text-red-600">Error: {error}</div>
              ) : payments.length === 0 ? (
                <div className="py-12 text-center">No hay pagos pendientes por validar</div>
              ) : getSortedPayments().length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No se encontraron pagos con los filtros seleccionados</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getSortedPayments().map((p) => (
                    <Card key={p.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-sky-500/50">
                      <CardContent className="p-5">
                        <div className="space-y-4">

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">#{p.id}</span>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Pago ID</p>
                                <p className="text-sm font-semibold">{p.operation_number}</p>
                              </div>
                            </div>
                            {getStatusBadge(p.status)}
                          </div>


                          <div className="space-y-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                                <IconUser className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Estudiante</p>
                                <p className="text-sm font-medium truncate">{p.student_name || 'Sin asignar'}</p>
                              </div>
                            </div>
                          </div>


                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Monto</p>
                              <p className="text-lg font-bold text-sky-600 dark:text-sky-400">{formatCurrency(p.amount)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Fecha</p>
                              <p className="text-sm font-medium">{new Date(p.operation_date).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Agencia</p>
                            <p className="text-sm font-medium">{p.agency_number}</p>
                          </div>


                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-colors"
                            onClick={() => openEvidenceModal(p)}
                          >
                            <IconEye className="h-4 w-4 mr-2" />
                            Ver evidencia y validar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog
            open={showEvidenceModal}
            onOpenChange={(open) => {
              setShowEvidenceModal(open);
              if (!open) {
                setSelectedPayment(null);
                setEvidenceError(false);
                setEvidenceUrl(null);
                setCheckingEvidence(false);
              }
            }}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Evidencia de Pago #{selectedPayment?.id}</DialogTitle>
              </DialogHeader>
              {selectedPayment && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Estudiante:</span> {selectedPayment.student_name || 'Sin asignar'}
                    </div>
                    <div>
                      <span className="font-semibold">N° Operación:</span> {selectedPayment.operation_number}
                    </div>
                    <div>
                      <span className="font-semibold">Agencia:</span> {selectedPayment.agency_number}
                    </div>
                    <div>
                      <span className="font-semibold">Monto:</span> {formatCurrency(selectedPayment.amount)}
                    </div>
                    <div>
                      <span className="font-semibold">Fecha:</span> {new Date(selectedPayment.operation_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Estado:</span> {getStatusBadge(selectedPayment.status)}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <p className="text-sm font-semibold mb-2">Evidencia:</p>
                    {checkingEvidence ? (
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-6 text-center text-sm text-muted-foreground">
                        Verificando comprobante...
                      </div>
                    ) : (
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-4">
                        {selectedPayment.evidence_path && evidenceUrl && !evidenceError ? (
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-center bg-white dark:bg-slate-900 rounded-lg p-4">
                              <img
                                src={evidenceUrl}
                                alt="Evidencia de pago"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                                onError={() => setEvidenceError(true)}
                              />
                            </div>
                            <div className="text-right">
                              <a
                                href={evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-sky-600 hover:underline"
                              >
                                Abrir comprobante en una nueva pestaña
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center h-20 w-28 bg-slate-100 dark:bg-slate-800 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M8 3h8l1 4H7l1-4z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 13l2.5 3L14 11l4 6" />
                              </svg>
                            </div>
                            <div className="flex-1 text-sm text-slate-500 dark:text-slate-400">
                              <div className="font-medium">Comprobante no disponible</div>
                              <div className="text-xs">Se muestran en esta ventana los datos del comprobante; utilícelos para validar la operación.</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowEvidenceModal(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={() => handleAction(selectedPayment.id, 'reject')}>
                      <IconX className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button variant="default" onClick={() => handleAction(selectedPayment.id, 'approve')}>
                      <IconCheck className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdministrativeLayout>
  );
}
