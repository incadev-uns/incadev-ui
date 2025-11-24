import { useState, useEffect } from "react";
import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconSearch,
  IconDownload,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconFilter,
  IconArrowsSort,
  IconChevronUp,
  IconChevronDown,
  IconUser,
  IconBook,
  IconCertificate,
  IconEye,
  IconMail,
  IconPhone,
  IconCalendar,
  IconCash,
  IconUsers,
  IconUserCheck,
  IconTrendingUp,
  IconExternalLink,
  IconFileText,
} from "@tabler/icons-react";
import { config } from "@/config/administrative-config";

// Interfaces
interface StudentRecord {
  id: number;
  code: string;
  fullname: string;
  email: string;
  dni: string;
  phone: string;
  avatar?: string;
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  failed_courses: number;
  average_grade: number;
  total_credits: number;
  earned_credits: number;
  completion_percentage: number;
  certificates_count: number;
  academic_status: string;
  payment_status: string;
  registration_date: string;
}

interface CourseRecord {
  id: number;
  course_name: string;
  period: string;
  instructor: string;
  final_grade: number | null;
  credits: number;
  attendance_percentage: number;
  status: string;
  certificate_id?: number;
  detailed_grades?: {
    component: string;
    grade: number;
    weight: number;
  }[];
  total_classes?: number;
  attended_classes?: number;
  payment_amount?: number;
  payment_date?: string;
  payment_status?: string;
}

interface Certificate {
  id: number;
  uuid: string;
  course_name: string;
  issue_date: string;
  final_grade: number;
  verification_url: string;
}

interface Stats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  average_completion_rate: number;
  total_certificates_issued: number;
}

interface AcademicData {
  students: StudentRecord[];
  stats: Stats;
}

