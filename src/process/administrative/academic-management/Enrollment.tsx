import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  IconCheck,
  IconEye,
  IconAlertCircle,
  IconCash,
  IconCalendar,
  IconUser,
  IconChevronDown,
  IconChevronUp,
  IconMail,
  IconPhone,
  IconCircleCheck,
  IconHourglass,
  IconUsers,
  IconCurrencyDollar,
  IconFileTypePdf,
  IconEdit,
  IconBook,
  IconExternalLink,
  IconFileTypeCsv,
} from "@tabler/icons-react";

// Interfaces adaptadas a la BD real
interface EnrollmentRecord {
  id: number;
  group_id: number;
  user_id: number;
  payment_status: "pending" | "paid" | "partial" | "overdue";
  academic_status: "pending" | "active" | "inactive" | "completed" | "failed";
  created_at: string;
  updated_at: string;

  // Datos relacionados del estudiante
  student: {
    id: number;
    name: string;
    dni: string | null;
    fullname: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
  };

  // Datos relacionados del grupo y curso
  group: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    course_version: {
      id: number;
      version: string | null;
      name: string;
      price: number;
      course: {
        id: number;
        name: string;
        description: string | null;
      };
    };
  };

  // Último pago registrado
  last_payment?: {
    id: number;
    amount: number;
    operation_number: string;
    operation_date: string;
    status: "pending" | "approved" | "rejected";
  };
}

interface Stats {
  total_enrollments: number;
  pending_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  pending_payments: number;
  total_revenue: number;
  pending_revenue: number;
  completion_rate: number;
}

