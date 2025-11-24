import { useState, useEffect } from 'react';
import AdministrativeLayout from '@/process/administrative/AdministrativeLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Users, FileText, Eye, Download, CheckCircle, XCircle, ArrowLeft, Mail, Phone, IdCard } from 'lucide-react';
import { config } from '@/config/administrative-config';
import { useToast } from '@/process/administrative/hooks/use-toast';
import { Toaster } from '@/process/administrative/humanresources/components/ui/toaster';

// Interfaces TypeScript inline
interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  dni: string | null;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

interface Application {
  id: number;
  offer_id: number;
  applicant_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  applicant_dni: string | null;
  cv_path: string;
  status: 'pending' | 'rejected' | 'hired' ;
  created_at: string;
  updated_at: string;
  offer?: {
    id: number;
    title: string;
    available_positions: number;
    status: string;
  };
}

interface Offer {
  id: number;
  title: string;
  status: 'active' | 'closed';
}

interface ApplicantStats {
  total_applicants: number;
  total_applications: number;
  pending_applications: number;
  hired_applications: number;
}

interface Filters {
  search: string;
  status: 'all' | 'pending' | 'under_review' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn';
  offer: string;
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<ApplicantStats>({ 
    total_applicants: 0, 
    total_applications: 0, 
    pending_applications: 0,
    hired_applications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    offer: 'all'
  });

