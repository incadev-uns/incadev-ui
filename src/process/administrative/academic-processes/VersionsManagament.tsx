import React, { useState, useEffect } from "react";
import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import { config } from "@/config/administrative-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { IconArrowsSort } from "@tabler/icons-react";
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  FileSpreadsheet,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  CheckCircle2,
  Clock,
  Archive,
  Copy,
  AlertCircle,
  Layers,
  Users,
} from "lucide-react";

// Tipos
interface Course {
  id: number;
  name: string;
}

interface CourseVersion {
  id: number;
  course_id: number;
  version: string;
  name: string;
  price: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  course?: Course;
  modules_count?: number;
  groups_count?: number;
  students_count?: number;
}

interface VersionStats {
  total_versions: number;
  published_versions: number;
  draft_versions: number;
  archived_versions: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function CourseVersionsManagement() {
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<VersionStats>({
    total_versions: 0,
    published_versions: 0,
    draft_versions: 0,
    archived_versions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof CourseVersion | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const [selectedVersion, setSelectedVersion] = useState<CourseVersion | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<CourseVersion | null>(
    null
  );
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const [formData, setFormData] = useState({
    course_id: "",
    version: "",
    name: "",
    price: "",
    status: "draft" as "draft" | "published" | "archived",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cargar datos iniciales
  useEffect(() => {
    loadCourses();
    loadStatistics();
  }, []);

  // Cargar versiones cuando cambian los filtros
  useEffect(() => {
    loadVersions();
  }, [
    paginationMeta.current_page,
    debouncedSearch,
    statusFilter,
    courseFilter,
  ]);

  const loadCourses = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.courseVersions}/courses`,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("Error al cargar cursos");
      const data = await response.json();
      // Asegurar que siempre sea un array
      setCourses(
        Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error("Error loading courses:", err);
      // Asegurar que courses sea un array vacío en caso de error
      setCourses([]);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.courseVersions}/statistics`,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("Error al cargar estadísticas");
      const data = await response.json();
      setStats(data.data || data);
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  };

  const loadVersions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: paginationMeta.current_page.toString(),
        per_page: paginationMeta.per_page.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(courseFilter !== "all" && { course_id: courseFilter }),
      });

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.courseVersions}?${params}`,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) throw new Error("Error al cargar versiones");

      const data = await response.json();

      setVersions(data.data || []);

      if (data.current_page !== undefined) {
        setPaginationMeta({
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to,
        });
      }

      setError(null);
    } catch (err) {
      console.error("Error loading versions:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.course_id) errors.course_id = "El curso es requerido";
    if (!formData.version) errors.version = "La versión es requerida";
    if (!formData.name) errors.name = "El nombre es requerido";
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.price = "El precio debe ser mayor a 0";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenForm = (mode: "create" | "edit", version?: CourseVersion) => {
    setFormMode(mode);
    setFormErrors({});

    if (mode === "edit" && version) {
      setFormData({
        course_id: version.course_id.toString(),
        version: version.version,
        name: version.name,
        price: version.price.toString(),
        status: version.status,
      });
      setSelectedVersion(version);
    } else {
      setFormData({
        course_id: "",
        version: "",
        name: "",
        price: "",
        status: "draft",
      });
      setSelectedVersion(null);
    }

    setIsFormModalOpen(true);
  };

  const handleDuplicateVersion = (version: CourseVersion) => {
    setFormData({
      course_id: version.course_id.toString(),
      version: "",
      name: version.name + " (Copia)",
      price: version.price.toString(),
      status: "draft",
    });
    setSelectedVersion(null);
    setFormMode("create");
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        course_id: parseInt(formData.course_id),
        version: formData.version,
        name: formData.name,
        price: parseFloat(formData.price),
        status: formData.status,
      };

      const url =
        formMode === "create"
          ? `${config.apiUrl}${config.endpoints.courseVersions}`
          : `${config.apiUrl}${config.endpoints.courseVersions}/${selectedVersion?.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar la versión");
      }

      await loadVersions();
      await loadStatistics();

      setIsFormModalOpen(false);
      setFormData({
        course_id: "",
        version: "",
        name: "",
        price: "",
        status: "draft",
      });
      setSelectedVersion(null);

