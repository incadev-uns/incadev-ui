import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/process/administrative/academic-processes/components/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlayCircle,
  XCircle,
  Filter,
  UserPlus,
} from "lucide-react";
import { config } from "@/config/administrative-config";

interface Group {
  id: number;
  name: string;
  course_name: string;
  course_version_name: string;
  course_version_id: number;
  start_date: string;
  end_date: string;
  status: string;
  teachers_count: number;
  students_count: number;
  created_at: string;
}

interface CourseVersion {
  id: number;
  name: string;
  course_name: string;
  label: string;
  price: string;
}

// Función auxiliar para obtener CSRF Token
const getCsrfToken = () => {
  if (typeof document !== 'undefined') {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  }
  return '';
};

const GroupsManagement = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [courseVersions, setCourseVersions] = useState<CourseVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modal states
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  // Form state - USANDO LOS ESTADOS CORRECTOS DEL ENUM
  const [formData, setFormData] = useState({
    course_version_id: "",
    name: "",
    start_date: "",
    end_date: "",
    status: "pending", // Estado inicial corregido
  });

  // Alert state
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    fetchGroups();
    fetchCourseVersions();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.groups}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.data || []);
      } else {
        showAlert("error", data.message || "Error al cargar los grupos");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showAlert("error", "Error al cargar los grupos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseVersions = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.groupsCourseVersions}`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCourseVersions(data.data || []);
      } else {
        console.error("Error loading course versions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching course versions:", error);
    }
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setFormData({
      course_version_id: "",
      name: "",
      start_date: "",
      end_date: "",
      status: "pending", // Estado inicial corregido
    });
    setIsGroupDialogOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      course_version_id: group.course_version_id.toString(),
      name: group.name,
      start_date: group.start_date.split('T')[0],
      end_date: group.end_date.split('T')[0],
      status: group.status, // Mantener el estado actual del grupo
    });
    setIsGroupDialogOpen(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setDeletingGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitGroup = async () => {
    // Validaciones
    if (!formData.name.trim()) {
      showAlert("error", "El nombre del grupo es obligatorio");
      return;
    }

    if (!formData.course_version_id) {
      showAlert("error", "Debe seleccionar un curso");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      showAlert("error", "Las fechas de inicio y fin son obligatorias");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      showAlert("error", "La fecha de inicio no puede ser mayor que la fecha de fin");
      return;
    }

    setSubmitLoading(true);

    try {
      const url = editingGroup
        ? `${config.apiUrl}${config.endpoints.groups}/${editingGroup.id}`
        : `${config.apiUrl}${config.endpoints.groups}`;

      const method = editingGroup ? "PUT" : "POST";

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
        showAlert("success", data.message || (editingGroup ? "Grupo actualizado correctamente" : "Grupo creado correctamente"));
        setIsGroupDialogOpen(false);
        fetchGroups();
      } else {
        showAlert("error", data.message || "Error al guardar el grupo");
      }
    } catch (error: any) {
      console.error("Error saving group:", error);
      showAlert("error", error.message || "Error al guardar el grupo");
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmDeleteGroup = async () => {
    if (!deletingGroup) return;

    setSubmitLoading(true);

    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.groups}/${deletingGroup.id}`,
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
        showAlert("success", data.message || "Grupo eliminado correctamente");
        setIsDeleteDialogOpen(false);
        setDeletingGroup(null);
        fetchGroups();
      } else {
        showAlert("error", data.message || "Error al eliminar el grupo");
      }
    } catch (error: any) {
      console.error("Error deleting group:", error);
      showAlert("error", error.message || "Error al eliminar el grupo");
    } finally {
      setSubmitLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.course_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || group.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdministrativeLayout title="Gestión de Grupos">
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-7 shadow-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/90">
              Procesos Académicos
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Gestión de Grupos
            </h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-100/80">
              Administra las clases y secciones donde se imparten los cursos
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

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar grupos o cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter - CORREGIDO */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="enrolling">Inscripciones</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                {/* Create Button */}
                <Button
                  onClick={handleCreateGroup}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Grupo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Groups List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Cargando grupos...</p>
              </div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron grupos con los filtros aplicados"
                    : "No hay grupos creados"}
                </p>
                <Button onClick={handleCreateGroup} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primer grupo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEdit={handleEditGroup}
                  onDelete={handleDeleteGroup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Editar Grupo" : "Crear Grupo"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Modifica la información del grupo"
                : "Ingresa los datos del nuevo grupo"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Course Version */}
            <div className="space-y-2">
              <Label htmlFor="course_version_id">Curso *</Label>
              <Select
                value={formData.course_version_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, course_version_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courseVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id.toString()}>
                      {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Grupo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Grupo A - Mañana"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de Fin *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Status - CORREGIDO */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="enrolling">Inscripciones</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGroupDialogOpen(false)}
              disabled={submitLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitGroup} 
              disabled={submitLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {editingGroup ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                editingGroup ? "Actualizar" : "Crear"
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
              Esta acción no se puede deshacer. Se eliminará el grupo "
              {deletingGroup?.name}" de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGroup}
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

// GroupCard component - CORREGIDO
const GroupCard = ({ group, onEdit, onDelete }: { group: Group; onEdit: (group: Group) => void; onDelete: (group: Group) => void }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: Clock,
        label: "Pendiente",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
      },
      enrolling: {
        icon: UserPlus,
        label: "Inscripciones",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
      },
      active: {
        icon: PlayCircle,
        label: "Activo",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
      },
      completed: {
        icon: CheckCircle2,
        label: "Completado",
        className: "bg-slate-100 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400",
      },
      cancelled: {
        icon: XCircle,
        label: "Cancelado",
        className: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
      },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(group.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{group.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span className="line-clamp-1">{group.course_name}</span>
            </div>
          </div>
          <Badge className={statusConfig.className}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Course Version */}
        <div className="text-sm">
          <span className="text-muted-foreground">Versión: </span>
          <span className="font-medium">{group.course_version_name}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(group.start_date).toLocaleDateString("es-ES")} -{" "}
            {new Date(group.end_date).toLocaleDateString("es-ES")}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{group.students_count}</span>
            <span className="text-muted-foreground">estudiantes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">{group.teachers_count}</span>
            <span className="text-muted-foreground">docentes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            onClick={() => onEdit(group)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 hover:text-red-700"
            onClick={() => onDelete(group)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupsManagement;