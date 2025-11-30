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
import { Search, Briefcase, Users, FileText, Calendar, Edit, Trash2, Eye, MoreHorizontal, Plus, CheckCircle, XCircle, Download, ArrowRight } from 'lucide-react';
import { config } from '@/config/administrative-config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/process/administrative/hooks/use-toast';
import { Toaster } from '@/process/administrative/humanresources/components/ui/toaster';

// Interfaces TypeScript inline
interface Offer {
  id: number;
  title: string;
  description: string | null;
  requirements: string[];
  closing_date: string | null;
  available_positions: number;
  applications_count: number;
  pending_applications: number;
  accepted_applications: number;
  status: 'active' | 'closed';
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
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  offer?: {
    id: number;
    title: string;
  };
  applicant?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    dni: string | null;
  };
}

interface OfferFormData {
  title: string;
  description: string;
  requirements: string[];
  closing_date: string | null;
  available_positions: number;
}

interface OfferStats {
  total_active_offers: number;
  total_closed_offers: number;
}

interface Filters {
  search: string;
  status: 'all' | 'active' | 'closed';
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<OfferStats>({ 
    total_active_offers: 0, 
    total_closed_offers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all'
  });

  const [searchInput, setSearchInput] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedOfferApplications, setSelectedOfferApplications] = useState<Application[]>([]);
  
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    requirements: [],
    closing_date: null,
    available_positions: 1,
  });

  const [currentRequirement, setCurrentRequirement] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, [filters]);

  useEffect(() => {
    if (offers.length === 0) {
      setFilteredOffers([]);
      return;
    }

    let filtered = [...offers];

    // Aplicar filtro de estado
    if (filters.status === 'active') {
      filtered = filtered.filter(offer => offer.status === 'active');
    } else if (filters.status === 'closed') {
      filtered = filtered.filter(offer => offer.status === 'closed');
    }

    // Aplicar filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.title.toLowerCase().includes(searchLower) ||
        offer.description?.toLowerCase().includes(searchLower) ||
        offer.requirements.some(req => req.toLowerCase().includes(searchLower))
      );
    }

    setFilteredOffers(filtered);
  }, [offers, filters]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('status', filters.status);
      
      const apiUrl = `${config.apiUrl}${config.endpoints.offers}?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOffers(data.offers || []);
        setStats({
          total_active_offers: data.total_active_offers || 0,
          total_closed_offers: data.total_closed_offers || 0
        });
      } else {
        throw new Error(data.error || 'Error al cargar ofertas');
      }
    } catch (error) {
      console.error('❌ Error al cargar ofertas:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (offerId: number) => {
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.offers}/${offerId}/applications`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedOfferApplications(data.applications || []);
      } else {
        throw new Error(data.error || 'Error al cargar aplicaciones');
      }
    } catch (error) {
      console.error('❌ Error al cargar aplicaciones:', error);
      toast({
        title: "❌ Error",
        description: 'Error al cargar las aplicaciones',
        variant: "destructive",
      });
    }
  };

  // ✅ NUEVA FUNCIÓN: Redireccionar a vista de postulantes con filtro
    const goToApplicants = (offer: Offer) => {
    // Guardar el filtro en sessionStorage para que la vista de postulantes lo use
    const filterData = {
        offer_id: offer.id.toString(),
        offer_title: offer.title
    };
    
    // Guardar en sessionStorage para que esté disponible en la otra página
    sessionStorage.setItem('applicants_filter', JSON.stringify(filterData));
    
    // Redireccionar a la vista de postulantes
    window.location.href = '/administrativo/recursoshumanos/postulantes';
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

  const openCreateModal = () => {
    setModalType('create');
    setSelectedOffer(null);
    setFormData({
      title: '',
      description: '',
      requirements: [],
      closing_date: null,
      available_positions: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setModalType('edit');
    setSelectedOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      requirements: offer.requirements,
      closing_date: offer.closing_date,
      available_positions: offer.available_positions,
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDetailModalOpen(true);
  };

  const openApplicationsModal = async (offer: Offer) => {
    setSelectedOffer(offer);
    await fetchApplications(offer.id);
    setIsApplicationsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOffer(null);
    setFormData({
      title: '',
      description: '',
      requirements: [],
      closing_date: null,
      available_positions: 1,
    });
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOffer(null);
  };

  const closeApplicationsModal = () => {
    setIsApplicationsModalOpen(false);
    setSelectedOffer(null);
    setSelectedOfferApplications([]);
  };

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('El título es requerido');
    }

    if (formData.available_positions < 1) {
      errors.push('Debe haber al menos 1 posición disponible');
    }

    if (formData.closing_date) {
      const closingDate = new Date(formData.closing_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (closingDate <= today) {
        errors.push('La fecha de cierre debe ser posterior a hoy');
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "❌ Error de validación",
        description: validationErrors.join('\n'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Establecer fecha de publicación como hoy
      const submissionData = {
        ...formData,
        publication_date: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
      };

      const apiUrl = modalType === 'create' 
        ? `${config.apiUrl}${config.endpoints.offers}`
        : `${config.apiUrl}${config.endpoints.offers}/${selectedOffer?.id}`;

      const method = modalType === 'create' ? 'POST' : 'PUT';

      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchOffers();
        closeModal();
        toast({
          title: "✅ Éxito",
          description: modalType === 'create' 
            ? "Oferta creada correctamente" 
            : "Oferta actualizada correctamente",
        });
      } else {
        let errorMessage = result.error || 'Error al procesar la oferta';
        
        if (result.errors) {
          const errorDetails = Object.entries(result.errors)
            .map(([field, messages]) => {
              const fieldName = field === 'title' ? 'Título' :
                              field === 'description' ? 'Descripción' :
                              field === 'available_positions' ? 'Posiciones disponibles' :
                              field === 'closing_date' ? 'Fecha de cierre' : field;
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
      console.error('Error al procesar oferta:', error);
      toast({
        title: "❌ Error",
        description: 'Error de conexión al procesar la oferta',
        variant: "destructive",
      });
    }
  };

  const deleteOffer = async (offerId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      return;
    }

    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.offers}/${offerId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchOffers();
        toast({
          title: "✅ Éxito",
          description: "Oferta eliminada correctamente",
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.error || 'Error al eliminar oferta',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al eliminar oferta:', error);
      toast({
        title: "❌ Error",
        description: 'Error al eliminar oferta',
        variant: "destructive",
      });
    }
  };

  const closeOffer = async (offerId: number) => {
    if (!confirm('¿Estás seguro de que deseas cerrar esta oferta? Todas las aplicaciones pendientes serán rechazadas.')) {
      return;
    }

    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.offers}/${offerId}/close`;
      const response = await fetch(apiUrl, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchOffers();
        toast({
          title: "✅ Éxito",
          description: "Oferta cerrada correctamente",
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.error || 'Error al cerrar oferta',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al cerrar oferta:', error);
      toast({
        title: "❌ Error",
        description: 'Error al cerrar oferta',
        variant: "destructive",
      });
    }
  };

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.offers}/applications/${applicationId}/status`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchApplications(selectedOffer!.id);
        toast({
          title: "✅ Éxito",
          description: "Estado de aplicación actualizado",
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
      active: 'default',
      closed: 'secondary',
      pending: 'outline',
      reviewed: 'secondary',
      accepted: 'default',
      rejected: 'destructive'
    } as const;

    const labels = {
      active: 'Activa',
      closed: 'Cerrada',
      pending: 'Pendiente',
      reviewed: 'Revisado',
      accepted: 'Aceptado',
      rejected: 'Rechazado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <AdministrativeLayout title="Recursos Humanos | Ofertas Laborales">
      <div className="min-h-screen p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4">
        
          {/* Cabecera */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-100/90">
                Módulo de Recursos Humanos
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">
                Gestión de Ofertas Laborales
              </h1>
              <p className="mt-1 text-xs text-blue-100/80">
                Administra las vacantes y postulaciones
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-blue-500 dark:border-slate-800 dark:border-t-blue-400"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando información de ofertas...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar las ofertas: {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={fetchOffers}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards - Solo 2 cards como solicitado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_active_offers}</div>
                    <p className="text-xs text-muted-foreground">Vacantes disponibles actualmente</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ofertas Cerradas</CardTitle>
                    <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_closed_offers}</div>
                    <p className="text-xs text-muted-foreground">Vacantes finalizadas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Offers Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3">
                    {/* Título y botón */}
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">Ofertas Laborales</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Mostrando {filteredOffers.length} de {offers.length} ofertas
                          {filters.status === 'active' && ' (activas)'}
                          {filters.status === 'closed' && ' (cerradas)'}
                        </p>
                      </div>
                      <Button onClick={openCreateModal} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Oferta
                      </Button>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 opacity-50" />
                        <Input
                          type="text"
                          placeholder="Buscar ofertas por título, descripción o requisitos..."
                          value={searchInput}
                          onChange={(e) => handleSearchInputChange(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
                          className="pl-8 h-9 text-sm w-full"
                        />
                      </div>
                      
                      <Select 
                        value={filters.status} 
                        onValueChange={(value: 'all' | 'active' | 'closed') => handleFilterChange('status', value)}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-40">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las ofertas</SelectItem>
                          <SelectItem value="active">Solo activas</SelectItem>
                          <SelectItem value="closed">Solo cerradas</SelectItem>
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
                          <TableHead className="h-10 px-3">Título</TableHead>
                          <TableHead className="h-10 px-3">Posiciones</TableHead>
                          <TableHead className="h-10 px-3">Postulaciones</TableHead>
                          <TableHead className="h-10 px-3">Fecha Cierre</TableHead>
                          <TableHead className="h-10 px-3">Estado</TableHead>
                          <TableHead className="h-10 px-3 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOffers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p className="text-sm opacity-50">No se encontraron ofertas</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOffers.map((offer) => (
                            <TableRow key={offer.id} className="group">
                              <TableCell className="px-3 py-2">
                                <div className="font-medium text-sm">
                                  {offer.title}
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {offer.available_positions}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                <div className="flex flex-col">
                                  <span>Total: {offer.applications_count}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Aceptadas: {offer.accepted_applications}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 text-sm">
                                {formatDate(offer.closing_date)}
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                {getStatusBadge(offer.status)}
                              </TableCell>
                              <TableCell className="px-3 py-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openDetailModal(offer)}>
                                      <Eye className="h-3.5 w-3.5 mr-2" />
                                      Ver detalle
                                    </DropdownMenuItem>
                                    
                                    {/* ✅ MODIFICADO: Cambiado para redireccionar a postulantes */}
                                    <DropdownMenuItem onClick={() => goToApplicants(offer)}>
                                      <Users className="h-3.5 w-3.5 mr-2" />
                                      <div className="flex items-center justify-between w-full">
                                        <span>Ver postulantes ({offer.applications_count})</span>
                                        <ArrowRight className="h-3 w-3 ml-2" />
                                      </div>
                                    </DropdownMenuItem>

                                    {offer.status === 'active' && (
                                      <>
                                        <DropdownMenuItem onClick={() => openEditModal(offer)}>
                                          <Edit className="h-3.5 w-3.5 mr-2" />
                                          Editar oferta
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => closeOffer(offer.id)}>
                                          <XCircle className="h-3.5 w-3.5 mr-2" />
                                          Cerrar oferta
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    <DropdownMenuItem 
                                      onClick={() => deleteOffer(offer.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                                      Eliminar oferta
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

              {/* Modal para Crear/Editar Oferta */}
              <Dialog open={isModalOpen} onOpenChange={closeModal}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg">
                      {modalType === 'create' ? 'Crear Nueva Oferta' : 'Editar Oferta'}
                    </DialogTitle>
                    <DialogDescription>
                      {modalType === 'create' 
                        ? 'Complete los datos para crear una nueva oferta laboral' 
                        : 'Modifique los datos de la oferta laboral'
                      }
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="title" className="text-sm">Título de la Oferta *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="h-9"
                          placeholder="Ej: Desarrollador Frontend Senior"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Descripción</Label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full min-h-24 p-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Describe las responsabilidades y características del puesto..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="available_positions" className="text-sm">Posiciones Disponibles *</Label>
                          <Input
                            id="available_positions"
                            type="number"
                            min="1"
                            value={formData.available_positions}
                            onChange={(e) => setFormData({...formData, available_positions: parseInt(e.target.value) || 1})}
                            className="h-9"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="closing_date" className="text-sm">Fecha de Cierre</Label>
                          <Input
                            id="closing_date"
                            type="date"
                            value={formData.closing_date || ''}
                            onChange={(e) => setFormData({...formData, closing_date: e.target.value || null})}
                            className="h-9"
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Mañana como mínimo
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Debe ser posterior a hoy (opcional)
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="requirements" className="text-sm">Requisitos</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={currentRequirement}
                              onChange={(e) => setCurrentRequirement(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                              className="h-9"
                              placeholder="Agregar requisito..."
                            />
                            <Button type="button" onClick={addRequirement} size="sm">
                              Agregar
                            </Button>
                          </div>
                          
                          {formData.requirements.length > 0 && (
                            <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                              {formData.requirements.map((req, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                  <span>• {req}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRequirement(index)}
                                    className="h-6 w-6 p-0 text-red-500"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm">
                        {modalType === 'create' ? 'Crear Oferta' : 'Actualizar Oferta'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Modal para Detalle de Oferta */}
              <Dialog open={isDetailModalOpen} onOpenChange={closeDetailModal}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Detalle de la Oferta</DialogTitle>
                  </DialogHeader>

                  {selectedOffer && (
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      <div className="flex items-start space-x-3">
                        <Briefcase className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs font-semibold opacity-70 uppercase">Título</h3>
                          <p className="text-sm font-medium">{selectedOffer.title}</p>
                        </div>
                      </div>

                      {selectedOffer.description && (
                        <div className="flex items-start space-x-3">
                          <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Descripción</h3>
                            <p className="text-sm whitespace-pre-wrap">{selectedOffer.description}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <Users className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Posiciones Disponibles</h3>
                            <p className="text-sm">{selectedOffer.available_positions}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Calendar className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Fecha de Cierre</h3>
                            <p className="text-sm">{formatDate(selectedOffer.closing_date)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <Users className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Total Postulaciones</h3>
                            <p className="text-sm">{selectedOffer.applications_count}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Aceptadas</h3>
                            <p className="text-sm">{selectedOffer.accepted_applications}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Badge variant={selectedOffer.status === 'active' ? 'default' : 'secondary'}>
                          {selectedOffer.status === 'active' ? 'Activa' : 'Cerrada'}
                        </Badge>
                      </div>

                      {selectedOffer.requirements.length > 0 && (
                        <div className="flex items-start space-x-3">
                          <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-xs font-semibold opacity-70 uppercase">Requisitos</h3>
                            <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                              {selectedOffer.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* ✅ NUEVO: Botón para ir a postulantes desde el detalle */}
                      <div className="pt-4 border-t">
                        <Button 
                          onClick={() => goToApplicants(selectedOffer)} 
                          className="w-full"
                          size="sm"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Ver todos los postulantes ({selectedOffer.applications_count})
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Modal para Aplicaciones (mantenido por si acaso) */}
              <Dialog open={isApplicationsModalOpen} onOpenChange={closeApplicationsModal}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Postulantes - {selectedOffer?.title}</DialogTitle>
                    <DialogDescription>
                      {selectedOfferApplications.length} postulante(s) encontrado(s)
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {selectedOfferApplications.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm opacity-50">No hay postulantes para esta oferta</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedOfferApplications.map((application) => (
                          <Card key={application.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div>
                                  <h3 className="font-medium">{application.applicant_name}</h3>
                                  <p className="text-sm text-muted-foreground">{application.applicant_email}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {application.applicant_phone && (
                                    <span>Tel: {application.applicant_phone}</span>
                                  )}
                                  {application.applicant_dni && (
                                    <span>DNI: {application.applicant_dni}</span>
                                  )}
                                  <span>Postuló: {formatDate(application.created_at)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">CV:</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadCV(application.cv_path)}
                                    className="h-6 text-xs"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Descargar CV
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(application.status)}
                                
                                <div className="flex gap-1">
                                  {application.status !== 'accepted' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                      className="h-7 text-xs"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Aceptar
                                    </Button>
                                  )}
                                  
                                  {application.status !== 'rejected' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                      className="h-7 text-xs text-red-600"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Rechazar
                                    </Button>
                                  )}

                                  {application.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                                      className="h-7 text-xs"
                                    >
                                      Revisar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
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