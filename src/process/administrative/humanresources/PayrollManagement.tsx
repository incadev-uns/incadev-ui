import { useState, useEffect } from 'react';
import AdministrativeLayout from '@/process/administrative/AdministrativeLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, FileText, Plus, Filter, MoreHorizontal, Edit, Trash2, User, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { config } from '@/config/administrative-config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/process/administrative/hooks/use-toast';
import { Toaster } from '@/process/administrative/humanresources/components/ui/toaster';

interface Employee {
  id: number;
  user: {
    id: number;
    fullname: string;
    email: string;
    dni: string;
  };
  is_active: boolean;
  active_contract: {
    id: number;
    staff_type: string;
    payment_type: string;
    amount: number;
  } | null;
}

interface Contract {
  id: number;
  user_id: number;
  staff_type: string;
  payment_type: string;
  amount: number;
  start_date: string;
  end_date: string | null;
}

interface PayrollExpense {
  id: number;
  contract_id: number;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  contract: {
    id: number;
    staff_type: string;
    payment_type: string;
    amount: number;
    user: {
      id: number;
      fullname: string;
      email: string;
    };
  };
}

interface PayrollStats {
  total_amount: number;
  total_payments: number;
  amount_by_staff_type: Record<string, number>;
  amount_by_payment_type: Record<string, number>;
  average_payment: number;
}

interface Filters {
  employee_id?: number | string;
  contract_id?: number | string;
  sort_by?: string;
  start_date?: string;
  end_date?: string;
}

interface CreatePayrollData {
  contract_id: number;
  amount: string;
  date: string;
  description: string;
}

