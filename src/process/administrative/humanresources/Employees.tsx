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
import { Search, Users, GraduationCap, User, Briefcase, Building, Calendar, DollarSign, Clock, FileText, Edit, Trash2, CheckCircle, MoreHorizontal, Phone } from 'lucide-react';
import { config } from '@/config/administrative-config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/process/administrative/hooks/use-toast';
import { Toaster } from '@/process/administrative/humanresources/components/ui/toaster';

interface User {
  id: number;
  name: string;
  email: string;
  fullname: string;
  dni: string;
  phone: string;
}

interface Contract {
  id: number;
  staff_type: string;
  payment_type: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface Employee {
  id: number;
  user: User;
  contracts: Contract[];
  roles: string[];
  is_active: boolean;
  active_contract: Contract | null;
  last_contract: Contract | null;
  created_at: string;
}

interface Stats {
  total_activos: number;
  total_inactivos: number;
}

interface Filters {
  search: string;
  status: 'all' | 'active' | 'inactive';
}

interface CreateContractData {
  staff_type: string;
  payment_type: string;
  amount: string;
  start_date: string;
  end_date: string;
}

// Función de validación de DNI (8 dígitos)
const validateDNI = (dni: string): boolean => {
  return /^\d{8}$/.test(dni);
};

// Función de validación de teléfono (9 dígitos)
const validatePhone = (phone: string): boolean => {
  return /^\d{9}$/.test(phone);
};

// Función de validación de email
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    total_activos: 0, 
    total_inactivos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all'
  });

  const [searchInput, setSearchInput] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'detail' | 'edit'>('detail');
  const [contractModalType, setContractModalType] = useState<'new' | 'reactivate'>('new');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    dni: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState({
    fullname: '',
    email: '',
    dni: '',
    phone: '',
  });

  const [contractFormData, setContractFormData] = useState<CreateContractData>({
    staff_type: '',
    payment_type: '',
    amount: '',
    start_date: '',
    end_date: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  // Efecto para filtrar empleados localmente cuando cambian los filtros o los empleados
  useEffect(() => {
    if (employees.length === 0) {
      setFilteredEmployees([]);
      return;
    }

    let filtered = [...employees];

    // Aplicar filtro de estado
    if (filters.status === 'active') {
      filtered = filtered.filter(emp => emp.is_active);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(emp => !emp.is_active);
    }
    // Si es 'all', no filtramos por estado

    // Aplicar filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.user.fullname?.toLowerCase().includes(searchLower) ||
        emp.user.name?.toLowerCase().includes(searchLower) ||
        emp.user.email?.toLowerCase().includes(searchLower) ||
        emp.user.dni?.includes(searchLower)
      );
    }

    console.log(`🔍 Filtros aplicados: status=${filters.status}, search=${filters.search}`);
    console.log(`📊 Resultados: ${filtered.length} de ${employees.length} empleados`);
    console.log(`👥 Distribución: ${filtered.filter(emp => emp.is_active).length} activos, ${filtered.filter(emp => !emp.is_active).length} inactivos`);

    setFilteredEmployees(filtered);
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      
      // ✅ CORRECCIÓN: Siempre enviar el status, incluso cuando es 'all'
      queryParams.append('status', filters.status);
      
      const apiUrl = `${config.apiUrl}${config.endpoints.employees}?${queryParams.toString()}`;
      
      console.log('🔍 Fetching employees with URL:', apiUrl);
      console.log('🎯 Current filters:', filters);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('📦 Full API response:', data);
      console.log('👥 Employees count in response:', data.employees?.length);
      console.log('✅ Success status:', data.success);
      console.log('🎯 Filters applied in backend:', data.filters);
      
      if (data.success) {
        const activeCount = data.employees.filter((emp: any) => emp.is_active).length;
        const inactiveCount = data.employees.filter((emp: any) => !emp.is_active).length;

        setEmployees(data.employees || []);
        setStats({
          total_activos: activeCount,
          total_inactivos: inactiveCount,
        });
      } else {
        throw new Error(data.error || 'Error al cargar empleados');
      }
    } catch (error) {
      console.error('❌ Error al cargar empleados:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    console.log(`🔄 Filter change: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Función para manejar la búsqueda al presionar Enter
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', searchInput);
    }
  };

  // Función para manejar el cambio en el input de búsqueda
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    // Si el input está vacío, buscar inmediatamente
    if (value === '') {
      handleFilterChange('search', '');
    }
  };

  const openModal = (type: 'detail' | 'edit', employee: Employee) => {
    setModalType(type);
    setSelectedEmployee(employee);
    setFormErrors({ fullname: '', email: '', dni: '', phone: '' });
    
    if (type === 'edit') {
      setFormData({
        fullname: employee.user.fullname || '',
        email: employee.user.email || '',
        dni: employee.user.dni || '',
        phone: employee.user.phone || '',
      });
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setModalType('detail');
    setFormErrors({ fullname: '', email: '', dni: '', phone: '' });
  };

  const openNewContractModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setContractModalType('new');
    setContractFormData({
      staff_type: employee.active_contract?.staff_type || '',
      payment_type: employee.active_contract?.payment_type || '',
      amount: employee.active_contract?.amount.toString() || '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    });
    setIsContractModalOpen(true);
  };

  const openReactivateModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setContractModalType('reactivate');
    setContractFormData({
      staff_type: employee.last_contract?.staff_type || '',
      payment_type: employee.last_contract?.payment_type || '',
      amount: employee.last_contract?.amount.toString() || '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    });
    setIsContractModalOpen(true);
  };

  const closeContractModal = () => {
    setIsContractModalOpen(false);
    setSelectedEmployee(null);
    setContractFormData({
      staff_type: '',
      payment_type: '',
      amount: '',
      start_date: '',
      end_date: '',
    });
  };

  // Validar formulario antes de enviar
  const validateForm = (): boolean => {
    const errors = {
      fullname: '',
      email: '',
      dni: '',
      phone: '',
    };

    let isValid = true;

    // Validar nombre completo
    if (!formData.fullname.trim()) {
      errors.fullname = 'El nombre completo es requerido';
      isValid = false;
    } else if (formData.fullname.trim().length < 2) {
      errors.fullname = 'El nombre completo debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar DNI
    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es requerido';
      isValid = false;
    } else if (!validateDNI(formData.dni)) {
      errors.dni = 'El DNI debe tener exactamente 8 dígitos';
      isValid = false;
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      errors.phone = 'El teléfono debe tener exactamente 9 dígitos';
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'El formato del email no es válido';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "❌ Error de validación",
        description: "Por favor corrige los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.employees}/${selectedEmployee?.id}`;
      
      // Datos a enviar: datos personales + datos actuales del contrato
      const dataToSend = {
        // Datos personales (editables)
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        dni: formData.dni.trim(),
        phone: formData.phone.trim(),
        // Datos del contrato actual (no editables, se envían como están)
        staff_type: selectedEmployee?.active_contract?.staff_type || '',
        payment_type: selectedEmployee?.active_contract?.payment_type || '',
        amount: selectedEmployee?.active_contract?.amount || 0,
        start_date: selectedEmployee?.active_contract?.start_date || '',
      };

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchEmployees();
        closeModal();
        toast({
          title: "✅ Éxito",
          description: "Empleado actualizado correctamente",
        });
      } else {
        let errorMessage = result.error || 'Error al actualizar empleado';
        
        if (result.errors) {
          const errorDetails = Object.entries(result.errors)
            .map(([field, messages]) => {
              const fieldName = field === 'staff_type' ? 'Tipo de staff' :
                              field === 'payment_type' ? 'Tipo de pago' :
                              field === 'amount' ? 'Monto' :
                              field === 'start_date' ? 'Fecha inicio' : field;
              return `${fieldName}: ${Array.isArray(messages) ? messages[0] : messages}`;
            })
            .join('\n');
          
          errorMessage = `${result.error}\n${errorDetails}`;
        }
        
        toast({
          title: "❌ Error de validación",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      toast({
        title: "❌ Error",
        description: 'Error de conexión al actualizar empleado',
        variant: "destructive",
      });
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
    const apiUrl = `${config.apiUrl}${config.endpoints.employees}/${selectedEmployee.id}/contracts`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractFormData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchEmployees();
        closeContractModal();
        toast({
          title: "✅ Éxito",
          description: "Nuevo contrato creado correctamente",
        });
      } else {
        let errorMessage = result.error || 'Error al crear contrato';
        
        if (result.errors) {
          const errorDetails = Object.entries(result.errors)
            .map(([field, messages]) => {
              const fieldName = field === 'staff_type' ? 'Tipo de staff' :
                              field === 'payment_type' ? 'Tipo de pago' :
                              field === 'amount' ? 'Monto' :
                              field === 'start_date' ? 'Fecha inicio' : field;
              return `${fieldName}: ${Array.isArray(messages) ? messages[0] : messages}`;
            })
            .join('\n');
          
          errorMessage = `${result.error}\n${errorDetails}`;
        }
        
        toast({
          title: "❌ Error de validación",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al crear contrato:', error);
      toast({
        title: "❌ Error",
        description: 'Error de conexión al crear contrato',
        variant: "destructive",
      });
    }
  };

  const handleReactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.employees}/${selectedEmployee.id}/activate`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractFormData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchEmployees();
        closeContractModal();
        toast({
          title: "✅ Éxito",
          description: "Empleado reactivado con nuevo contrato",
        });
      } else {
        let errorMessage = result.error || 'Error al reactivar';
        
        if (result.errors) {
          const errorDetails = Object.entries(result.errors)
            .map(([field, messages]) => {
              const fieldName = field === 'staff_type' ? 'Tipo de staff' :
                              field === 'payment_type' ? 'Tipo de pago' :
                              field === 'amount' ? 'Monto' :
                              field === 'start_date' ? 'Fecha inicio' : field;
              return `${fieldName}: ${Array.isArray(messages) ? messages[0] : messages}`;
            })
            .join('\n');
          
          errorMessage = `${result.error}\n${errorDetails}`;
        }
        
        toast({
          title: "❌ Error de validación",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al reactivar:', error);
      toast({
        title: "❌ Error",
        description: 'Error de conexión al reactivar',
        variant: "destructive",
      });
    }
  };

  const deactivateEmployee = async (employeeId: number) => {
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.employees}/${employeeId}/deactivate`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchEmployees();
        toast({
          title: "✅ Éxito",
          description: "Empleado dado de baja correctamente",
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.error || 'Error al dar de baja',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al dar de baja:', error);
      toast({
        title: "❌ Error",
        description: 'Error al dar de baja',
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-PE');
    } catch {
      return '-';
    }
  };

  // Función para manejar cambios en los inputs con validación en tiempo real
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AdministrativeLayout title="Recursos Humanos | Empleados">
      <div className="min-h-screen p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
        
          {/* Cabecera */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-600 px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-sky-100/90">
                Módulo de Recursos Humanos
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">
                Gestión de Empleados
              </h1>
              <p className="mt-1 text-xs text-sky-100/80">
                Administra la plantilla de personal y contratos
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-sky-500 dark:border-slate-800 dark:border-t-sky-400"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando información de empleados...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar los empleados: {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={fetchEmployees}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_activos}</div>
                    <p className="text-xs text-muted-foreground">Empleados en plantilla</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Personal Inactivo</CardTitle>
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_inactivos}</div>
                    <p className="text-xs text-muted-foreground">Empleados dados de baja</p>
                  </CardContent>
                </Card>
              </div>

              {/* Employees Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3">
                    {/* Título y descripción */}
                    <div>
                      <CardTitle className="text-lg">Empleados</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Mostrando {filteredEmployees.length} de {employees.length} empleados
                        {filters.status === 'active' && ' (activos)'}
                        {filters.status === 'inactive' && ' (inactivos)'}
                      </p>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 opacity-50" />
                        <Input
                          type="text"
                          placeholder="Buscar empleados por nombre, email o DNI..."
                          value={searchInput}
                          onChange={(e) => handleSearchInputChange(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
                          className="pl-8 h-9 text-sm w-full"
                        />
                      </div>
                      
                      <Select 
                        value={filters.status} 
                        onValueChange={(value: 'all' | 'active' | 'inactive') => handleFilterChange('status', value)}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-40">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los empleados</SelectItem>
                          <SelectItem value="active">Solo activos</SelectItem>
                          <SelectItem value="inactive">Solo inactivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-10 px-3">Empleado</TableHead>
                          <TableHead className="h-10 px-3">DNI</TableHead>
                          <TableHead className="h-10 px-3">Staff</TableHead>
                          <TableHead className="h-10 px-3">Pago</TableHead>
                          <TableHead className="h-10 px-3">Monto</TableHead>
                          <TableHead className="h-10 px-3">Estado</TableHead>
                          <TableHead className="h-10 px-3 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p className="text-sm opacity-50">No se encontraron empleados</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEmployees.map((employee) => (
                            <TableRow key={employee.id} className="group">
                              <TableCell className="px-3 py-2">
                                <div>
                                  <div className="font-medium text-sm">
                                    {employee.user.fullname || employee.user.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {employee.user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {employee.user.dni || '-'}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {employee.active_contract?.staff_type || '-'}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {employee.active_contract?.payment_type || '-'}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {employee.active_contract?.amount ? `S/ ${employee.active_contract.amount.toFixed(2)}` : '-'}
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <Badge 
                                  variant={employee.is_active ? "default" : "secondary"} 
                                  className="text-xs"
                                >
                                  {employee.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openModal('detail', employee)}>
                                      Ver detalle
                                    </DropdownMenuItem>
                                    
                                    {/* Para empleados activos */}
                                    {employee.is_active && (
                                      <>
                                        <DropdownMenuItem onClick={() => openModal('edit', employee)}>
                                          <Edit className="h-3.5 w-3.5 mr-2" />
                                          Editar datos personales
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openNewContractModal(employee)}>
                                          <FileText className="h-3.5 w-3.5 mr-2" />
                                          Nuevo contrato
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => deactivateEmployee(employee.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                                          Dar de baja
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    {/* Para empleados inactivos */}
                                    {!employee.is_active && (
                                      <DropdownMenuItem 
                                        onClick={() => openReactivateModal(employee)}
                                        className="text-green-600"
                                      >
                                        <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                        Reactivar con nuevo contrato
                                      </DropdownMenuItem>
                                    )}
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

              {/* Modales */}
              <Dialog open={isModalOpen} onOpenChange={closeModal}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg">
                      {modalType === 'detail' ? 'Detalle del Empleado' : 'Editar Empleado'}
                    </DialogTitle>
                  </DialogHeader>

                  {modalType === 'detail' && selectedEmployee ? (
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      {/* Contenido del modal de detalle */}
                      <div className="flex items-start space-x-3">
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">Nombre Completo</h3>
                          <p className="text-sm">{selectedEmployee.user.fullname || selectedEmployee.user.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">DNI</h3>
                          <p className="text-sm">{selectedEmployee.user.dni || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">Teléfono</h3>
                          <p className="text-sm">{selectedEmployee.user.phone || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">Email</h3>
                          <p className="text-sm">{selectedEmployee.user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <Briefcase className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Tipo de Staff</h3>
                            <p className="text-sm">{selectedEmployee.active_contract?.staff_type || '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Building className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Tipo de Pago</h3>
                            <p className="text-sm">{selectedEmployee.active_contract?.payment_type || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <DollarSign className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Monto</h3>
                            <p className="text-sm">S/ {selectedEmployee.active_contract?.amount.toFixed(2) || '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Calendar className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Fecha Inicio</h3>
                            <p className="text-sm">
                              {selectedEmployee.is_active && selectedEmployee.active_contract?.start_date 
                                ? formatDate(selectedEmployee.active_contract.start_date)
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">Fecha Fin</h3>
                          <p className="text-sm">
                            {selectedEmployee.is_active && selectedEmployee.active_contract?.end_date 
                              ? formatDate(selectedEmployee.active_contract.end_date)
                              : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">Roles</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedEmployee.roles.map((role, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{role}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">Total de Contratos</h3>
                          <p className="text-sm">{selectedEmployee.contracts.length}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                      {/* Contenido del modal de edición */}
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor="fullname" className="text-sm">Nombre Completo *</Label>
                          <Input
                            id="fullname"
                            value={formData.fullname}
                            onChange={(e) => handleInputChange('fullname', e.target.value)}
                            className={`h-9 ${formErrors.fullname ? 'border-red-500' : ''}`}
                            required
                          />
                          {formErrors.fullname && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.fullname}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="dni" className="text-sm">DNI *</Label>
                            <Input
                              id="dni"
                              value={formData.dni}
                              onChange={(e) => handleInputChange('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                              className={`h-9 ${formErrors.dni ? 'border-red-500' : ''}`}
                              maxLength={8}
                              placeholder="8 dígitos"
                              required
                            />
                            {formErrors.dni && (
                              <p className="text-xs text-red-500 mt-1">{formErrors.dni}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="phone" className="text-sm">Teléfono</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                              className={`h-9 ${formErrors.phone ? 'border-red-500' : ''}`}
                              maxLength={9}
                              placeholder="9 dígitos"
                            />
                            {formErrors.phone && (
                              <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-sm">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`h-9 ${formErrors.email ? 'border-red-500' : ''}`}
                            placeholder="usuario@dominio.com"
                            required
                          />
                          {formErrors.email && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                          Cancelar
                        </Button>
                        <Button type="submit" size="sm">
                          Guardar
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              {/* Modal para Nuevo Contrato/Reactivación */}
              <Dialog open={isContractModalOpen} onOpenChange={closeContractModal}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {contractModalType === 'new' ? 'Nuevo Contrato' : 'Reactivar Empleado'}
                    </DialogTitle>
                    <DialogDescription>
                      {contractModalType === 'new' 
                        ? 'Crear nuevo contrato para el empleado (se cerrará el contrato actual)'
                        : 'Crear nuevo contrato para reactivar al empleado'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={contractModalType === 'new' ? handleCreateContract : handleReactivate}>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="contract_staff_type" className="text-sm">Tipo de Staff</Label>
                          <Select 
                            value={contractFormData.staff_type} 
                            onValueChange={(value) => setContractFormData({...contractFormData, staff_type: value})}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="teacher">Docente</SelectItem>
                              <SelectItem value="administrator">Administrativo</SelectItem>
                              <SelectItem value="support">Soporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="contract_payment_type" className="text-sm">Tipo de Pago</Label>
                          <Select 
                            value={contractFormData.payment_type} 
                            onValueChange={(value) => setContractFormData({...contractFormData, payment_type: value})}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Mensual</SelectItem>
                              <SelectItem value="weekly">Por horas</SelectItem>
                              <SelectItem value="per_course">Por curso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="contract_amount" className="text-sm">Monto</Label>
                          <Input
                            id="contract_amount"
                            type="number"
                            step="0.01"
                            value={contractFormData.amount}
                            onChange={(e) => setContractFormData({...contractFormData, amount: e.target.value})}
                            className="h-9"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="contract_start_date" className="text-sm">Fecha Inicio</Label>
                          <Input
                            id="contract_start_date"
                            type="date"
                            value={contractFormData.start_date}
                            onChange={(e) => setContractFormData({...contractFormData, start_date: e.target.value})}
                            className="h-9"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="contract_end_date" className="text-sm">
                          Fecha Fin (Opcional - dejar en blanco para contrato indefinido)
                        </Label>
                        <Input
                          id="contract_end_date"
                          type="date"
                          value={contractFormData.end_date}
                          onChange={(e) => setContractFormData({...contractFormData, end_date: e.target.value})}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={closeContractModal}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {contractModalType === 'new' ? 'Crear Contrato' : 'Reactivar Empleado'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Toaster />
    </AdministrativeLayout>
  );
}