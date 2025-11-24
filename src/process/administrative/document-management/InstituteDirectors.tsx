import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  PenLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { config } from "@/config/administrative-config";
import CloudinaryUploader from "@/services/academico/CloudinaryUploader";

interface Director {
  id: number;
  name: string;
  signature: string;
  created_at: string;
}

interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const getCsrfToken = () => {
  if (typeof document !== 'undefined') {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  }
  return '';
};

const InstituteDirectors = () => {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    per_page: 9,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const [isDirectorDialogOpen, setIsDirectorDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState<Director | null>(null);
  const [deletingDirector, setDeletingDirector] = useState<Director | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    signature: "",
  });

  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    fetchDirectors(1, "");
  }, []);

  const fetchDirectors = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const url = new URL(`${config.apiUrl}/api/gestion-documentaria/institute-directors`);
      // const apiUrl = `${config.apiUrl}${config.endpoints.instituteDirectors}`;
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', '9');
      if (search) {
        url.searchParams.append('search', search);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDirectors(data.data || []);
        setPagination(data.pagination);
      } else {
        showAlert("error", data.message || "Error al cargar los directores");
      }
    } catch (error) {
      console.error("Error fetching directors:", error);
      showAlert("error", "Error al cargar los directores");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDirectors(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchDirectors(newPage, searchTerm);
  };

  const handleCreateDirector = () => {
    setEditingDirector(null);
    setFormData({
      name: "",
      signature: "",
    });
    setIsDirectorDialogOpen(true);
  };

  const handleEditDirector = (director: Director) => {
    setEditingDirector(director);
    setFormData({
      name: director.name,
      signature: director.signature,
    });
    setIsDirectorDialogOpen(true);
  };

  const handleDeleteDirector = (director: Director) => {
    setDeletingDirector(director);
    setIsDeleteDialogOpen(true);
  };

  const handleSignatureUpload = (url: string) => {
    setFormData({ ...formData, signature: url });
  };

  const handleSubmitDirector = async () => {
    if (!formData.name.trim()) {
      showAlert("error", "El nombre es obligatorio");
      return;
    }

    if (!formData.signature.trim()) {
      showAlert("error", "La firma es obligatoria");
      return;
    }

    setSubmitLoading(true);

    try {
    //   const url = editingDirector
    //     ? `${config.apiUrl}/api/administrative/institute-directors/${editingDirector.id}`
    //     : `${config.apiUrl}/api/administrative/institute-directors`;

        const url = editingDirector
                ? `${config.apiUrl}${config.endpoints.instituteDirectors}/${editingDirector.id}`
                : `${config.apiUrl}${config.endpoints.instituteDirectors}`;

      const method = editingDirector ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      if (data.success) {
        showAlert("success", data.message || (editingDirector ? "Director actualizado correctamente" : "Director creado correctamente"));
        setIsDirectorDialogOpen(false);
        fetchDirectors(pagination.current_page, searchTerm);
      } else {
        showAlert("error", data.message || "Error al guardar el director");
      }
    } catch (error: any) {
      console.error("Error saving director:", error);
      showAlert("error", error.message || "Error al guardar el director");
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmDeleteDirector = async () => {
    if (!deletingDirector) return;

    setSubmitLoading(true);

    try {
      const response = await fetch(
        `${config.apiUrl}/api/administrative/institute-directors/${deletingDirector.id}`,
        { 
          method: "DELETE",
          headers: {
            "X-CSRF-TOKEN": getCsrfToken(),
            "Accept": "application/json"
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      if (data.success) {
        showAlert("success", data.message || "Director eliminado correctamente");
        setIsDeleteDialogOpen(false);
        setDeletingDirector(null);
        fetchDirectors(pagination.current_page, searchTerm);
      } else {
        showAlert("error", data.message || "Error al eliminar el director");
      }
    } catch (error: any) {
      console.error("Error deleting director:", error);
      showAlert("error", error.message || "Error al eliminar el director");
    } finally {
      setSubmitLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <AdministrativeLayout title="Gestión de Firmas de Directores">
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-indigo-500 to-indigo-700 px-6 py-7 shadow-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-100/90">
              Gestión Documentaria
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Firmas de Directores
            </h1>
            <p className="mt-2 max-w-xl text-sm text-indigo-100/80">
              Administra las firmas autorizadas para certificados y documentos oficiales
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <Alert
              className={
                alert.type === "success"
                  ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-red-200 bg-red-50 dark:bg-red-950/20"
              }
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  alert.type === "success"
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-red-800 dark:text-red-200"
                }
              >
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Search and Create */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} variant="outline">
                  Buscar
                </Button>
                <Button
                  onClick={handleCreateDirector}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Firma
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Directors Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Cargando firmas...</p>
              </div>
            </div>
          ) : directors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <PenLine className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No se encontraron firmas con el criterio de búsqueda"
                    : "No hay firmas registradas"}
                </p>
                <Button onClick={handleCreateDirector} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primera firma
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {directors.map((director) => (
                  <DirectorCard
                    key={director.id}
                    director={director}
                    onEdit={handleEditDirector}
                    onDelete={handleDeleteDirector}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {pagination.from} - {pagination.to} de {pagination.total} firmas
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          disabled={pagination.current_page === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium">
                          Página {pagination.current_page} de {pagination.last_page}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          disabled={pagination.current_page === pagination.last_page}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Director Dialog */}
      <Dialog open={isDirectorDialogOpen} onOpenChange={setIsDirectorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingDirector ? "Editar Firma" : "Nueva Firma"}
            </DialogTitle>
            <DialogDescription>
              {editingDirector
                ? "Modifica la información de la firma del director"
                : "Ingresa los datos de la nueva firma"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Director *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Dr. Juan Pérez Rodríguez"
              />
            </div>

            <div className="space-y-2">
              <CloudinaryUploader
                onUpload={handleSignatureUpload}
                label="Firma (Imagen) *"
                acceptType="image"
              />
              {formData.signature && (
                <p className="text-xs text-muted-foreground">
                  ✓ Firma cargada correctamente
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDirectorDialogOpen(false)}
              disabled={submitLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitDirector} 
              disabled={submitLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {editingDirector ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                editingDirector ? "Actualizar" : "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la firma de "
              {deletingDirector?.name}" de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDirector}
              disabled={submitLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdministrativeLayout>
  );
};

const DirectorCard = ({ 
  director, 
  onEdit, 
  onDelete 
}: { 
  director: Director; 
  onEdit: (director: Director) => void; 
  onDelete: (director: Director) => void 
}) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <PenLine className="w-5 h-5 text-indigo-600" />
          {director.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Signature Preview */}
        <div className="relative aspect-[2/1] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800">
          <img
            src={director.signature}
            alt={`Firma de ${director.name}`}
            className="w-full h-full object-contain p-4"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
            onClick={() => onEdit(director)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 hover:text-red-700"
            onClick={() => onDelete(director)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstituteDirectors;