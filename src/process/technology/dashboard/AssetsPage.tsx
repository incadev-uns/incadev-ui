"use client";

import { useState, useEffect } from "react";
import TechnologyLayout from "@/process/technology/TechnologyLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  RefreshCw,
  Calendar,
  Cpu,
  Monitor,
  Server,
  Laptop,
  HardDrive,
  CheckCircle2,
  XCircle,
  Wrench,
  Archive,
  AlertTriangle,
  ExternalLink,
  Tag,
} from "lucide-react";
import { config } from "@/config/technology-config";
import { routes } from "@/process/technology/technology-site";
import { toast } from "sonner";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return token.replace(/^"|"$/g, "");
};

interface Hardware {
  id: number;
  model: string;
  serial_number: string;
  warranty_expiration: string;
  specs: string;
}

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  user_id: number;
  acquisition_date: string;
  expiration_date: string;
  hardware?: Hardware;
  created_at: string;
  updated_at: string;
}

interface LicenseAssignment {
  id: number;
  license_id: number;
  asset_id: number;
  assigned_date: string;
  status: string;
  license?: {
    id: number;
    key_code: string;
    provider: string;
    expiration_date: string;
    software?: {
      software_name: string;
      version: string;
    };
  };
}

const assetTypes = [
  { value: "hardware", label: "Hardware", icon: Cpu },
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "laptop", label: "Laptop", icon: Laptop },
  { value: "server", label: "Servidor", icon: Server },
  { value: "software", label: "Software", icon: HardDrive },
  { value: "license", label: "Licencia", icon: Key },
  { value: "subscription", label: "Suscripción", icon: Tag },
];