// Stats Cards Component
function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Estudiantes
              </p>
              <p className="text-3xl font-bold">{stats.total_students}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <IconUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
              <p className="text-3xl font-bold">{stats.active_students}</p>
              <p className="text-xs text-muted-foreground">
                {((stats.active_students / stats.total_students) * 100).toFixed(
                  1
                )}
                % del total
              </p>
            </div>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <IconUserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
                Graduados
              </p>
              <p className="text-3xl font-bold">{stats.graduated_students}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total_certificates_issued} certificados emitidos
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
              <IconCertificate className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tasa de Finalización
              </p>
              <p className="text-3xl font-bold">
                {stats.average_completion_rate.toFixed(1)}%
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${stats.average_completion_rate}%` }}
                ></div>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 ml-4">
              <IconTrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Student Detail Modal Component
function StudentDetailModal({
  student,
  isOpen,
  onClose,
}: {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      loadCourses();
      loadCertificates();
    }
  }, [student, isOpen]);

  const loadCourses = async () => {
    if (!student) return;
    try {
      setLoadingCourses(true);
      const apiUrl = `${config.apiUrl}${config.endpoints.academicHistory}/${student.id}/cursos`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Error al cargar cursos:", err);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadCertificates = async () => {
    if (!student) return;
    try {
      setLoadingCertificates(true);
      const apiUrl = `${config.apiUrl}${config.endpoints.academicHistory}/${student.id}/certificados`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      setCertificates(data);
    } catch (err) {
      console.error("Error al cargar certificados:", err);
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  };

  if (!student) return null;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusMap: Record<string, { text: string; className: string }> = {
      active: { text: "ACTIVO", className: "bg-emerald-500 text-white" },
      inactive: { text: "INACTIVO", className: "bg-slate-500 text-white" },
      graduated: { text: "GRADUADO", className: "bg-violet-500 text-white" },
      suspended: { text: "SUSPENDIDO", className: "bg-red-500 text-white" },
    };
    const statusInfo = statusMap[statusLower] || {
      text: status,
      className: "bg-slate-500 text-white",
    };
    return <Badge className={statusInfo.className}>{statusInfo.text}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusMap: Record<string, { text: string; className: string }> = {
      paid: {
        text: "✅ Al día",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      },
      pending: {
        text: "⏳ Pendiente",
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      },
      overdue: {
        text: "❌ Vencido",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      },
    };
    const statusInfo = statusMap[statusLower] || statusMap.pending;
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.text}
      </Badge>
    );
  };

  const getCourseStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { text: string; className: string; icon: string }
    > = {
      approved: {
        text: "APROBADO",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        icon: "✅",
      },
      in_progress: {
        text: "EN CURSO",
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        icon: "🔄",
      },
      failed: {
        text: "REPROBADO",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        icon: "❌",
      },
      abandoned: {
        text: "ABANDONADO",
        className:
          "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
        icon: "⚪",
      },
    };
    const info = statusMap[status.toLowerCase()] || statusMap.abandoned;
    return (
      <Badge variant="outline" className={info.className}>
        {info.icon} {info.text}
      </Badge>
    );
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 18) return "text-emerald-600 dark:text-emerald-400";
    if (grade >= 14) return "text-blue-600 dark:text-blue-400";
    if (grade >= 11) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const downloadCertificate = (certificateId: number) => {
    window.open(
      `${config.apiUrl}/certificates/${certificateId}/download`,
      "_blank"
    );
  };

  const verifyCertificate = (uuid: string) => {
    window.open(`/verificar-certificado/${uuid}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Expediente Estudiantil</DialogTitle>
          <DialogDescription>
            Información académica completa del estudiante
          </DialogDescription>
        </DialogHeader>

        {/* Student Header */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.fullname}
                  className="h-24 w-24 rounded-xl object-cover ring-4 ring-blue-100 dark:ring-blue-900/20"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20 ring-4 ring-blue-200 dark:ring-blue-800">
                  <IconUser className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Código Estudiante
                    </p>
                    <Badge variant="outline" className="font-mono">
                      {student.code}
                    </Badge>
                  </div>
                  <h3 className="mt-1 text-2xl font-bold">
                    {student.fullname}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconUser className="h-4 w-4" />
                    <span>DNI: {student.dni}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconMail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconPhone className="h-4 w-4" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    <span>
                      Registro:{" "}
                      {new Date(student.registration_date).toLocaleDateString(
                        "es-ES"
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Estado:
                    </span>
                    {getStatusBadge(student.academic_status)}
                  </div>
                  <div className="h-4 w-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Pagos:
                    </span>
                    {getPaymentStatusBadge(student.payment_status)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Resumen de Avance Académico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Cursos
                </p>
                <p className="text-4xl font-bold">{student.total_courses}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Completados
                </p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {student.completed_courses}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  En Progreso
                </p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {student.in_progress_courses}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Abandonados/Reprobados
                </p>
                <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {student.failed_courses}
                </p>
              </div>
            </div>

            <div className="mt-6 h-px bg-border"></div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Promedio General
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    ⭐{" "}
                    {student.average_grade > 0
                      ? student.average_grade.toFixed(1)
                      : "0.0"}
                  </span>
                  <span className="text-lg text-muted-foreground">/ 20</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Créditos
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {student.earned_credits || 0}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    / {student.total_credits || 0}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Avance
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${student.completion_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">
                      {Number(student.completion_percentage ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                    <span className="text-lg">📜</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Certificados
                    </p>
                    <p className="text-2xl font-bold">
                      {student.certificates_count} obtenidos
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Estado Pagos
                    </p>
                    {getPaymentStatusBadge(student.payment_status)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses" className="gap-2">
              <IconBook className="h-4 w-4" />
              Historial de Cursos
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2">
              <IconCertificate className="h-4 w-4" />
              Certificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6 space-y-4">
            {loadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500"></div>
                  <p className="text-sm text-muted-foreground">
                    Cargando historial de cursos...
                  </p>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No hay cursos registrados
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${
                            course.status.toLowerCase() === "approved"
                              ? "bg-emerald-100 dark:bg-emerald-900/20"
                              : course.status.toLowerCase() === "in_progress"
                              ? "bg-blue-100 dark:bg-blue-900/20"
                              : course.status.toLowerCase() === "failed"
                              ? "bg-red-100 dark:bg-red-900/20"
                              : "bg-slate-100 dark:bg-slate-900/20"
                          }`}
                        >
                          {course.status.toLowerCase() === "approved"
                            ? "🟢"
                            : course.status.toLowerCase() === "in_progress"
                            ? "🔵"
                            : course.status.toLowerCase() === "failed"
                            ? "🔴"
                            : "⚪"}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {course.course_name}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>📅 Periodo: {course.period}</span>
                              <span>👨‍🏫 Instructor: {course.instructor}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {course.final_grade !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Calificación:
                                </span>
                                <span
                                  className={`text-lg font-bold ${getGradeColor(
                                    course.final_grade
                                  )}`}
                                >
                                  {course.final_grade}/20 ⭐
                                </span>
                              </div>
                            ) : (
                              course.status.toLowerCase() === "in_progress" && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Nota actual:
                                  </span>
                                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    En progreso
                                  </span>
                                </div>
                              )
                            )}
                            {course.status.toLowerCase() === "in_progress" && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Progreso:
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500"
                                      style={{
                                        width: `${course.attendance_percentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold">
                                    {course.attendance_percentage}%
                                  </span>
                                </div>
                              </div>
                            )}
                            <Badge variant="outline">
                              Créditos: {course.credits}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                course.attendance_percentage >= 90
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                  : course.attendance_percentage >= 70
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                              }
                            >
                              Asistencia: {course.attendance_percentage}%
                            </Badge>
                            {getCourseStatusBadge(course.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.certificate_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `/academico/certificados/${course.certificate_id}`,
                                "_blank"
                              )
                            }
                            title="Ver certificado"
                          >
                            <IconCertificate className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedCourse(
                              expandedCourse === course.id ? null : course.id
                            )
                          }
                        >
                          {expandedCourse === course.id ? (
                            <>
                              <IconChevronUp className="h-4 w-4 mr-1" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <IconChevronDown className="h-4 w-4 mr-1" />
                              Ver detalles
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedCourse === course.id && (
                      <div className="mt-4 pt-4 border-t bg-slate-50 dark:bg-slate-900/20 -mx-4 -mb-4 p-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {course.detailed_grades &&
                            course.detailed_grades.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <IconFileText className="h-4 w-4" />
                                  Calificaciones Detalladas
                                </h5>
                                <div className="space-y-2">
                                  {course.detailed_grades.map(
                                    (grade, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span className="text-muted-foreground">
                                          {grade.component} (Peso:{" "}
                                          {grade.weight}%)
                                        </span>
                                        <span className="font-semibold">
                                          {grade.grade}/20
                                        </span>
                                      </div>
                                    )
                                  )}
                                  {course.final_grade !== null && (
                                    <div className="mt-2 pt-2 border-t flex items-center justify-between font-semibold">
                                      <span>NOTA FINAL:</span>
                                      <span
                                        className={getGradeColor(
                                          course.final_grade
                                        )}
                                      >
                                        {course.final_grade}/20 ⭐
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              👥 Asistencia
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Clases totales:
                                </span>
                                <span className="font-semibold">
                                  {course.total_classes || 0}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Asistencias:
                                </span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {course.attended_classes || 0}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Faltas:
                                </span>
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                  {(course.total_classes || 0) -
                                    (course.attended_classes || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="text-muted-foreground">
                                  Porcentaje:
                                </span>
                                <span className="font-semibold">
                                  {course.attendance_percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                          {course.payment_amount && (
                            <div>
                              <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                💰 Información de Pago
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Monto:
                                  </span>
                                  <span className="font-semibold">
                                    $
                                    {Number(course.payment_amount ?? 0).toFixed(
                                      2
                                    )}
                                  </span>
                                </div>
                                {course.payment_date && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Fecha de pago:
                                    </span>
                                    <span className="font-semibold">
                                      {new Date(
                                        course.payment_date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Estado:
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={
                                      course.payment_status?.toLowerCase() ===
                                      "paid"
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                    }
                                  >
                                    {course.payment_status?.toLowerCase() ===
                                    "paid"
                                      ? "✅ Pagado"
                                      : "⏳ Pendiente"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            {loadingCertificates ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-violet-500"></div>
                  <p className="text-sm text-muted-foreground">
                    Cargando certificados...
                  </p>
                </div>
              </div>
            ) : certificates.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                  <IconCertificate className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-muted-foreground">
                  No hay certificados emitidos
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {certificates.map((cert) => (
                  <Card
                    key={cert.id}
                    className="border-2 border-violet-200 dark:border-violet-800"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/20 ring-4 ring-violet-50 dark:ring-violet-900/10">
                          <IconCertificate className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-semibold">
                              {cert.course_name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Código:{" "}
                              <span className="font-mono">{cert.uuid}</span>
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Badge
                              variant="outline"
                              className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20"
                            >
                              📅{" "}
                              {new Date(cert.issue_date).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            >
                              ⭐ {cert.final_grade}/20
                            </Badge>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => downloadCertificate(cert.id)}
                            >
                              <IconDownload className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => verifyCertificate(cert.uuid)}
                            >
                              <IconExternalLink className="mr-2 h-4 w-4" />
                              Verificar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function AcademicHistory() {
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof StudentRecord | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAcademicRecords();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, allStudents, sortColumn, sortDirection, statusFilter]);

  const loadAcademicRecords = async () => {
    try {
      setLoading(true);
      const apiUrl = `${config.apiUrl}${config.endpoints.academicHistory}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: AcademicData = await response.json();
      setStats(data.stats);
      setAllStudents(data.students);
      setFilteredStudents(data.students);
      setError(null);
    } catch (err) {
      console.error("Error al cargar registros académicos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof StudentRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setSortColumn(null);
    setSortDirection("desc");
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase().trim();

    let filtered = [...allStudents];

    if (lowerQuery) {
      filtered = filtered.filter((student) => {
        const fullname = (student.fullname || "").toLowerCase();
        const code = (student.code || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        return (
          fullname.includes(lowerQuery) ||
          code.includes(lowerQuery) ||
          email.includes(lowerQuery)
        );
      });
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((student) =>
        statusFilter.includes(student.academic_status.toLowerCase())
      );
    }

    if (sortColumn) {
      filtered.sort((a, b) => {
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
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const url = `${config.apiUrl}${config.endpoints.academicHistoryExportCsv}`;
    window.open(url, "_blank");
  };

  const exportPDF = () => {
    const url = config.endpoints.academicHistoryExportData;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("academicHistoryExportData", JSON.stringify(data));
        window.open(
          "/administrativo/gestion-academica/academic-history-export-pdf",
          "_blank"
        );
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  };

  const openStudentDetail = (student: StudentRecord) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusMap: Record<string, { text: string; className: string }> = {
      active: {
        text: "Activo",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      },
      inactive: {
        text: "Inactivo",
        className:
          "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
      },
      graduated: {
        text: "Graduado",
        className:
          "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
      },
      suspended: {
        text: "Suspendido",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      },
    };
    const statusInfo = statusMap[statusLower] || {
      text: status,
      className:
        "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    };
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.text}
      </Badge>
    );
  };

  const getCompletionBadge = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    let className = "bg-slate-500/10 text-slate-700 dark:text-slate-400";

    if (percentage >= 80)
      className = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    else if (percentage >= 50)
      className = "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    else if (percentage >= 20)
      className = "bg-amber-500/10 text-amber-700 dark:text-amber-400";

    return (
      <Badge variant="outline" className={className}>
        {completed}/{total}
      </Badge>
    );
  };

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageStudents = filteredStudents.slice(start, end);

  return (
    <AdministrativeLayout title="Historial Académico">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-100/90">
                Gestión Académica
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                Historial Académico
              </h1>
              <p className="mt-2 max-w-xl text-sm text-blue-100/80">
                Consulta y gestiona el expediente académico completo de cada
                estudiante
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando registros académicos...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <IconBook className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar los registros: {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifica que el backend esté corriendo en {config.apiUrl}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              {stats && <StatsCards stats={stats} />}

              {/* Main Table Card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Expedientes Estudiantiles</CardTitle>
                      <CardDescription>
                        Lista completa de estudiantes con resumen académico
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {filteredStudents.length} estudiantes
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[280px]">
                      <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre, código o DNI..."
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
                          {statusFilter.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                            >
                              {statusFilter.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Estado académico</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes("active")}
                          onCheckedChange={() => toggleStatusFilter("active")}
                        >
                          Activo
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes("inactive")}
                          onCheckedChange={() => toggleStatusFilter("inactive")}
                        >
                          Inactivo
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes("graduated")}
                          onCheckedChange={() =>
                            toggleStatusFilter("graduated")
                          }
                        >
                          Graduado
                        </DropdownMenuCheckboxItem>
                        {(statusFilter.length > 0 || sortColumn) && (
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
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No hay estudiantes que coincidan con la búsqueda
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={() => handleSort("code")}
                                >
                                  Código
                                  {sortColumn === "code" ? (
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
                                  className="h-8 gap-1 font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={() => handleSort("fullname")}
                                >
                                  Estudiante
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
                              <TableHead className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={() =>
                                    handleSort("completed_courses")
                                  }
                                >
                                  Cursos
                                  {sortColumn === "completed_courses" ? (
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
                              <TableHead className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={() => handleSort("average_grade")}
                                >
                                  Promedio
                                  {sortColumn === "average_grade" ? (
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
                              <TableHead className="text-center font-semibold text-blue-700 dark:text-blue-400">
                                Créditos
                              </TableHead>
                              <TableHead className="text-center font-semibold text-blue-700 dark:text-blue-400">
                                Certificados
                              </TableHead>
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={() => handleSort("academic_status")}
                                >
                                  Estado
                                  {sortColumn === "academic_status" ? (
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
                              <TableHead className="text-center font-semibold text-blue-700 dark:text-blue-400">
                                Acciones
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pageStudents.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-mono text-xs font-semibold">
                                  {student.code}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {student.avatar ? (
                                      <img
                                        src={student.avatar}
                                        alt={student.fullname}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                        <IconUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium">
                                        {student.fullname}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {student.email}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {getCompletionBadge(
                                    student.completed_courses,
                                    student.total_courses
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {student.average_grade.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    /20
                                  </span>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                  {student.earned_credits}/
                                  {student.total_credits}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant="outline"
                                    className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20"
                                  >
                                    <IconCertificate className="mr-1 h-3 w-3" />
                                    {student.certificates_count}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(student.academic_status)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openStudentDetail(student)}
                                      title="Ver expediente completo"
                                    >
                                      <IconEye className="h-4 w-4" />
                                    </Button>
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
                          Mostrando {start + 1}-
                          {Math.min(end, filteredStudents.length)} de{" "}
                          {filteredStudents.length}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={end >= filteredStudents.length}
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
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </AdministrativeLayout>
  );
}