interface EnrollmentData {
  enrollments: EnrollmentRecord[];
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
                Total Matrículas
              </p>
              <p className="text-3xl font-bold">{stats.total_enrollments}</p>
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
                Matrículas Activas
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.active_enrollments}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.pending_enrollments} pendientes aprobación
              </p>
            </div>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <IconCircleCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              {stats.pending_enrollments > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 animate-pulse"></div>
              )}
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
                {stats.pending_payments}
              </p>
              <p className="text-xs text-muted-foreground">
                ${stats.pending_revenue.toFixed(2)} por cobrar
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <IconHourglass className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ingresos Totales
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                $
                {stats.total_revenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Tasa completación: {stats.completion_rate}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 ml-4">
              <IconCurrencyDollar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enrollment Detail Modal Component
function EnrollmentDetailModal({
  enrollment,
  isOpen,
  onClose,
  onUpdateStatus,
}: {
  enrollment: EnrollmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    id: number,
    status: string,
    type: "payment" | "academic"
  ) => Promise<void>;
}) {
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!enrollment) return null;

  const handleStatusUpdate = async (
    status: string,
    type: "payment" | "academic"
  ) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(enrollment.id, status, type);
      // Cerrar el modal después de actualizar exitosamente
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      paid: {
        text: "✅ Pagado",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      },
      pending: {
        text: "⏳ Pendiente",
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      },
      partial: {
        text: "🔸 Parcial",
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      },
      overdue: {
        text: "❌ Vencido",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      },
    };
    const info = statusMap[status] || statusMap.pending;
    return (
      <Badge variant="outline" className={info.className}>
        {info.text}
      </Badge>
    );
  };

  const getAcademicStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: {
        text: "⏳ Pendiente",
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      },
      active: {
        text: "✅ Activo",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      },
      inactive: {
        text: "⭕ Inactivo",
        className:
          "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
      },
      completed: {
        text: "🎓 Completado",
        className:
          "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
      },
      failed: {
        text: "❌ Reprobado",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      },
    };
    const info = statusMap[status] || statusMap.pending;
    return (
      <Badge variant="outline" className={info.className}>
        {info.text}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalle de Matrícula</DialogTitle>
          <DialogDescription>
            Información completa de la matrícula y gestión del estudiante
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              className={`border-2 ${
                enrollment.payment_status === "paid"
                  ? "border-emerald-200 dark:border-emerald-800"
                  : enrollment.payment_status === "overdue"
                  ? "border-red-200 dark:border-red-800"
                  : "border-amber-200 dark:border-amber-800"
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Estado de Pago
                  </p>
                  <div className="flex items-center justify-between">
                    {getPaymentStatusBadge(enrollment.payment_status)}
                    {enrollment.payment_status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate("paid", "payment")}
                      >
                        <IconCheck className="h-4 w-4 mr-1" />
                        Marcar como Pagado
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-2 ${
                enrollment.academic_status === "active"
                  ? "border-emerald-200 dark:border-emerald-800"
                  : enrollment.academic_status === "inactive"
                  ? "border-red-200 dark:border-red-800"
                  : "border-amber-200 dark:border-amber-800"
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Estado Académico
                  </p>
                  <div className="flex items-center justify-between">
                    {getAcademicStatusBadge(enrollment.academic_status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                        >
                          <IconEdit className="h-4 w-4 mr-1" />
                          Cambiar Estado
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate("active", "academic")
                          }
                        >
                          Activar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate("pending", "academic")
                          }
                        >
                          Pendiente
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate("completed", "academic")
                          }
                        >
                          Marcar Completado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student & Course Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconUser className="h-4 w-4" />
                  Información del Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Usuario:</span>
                  <span className="font-mono font-semibold">
                    #{enrollment.student.id}
                  </span>
                </div>
                {enrollment.student.dni && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DNI:</span>
                    <span className="font-mono">{enrollment.student.dni}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs">
                    Nombre Completo:
                  </span>
                  <p className="font-medium">
                    {enrollment.student.fullname || enrollment.student.name}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <a
                    href={`mailto:${enrollment.student.email}`}
                    className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                  >
                    <IconMail className="h-3 w-3" />
                    {enrollment.student.email}
                  </a>
                </div>
                {enrollment.student.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Teléfono:</span>
                    <a
                      href={`tel:${enrollment.student.phone}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <IconPhone className="h-3 w-3" />
                      {enrollment.student.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconBook className="h-4 w-4" />
                  Información del Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Curso</p>
                  <p className="font-medium">
                    {enrollment.group.course_version.course.name}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versión:</span>
                  <span className="font-mono">
                    {enrollment.group.course_version.version || "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Grupo</p>
                  <p className="font-medium">{enrollment.group.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <p className="text-muted-foreground text-xs">Inicio</p>
                    <p className="font-medium">
                      {new Date(enrollment.group.start_date).toLocaleDateString(
                        "es-ES"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Fin</p>
                    <p className="font-medium">
                      {new Date(enrollment.group.end_date).toLocaleDateString(
                        "es-ES"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Information */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconCash className="h-4 w-4" />
                  Información de Pago
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Monto del Curso
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${enrollment.group.course_version.price.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Fecha de Matrícula
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-blue-600" />
                    {new Date(enrollment.created_at).toLocaleDateString(
                      "es-ES"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  {getPaymentStatusBadge(enrollment.payment_status)}
                </div>
              </div>

              {enrollment.last_payment && (
                <>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold mb-2">
                      Último Pago Registrado
                    </p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          N° Operación
                        </p>
                        <p className="font-mono font-semibold">
                          {enrollment.last_payment.operation_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Monto</p>
                        <p className="font-bold text-emerald-600">
                          ${enrollment.last_payment.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha</p>
                        <p className="text-sm">
                          {new Date(
                            enrollment.last_payment.operation_date
                          ).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Estado</p>
                        <Badge
                          variant="outline"
                          className={
                            enrollment.last_payment.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : enrollment.last_payment.status === "rejected"
                              ? "bg-red-500/10 text-red-700 dark:text-red-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          }
                        >
                          {enrollment.last_payment.status === "approved"
                            ? "✅ Aprobado"
                            : enrollment.last_payment.status === "rejected"
                            ? "❌ Rechazado"
                            : "⏳ Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {showPaymentHistory && (
                    <div className="pt-3 border-t">
                      <div className="rounded-lg border bg-slate-50 dark:bg-slate-900/20 p-4">
                        <div className="text-center space-y-2">
                          <IconFileTypePdf className="h-12 w-12 mx-auto text-red-500" />
                          <p className="text-sm font-medium">
                            Comprobante de Pago
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `${config.apiUrl}/payments/${enrollment.last_payment?.id}`,
                                "_blank"
                              )
                            }
                          >
                            <IconExternalLink className="h-4 w-4 mr-1" />
                            Ver Comprobante
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!enrollment.last_payment && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    No hay pagos registrados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconAlertCircle className="h-4 w-4" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de Matrícula:</span>
                <span className="font-mono font-semibold">
                  #{enrollment.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de Grupo:</span>
                <span className="font-mono">#{enrollment.group_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Fecha de Registro:
                </span>
                <span>
                  {new Date(enrollment.created_at).toLocaleString("es-ES")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Última Actualización:
                </span>
                <span>
                  {new Date(enrollment.updated_at).toLocaleString("es-ES")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function EnrollmentManagement() {
  const [allEnrollments, setAllEnrollments] = useState<EnrollmentRecord[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<
    EnrollmentRecord[]
  >([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<EnrollmentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEnrollments();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, allEnrollments, activeTab]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const apiUrl = `${config.apiUrl}${config.endpoints.enrollments}`;
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

      const data: EnrollmentData = await response.json();
      setStats(data.stats);
      setAllEnrollments(data.enrollments);
      setFilteredEnrollments(data.enrollments);
      setError(null);
    } catch (err) {
      console.error("Error al cargar matrículas:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase().trim();
    let filtered = [...allEnrollments];

    // Filter by tab
    if (activeTab !== "all") {
      if (activeTab === "pending") {
        filtered = filtered.filter(
          (e) =>
            e.academic_status === "pending" || e.payment_status === "pending"
        );
      } else if (activeTab === "active") {
        filtered = filtered.filter((e) => e.academic_status === "active");
      } else if (activeTab === "completed") {
        filtered = filtered.filter((e) => e.academic_status === "completed");
      } else if (activeTab === "payment_issues") {
        filtered = filtered.filter(
          (e) =>
            e.payment_status === "overdue" || e.payment_status === "pending"
        );
      }
    }

    // Filter by search
    if (lowerQuery) {
      filtered = filtered.filter((enrollment) => {
        const studentName = (
          enrollment.student.fullname ||
          enrollment.student.name ||
          ""
        ).toLowerCase();
        const studentEmail = (enrollment.student.email || "").toLowerCase();
        const studentDni = (enrollment.student.dni || "").toLowerCase();
        const courseName = (
          enrollment.group.course_version.course.name || ""
        ).toLowerCase();
        const groupName = (enrollment.group.name || "").toLowerCase();

        return (
          studentName.includes(lowerQuery) ||
          studentEmail.includes(lowerQuery) ||
          studentDni.includes(lowerQuery) ||
          courseName.includes(lowerQuery) ||
          groupName.includes(lowerQuery)
        );
      });
    }

    setFilteredEnrollments(filtered);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (
    id: number,
    status: string,
    type: "payment" | "academic"
  ) => {
    try {
      const endpoint =
        type === "payment"
          ? `${config.apiUrl}${config.endpoints.enrollments}/${id}/payment-status`
          : `${config.apiUrl}${config.endpoints.enrollments}/${id}/academic-status`;

      const body =
        type === "payment"
          ? { payment_status: status }
          : { academic_status: status };

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      // Recargar datos después de actualizar
      await loadEnrollments();

      // NO actualizar selectedEnrollment aquí, el modal se cerrará automáticamente
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("Error al actualizar el estado. Por favor, intenta nuevamente.");
      // Si hay error, re-lanzarlo para que el modal no se cierre
      throw err;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
  };

  const openEnrollmentDetail = (enrollment: EnrollmentRecord) => {
    setSelectedEnrollment(enrollment);
    setIsModalOpen(true);
  };

  /**
   * Exportar matrículas a CSV
   */
  const exportCSV = async () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.enrollments}/export-csv`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error al exportar CSV:", err);
      alert("Error al exportar el reporte CSV");
    }
  };

  /**
   * Exportar matrículas a PDF
   */
  const exportPDF = async () => {
    try {
      // Primero obtenemos los datos
      const url = `${config.apiUrl}${config.endpoints.enrollments}/export-data`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener datos para exportación");
      }

      const data = await response.json();

      // Guardamos los datos en localStorage para que la página de PDF los use
      localStorage.setItem("enrollmentsExportData", JSON.stringify(data));

      // Abrimos la página de exportación PDF
      window.open("/administrativo/gestion-academica/enrollment-export-pdf", "_blank");
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert("Error al exportar el reporte PDF");
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      paid: {
        text: "✅ Pagado",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      },
      pending: {
        text: "⏳ Pendiente",
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      },
      partial: {
        text: "🔸 Parcial",
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      },
      overdue: {
        text: "❌ Vencido",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      },
    };
    const info = statusMap[status] || statusMap.pending;
    return (
      <Badge variant="outline" className={info.className}>
        {info.text}
      </Badge>
    );
  };

  const getAcademicStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: {
        text: "⏳ Pendiente",
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      },
      active: {
        text: "✅ Activo",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      },
      inactive: {
        text: "⭕ Inactivo",
        className:
          "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
      },
      completed: {
        text: "🎓 Completado",
        className:
          "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
      },
      failed: {
        text: "❌ Reprobado",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      },
    };
    const info = statusMap[status] || statusMap.pending;
    return (
      <Badge variant="outline" className={info.className}>
        {info.text}
      </Badge>
    );
  };

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageEnrollments = filteredEnrollments.slice(start, end);

  return (
    <AdministrativeLayout title="Estudiantes">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-blue-500 to-blue-700 px-6 py-7 shadow-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-100/90">
                ÁREA ADMINISTRATIVA
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                Gestión de Matrículas
              </h1>
              <p className="mt-2 max-w-xl text-sm text-blue-100/80">
                Administración completa del ciclo de matrículas y seguimiento
                académico
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando matrículas...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <IconAlertCircle className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Error al cargar las matrículas: {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifica que el backend esté corriendo en {config.apiUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={loadEnrollments}
                >
                  Reintentar
                </Button>
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
                      <CardTitle>Registro de Matrículas</CardTitle>
                      <CardDescription>
                        Gestiona las matrículas, pagos y estados académicos de
                        los estudiantes
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {filteredEnrollments.length} matrículas
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <IconDownload className="mr-2 h-4 w-4" />
                            Exportar Reporte
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={exportCSV}>
                            <IconFileTypeCsv className="mr-2 h-4 w-4" />
                            Exportar CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportPDF}>
                            <IconFileTypePdf className="mr-2 h-4 w-4" />
                            Exportar PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all" className="gap-2">
                        Todas
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="gap-2">
                        <IconHourglass className="h-4 w-4" />
                        Pendientes
                        {stats && stats.pending_enrollments > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-amber-500 text-white"
                          >
                            {stats.pending_enrollments}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="active" className="gap-2">
                        <IconCircleCheck className="h-4 w-4" />
                        Activas
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="gap-2">
                        🎓 Completadas
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[280px]">
                      <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre, código, DNI o curso..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {(searchQuery || activeTab !== "all") && (
                      <Button variant="outline" onClick={clearFilters}>
                        Limpiar filtros
                      </Button>
                    )}
                  </div>

                  {filteredEnrollments.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <IconUsers className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-muted-foreground">
                        No hay matrículas que coincidan con los filtros
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                              <TableHead className="font-semibold text-blue-700 dark:text-blue-400">
                                Estudiante
                              </TableHead>
                              <TableHead className="font-semibold text-blue-700 dark:text-blue-400">
                                Curso / Grupo
                              </TableHead>
                              <TableHead className="font-semibold text-blue-700 dark:text-blue-400">
                                Fecha Matrícula
                              </TableHead>
                              <TableHead className="text-right font-semibold text-blue-700 dark:text-blue-400">
                                Monto
                              </TableHead>
                              <TableHead className="text-center font-semibold text-blue-700 dark:text-blue-400">
                                Estado Pago
                              </TableHead>
                              <TableHead className="text-center font-semibold text-blue-700 dark:text-blue-400">
                                Estado Académico
                              </TableHead>
                              <TableHead className="text-center font-semibold text-blue-700 dark:text-blue-400">
                                Acciones
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pageEnrollments.map((enrollment) => (
                              <TableRow
                                key={enrollment.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {enrollment.student.avatar ? (
                                      <img
                                        src={enrollment.student.avatar}
                                        alt={enrollment.student.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                        <IconUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium">
                                        {enrollment.student.fullname ||
                                          enrollment.student.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        ID: {enrollment.student.id}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {
                                        enrollment.group.course_version.course
                                          .name
                                      }
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {enrollment.group.name}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(
                                    enrollment.created_at
                                  ).toLocaleDateString("es-ES")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="font-bold text-blue-600 dark:text-blue-400">
                                    $
                                    {enrollment.group.course_version.price.toFixed(
                                      2
                                    )}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {getPaymentStatusBadge(
                                    enrollment.payment_status
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getAcademicStatusBadge(
                                    enrollment.academic_status
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        openEnrollmentDetail(enrollment)
                                      }
                                      title="Ver detalles completos"
                                    >
                                      <IconEye className="h-4 w-4" />
                                    </Button>
                                    {enrollment.academic_status ===
                                      "pending" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                        onClick={() =>
                                          handleUpdateStatus(
                                            enrollment.id,
                                            "active",
                                            "academic"
                                          )
                                        }
                                        title="Activar matrícula"
                                      >
                                        <IconCheck className="h-4 w-4" />
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
                          Mostrando {start + 1}-
                          {Math.min(end, filteredEnrollments.length)} de{" "}
                          {filteredEnrollments.length}
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
                            disabled={end >= filteredEnrollments.length}
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

        {/* Enrollment Detail Modal */}
        <EnrollmentDetailModal
          enrollment={selectedEnrollment}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEnrollment(null);
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </AdministrativeLayout>
  );
}