export default function PayrollManagement() {
  const [payrollExpenses, setPayrollExpenses] = useState<PayrollExpense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<PayrollStats>({
    total_amount: 0,
    total_payments: 0,
    amount_by_staff_type: {},
    amount_by_payment_type: {},
    average_payment: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    sort_by: 'date_desc'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollExpense | null>(null);
  
  const [formData, setFormData] = useState<CreatePayrollData>({
    contract_id: 0,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchPayrollData();
    fetchEmployees();
  }, [filters]);

  useEffect(() => {
    if (formData.contract_id) {
      const selectedContract = contracts.find(c => c.id === formData.contract_id);
      if (selectedContract) {
        setFormData(prev => ({
          ...prev,
          amount: selectedContract.amount.toString()
        }));
      }
    }
  }, [formData.contract_id, contracts]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value.toString());
        }
      });
      
      console.log('🔍 Fetching payroll with filters:', filters);
      console.log('📡 API URL:', `${config.apiUrl}${config.endpoints.payroll}?${queryParams.toString()}`);
      
      const expensesResponse = await fetch(`${config.apiUrl}${config.endpoints.payroll}?${queryParams.toString()}`);
      const statsResponse = await fetch(`${config.apiUrl}${config.endpoints.payrollStats}?${queryParams.toString()}`);
      
      if (!expensesResponse.ok) {
        const errorData = await expensesResponse.json().catch(() => null);
        throw new Error(errorData?.error || `Error ${expensesResponse.status} al cargar pagos`);
      }
      
      let statsData = { success: true, data: stats };
      if (statsResponse.ok) {
        statsData = await statsResponse.json();
      } else {
        console.warn('⚠️ No se pudieron cargar las estadísticas, usando valores por defecto');
      }
      
      const expensesData = await expensesResponse.json();
      
      console.log('📦 Payroll API response:', expensesData);
      console.log('📊 Stats API response:', statsData);
      
      if (expensesData.success) {
        setPayrollExpenses(expensesData.data || []);
        
        if (statsData.success) {
          setStats(statsData.data);
        }
      } else {
        throw new Error(expensesData.error || 'Error al cargar datos');
      }
    } catch (error) {
      console.error('❌ Error al cargar nómina:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos de nómina');
      
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'Error al cargar datos',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.employees}?status=active`);
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees || []);
        const activeContracts = data.employees.flatMap((emp: Employee) => 
          emp.active_contract ? [{ ...emp.active_contract, user_id: emp.user.id }] : []
        );
        setContracts(activeContracts);
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string | number | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === undefined || value === 'all') {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
      
      console.log(`🔄 Filter changed: ${key} = ${value}`, newFilters);
      return newFilters;
    });
  };

  const openModal = (payroll?: PayrollExpense) => {
    if (payroll) {
      setSelectedPayroll(payroll);
      setFormData({
        contract_id: payroll.contract_id,
        amount: payroll.amount.toString(),
        date: payroll.date.split('T')[0],
        description: payroll.description || ''
      });
    } else {
      setSelectedPayroll(null);
      setFormData({
        contract_id: 0,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayroll(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = selectedPayroll 
        ? `${config.apiUrl}${config.endpoints.payroll}/${selectedPayroll.id}`
        : `${config.apiUrl}${config.endpoints.payroll}`;
      
      const method = selectedPayroll ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchPayrollData();
        closeModal();
        toast({
          title: "✅ Éxito",
          description: selectedPayroll ? "Pago actualizado correctamente" : "Pago registrado correctamente",
        });
      } else {
        throw new Error(result.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al guardar pago:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'Error al guardar el pago',
        variant: "destructive",
      });
    }
  };

  const deletePayroll = async (id: number) => {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.payroll}/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchPayrollData();
        toast({
          title: "✅ Éxito",
          description: "Pago eliminado correctamente",
        });
      } else {
        throw new Error(result.error || 'Error al eliminar pago');
      }
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'Error al eliminar pago',
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const getStaffTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      teacher: 'Docente',
      administrator: 'Administrativo',
      support: 'Soporte'
    };
    return labels[type] || type;
  };

  const getPaymentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      monthly: 'Mensual',
      weekly: 'Por horas',
      per_course: 'Por curso'
    };
    return labels[type] || type;
  };

  const getSortIcon = () => {
    switch (filters.sort_by) {
      case 'date_desc': return <ArrowDown className="h-3 w-3" />;
      case 'date_asc': return <ArrowUp className="h-3 w-3" />;
      case 'amount_desc': return <ArrowDown className="h-3 w-3" />;
      case 'amount_asc': return <ArrowUp className="h-3 w-3" />;
      default: return <ArrowUpDown className="h-3 w-3" />;
    }
  };

  const getSortLabel = () => {
    switch (filters.sort_by) {
      case 'date_desc': return 'Más recientes';
      case 'date_asc': return 'Más antiguos';
      case 'amount_desc': return 'Mayor monto';
      case 'amount_asc': return 'Menor monto';
      default: return 'Ordenar por';
    }
  };

  const getFilterDescription = () => {
    const parts = [];
    
    if (filters.employee_id) {
      const employee = employees.find(e => e.id === Number(filters.employee_id));
      if (employee) {
        parts.push(`Empleado: ${employee.user.fullname}`);
      }
    }
    
    if (filters.sort_by) {
      parts.push(`Orden: ${getSortLabel()}`);
    }
    
    return parts.length > 0 ? ` - Filtrado: ${parts.join(', ')}` : '';
  };

  return (
    <AdministrativeLayout title="Recursos Humanos | Gestión de Nómina">
      <div className="min-h-screen p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
        
          {/* Cabecera */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-green-500 to-green-600 px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-green-100/90">
                Módulo de Recursos Humanos
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">
                Gestión de Nómina
              </h1>
              <p className="mt-1 text-xs text-green-100/80">
                Administra los pagos y nómina del personal
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-green-500 dark:border-slate-800 dark:border-t-green-400"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando información de nómina...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar la nómina: {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={fetchPayrollData}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Nómina</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</div>
                    <p className="text-xs text-muted-foreground">Periodo actual</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_payments}</div>
                    <p className="text-xs text-muted-foreground">Registros de pago</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pago Promedio</CardTitle>
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.average_payment)}</div>
                    <p className="text-xs text-muted-foreground">Por empleado</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                    <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contracts.length}</div>
                    <p className="text-xs text-muted-foreground">Con contrato activo</p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 opacity-50" />
                        <Select 
                          value={filters.employee_id?.toString() || 'all'} 
                          onValueChange={(value) => handleFilterChange('employee_id', value !== 'all' ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger className="w-40 h-9">
                            <SelectValue placeholder="Filtrar por empleado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los empleados</SelectItem>
                            {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id.toString()}>
                                {emp.user.fullname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtro de ordenamiento */}
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                        <Select 
                          value={filters.sort_by || 'date_desc'} 
                          onValueChange={(value) => handleFilterChange('sort_by', value)}
                        >
                          <SelectTrigger className="w-40 h-9">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getSortIcon()}
                                <span>{getSortLabel()}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date_desc">
                              <div className="flex items-center gap-2">
                                <ArrowDown className="h-3 w-3" />
                                Más recientes
                              </div>
                            </SelectItem>
                            <SelectItem value="date_asc">
                              <div className="flex items-center gap-2">
                                <ArrowUp className="h-3 w-3" />
                                Más antiguos
                              </div>
                            </SelectItem>
                            <SelectItem value="amount_desc">
                              <div className="flex items-center gap-2">
                                <ArrowDown className="h-3 w-3" />
                                Mayor monto
                              </div>
                            </SelectItem>
                            <SelectItem value="amount_asc">
                              <div className="flex items-center gap-2">
                                <ArrowUp className="h-3 w-3" />
                                Menor monto
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => openModal()} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Pago
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payroll Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Registros de Nómina</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Mostrando {payrollExpenses.length} registros de pago{getFilterDescription()}
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-10 px-3">Empleado</TableHead>
                          <TableHead className="h-10 px-3">Tipo Staff</TableHead>
                          <TableHead className="h-10 px-3">Tipo Pago</TableHead>
                          <TableHead className="h-10 px-3">Monto</TableHead>
                          <TableHead className="h-10 px-3">Fecha</TableHead>
                          <TableHead className="h-10 px-3">Descripción</TableHead>
                          <TableHead className="h-10 px-3 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollExpenses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p className="text-sm opacity-50">No se encontraron registros de pago</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          payrollExpenses.map((expense) => (
                            <TableRow key={expense.id} className="group">
                              <TableCell className="px-3 py-2">
                                <div>
                                  <div className="font-medium text-sm">
                                    {expense.contract.user.fullname}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {expense.contract.user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <Badge variant="outline" className="text-xs">
                                  {getStaffTypeLabel(expense.contract.staff_type)}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <Badge variant="secondary" className="text-xs">
                                  {getPaymentTypeLabel(expense.contract.payment_type)}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3 py-2 font-medium">
                                {formatCurrency(expense.amount)}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {formatDate(expense.date)}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {expense.description || '-'}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openModal(expense)}>
                                      <Edit className="h-3.5 w-3.5 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => deletePayroll(expense.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Modal para Nuevo/Editar Pago */}
          <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedPayroll ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                </DialogTitle>
                <DialogDescription>
                  {selectedPayroll 
                    ? 'Modifica la información del registro de pago'
                    : 'Registra un nuevo pago para un empleado'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="contract_id" className="text-sm">Contrato *</Label>
                    <Select 
                      value={formData.contract_id.toString()} 
                      onValueChange={(value) => setFormData({...formData, contract_id: parseInt(value)})}
                      disabled={!!selectedPayroll}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seleccionar contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts.map(contract => (
                          <SelectItem key={contract.id} value={contract.id.toString()}>
                            {employees.find(e => e.user.id === contract.user_id)?.user.fullname} - 
                            {getStaffTypeLabel(contract.staff_type)} - 
                            {formatCurrency(contract.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="amount" className="text-sm">Monto *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="h-9"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="date" className="text-sm">Fecha *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="h-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="h-9"
                      placeholder="Descripción del pago (opcional)"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {selectedPayroll ? 'Actualizar Pago' : 'Registrar Pago'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Toaster />
    </AdministrativeLayout>
  );
}