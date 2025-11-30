import React, { useState, useEffect } from "react";
import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import { config } from "@/config/administrative-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconUserPlus,
  IconDownload,
  IconSearch,
  IconFilter,
  IconArrowsSort,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEdit,
  IconUsers,
  IconFileTypeCsv,
  IconFileTypePdf,
} from "@tabler/icons-react";
import StudentDetailModal from "@/process/administrative/academic-management/components/student-detail-modal";
import StudentFormModal from "@/process/administrative/academic-management/components/student-form-modal";
import StudentHistoryModal from "@/process/administrative/academic-management/components/student-history-modal";

interface StudentProfile {
  interests?: string[] | null;
  learning_goal?: string | null;
}

interface Enrollment {
  id: number;
  academic_status: string;
  payment_status: string;
  group?: {
    course_version?: {
      course?: {
        name: string;
      };
    };
  };
}

interface Student {
  id: number;
  name: string;
  fullname: string;
  dni: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  created_at: string;
  student_profile?: StudentProfile;
  enrollments?: Enrollment[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface StudentStats {
  total_students: number;
  active_students: number;
  pending_payments: number;
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [userRole] = useState<"admin" | "teacher">("admin");

  // Paginación
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Student | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    loadStudents();
  }, [paginationMeta.current_page, debouncedSearch, statusFilter]);

  // Cargar estadísticas al montar
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: paginationMeta.current_page.toString(),
        per_page: paginationMeta.per_page.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const apiUrl = `${config.apiUrl}${config.endpoints.students}?${params}`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al cargar estudiantes");

      const data = await response.json();

