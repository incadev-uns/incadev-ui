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
  IconBook,
  IconPackage,
  IconUsers as IconUsersTabler,
  IconFolders,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
} from "@/process/administrative/academic-processes/components/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowsSort } from "@tabler/icons-react";
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  FileSpreadsheet,
  Package,
  Users,
  ChevronDown,
  ChevronUp,
  Folder,
  X,
  AlertCircle,
} from "lucide-react";

// Tipos
interface Course {
  id: number;
  name: string;
  description: string | null;
  image_path: string | null;
  created_at: string;
  versions_count?: number;
  active_versions?: number;
  total_students?: number;
}

interface CourseStats {
  total_courses: number;
  total_versions: number;
  total_students: number;
  active_courses: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface ApiResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Course | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("all");

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  // Paginación
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    loadCourses();
  }, [paginationMeta.current_page, debouncedSearch]);

  // Cargar estadísticas al montar
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: paginationMeta.current_page.toString(),
        per_page: paginationMeta.per_page.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const apiUrl = `${config.apiUrl}${config.endpoints.courses}?${params}`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al cargar cursos");

      const data = await response.json();

      // CAMBIO AQUÍ: Ajustar para la nueva estructura
      setCourses(data.courses || []);

      // Actualizar stats si existe
      if (data.stats) {
        setStats(data.stats);
      }

      setPaginationMeta({
        current_page: data.pagination.current_page,
        last_page: data.pagination.last_page,
        per_page: data.pagination.per_page,
        total: data.pagination.total,
        from: data.pagination.from,
        to: data.pagination.to,
      });

      setError(null);
    } catch (error) {
      console.error("Error loading courses:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.courses}/statistics`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al cargar estadísticas");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading statistics:", error);
      setStats({
        total_courses: 0,
        total_versions: 0,
        total_students: 0,
        active_courses: 0,
      });
    }
  };

  const handleSort = (column: keyof Course) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleOpenForm = (mode: "create" | "edit", course?: Course) => {
    setFormMode(mode);

    if (mode === "edit" && course) {
      setFormData({
        name: course.name,
        description: course.description || "",
      });
      setSelectedCourse(course);
    } else {
      setFormData({
        name: "",
        description: "",
      });
      setSelectedCourse(null);
    }

    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async () => {
    if (!formData.name.trim()) {
      alert("El nombre del curso es requerido");
      return;
    }

    setSubmitting(true);
    try {
      const url =
        formMode === "create"
          ? `${config.apiUrl}${config.endpoints.courses}`
          : `${config.apiUrl}${config.endpoints.courses}/${selectedCourse?.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el curso");
      }

      // Recargar datos
      await loadCourses();
      await loadStatistics();

      // Cerrar modal y limpiar
      setIsFormModalOpen(false);
      setFormData({ name: "", description: "" });
      setSelectedCourse(null);

      setSuccessMessage(
        formMode === "create"
          ? "Curso creado exitosamente"
          : "Curso actualizado exitosamente"
      );
      setTimeout(() => setSuccessMessage(null), 5000); // Auto-ocultar después de 5 segundos
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error al guardar el curso"
      );
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.courses}/${courseToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Error al eliminar el curso"
        );
      }

      // Recargar datos
      await loadCourses();

      setSuccessMessage("Curso eliminado exitosamente");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error deleting course:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error al eliminar el curso"
      );
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const exportCSV = () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.courses}/export/csv`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al exportar CSV:", error);
    }
  };

  const exportPDF = async () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.courses}/export/pdf`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      localStorage.setItem("coursesExportData", JSON.stringify(data));

      const pdfWindow = window.open(
        "/administrativo/procesos-academicos/export-courses",
        "_blank"
      );

      if (!pdfWindow) {
        alert(
          "Por favor, permite las ventanas emergentes para exportar el PDF"
        );
      }
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert(
        `Error al exportar PDF: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPaginationMeta((prev) => ({ ...prev, current_page: newPage }));
  };

  const sortedCourses = React.useMemo(() => {
    if (!sortColumn) return courses;

    return [...courses].sort((a, b) => {
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
  }, [courses, sortColumn, sortDirection]);

  return (
    <AdministrativeLayout title="Cursos">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-100/90">
                  Procesos Academicos
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                  Gestión de Cursos
                </h1>
                <p className="mt-2 max-w-xl text-sm text-indigo-100/80">
                  Administra los cursos disponibles en la plataforma educativa
                </p>
              </div>
              <Button
                onClick={() => handleOpenForm("create")}
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Curso
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
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando cursos...
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
                  Error al cargar los cursos: {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifica que el backend esté corriendo en {config.apiUrl}
                </p>
                <Button
                  onClick={loadCourses}
                  className="mt-4"
                  variant="outline"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards mejoradas */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Cursos
                        </p>
                        <p className="text-3xl font-bold">
                          {stats?.total_courses || 0}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                        <IconBook className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Cursos Activos
                        </p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stats?.active_courses || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Publicados y disponibles
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                        <IconPackage className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Versiones
                        </p>
                        <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                          {stats?.total_versions || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Historial completo
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                        <IconFolders className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Estudiantes
                        </p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {stats?.total_students || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Matriculados activos
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 ml-4">
                        <IconUsersTabler className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                      <CardTitle>Catálogo de Cursos</CardTitle>
                      <CardDescription>
                        Lista completa de cursos registrados en el sistema
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {paginationMeta.total} cursos
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                  {/* Search */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[280px]">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {searchQuery && (
                      <Button variant="outline" onClick={handleClearSearch}>
                        <X className="mr-2 h-4 w-4" />
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>

                  {courses.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                        <BookOpen className="h-8 w-8 text-indigo-400" />
                      </div>
                      <p className="text-lg font-medium mb-2">
                        No hay cursos disponibles
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? "No se encontraron cursos que coincidan con la búsqueda"
                          : "Comienza agregando tu primer curso"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Vista Mobile - Cards */}
                      <div className="space-y-3 md:hidden">
                        {sortedCourses.map((course) => (
                          <div
                            key={course.id}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {course.image_path ? (
                                  <img
                                    src={course.image_path}
                                    alt={course.name}
                                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20 shrink-0">
                                    <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Curso #{course.id}
                                  </p>
                                  <p className="font-semibold text-base truncate">
                                    {course.name}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description || "Sin descripción"}
                            </p>

                            <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b border-slate-200 dark:border-slate-800">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Versiones
                                </p>
                                <Badge
                                  variant="outline"
                                  className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20"
                                >
                                  {course.versions_count || 0}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Activas
                                </p>
                                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                                  {course.active_versions || 0}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Estudiantes
                                </p>
                                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                  {course.total_students || 0}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCourse(course);
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
                                      handleOpenForm("edit", course)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Package className="mr-2 h-4 w-4" />
                                    Ver versiones
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Users className="mr-2 h-4 w-4" />
                                    Ver estudiantes
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteCourse(course)}
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
                              <TableRow className="bg-indigo-50 dark:bg-indigo-950/20">
                                <TableHead className="w-[40px]">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
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
                                    className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                    onClick={() => handleSort("name")}
                                  >
                                    Nombre del Curso
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
                                <TableHead className="w-[250px] font-semibold text-indigo-700 dark:text-indigo-400">
                                  Descripción
                                </TableHead>
                                <TableHead className="w-[110px] font-semibold text-indigo-700 dark:text-indigo-400 text-center">
                                  Versiones
                                </TableHead>
                                <TableHead className="w-[100px] font-semibold text-indigo-700 dark:text-indigo-400 text-center">
                                  Activas
                                </TableHead>
                                <TableHead className="w-[130px] font-semibold text-indigo-700 dark:text-indigo-400 text-center">
                                  Estudiantes
                                </TableHead>
                                <TableHead className="w-[140px] font-semibold text-indigo-700 dark:text-indigo-400 text-center">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedCourses.map((course) => (
                                <TableRow
                                  key={course.id}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                >
                                  <TableCell className="font-semibold text-center">
                                    #{course.id}
                                  </TableCell>
                                  <TableCell className="max-w-[300px]">
                                    <div className="flex items-center gap-3">
                                      {course.image_path ? (
                                        <img
                                          src={course.image_path}
                                          alt={course.name}
                                          className="h-10 w-10 rounded-lg object-cover shrink-0"
                                        />
                                      ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20 shrink-0">
                                          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                          {course.name}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-[350px]">
                                    <p className="text-sm text-muted-foreground truncate">
                                      {course.description || "Sin descripción"}
                                    </p>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="secondary"
                                      className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20"
                                    >
                                      {course.versions_count || 0}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                                      {course.active_versions || 0}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                      {course.total_students || 0}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedCourse(course);
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
                                          handleOpenForm("edit", course)
                                        }
                                        title="Editar curso"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteCourse(course)
                                        }
                                        className="text-red-600 dark:text-red-400"
                                        title="Eliminar curso"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
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
                          {paginationMeta.total} cursos
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
                  {formMode === "create" ? "Crear Nuevo Curso" : "Editar Curso"}
                </DialogTitle>
                <DialogDescription>
                  {formMode === "create"
                    ? "Complete los datos para crear un nuevo curso en el sistema"
                    : "Modifique los datos del curso"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Curso *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Inteligencia Artificial y Data Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe el curso y sus objetivos principales..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Una buena descripción ayuda a los estudiantes a entender el
                    contenido del curso
                  </p>
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
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : formMode === "create" ? (
                    "Crear Curso"
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
                <DialogTitle>Detalles del Curso</DialogTitle>
                <DialogDescription>
                  Información completa del curso
                </DialogDescription>
              </DialogHeader>

              {selectedCourse && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        ID del Curso
                      </p>
                      <p className="text-lg font-semibold">
                        #{selectedCourse.id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Fecha de Creación
                      </p>
                      <p className="text-lg">
                        {new Date(selectedCourse.created_at).toLocaleDateString(
                          "es-PE",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Nombre del Curso
                    </p>
                    <p className="text-xl font-semibold">
                      {selectedCourse.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Descripción
                    </p>
                    <p className="text-base text-muted-foreground">
                      {selectedCourse.description ||
                        "Sin descripción registrada"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Versiones
                      </p>
                      <p className="text-3xl font-bold text-violet-600">
                        {selectedCourse.versions_count || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Versiones Activas
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {selectedCourse.active_versions || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Estudiantes
                      </p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {selectedCourse.total_students || 0}
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
                    if (selectedCourse) {
                      handleOpenForm("edit", selectedCourse);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
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
                  ¿Estás seguro de eliminar este curso?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  el curso
                  <strong className="block mt-2 text-foreground">
                    {courseToDelete?.name}
                  </strong>
                  y todas sus versiones asociadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar Curso
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AdministrativeLayout>
  );
}
