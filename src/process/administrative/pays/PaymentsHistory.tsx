import { useState, useEffect } from 'react';
import AdministrativeLayout from '@/process/administrative/AdministrativeLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/config/administrative-config';
import { IconFileText, IconDownload, IconSearch, IconFileTypeCsv, IconFileTypePdf, IconChevronDown, IconChevronUp, IconFilter, IconArrowsSort } from '@tabler/icons-react';

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

interface Stats {
  monthly_income: number;
  monthly_variation: number | null;
  pending_amount: number;
  pending_students: number;
  collection_rate: number | null;
}

interface StatusBreakdown {
  paid?: number;
  completed?: number;
  pending?: number;
  failed?: number;
  cancelled?: number;
  partial?: number;
}

interface PaymentsData {
  payments: Payment[];
  stats: Stats;
  status_breakdown: StatusBreakdown;
}

export default function PaymentsHistory() {
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Payment | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, allPayments, sortColumn, sortDirection, statusFilter]);

  const handleSort = (column: keyof Payment) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setSortColumn(null);
    setSortDirection('desc');
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const apiUrl = `${config.apiUrl}${config.endpoints.pagos}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: PaymentsData = await response.json();
      setStats(data.stats);
      setStatusBreakdown(data.status_breakdown);
      setAllPayments(data.payments);
      setFilteredPayments(data.payments);
      setError(null);
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase().trim();

    let filtered = [...allPayments];

    if (lowerQuery) {
      filtered = filtered.filter((payment) => {
        const studentName = (payment.student_name || '').toLowerCase();
        const paymentId = String(payment.id).toLowerCase();
        const operationNumber = (payment.operation_number || '').toLowerCase();
        return studentName.includes(lowerQuery) || paymentId.includes(lowerQuery) || operationNumber.includes(lowerQuery);
      });
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(payment =>
        statusFilter.includes(payment.status.toLowerCase())
      );
    }

    if (sortColumn) {
      filtered.sort((a, b) => {
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
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const url = `${config.apiUrl}${config.endpoints.pagosExportCsv}`;
    window.open(url, '_blank');
  };

  const exportPDF = () => {
    const url = `${config.apiUrl}${config.endpoints.pagosExportData}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        localStorage.setItem('paymentsExportData', JSON.stringify(data));
        window.open('/administrativo/pagos/export-pdf', '_blank');
      })
      .catch(err => console.error('Error al cargar datos:', err));
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

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pagePayments = filteredPayments.slice(start, end);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AdministrativeLayout title="Historial de Pagos">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-sky-100/90">Pagos Académicos</p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Historial de Pagos</h1>
              <p className="mt-2 max-w-xl text-sm text-sky-100/80">
                Historial de pagos realizados y pendientes
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-sky-500"></div>
                <p className="text-sm text-muted-foreground">Cargando pagos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <IconFileText className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">Error al cargar los pagos: {error}</p>
                <p className="text-xs text-muted-foreground mt-2">Verifica que el backend esté corriendo en {config.apiUrl}</p>
              </div>
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-3">
                  <div className="grid gap-3 md:grid-cols-4 justify-items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <IconDownload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Ingresos del mes</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold truncate">{stats && formatCurrency(stats.monthly_income)}</p>
                        </div>
                        {stats && stats.monthly_variation !== null && (
                          <p className={`text-xs font-semibold mt-1 ${stats.monthly_variation >= 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'} inline-block px-1.5 py-0.5 rounded`}>
                            {stats.monthly_variation >= 0 ? '↗' : '↘'} {Math.abs(stats.monthly_variation).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                        <IconSearch className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        {stats && stats.pending_students > 0 && (
                          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white">
                            {stats.pending_students > 9 ? '9+' : stats.pending_students}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Pendiente verificar</p>
                        <p className="text-2xl font-bold">{stats && formatCurrency(stats.pending_amount)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stats?.pending_students} {stats?.pending_students === 1 ? 'estudiante' : 'estudiantes'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center">
                        <svg className="h-10 w-10 -rotate-90 transform">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-muted/20"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - (stats?.collection_rate || 0) / 100)}`}
                            className="text-sky-600 dark:text-sky-400 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-xs font-bold">
                          {stats?.collection_rate?.toFixed(0) || 0}%
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Tasa de cobro</p>
                        <p className="text-lg font-bold">{stats && stats.collection_rate !== null ? `${stats.collection_rate.toFixed(1)}%` : '--'}</p>
                        <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-sky-600 transition-all duration-500"
                            style={{ width: `${stats?.collection_rate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {statusBreakdown && Object.keys(statusBreakdown).length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estado de pagos</h3>
                        <div className="flex flex-col gap-1.5">
                          {Object.entries(statusBreakdown).map(([status, count]) => {
                            const statusConfig: Record<string, { label: string; className: string }> = {
                              approved: { label: 'Aprobados', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
                              pending: { label: 'Pendientes', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
                              rejected: { label: 'Rechazados', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' }
                            };
                            const config = statusConfig[status] || { label: status, className: '' };
                            return (
                              <Badge key={status} variant="outline" className={`${config.className} text-xs`}>
                                {config.label} · <span className="font-semibold ml-1">{count}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Registro de pagos</CardTitle>
                      <CardDescription>Historial de pagos realizados y pendientes</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {filteredPayments.length} registros
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">
                            <IconDownload className="mr-2 h-4 w-4" />
                            Exportar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={exportCSV}>
                            <IconFileTypeCsv className="mr-2 h-4 w-4" />
                            CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportPDF}>
                            <IconFileTypePdf className="mr-2 h-4 w-4" />
                            PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-0 md:min-w-[280px]">
                      <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre del estudiante o N° Operación..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <IconFilter className="h-4 w-4" />
                          Filtrar estado
                          {statusFilter.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                              {statusFilter.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Estado del pago</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('approved')}
                          onCheckedChange={() => toggleStatusFilter('approved')}
                        >
                          Aprobado
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('pending')}
                          onCheckedChange={() => toggleStatusFilter('pending')}
                        >
                          Pendiente
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('rejected')}
                          onCheckedChange={() => toggleStatusFilter('rejected')}
                        >
                          Rechazado
                        </DropdownMenuCheckboxItem>
                        {(statusFilter.length > 0 || sortColumn) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={clearFilters} className="text-red-600 dark:text-red-400">
                              Limpiar filtros
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={handleClearSearch}>
                      Limpiar búsqueda
                    </Button>
                  </div>

                  {filteredPayments.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">No hay pagos que coincidan con la búsqueda</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 md:hidden">
                        {pagePayments.map((payment) => (
                          <div key={payment.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Pago #{payment.id}</p>
                                <p className="font-semibold text-base">{payment.student_name || 'Sin asignar'}</p>
                              </div>
                              {getStatusBadge(payment.status)}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p><span className="font-medium text-foreground">Operación:</span> {payment.operation_number}</p>
                              <p><span className="font-medium text-foreground">Agencia:</span> {payment.agency_number}</p>
                              <p><span className="font-medium text-foreground">Monto:</span> {formatCurrency(payment.amount)}</p>
                              <p><span className="font-medium text-foreground">Fecha:</span> {new Date(payment.operation_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex justify-end">
                                  {(() => {
                                    const canEmit = (payment.status || '').toLowerCase() === 'approved';
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (!canEmit) return;
                                          localStorage.setItem('invoicePaymentId', String(payment.id));
                                          window.open('/administrativo/pagos/invoice', '_blank');
                                        }}
                                        title={canEmit ? 'Ver comprobante' : 'Disponible solo si el pago está aprobado'}
                                        disabled={!canEmit}
                                        className={!canEmit ? 'opacity-60 pointer-events-none' : ''}
                                      >
                                        Ver comprobante
                                      </Button>
                                    );
                                  })()}
                                </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden md:block rounded-md border">
                        <Table className="table-fixed w-full [&_th]:whitespace-normal [&_td]:whitespace-normal [&_th]:px-4 [&_td]:px-4">
                          <TableHeader>
                            <TableRow className="bg-sky-50 dark:bg-sky-950/20">
                              <TableHead className="w-20">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                                  onClick={() => handleSort('id')}
                                >
                                  ID
                                  {sortColumn === 'id' ? (
                                    sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                                  ) : (
                                    <IconArrowsSort className="h-3 w-3 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                              <TableHead className="min-w-[180px]">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                                  onClick={() => handleSort('student_name')}
                                >
                                  Estudiante
                                  {sortColumn === 'student_name' ? (
                                    sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                                  ) : (
                                    <IconArrowsSort className="h-3 w-3 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                              <TableHead className="hidden md:table-cell min-w-[140px] font-semibold text-sky-700 dark:text-sky-400 text-center">N° Op.</TableHead>
                              <TableHead className="hidden lg:table-cell min-w-[120px] font-semibold text-sky-700 dark:text-sky-400 text-center">Agencia</TableHead>
                              <TableHead className="min-w-[120px]">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                                  onClick={() => handleSort('amount')}
                                >
                                  Monto
                                  {sortColumn === 'amount' ? (
                                    sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                                  ) : (
                                    <IconArrowsSort className="h-3 w-3 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                              <TableHead className="hidden xl:table-cell min-w-[130px]">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                                  onClick={() => handleSort('operation_date')}
                                >
                                  Fecha Op.
                                  {sortColumn === 'operation_date' ? (
                                    sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                                  ) : (
                                    <IconArrowsSort className="h-3 w-3 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                              <TableHead className="min-w-[120px]">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                                  onClick={() => handleSort('status')}
                                >
                                  Estado
                                  {sortColumn === 'status' ? (
                                    sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                                  ) : (
                                    <IconArrowsSort className="h-3 w-3 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                              <TableHead className="text-center min-w-[120px] font-semibold text-sky-700 dark:text-sky-400">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pagePayments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell className="font-semibold text-center">
                                  #{payment.id}
                                </TableCell>
                                <TableCell className="text-center">{payment.student_name || 'Sin asignar'}</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground text-center">
                                  {payment.operation_number}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-muted-foreground text-center">
                                  {payment.agency_number}
                                </TableCell>
                                <TableCell className="font-semibold text-sky-600 dark:text-sky-400 text-center">
                                  {formatCurrency(payment.amount)}
                                </TableCell>
                                <TableCell className="hidden xl:table-cell text-muted-foreground text-center">
                                  {new Date(payment.operation_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-center">{getStatusBadge(payment.status)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                      {(() => {
                                        const canEmit = (payment.status || '').toLowerCase() === 'approved';
                                        return (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              if (!canEmit) return;
                                              localStorage.setItem('invoicePaymentId', String(payment.id));
                                              window.open('/administrativo/pagos/invoice', '_blank');
                                            }}
                                            title={canEmit ? 'Ver comprobante' : 'Disponible solo si el pago está aprobado'}
                                            disabled={!canEmit}
                                            className={!canEmit ? 'opacity-60 pointer-events-none' : ''}
                                          >
                                            <IconFileText className="h-4 w-4" />
                                          </Button>
                                        );
                                      })()}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {start + 1}-{Math.min(end, filteredPayments.length)} de {filteredPayments.length}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={end >= filteredPayments.length}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AdministrativeLayout>
  );
}