      setStudents(data.data || []);
      setPaginationMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
        from: data.from,
        to: data.to,
      });

      setError(null);
    } catch (error) {
      console.error("Error loading students:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.students}/statistics`;
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
        total_students: 0,
        active_students: 0,
        pending_payments: 0,
      });
    }
  };

  const handleSort = (column: keyof Student) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSortColumn(null);
    setSortDirection("desc");
    setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
  };

  const exportCSV = () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.students}/export/csv`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al exportar CSV:", error);
    }
  };

  const exportPDF = async () => {
    try {
      console.log("🔍 Iniciando exportación PDF...");

      // Construir la URL completa
      const url = `${config.apiUrl}${config.endpoints.studentsExportData}`;
      console.log("📡 URL del endpoint:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("📊 Respuesta del servidor:", response.status);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Datos recibidos:", data);

      // Guardar en localStorage
      localStorage.setItem("studentsExportData", JSON.stringify(data));
      console.log("💾 Datos guardados en localStorage");

      // Abrir nueva ventana
      const pdfWindow = window.open(
        "/administrativo/gestion-academica/export-pdf",
        "_blank"
      );
      console.log("🪟 Ventana abierta:", pdfWindow ? "Sí" : "No");

      if (!pdfWindow) {
        alert(
          "Por favor, permite las ventanas emergentes para exportar el PDF"
        );
      }
    } catch (error) {
      console.error("❌ Error al exportar PDF:", error);
      alert(
        `Error al exportar PDF: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  const handleNewStudent = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleViewHistory = (student: Student) => {
    setHistoryStudent(student);
    setIsHistoryModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadStudents();
    loadStatistics();
  };

  const getStatusBadge = (enrollments?: Enrollment[]) => {
    if (!enrollments || enrollments.length === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20"
        >
          Sin matrícula
        </Badge>
      );
    }

    const hasActive = enrollments.some((e) => e.academic_status === "active");

    return hasActive ? (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      >
        Activo
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      >
        Inactivo
      </Badge>
    );
  };

  const getEnrollmentsCount = (student: Student): number => {
    return student.enrollments?.length || 0;
  };

  const getCurrentCourses = (student: Student): number => {
    return (
      student.enrollments?.filter((e) => e.academic_status === "active")
        .length || 0
    );
  };

  const handlePageChange = (newPage: number) => {
    setPaginationMeta((prev) => ({ ...prev, current_page: newPage }));
  };

  const sortedStudents = React.useMemo(() => {
    if (!sortColumn) return students;

    return [...students].sort((a, b) => {
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
  }, [students, sortColumn, sortDirection]);

  return (
    <AdministrativeLayout title="Estudiantes">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-100/90">
                Gestión Académica
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                Gestión de Estudiantes
              </h1>
              <p className="mt-2 max-w-xl text-sm text-indigo-100/80">
                Visualiza y administra la información de los estudiantes
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando estudiantes...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <IconUsers className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar los estudiantes: {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifica que el backend esté corriendo en {config.apiUrl}
                </p>
                <Button
                  onClick={loadStudents}
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
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Estudiantes
                        </p>
                        <p className="text-3xl font-bold">
                          {stats?.total_students || 0}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                        <IconUsers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Estudiantes Activos
                        </p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stats?.active_students || 0}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                          <IconUsers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Pagos Pendientes
                        </p>
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                          {stats?.pending_payments || 0}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                          <IconUsers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        {stats && stats.pending_payments > 0 && (
                          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                            {stats.pending_payments > 9
                              ? "9+"
                              : stats.pending_payments}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table Card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Registro de estudiantes</CardTitle>
                      <CardDescription>
                        Lista completa de estudiantes registrados en el sistema
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {paginationMeta.total} registros
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <IconDownload className="mr-2 h-4 w-4" />
                            Exportar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={exportCSV}>
                            <IconFileTypeCsv className="mr-2 h-4 w-4" />
                            CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportPDF}>
                            <IconFileTypePdf className="mr-2 h-4 w-4" />
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
                      <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre, DNI o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <IconFilter className="h-4 w-4" />
                          Filtrar estado
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
                        <DropdownMenuLabel>Estado académico</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "all"}
                          onCheckedChange={() => toggleStatusFilter("all")}
                        >
                          Todos
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "active"}
                          onCheckedChange={() => toggleStatusFilter("active")}
                        >
                          Activos
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter === "inactive"}
                          onCheckedChange={() => toggleStatusFilter("inactive")}
                        >
                          Inactivos
                        </DropdownMenuCheckboxItem>
                        {(statusFilter !== "all" || sortColumn) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={clearFilters}
                              className="text-red-600 dark:text-red-400"
                            >
                              Limpiar filtros
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={handleClearSearch}>
                      Limpiar búsqueda
                    </Button>
                  </div>

                  {students.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No hay estudiantes que coincidan con la búsqueda
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Table */}
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-indigo-50 dark:bg-indigo-950/20">
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                  onClick={() => handleSort("id")}
                                >
                                  ID
                                  {sortColumn === "id" ? (
                                    sortDirection === "asc" ? (
                                      <IconChevronUp className="h-3 w-3" />
                                    ) : (
                                      <IconChevronDown className="h-3 w-3" />
                                    )
                                  ) : (
                                    <IconArrowsSort className="h-3 w-3 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                  onClick={() => handleSort("fullname")}
                                >
                                  Nombre Completo
                                  {sortColumn === "fullname" ? (
                                    sortDirection === "asc" ? (
                                      <IconChevronUp className="h-3 w-3" />
                                    ) : (
                                      <IconChevronDown className="h-3 w-3" />
                                    )
                                  ) : (
                                    <IconArrowsSort className="h-3 w-3 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                              <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400">
                                DNI
                              </TableHead>
                              <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400">
                                Email
                              </TableHead>
                              <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400">
                                Teléfono
                              </TableHead>
                              <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400 text-center">
                                Matrículas
                              </TableHead>
                              <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400 text-center">
                                Cursos actuales
                              </TableHead>
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                >
                                  Estado
                                </Button>
                              </TableHead>
                              <TableHead className="text-center font-semibold text-indigo-700 dark:text-indigo-400">
                                Acciones
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedStudents.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-semibold">
                                  #{student.id}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {student.fullname}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {student.dni}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {student.email}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {student.phone || "--"}
                                </TableCell>
                                <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400 text-center">
                                  {getEnrollmentsCount(student)}
                                </TableCell>
                                <TableCell className="font-semibold text-center">
                                  {getCurrentCourses(student)}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(student.enrollments)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedStudent(student)
                                      }
                                      title="Ver detalles"
                                    >
                                      <IconEye className="h-4 w-4" />
                                    </Button>
                                    {userRole === "admin" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleEditStudent(student)
                                        }
                                        title="Editar estudiante"
                                      >
                                        <IconEdit className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {paginationMeta.from}-{paginationMeta.to} de{" "}
                          {paginationMeta.total}
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
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Página {paginationMeta.current_page} de{" "}
                              {paginationMeta.last_page}
                            </span>
                          </div>
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
        </div>

        {/* Detail Modal */}
        <StudentDetailModal
          student={selectedStudent}
          userRole={userRole}
          onClose={() => setSelectedStudent(null)}
          onEdit={(student) => {
            setSelectedStudent(null);
            handleEditStudent(student);
          }}
          onViewHistory={(student) => {
            setSelectedStudent(null);
            handleViewHistory(student);
          }}
        />

        {/* Form Modal (Create/Edit) */}
        <StudentFormModal
          student={editingStudent}
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingStudent(null);
          }}
          onSuccess={handleFormSuccess}
        />

        {/* History Modal */}
        <StudentHistoryModal
          student={historyStudent}
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setHistoryStudent(null);
          }}
        />
      </div>
    </AdministrativeLayout>
  );
}
