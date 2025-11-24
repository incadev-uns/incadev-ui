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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Key,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp,
  Package,
  HardDrive,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Link2,
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

interface Software {
  id: number;
  software_name: string;
  version: string;
  type: string;
}

interface License {
  id: number;
  software_id: number;
  key_code: string;
  provider: string;
  purchase_date: string;
  expiration_date: string;
  cost: number;
  status: string;
  software?: Software;
}

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
}

const licenseStatuses = [
  { value: "active", label: "Activa", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "assigned", label: "Asignada", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "expired", label: "Expirada", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { value: "revoked", label: "Revocada", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
];

export default function LicensesPage() {
  const [software, setSoftware] = useState<Software[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [expandedSoftware, setExpandedSoftware] = useState<number[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    software_id: "",
    key_code: "",
    provider: "",
    purchase_date: "",
    expiration_date: "",
    cost: "",
    status: "active",
  });
  const [assignmentData, setAssignmentData] = useState({
    asset_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const [softwareRes, licensesRes, assetsRes] = await Promise.all([
        fetch(`${config.apiUrl}${config.endpoints.infrastructure.software.list}`, {
          headers,
          credentials: "include",
        }),
        fetch(`${config.apiUrl}${config.endpoints.infrastructure.licenses.list}`, {
          headers,
          credentials: "include",
        }),
        fetch(`${config.apiUrl}${config.endpoints.infrastructure.assets.list}`, {
          headers,
          credentials: "include",
        }),
      ]);

      // Handle authentication errors
      if (!softwareRes.ok || !licensesRes.ok || !assetsRes.ok) {
        const hasAuthError = [softwareRes, licensesRes, assetsRes].some(
          (res) => res.status === 401 || res.status === 403
        );
        if (hasAuthError) {
          toast.error("Sesión expirada o sin permisos. Por favor, inicia sesión nuevamente.");
        } else {
          toast.error("Error al cargar los datos");
        }
        setSoftware([]);
        setLicenses([]);
        setAssets([]);
        return;
      }

      const softwareData = await softwareRes.json();
      const licensesData = await licensesRes.json();
      const assetsData = await assetsRes.json();

      const softwareList = softwareData.data || softwareData || [];
      const licensesList = licensesData.data || licensesData || [];
      const assetsList = assetsData.data || assetsData || [];

      setSoftware(Array.isArray(softwareList) ? softwareList : []);
      setLicenses(Array.isArray(licensesList) ? licensesList : []);
      setAssets(Array.isArray(assetsList) ? assetsList : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos");
      setSoftware([]);
      setLicenses([]);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.software_id || !formData.key_code.trim()) {
      toast.error("Software y clave de licencia son requeridos");
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

      const response = await fetch(`${config.apiUrl}${config.endpoints.infrastructure.licenses.store}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          software_id: Number(formData.software_id),
          cost: formData.cost ? Number(formData.cost) : null,
        }),
      });

      if (response.ok) {
        toast.success("Licencia creada exitosamente");
        setIsAddOpen(false);
        resetForm();
        fetchAllData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al crear la licencia");
      }
    } catch (error) {
      console.error("Error creating license:", error);
      toast.error("Error al crear la licencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedLicense) return;

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

      const endpoint = config.endpoints.infrastructure.licenses.update.replace(":id", String(selectedLicense.id));
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          software_id: Number(formData.software_id),
          cost: formData.cost ? Number(formData.cost) : null,
        }),
      });

      if (response.ok) {
        toast.success("Licencia actualizada exitosamente");
        setIsEditOpen(false);
        resetForm();
        fetchAllData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al actualizar la licencia");
      }
    } catch (error) {
      console.error("Error updating license:", error);
      toast.error("Error al actualizar la licencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLicense) return;

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const endpoint = config.endpoints.infrastructure.licenses.destroy.replace(":id", String(selectedLicense.id));
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Licencia eliminada exitosamente");
        setIsDeleteOpen(false);
        setSelectedLicense(null);
        fetchAllData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al eliminar la licencia");
      }
    } catch (error) {
      console.error("Error deleting license:", error);
      toast.error("Error al eliminar la licencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedLicense || !assignmentData.asset_id) {
      toast.error("Selecciona un activo para asignar");
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

      const response = await fetch(`${config.apiUrl}${config.endpoints.infrastructure.assignments.store}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          license_id: selectedLicense.id,
          asset_id: Number(assignmentData.asset_id),
          assigned_date: new Date().toISOString().split("T")[0],
          status: "active",
        }),
      });

      if (response.ok) {
        toast.success("Licencia asignada exitosamente");
        setIsAssignOpen(false);
        setAssignmentData({ asset_id: "" });
        fetchAllData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al asignar la licencia");
      }
    } catch (error) {
      console.error("Error assigning license:", error);
      toast.error("Error al asignar la licencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (license: License) => {
    setSelectedLicense(license);
    setFormData({
      software_id: String(license.software_id),
      key_code: license.key_code || "",
      provider: license.provider || "",
      purchase_date: license.purchase_date?.split("T")[0] || "",
      expiration_date: license.expiration_date?.split("T")[0] || "",
      cost: license.cost ? String(license.cost) : "",
      status: license.status || "active",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (license: License) => {
    setSelectedLicense(license);
    setIsDeleteOpen(true);
  };

  const openAssignDialog = (license: License) => {
    setSelectedLicense(license);
    setAssignmentData({ asset_id: "" });
    setIsAssignOpen(true);
  };

  const resetForm = () => {
    setFormData({
      software_id: "",
      key_code: "",
      provider: "",
      purchase_date: "",
      expiration_date: "",
      cost: "",
      status: "active",
    });
    setSelectedLicense(null);
  };

  const toggleSoftware = (softwareId: number) => {
    setExpandedSoftware((prev) =>
      prev.includes(softwareId) ? prev.filter((id) => id !== softwareId) : [...prev, softwareId]
    );
  };

  const getStatusConfig = (status: string) => {
    const found = licenseStatuses.find((s) => s.value === status);
    return found || { value: status, label: status, color: "bg-muted text-muted-foreground" };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const isExpiringSoon = (dateString: string) => {
    if (!dateString) return false;
    const expDate = new Date(dateString);
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expDate > now && expDate <= thirtyDays;
  };

  const isExpired = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Filter licenses
  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      !searchTerm ||
      lic.key_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || lic.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group licenses by software
  const licensesBySoftware = software.map((soft) => ({
    ...soft,
    licenses: filteredLicenses.filter((lic) => lic.software_id === soft.id),
  }));

  // Stats
  const stats = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === "active").length,
    expired: licenses.filter((l) => l.status === "expired" || isExpired(l.expiration_date)).length,
    expiringSoon: licenses.filter((l) => isExpiringSoon(l.expiration_date)).length,
  };

  return (
    <TechnologyLayout
      breadcrumbs={[
        { label: "Infraestructura", href: routes.infrastructure.dashboard },
        { label: "Licencias" },
      ]}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Licencias</h1>
          <p className="text-muted-foreground mt-1">
            Administra las licencias de software de la organización
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAllData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Licencia
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Licencias</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.expiringSoon}</p>
              <p className="text-sm text-muted-foreground">Por vencer</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">Expiradas</p>
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
                placeholder="Buscar por clave o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {licenseStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Licenses by Software */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : licensesBySoftware.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Key className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay software registrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Primero registra software en el catálogo
            </p>
            <Button asChild>
              <a href={routes.infrastructure.software}>
                <HardDrive className="h-4 w-4 mr-2" />
                Ir al Catálogo de Software
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {licensesBySoftware.map((soft) => (
            <Collapsible
              key={soft.id}
              open={expandedSoftware.includes(soft.id)}
              onOpenChange={() => toggleSoftware(soft.id)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <HardDrive className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{soft.software_name}</CardTitle>
                          <CardDescription>
                            Versión {soft.version || "N/A"} · {soft.licenses.length} licencia{soft.licenses.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{soft.licenses.length}</Badge>
                        {expandedSoftware.includes(soft.id) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {soft.licenses.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay licencias registradas para este software
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {soft.licenses.map((lic) => (
                          <div
                            key={lic.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                                  {lic.key_code?.substring(0, 30)}{lic.key_code?.length > 30 ? "..." : ""}
                                </code>
                                <Badge variant="outline" className={getStatusConfig(lic.status).color}>
                                  {getStatusConfig(lic.status).label}
                                </Badge>
                                {isExpiringSoon(lic.expiration_date) && (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Por vencer
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                {lic.provider && (
                                  <span>Proveedor: {lic.provider}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Expira: {formatDate(lic.expiration_date)}
                                </span>
                                {lic.cost && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {formatCurrency(lic.cost)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openAssignDialog(lic)}
                                title="Asignar a activo"
                              >
                                <Link2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(lic)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => openDeleteDialog(lic)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Add/Edit License Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Editar Licencia" : "Nueva Licencia"}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? "Actualiza la información de la licencia" : "Registra una nueva licencia de software"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="software_id">Software *</Label>
              <Select
                value={formData.software_id}
                onValueChange={(value) => setFormData({ ...formData, software_id: value })}
              >
                <SelectTrigger id="software_id">
                  <SelectValue placeholder="Seleccionar software" />
                </SelectTrigger>
                <SelectContent>
                  {software.map((soft) => (
                    <SelectItem key={soft.id} value={String(soft.id)}>
                      {soft.software_name} {soft.version && `(v${soft.version})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_code">Clave de Licencia *</Label>
              <Input
                id="key_code"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                value={formData.key_code}
                onChange={(e) => setFormData({ ...formData, key_code: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor</Label>
                <Input
                  id="provider"
                  placeholder="Microsoft"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Costo</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="299.99"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Fecha de Compra</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
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
                  {licenseStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={isEditOpen ? handleUpdate : handleCreate} disabled={isSubmitting}>
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

      {/* Assign License Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Licencia</DialogTitle>
            <DialogDescription>
              Selecciona el activo al que deseas asignar esta licencia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedLicense && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Licencia:</p>
                <code className="text-xs font-mono">{selectedLicense.key_code}</code>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="asset_id">Activo Tecnológico</Label>
              <Select
                value={assignmentData.asset_id}
                onValueChange={(value) => setAssignmentData({ asset_id: value })}
              >
                <SelectTrigger id="asset_id">
                  <SelectValue placeholder="Seleccionar activo" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={String(asset.id)}>
                      {asset.name} ({asset.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={isSubmitting}>
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar licencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la licencia. Esta acción no se puede deshacer.
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
