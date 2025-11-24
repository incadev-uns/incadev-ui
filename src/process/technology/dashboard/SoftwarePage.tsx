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
  HardDrive,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  RefreshCw,
  Package,
  Tag,
  Calendar,
  ExternalLink,
  Layers,
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
  created_at: string;
  updated_at: string;
  licenses_count?: number;
}

const softwareTypes = [
  { value: "productivity", label: "Productividad" },
  { value: "development", label: "Desarrollo" },
  { value: "design", label: "Diseño" },
  { value: "security", label: "Seguridad" },
  { value: "database", label: "Base de Datos" },
  { value: "communication", label: "Comunicación" },
  { value: "operating_system", label: "Sistema Operativo" },
  { value: "utility", label: "Utilidad" },
  { value: "other", label: "Otro" },
];

export default function SoftwarePage() {
  const [software, setSoftware] = useState<Software[]>([]);
  const [filteredSoftware, setFilteredSoftware] = useState<Software[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    software_name: "",
    version: "",
    type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSoftware();
  }, []);

  useEffect(() => {
    filterSoftwareList();
  }, [software, searchTerm, filterType]);

  const fetchSoftware = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.apiUrl}${config.endpoints.infrastructure.software.list}`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else if (response.status === 403) {
          toast.error("No tienes permisos para ver el catálogo de software");
        } else {
          toast.error("Error al cargar el catálogo de software");
        }
        setSoftware([]);
        return;
      }

      const data = await response.json();
      const softwareList = data.data || data || [];
      setSoftware(Array.isArray(softwareList) ? softwareList : []);
    } catch (error) {
      console.error("Error fetching software:", error);
      toast.error("Error al cargar el catálogo de software");
      setSoftware([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSoftwareList = () => {
    let filtered = [...software];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.software_name.toLowerCase().includes(term) ||
          s.version?.toLowerCase().includes(term) ||
          s.type?.toLowerCase().includes(term)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((s) => s.type === filterType);
    }

    setFilteredSoftware(filtered);
  };

  const handleCreate = async () => {
    if (!formData.software_name.trim()) {
      toast.error("El nombre del software es requerido");
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

      const response = await fetch(`${config.apiUrl}${config.endpoints.infrastructure.software.store}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Software creado exitosamente");
        setIsAddOpen(false);
        resetForm();
        fetchSoftware();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al crear el software");
      }
    } catch (error) {
      console.error("Error creating software:", error);
      toast.error("Error al crear el software");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSoftware || !formData.software_name.trim()) {
      toast.error("El nombre del software es requerido");
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

      const endpoint = config.endpoints.infrastructure.software.update.replace(":id", String(selectedSoftware.id));
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Software actualizado exitosamente");
        setIsEditOpen(false);
        resetForm();
        fetchSoftware();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al actualizar el software");
      }
    } catch (error) {
      console.error("Error updating software:", error);
      toast.error("Error al actualizar el software");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSoftware) return;

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const endpoint = config.endpoints.infrastructure.software.destroy.replace(":id", String(selectedSoftware.id));
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Software eliminado exitosamente");
        setIsDeleteOpen(false);
        setSelectedSoftware(null);
        fetchSoftware();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al eliminar el software");
      }
    } catch (error) {
      console.error("Error deleting software:", error);
      toast.error("Error al eliminar el software");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (item: Software) => {
    setSelectedSoftware(item);
    setFormData({
      software_name: item.software_name,
      version: item.version || "",
      type: item.type || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (item: Software) => {
    setSelectedSoftware(item);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setFormData({ software_name: "", version: "", type: "" });
    setSelectedSoftware(null);
  };

  const getTypeLabel = (type: string) => {
    const found = softwareTypes.find((t) => t.value === type);
    return found?.label || type || "Sin tipo";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      productivity: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      development: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      design: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      security: "bg-red-500/10 text-red-500 border-red-500/20",
      database: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      communication: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      operating_system: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      utility: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[type] || "bg-muted text-muted-foreground border-border";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Stats
  const stats = {
    total: software.length,
    byType: softwareTypes.map((t) => ({
      ...t,
      count: software.filter((s) => s.type === t.value).length,
    })).filter((t) => t.count > 0),
  };

  return (
    <TechnologyLayout
      breadcrumbs={[
        { label: "Infraestructura", href: routes.infrastructure.dashboard },
        { label: "Software" },
      ]}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catálogo de Software</h1>
          <p className="text-muted-foreground mt-1">
            Gestión del inventario de software y aplicaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSoftware} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Software
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <HardDrive className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Software</p>
            </div>
          </CardContent>
        </Card>
        {stats.byType.slice(0, 3).map((type) => (
          <Card key={type.value} className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${getTypeColor(type.value).split(" ")[0]}`}>
                <Layers className={`h-6 w-6 ${getTypeColor(type.value).split(" ")[1]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{type.count}</p>
                <p className="text-sm text-muted-foreground">{type.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o versión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de software" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {softwareTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Software Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSoftware.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HardDrive className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontró software
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Agrega nuevo software al catálogo"}
            </p>
            {!searchTerm && filterType === "all" && (
              <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Software
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSoftware.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-all group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <HardDrive className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                        {item.software_name}
                      </CardTitle>
                      {item.version && (
                        <CardDescription className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          v{item.version}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={routes.infrastructure.licenses}>
                          <Key className="h-4 w-4 mr-2" />
                          Ver Licencias
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="outline" className={getTypeColor(item.type)}>
                  {getTypeLabel(item.type)}
                </Badge>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Registrado: {formatDate(item.created_at)}</span>
                </div>

                {item.licenses_count !== undefined && item.licenses_count > 0 && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Key className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">
                        {item.licenses_count} licencia{item.licenses_count !== 1 ? "s" : ""} asociada{item.licenses_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              {isEditOpen ? "Editar Software" : "Agregar Nuevo Software"}
            </DialogTitle>
            <DialogDescription>
              {isEditOpen
                ? "Actualiza la información del software"
                : "Ingresa los datos del nuevo software"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="software_name">Nombre del Software *</Label>
              <Input
                id="software_name"
                placeholder="Microsoft Office 365"
                value={formData.software_name}
                onChange={(e) => setFormData({ ...formData, software_name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="version">Versión</Label>
                <Input
                  id="version"
                  placeholder="2024"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>

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
                    {softwareTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <AlertDialogTitle>¿Eliminar software?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente <strong>{selectedSoftware?.software_name}</strong> del catálogo.
              {selectedSoftware?.licenses_count && selectedSoftware.licenses_count > 0 && (
                <span className="block mt-2 text-amber-500">
                  Advertencia: Este software tiene {selectedSoftware.licenses_count} licencia(s) asociada(s).
                </span>
              )}
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