const assetStatuses = [
  { value: "in_use", label: "En uso", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500" },
  { value: "in_storage", label: "Almacenado", icon: Archive, color: "bg-blue-500/10 text-blue-500" },
  { value: "in_repair", label: "En reparación", icon: Wrench, color: "bg-amber-500/10 text-amber-500" },
  { value: "disposed", label: "Dado de baja", icon: XCircle, color: "bg-red-500/10 text-red-500" },
  { value: "lost", label: "Perdido", icon: AlertTriangle, color: "bg-red-500/10 text-red-500" },
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assignedLicenses, setAssignedLicenses] = useState<LicenseAssignment[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "in_use",
    user_id: 1,
    acquisition_date: "",
    expiration_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    filterAssetsList();
  }, [assets, searchTerm, filterType, filterStatus]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.apiUrl}${config.endpoints.infrastructure.assets.list}`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else if (response.status === 403) {
          toast.error("No tienes permisos para ver los activos");
        } else {
          toast.error("Error al cargar los activos");
        }
        setAssets([]);
        return;
      }

      const data = await response.json();
      const assetsList = data.data || data || [];
      setAssets(Array.isArray(assetsList) ? assetsList : []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Error al cargar los activos");
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedLicenses = async (assetId: number) => {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.apiUrl}${config.endpoints.infrastructure.assignments.list}`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        setAssignedLicenses([]);
        return;
      }

      const data = await response.json();
      const assignments = data.data || data || [];
      if (!Array.isArray(assignments)) {
        setAssignedLicenses([]);
        return;
      }
      const filtered = assignments.filter((item: LicenseAssignment) => item.asset_id === assetId);
      setAssignedLicenses(filtered);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignedLicenses([]);
    }
  };

  const filterAssetsList = () => {
    let filtered = [...assets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.type?.toLowerCase().includes(term) ||
          a.hardware?.model?.toLowerCase().includes(term) ||
          a.hardware?.serial_number?.toLowerCase().includes(term)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((a) => a.type?.toLowerCase() === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    setFilteredAssets(filtered);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre del activo es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.apiUrl}${config.endpoints.infrastructure.assets.store}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Activo creado exitosamente");
        setIsAddOpen(false);
        resetForm();
        fetchAssets();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al crear el activo");
      }
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Error al crear el activo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAsset || !formData.name.trim()) {
      toast.error("El nombre del activo es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const endpoint = config.endpoints.infrastructure.assets.update.replace(":id", String(selectedAsset.id));
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Activo actualizado exitosamente");
        setIsEditOpen(false);
        resetForm();
        fetchAssets();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al actualizar el activo");
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      toast.error("Error al actualizar el activo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const endpoint = config.endpoints.infrastructure.assets.destroy.replace(":id", String(selectedAsset.id));
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Activo eliminado exitosamente");
        setIsDeleteOpen(false);
        setSelectedAsset(null);
        fetchAssets();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al eliminar el activo");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Error al eliminar el activo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetailDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    fetchAssignedLicenses(asset.id);
    setIsDetailOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type || "",
      status: asset.status || "in_use",
      user_id: asset.user_id || 1,
      acquisition_date: asset.acquisition_date || "",
      expiration_date: asset.expiration_date || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      status: "in_use",
      user_id: 1,
      acquisition_date: "",
      expiration_date: "",
    });
    setSelectedAsset(null);
  };

  const getTypeConfig = (type: string) => {
    const found = assetTypes.find((t) => t.value === type?.toLowerCase());
    return found || { value: type, label: type || "Otro", icon: Package };
  };

  const getStatusConfig = (status: string) => {
    const found = assetStatuses.find((s) => s.value === status);
    return found || { value: status, label: status, icon: Package, color: "bg-muted text-muted-foreground" };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Stats
  const stats = {
    total: assets.length,
    inUse: assets.filter((a) => a.status === "in_use").length,
    inRepair: assets.filter((a) => a.status === "in_repair").length,
    disposed: assets.filter((a) => a.status === "disposed" || a.status === "lost").length,
  };

  return (
    <TechnologyLayout
      breadcrumbs={[
        { label: "Infraestructura", href: routes.infrastructure.dashboard },
        { label: "Activos Tecnológicos" },
      ]}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activos Tecnológicos</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de equipos, hardware y recursos tecnológicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAssets} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inUse}</p>
              <p className="text-sm text-muted-foreground">En uso</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Wrench className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inRepair}</p>
              <p className="text-sm text-muted-foreground">En reparación</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.disposed}</p>
              <p className="text-sm text-muted-foreground">Dados de baja</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, modelo o serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {assetTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {assetStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron activos
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Agrega un nuevo activo para comenzar"}
            </p>
            {!searchTerm && filterType === "all" && filterStatus === "all" && (
              <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Activo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => {
            const typeConfig = getTypeConfig(asset.type);
            const statusConfig = getStatusConfig(asset.status);
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={asset.id}
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => openDetailDialog(asset)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                          {asset.name}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {typeConfig.label}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetailDialog(asset); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(asset); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={(e) => { e.stopPropagation(); openDeleteDialog(asset); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Status Badge */}
                  <Badge variant="outline" className={statusConfig.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>

                  {/* Hardware Info */}
                  {asset.hardware && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {asset.hardware.model && (
                        <p className="truncate">
                          <span className="font-medium">Modelo:</span> {asset.hardware.model}
                        </p>
                      )}
                      {asset.hardware.serial_number && (
                        <p className="truncate font-mono text-xs">
                          <span className="font-medium font-sans">S/N:</span> {asset.hardware.serial_number}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Acquisition Date */}
                  {asset.acquisition_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                      <Calendar className="h-3 w-3" />
                      <span>Adquirido: {formatDate(asset.acquisition_date)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedAsset && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    {(() => {
                      const TypeIcon = getTypeConfig(selectedAsset.type).icon;
                      return <TypeIcon className="h-6 w-6 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedAsset.name}</DialogTitle>
                    <DialogDescription className="capitalize">
                      {getTypeConfig(selectedAsset.type).label}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status */}
                <Badge variant="outline" className={getStatusConfig(selectedAsset.status).color}>
                  {getStatusConfig(selectedAsset.status).label}
                </Badge>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha de Adquisición</p>
                    <p className="font-medium">{formatDate(selectedAsset.acquisition_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha de Expiración</p>
                    <p className="font-medium">{formatDate(selectedAsset.expiration_date)}</p>
                  </div>
                </div>

                {/* Hardware details */}
                {selectedAsset.hardware && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-3">Detalles de Hardware</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Modelo</p>
                        <p className="font-medium">{selectedAsset.hardware.model || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Número de Serie</p>
                        <p className="font-medium font-mono">{selectedAsset.hardware.serial_number || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Garantía hasta</p>
                        <p className="font-medium">{formatDate(selectedAsset.hardware.warranty_expiration)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Especificaciones</p>
                        <p className="font-medium">{selectedAsset.hardware.specs || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Licenses */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Licencias Asignadas
                  </h4>
                  {assignedLicenses.length > 0 ? (
                    <div className="space-y-2">
                      {assignedLicenses.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div>
                            <p className="font-medium">
                              {assignment.license?.software?.software_name || "Software"}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {assignment.license?.key_code?.substring(0, 25)}...
                            </p>
                          </div>
                          <Badge variant="outline">
                            Expira: {formatDate(assignment.license?.expiration_date || "")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/50 text-center">
                      No hay licencias asignadas a este activo
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => { setIsDetailOpen(false); openEditDialog(selectedAsset); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditOpen ? "Editar Activo" : "Agregar Nuevo Activo"}
            </DialogTitle>
            <DialogDescription>
              {isEditOpen
                ? "Actualiza la información del activo"
                : "Ingresa los datos del nuevo activo tecnológico"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Activo *</Label>
              <Input
                id="name"
                placeholder="Laptop Dell XPS 15"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="acquisition_date">Fecha de Adquisición</Label>
                <Input
                  id="acquisition_date"
                  type="date"
                  value={formData.acquisition_date}
                  onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration_date">Fecha de Expiración</Label>
                <Input
                  id="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={isEditOpen ? handleUpdate : handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : isEditOpen ? (
                <Edit className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isEditOpen ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar activo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente <strong>{selectedAsset?.name}</strong>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TechnologyLayout>
  );
}