  const [searchInput, setSearchInput] = useState('');
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedApplicantApplications, setSelectedApplicantApplications] = useState<Application[]>([]);

  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState<{[key: string]: string}>({});
  const [loadingRoles, setLoadingRoles] = useState(false);

  const { toast } = useToast();

  // ✅ Leer filtro automáticamente al cargar la página
  useEffect(() => {
    const savedFilter = sessionStorage.getItem('applicants_filter');
    if (savedFilter) {
      const filterData = JSON.parse(savedFilter);
      
      setFilters(prev => ({
        ...prev,
        offer: filterData.offer_id
      }));
      
      sessionStorage.removeItem('applicants_filter');
      
      toast({
        title: "🔍 Filtro aplicado",
        description: `Mostrando postulantes para: ${filterData.offer_title}`,
      });
    }
  }, [toast]);

  // ✅ NUEVO: Cargar roles disponibles al montar el componente
  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [filters]);

  useEffect(() => {
    if (applicants.length === 0) {
      setFilteredApplicants([]);
      return;
    }

    let filtered = [...applicants];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(applicant => 
        applicant.name.toLowerCase().includes(searchLower) ||
        applicant.email.toLowerCase().includes(searchLower) ||
        applicant.dni?.toLowerCase().includes(searchLower) ||
        applicant.phone?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredApplicants(filtered);
  }, [applicants, filters]);

  const fetchAvailableRoles = async () => {
    try {
      setLoadingRoles(true);
      const apiUrl = `${config.apiUrl}/api/rrhh/applicants/roles`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAvailableRoles(data.roles || {});
      }
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      toast({
        title: "❌ Error",
        description: 'Error al cargar roles disponibles',
        variant: "destructive",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.offer !== 'all') queryParams.append('offer_id', filters.offer);
      
      const queryString = queryParams.toString();
      const baseUrl = `${config.apiUrl}${config.endpoints.applicants}`;
      const apiUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      
      console.log('🔍 Fetching applicants from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setApplicants(data.applicants || []);
        setStats({
          total_applicants: data.total_applicants || 0,
          total_applications: data.total_applications || 0,
          pending_applications: data.pending_applications || 0,
          hired_applications: data.hired_applications || 0
        });
      } else {
        throw new Error(data.error || 'Error al cargar postulantes');
      }

      const offersUrl = `${config.apiUrl}${config.endpoints.offers}?status=all`;
      const offersResponse = await fetch(offersUrl);
      
      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        if (offersData.success) {
          setOffers(offersData.offers || []);
        }
      }

    } catch (error) {
      console.error('❌ Error al cargar postulantes:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los postulantes');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantApplications = async (applicantId: number) => {
    try {
      const apiUrl = `${config.apiUrl}/api/rrhh/applicants/${applicantId}/applications`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedApplicantApplications(data.applications || []);
      } else {
        throw new Error(data.error || 'Error al cargar aplicaciones');
      }
    } catch (error) {
      console.error('❌ Error al cargar aplicaciones:', error);
      toast({
        title: "❌ Error",
        description: 'Error al cargar las aplicaciones del postulante',
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', searchInput);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (value === '') {
      handleFilterChange('search', '');
    }
  };

  const openDetailModal = async (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    await fetchApplicantApplications(applicant.id);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedApplicant(null);
    setSelectedApplicantApplications([]);
  };

  const openHireModal = (application: Application) => {
    setSelectedApplication(application);
    setSelectedRole('');
    setIsHireModalOpen(true);
  };

  const closeHireModal = () => {
    setIsHireModalOpen(false);
    setSelectedApplication(null);
    setSelectedRole('');
  };

  const handleHire = async () => {
    if (!selectedApplication || !selectedRole) {
      toast({
        title: "❌ Error",
        description: 'Debe seleccionar un rol para contratar',
        variant: "destructive",
      });
      return;
    }

    try {
      const apiUrl = `${config.apiUrl}/api/rrhh/applicants/applications/${selectedApplication.id}/status`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'hired',
          role: selectedRole 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchApplicantApplications(selectedApplicant!.id);
        await fetchApplicants();
        toast({
          title: "✅ Éxito",
          description: result.message || "Postulante contratado y usuario creado automáticamente",
        });
        closeHireModal();
      } else {
        toast({
          title: "❌ Error",
          description: result.error || 'Error al contratar postulante',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al contratar postulante:', error);
      toast({
        title: "❌ Error",
        description: 'Error al contratar postulante',
        variant: "destructive",
      });
    }
  };

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    // Si es rechazar, usar la función existente
    if (status === 'rejected') {
      try {
        const apiUrl = `${config.apiUrl}/api/rrhh/applicants/applications/${applicationId}/status`;
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchApplicantApplications(selectedApplicant!.id);
          await fetchApplicants();
          toast({
            title: "✅ Éxito",
            description: result.message || "Estado de aplicación actualizado",
          });
        } else {
          toast({
            title: "❌ Error",
            description: result.error || 'Error al actualizar estado',
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        toast({
          title: "❌ Error",
          description: 'Error al actualizar estado',
          variant: "destructive",
        });
      }
    }
    // Si es contratar, abrir el modal de selección de rol
    else if (status === 'hired') {
      const application = selectedApplicantApplications.find(app => app.id === applicationId);
      if (application) {
        openHireModal(application);
      }
    }
  };

  const downloadCV = (cvPath: string) => {
    const downloadUrl = `${config.apiUrl}/storage/${cvPath}`;
    window.open(downloadUrl, '_blank');
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-PE');
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      under_review: 'secondary',
      shortlisted: 'default',
      rejected: 'destructive',
      hired: 'default',
      withdrawn: 'outline'
    } as const;

    const labels = {
      pending: 'Pendiente',
      under_review: 'En Revisión',
      shortlisted: 'Seleccionado',
      rejected: 'Rechazado',
      hired: 'Contratado',
      withdrawn: 'Retirado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const goBackToOffers = () => {
    window.location.href = '/administrativo/recursoshumanos/vacantes';
  };

  const clearOfferFilter = () => {
    setFilters(prev => ({
      ...prev,
      offer: 'all'
    }));
  };

  return (
    <AdministrativeLayout title="Recursos Humanos | Gestión de Postulantes">
      <div className="min-h-screen p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
        
          {/* Cabecera */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBackToOffers}
                    className="text-blue-100 hover:text-white hover:bg-blue-600"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a Ofertas
                  </Button>
                </div>
                <p className="text-xs uppercase tracking-wider text-blue-100/90">
                  Módulo de Recursos Humanos
                </p>
                <h1 className="mt-1 text-xl font-semibold text-white">
                  Gestión de Postulantes
                </h1>
                <p className="mt-1 text-xs text-blue-100/80">
                  Administra y revisa todos los postulantes y sus aplicaciones
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-blue-500 dark:border-slate-800 dark:border-t-blue-400"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando información de postulantes...
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
                  Error al cargar los postulantes: {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={fetchApplicants}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Postulantes</CardTitle>
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_applicants}</div>
                    <p className="text-xs text-muted-foreground">Postulantes registrados</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Postulaciones</CardTitle>
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_applications}</div>
                    <p className="text-xs text-muted-foreground">Aplicaciones enviadas</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                    <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending_applications}</div>
                    <p className="text-xs text-muted-foreground">Por revisar</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contratados</CardTitle>
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.hired_applications}</div>
                    <p className="text-xs text-muted-foreground">Aplicaciones contratadas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Applicants Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3">
                    {/* Título */}
                    <div>
                      <CardTitle className="text-lg">Postulantes Registrados</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Mostrando {filteredApplicants.length} de {applicants.length} postulantes
                        {filters.offer !== 'all' && (
                          <span className="ml-2">
                            • Filtrado por oferta: {
                              offers.find(offer => offer.id.toString() === filters.offer)?.title || 'Oferta específica'
                            }
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={clearOfferFilter}
                              className="h-5 px-2 ml-2 text-xs"
                            >
                              ✕ Limpiar
                            </Button>
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 opacity-50" />
                        <Input
                          type="text"
                          placeholder="Buscar postulantes por nombre, email, DNI o teléfono..."
                          value={searchInput}
                          onChange={(e) => handleSearchInputChange(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
                          className="pl-8 h-9 text-sm w-full"
                        />
                      </div>
                      
                      <Select 
                        value={filters.status} 
                        onValueChange={(value: 'all' | 'pending' | 'rejected' | 'hired') => handleFilterChange('status', value)}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-40">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="pending">Pendientes</SelectItem>
                          <SelectItem value="rejected">Rechazados</SelectItem>
                          <SelectItem value="hired">Contratados</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select 
                        value={filters.offer} 
                        onValueChange={(value: string) => handleFilterChange('offer', value)}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-48">
                          <SelectValue placeholder="Todas las ofertas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las ofertas</SelectItem>
                          {offers.map((offer) => (
                            <SelectItem key={offer.id} value={offer.id.toString()}>
                              {offer.title}
                            </SelectItem>
                          ))}
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
                          <TableHead className="h-10 px-3">Postulante</TableHead>
                          <TableHead className="h-10 px-3">Contacto</TableHead>
                          <TableHead className="h-10 px-3">DNI</TableHead>
                          <TableHead className="h-10 px-3">Postulaciones</TableHead>
                          <TableHead className="h-10 px-3">Fecha Registro</TableHead>
                          <TableHead className="h-10 px-3 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplicants.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p className="text-sm opacity-50">No se encontraron postulantes</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredApplicants.map((applicant) => (
                            <TableRow key={applicant.id} className="group">
                              <TableCell className="px-3 py-2">
                                <div className="font-medium text-sm">
                                  {applicant.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {applicant.id}
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {applicant.email}
                                  </span>
                                  {applicant.phone && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      {applicant.phone}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <IdCard className="h-3 w-3" />
                                  {applicant.dni || '-'}
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                <Badge variant="outline">
                                  {applicant.applications_count}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {formatDate(applicant.created_at)}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openDetailModal(applicant)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  Ver Detalle
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Modal para Detalle de Postulante */}
              <Dialog open={isDetailModalOpen} onOpenChange={closeDetailModal}>
                <DialogContent
                  className="
                    w-full 
                    !max-w-5xl
                    max-h-[90vh] 
                    overflow-y-auto 
                    overflow-x-hidden 
                    rounded-xl
                  "
                >
                  <DialogHeader>
                    <DialogTitle>Detalle del Postulante</DialogTitle>
                    <DialogDescription>
                      Información completa y historial de aplicaciones de {selectedApplicant?.name}
                    </DialogDescription>
                  </DialogHeader>

                  {selectedApplicant && (
                    <div className="space-y-6 w-full overflow-x-hidden">

                      {/* Información del Postulante */}
                      <Card className="w-full !max-w-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Información Personal</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                            <div className="flex items-start gap-3">
                              <Users className="h-5 w-5 mt-1" />
                              <div>
                                <p className="text-xs font-semibold uppercase opacity-70">Nombre Completo</p>
                                <p className="text-sm font-medium">{selectedApplicant.name}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 mt-1" />
                              <div>
                                <p className="text-xs font-semibold uppercase opacity-70">Email</p>
                                <p className="text-sm">{selectedApplicant.email}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Phone className="h-5 w-5 mt-1" />
                              <div>
                                <p className="text-xs font-semibold uppercase opacity-70">Teléfono</p>
                                <p className="text-sm">{selectedApplicant.phone || 'No especificado'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <IdCard className="h-5 w-5 mt-1" />
                              <div>
                                <p className="text-xs font-semibold uppercase opacity-70">DNI</p>
                                <p className="text-sm">{selectedApplicant.dni || 'No especificado'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 mt-1" />
                              <div>
                                <p className="text-xs font-semibold uppercase opacity-70">Total Postulaciones</p>
                                <p className="text-sm">{selectedApplicant.applications_count}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 mt-1" />
                              <div>
                                <p className="text-xs font-semibold uppercase opacity-70">Fecha de Registro</p>
                                <p className="text-sm">{formatDate(selectedApplicant.created_at)}</p>
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </Card>

                      {/* Historial de Aplicaciones */}
                      <Card className="w-full !max-w-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Historial de Aplicaciones</CardTitle>
                        </CardHeader>

                        <CardContent className="w-full">

                          {selectedApplicantApplications.length === 0 ? (
                            <div className="text-center py-10">
                              <FileText className="h-12 w-12 mx-auto opacity-40 mb-3" />
                              <p className="text-sm opacity-60">No hay aplicaciones registradas</p>
                            </div>
                          ) : (
                            <div className="space-y-5 w-full">

                              {selectedApplicantApplications.map((application) => (
                                <Card key={application.id} className="p-5 w-full !max-w-none">

                                  <div className="flex justify-between items-start w-full gap-4">

                                    {/* Izquierda */}
                                    <div className="flex-1 space-y-2">
                                      <h3 className="font-medium text-base">
                                        {application.offer?.title || 'Oferta no disponible'}
                                      </h3>

                                      <p className="text-xs text-muted-foreground">
                                        Postuló el {formatDate(application.created_at)}
                                      </p>

                                      {application.offer && (
                                        <Badge variant="outline" className="text-xs">
                                          Estado oferta: {application.offer.status === 'active' ? 'Activa' : 'Cerrada'}
                                        </Badge>
                                      )}

                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-medium">CV:</span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => downloadCV(application.cv_path)}
                                        >
                                          <Download className="h-3 w-3 mr-1" />
                                          Descargar CV
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Derecha */}
                                    <div className="flex flex-col items-end gap-2">
                                      {getStatusBadge(application.status)}

                                      <div className="flex gap-2">
                                        {/* ✅ BOTÓN CONTRATAR: Solo aparece si no está contratado ni rechazado y la oferta está activa */}
                                        {application.status !== 'hired' && 
                                         application.status !== 'rejected' &&
                                         application.offer?.status === 'active' && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={() => updateApplicationStatus(application.id, 'hired')}
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Contratar
                                          </Button>
                                        )}

                                        {/* ✅ BOTÓN RECHAZAR: Solo aparece si no está rechazado ni contratado ni retirado */}
                                        {application.status !== 'rejected' && 
                                         application.status !== 'hired' && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs text-red-600"
                                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                          >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Rechazar
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                  </div>

                                </Card>
                              ))}

                            </div>
                          )}

                        </CardContent>
                      </Card>

                    </div>
                  )}

                </DialogContent>
              </Dialog>

              {/* ✅ NUEVO: Modal para Contratar y Seleccionar Rol */}
              <Dialog open={isHireModalOpen} onOpenChange={closeHireModal}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Contratar Postulante</DialogTitle>
                    <DialogDescription>
                      Seleccione el rol que tendrá el usuario en el sistema
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol del Usuario</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingRoles ? (
                            <SelectItem value="loading" disabled>
                              Cargando roles...
                            </SelectItem>
                          ) : (
                            Object.entries(availableRoles).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Se creará un usuario automáticamente con este rol
                      </p>
                    </div>

                    {selectedApplication && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-sm font-medium">{selectedApplicant?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedApplication.offer?.title || 'Oferta no disponible'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={closeHireModal}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleHire} 
                      disabled={!selectedRole || loadingRoles}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Contratar
                    </Button>
                  </div>
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