      setSuccessMessage(
        formMode === "create"
          ? "Versión creada exitosamente"
          : "Versión actualizada exitosamente"
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Error al guardar la versión"
      );
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVersion = (version: CourseVersion) => {
    setVersionToDelete(version);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!versionToDelete) return;

    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.courseVersions}/${versionToDelete.id}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Error al eliminar la versión"
        );
      }

      await loadVersions();
      await loadStatistics();

      setSuccessMessage("Versión eliminada exitosamente");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error deleting version:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Error al eliminar la versión"
      );
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsDeleteDialogOpen(false);
      setVersionToDelete(null);
    }
  };

  const handleChangeStatus = async (
    version: CourseVersion,
    newStatus: "draft" | "published" | "archived"
  ) => {
    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.courseVersions}/${version.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...version,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al cambiar el estado");

      await loadVersions();
      await loadStatistics();

      setSuccessMessage("Estado actualizado exitosamente");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error changing status:", err);
      setErrorMessage("Error al cambiar el estado");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const exportCSV = () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.courseVersions}/export/csv`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al exportar CSV:", error);
      setErrorMessage("Error al exportar CSV");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const exportPDF = async () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.courseVersions}/export/pdf`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener datos para exportación");
      }

      const data = await response.json();

      // Guardamos los datos en localStorage
      localStorage.setItem("courseVersionsExportData", JSON.stringify(data));

      // Abrimos la página de exportación PDF
      window.open(
        "/administrativo/procesos-academicos/export-versions",
        "_blank"
      );

      setSuccessMessage("Generando reporte PDF...");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      setErrorMessage("Error al exportar PDF");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleSort = (column: keyof CourseVersion) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCourseFilter("all");
    setSortColumn(null);
    setSortDirection("desc");
  };

  const handlePageChange = (newPage: number) => {
    setPaginationMeta((prev) => ({ ...prev, current_page: newPage }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Publicado
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Borrador
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20">
            <Archive className="mr-1 h-3 w-3" />
            Archivado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCourseNameById = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || "Curso no encontrado";
  };

  const sortedVersions = React.useMemo(() => {
    if (!sortColumn) return versions;

    return [...versions].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue || "");
      const bString = String(bValue || "");

      if (sortDirection === "asc") {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [versions, sortColumn, sortDirection]);

  const hasActiveFilters =
    statusFilter !== "all" || courseFilter !== "all" || searchQuery !== "";

  return (
    <AdministrativeLayout title="Versiones de Cursos">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-violet-100/90">
                  Procesos Académicos
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                  Versiones de Cursos
                </h1>
                <p className="mt-2 max-w-xl text-sm text-violet-100/80">
                  Administra las diferentes versiones y ediciones de cada curso
                </p>
              </div>
              <Button
                onClick={() => handleOpenForm("create")}
                className="bg-white text-violet-600 hover:bg-violet-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Versión
              </Button>
            </div>
          </div>

          {/* Mensajes de éxito y error */}
          {successMessage && (
            <Alert className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-100">
              <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-violet-500"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando versiones...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar las versiones: {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifica que el backend esté corriendo en {config.apiUrl}
                </p>
                <Button
                  onClick={loadVersions}
                  className="mt-4"
                  variant="outline"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Versiones
                        </p>
                        <p className="text-3xl font-bold">
                          {stats.total_versions}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                        <Package className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Publicadas
                        </p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.published_versions}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Borradores
                        </p>
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                          {stats.draft_versions}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                        <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Archivadas
                        </p>
                        <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                          {stats.archived_versions}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/20">
                        <Archive className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Listado de Versiones</CardTitle>
                      <CardDescription>
                        Gestiona las versiones de los cursos disponibles en la
                        plataforma
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {paginationMeta.total} versiones
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={exportCSV}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportPDF}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[280px]">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre, versión o curso..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select
                      value={courseFilter}
                      onValueChange={setCourseFilter}
                    >
                      <SelectTrigger className="w-[200px]">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filtrar por curso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los cursos</SelectItem>
                        {Array.isArray(courses) &&
                          courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                            >
                              {course.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter className="h-4 w-4" />
                          Estado
                          {statusFilter !== "all" && (
                            <Badge
                              variant="secondary"
                              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                            >
                              1
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          Filtrar por estado
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "all"}
                          onCheckedChange={() => setStatusFilter("all")}
                        >
                          Todos los estados
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "published"}
                          onCheckedChange={() => setStatusFilter("published")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                          Publicado
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "draft"}
                          onCheckedChange={() => setStatusFilter("draft")}
                        >
                          <Clock className="mr-2 h-4 w-4 text-amber-600" />
                          Borrador
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "archived"}
                          onCheckedChange={() => setStatusFilter("archived")}
                        >
                          <Archive className="mr-2 h-4 w-4 text-slate-600" />
                          Archivado
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {hasActiveFilters && (
                      <Button variant="outline" onClick={handleClearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>

                  {versions.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                        <Package className="h-8 w-8 text-violet-400" />
                      </div>
                      <p className="text-lg font-medium mb-2">
                        No hay versiones disponibles
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {hasActiveFilters
                          ? "No se encontraron versiones que coincidan con los filtros"
                          : "Comienza agregando tu primera versión"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Vista Mobile - Cards */}
                      <div className="space-y-3 md:hidden">
                        {sortedVersions.map((version) => (
                          <div
                            key={version.id}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  Versión #{version.id}
                                </p>
                                <p className="font-semibold text-base truncate">
                                  {version.name}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {getCourseNameById(version.course_id)}
                                </p>
                              </div>
                              {getStatusBadge(version.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-2 py-2 border-t border-slate-200 dark:border-slate-800">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Versión
                                </p>
                                <Badge variant="outline">
                                  {version.version}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Precio
                                </p>
                                <p className="text-lg font-semibold text-violet-600">
                                  S/.{" "}
                                  {parseFloat(version.price.toString()).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedVersion(version);
                                  setIsDetailModalOpen(true);
                                }}
                              >
                                Ver detalles
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenForm("edit", version)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDuplicateVersion(version)
                                    }
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicar versión
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteVersion(version)}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Vista Desktop - Tabla */}
                      <div className="hidden md:block overflow-x-auto">
                        <div className="rounded-md border inline-block min-w-full">
                          <Table className="table-fixed w-full [&_th]:whitespace-normal [&_td]:whitespace-normal [&_th]:px-4 [&_td]:px-4">
                            <TableHeader>
                              <TableRow className="bg-violet-50 dark:bg-violet-950/20">
                                <TableHead className="w-[80px]">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 font-semibold text-violet-700 dark:text-violet-400"
                                    onClick={() => handleSort("id")}
                                  >
                                    ID
                                    {sortColumn === "id" ? (
                                      sortDirection === "asc" ? (
                                        <ChevronUp className="h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3" />
                                      )
                                    ) : (
                                      <IconArrowsSort className="h-3 w-3 opacity-50" />
                                    )}
                                  </Button>
                                </TableHead>
                                <TableHead className="min-w-[200px]">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 font-semibold text-violet-700 dark:text-violet-400"
                                    onClick={() => handleSort("name")}
                                  >
                                    Nombre
                                    {sortColumn === "name" ? (
                                      sortDirection === "asc" ? (
                                        <ChevronUp className="h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3" />
                                      )
                                    ) : (
                                      <IconArrowsSort className="h-3 w-3 opacity-50" />
                                    )}
                                  </Button>
                                </TableHead>
                                <TableHead className="w-[250px] font-semibold text-violet-700 dark:text-violet-400">
                                  Curso
                                </TableHead>
                                <TableHead className="w-[100px] font-semibold text-violet-700 dark:text-violet-400">
                                  Versión
                                </TableHead>
                                <TableHead className="w-[150px] font-semibold text-violet-700 dark:text-violet-400">
                                  Precio
                                </TableHead>
                                <TableHead className="w-[130px] font-semibold text-violet-700 dark:text-violet-400">
                                  Estado
                                </TableHead>
                                <TableHead className="w-[140px] font-semibold text-violet-700 dark:text-violet-400 text-center">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedVersions.map((version) => (
                                <TableRow
                                  key={version.id}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                >
                                  <TableCell className="font-semibold text-center">
                                    #{version.id}
                                  </TableCell>
                                  <TableCell className="font-medium truncate">
                                    {version.name}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm truncate">
                                    {getCourseNameById(version.course_id)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {version.version}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-semibold text-violet-600">
                                    S/.{" "}
                                    {parseFloat(
                                      version.price.toString()
                                    ).toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(version.status)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedVersion(version);
                                          setIsDetailModalOpen(true);
                                        }}
                                        title="Ver detalles"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenForm("edit", version)
                                        }
                                        title="Editar versión"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteVersion(version)
                                        }
                                        className="text-red-600 dark:text-red-400"
                                        title="Eliminar versión"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Paginación */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {paginationMeta.from}-{paginationMeta.to} de{" "}
                          {paginationMeta.total} versiones
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(paginationMeta.current_page - 1)
                            }
                            disabled={paginationMeta.current_page === 1}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(paginationMeta.current_page + 1)
                            }
                            disabled={
                              paginationMeta.current_page ===
                              paginationMeta.last_page
                            }
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

          {/* Form Modal (Create/Edit) */}
          <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {formMode === "create"
                    ? "Crear Nueva Versión"
                    : "Editar Versión"}
                </DialogTitle>
                <DialogDescription>
                  {formMode === "create"
                    ? "Complete los datos para crear una nueva versión del curso"
                    : "Modifique los datos de la versión"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="course_id">Curso *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, course_id: value })
                    }
                  >
                    <SelectTrigger
                      className={formErrors.course_id ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Selecciona un curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(courses) && courses.length > 0 ? (
                        courses.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No hay cursos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.course_id && (
                    <p className="text-xs text-red-600">
                      {formErrors.course_id}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Versión *</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) =>
                        setFormData({ ...formData, version: e.target.value })
                      }
                      placeholder="Ej: 2025-01"
                      className={formErrors.version ? "border-red-500" : ""}
                    />
                    {formErrors.version ? (
                      <p className="text-xs text-red-600">
                        {formErrors.version}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Formato: YYYY-MM
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (S/.) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="350.00"
                      className={formErrors.price ? "border-red-500" : ""}
                    />
                    {formErrors.price && (
                      <p className="text-xs text-red-600">{formErrors.price}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Versión *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: IA-DS-2025-01"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name ? (
                    <p className="text-xs text-red-600">{formErrors.name}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Nombre identificador único para esta versión
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-amber-600" />
                          Borrador
                        </div>
                      </SelectItem>
                      <SelectItem value="published">
                        <div className="flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                          Publicado
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center">
                          <Archive className="mr-2 h-4 w-4 text-slate-600" />
                          Archivado
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitForm}
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : formMode === "create" ? (
                    "Crear Versión"
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Detail Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalles de la Versión</DialogTitle>
                <DialogDescription>
                  Información completa de la versión del curso
                </DialogDescription>
              </DialogHeader>

              {selectedVersion && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Estado
                      </p>
                      {getStatusBadge(selectedVersion.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">
                        ID de Versión
                      </p>
                      <p className="text-lg font-semibold">
                        #{selectedVersion.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Nombre de la Versión
                    </p>
                    <p className="text-xl font-semibold">
                      {selectedVersion.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Curso
                      </p>
                      <p className="text-base font-medium">
                        {getCourseNameById(selectedVersion.course_id)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Versión
                      </p>
                      <Badge variant="outline" className="text-base">
                        {selectedVersion.version}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Precio
                    </p>
                    <p className="text-2xl font-bold text-violet-600">
                      S/.{" "}
                      {parseFloat(selectedVersion.price.toString()).toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Fecha de Creación
                      </p>
                      <p className="text-base">
                        {new Date(
                          selectedVersion.created_at
                        ).toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Última Actualización
                      </p>
                      <p className="text-base">
                        {new Date(
                          selectedVersion.updated_at
                        ).toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    if (selectedVersion) {
                      handleOpenForm("edit", selectedVersion);
                    }
                  }}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estás seguro de eliminar esta versión?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  la versión
                  <strong className="block mt-2 text-foreground">
                    {versionToDelete?.name}
                  </strong>
                  y todos sus módulos, grupos y datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar Versión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AdministrativeLayout>
  );
}
