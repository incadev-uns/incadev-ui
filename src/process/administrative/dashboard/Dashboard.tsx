import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";
import KpiCard from "@/process/administrative/dashboard/components/kpi-card";
import ChartCourseResponsive from "@/process/administrative/dashboard/components/chart-course";
import TableCourse from "@/process/administrative/dashboard/components/table-course";
import ChartTransactions from "@/process/administrative/dashboard/components/chart-transactions";
import NewStudents from "@/process/administrative/dashboard/components/new-students";
import TeamTeacher from "@/process/administrative/dashboard/components/team-teacher";
import PaysStudents from "@/process/administrative/dashboard/components/pays-students";
import PersonalWallet from "@/process/administrative/dashboard/components/personal-wallet";
import StateEnrollment from "@/process/administrative/dashboard/components/state-enrollment";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  UserCheck,
  ClipboardList,
  Award,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { config } from "@/config/administrative-config";
import { mockData } from "@/process/administrative/dashboard/mockData";


// Datos de ejemplo para el dashboard

interface Course {
  id: number;
  name: string;
  version: string;
  price: number;
  status: "draft" | "published" | "archived";
  enrollments: number;
}

interface Enrollment {
  id: number;
  student: string;
  course: string;
  payment_status:
    | "pending"
    | "paid"
    | "partially_paid"
    | "refunded"
    | "cancelled"
    | "overdue";
  academic_status: "pending" | "active" | "completed" | "failed" | "dropped";
  amount: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  courses: number;
  status: "active" | "inactive";
}

interface Teacher {
  id: number;
  name: string;
  speciality: string;
  courses: number;
  students: number;
}

interface Payment {
  id: number;
  student: string;
  course?: string;
  amount: number;
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface PayrollExpense {
  id: number;
  teacher: string;
  amount: number;
  date: string;
  type: string;
}

interface DashboardData {
  courses: Course[];
  enrollments: Enrollment[];
  students: Student[];
  teachers: Teacher[];
  payrollExpenses: PayrollExpense[];
  payments: Payment[];
  monthlyData: any[];
  coursesDistribution: any[];
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
    activeCourses: number;
    totalEnrollments: number;
    paidEnrollments: number;
    pendingPayments: number;
    totalRevenue: number;
    totalPayroll: number;
    netIncome: number;
  };
}

const COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function DashboardPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [stats, setStats] = useState<any>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<any>(null);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);

  // Cargar datos reales del dashboard
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const apiUrl = `${config.apiUrl}${config.endpoints.dashboard}`;
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

      const data: DashboardData = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      // Usar datos mock como fallback
      setDashboardData(mockData as DashboardData);
    } finally {
      setLoading(false);
    }
  };

  const data = dashboardData || mockData;

  // Cálculos de estadísticas usando los datos reales
  const totalStudents = data.stats?.totalStudents || data.students.length;
  const activeStudents =
    data.stats?.activeStudents ||
    data.students.filter((s) => s.status === "active").length;
  const totalTeachers = data.stats?.totalTeachers || data.teachers.length;
  const activeCourses =
    data.stats?.activeCourses ||
    data.courses.filter((c) => c.status === "published").length;

  const totalEnrollments =
    data.stats?.totalEnrollments || data.enrollments.length;
  const paidEnrollments =
    data.stats?.paidEnrollments ||
    data.enrollments.filter((e) => e.payment_status === "paid").length;
  const pendingPayments =
    data.stats?.pendingPayments ||
    data.enrollments.filter(
      (e) =>
        e.payment_status === "pending" || e.payment_status === "partially_paid"
    ).length;

  const totalRevenue =
    data.stats?.totalRevenue ||
    data.payments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0);

  const totalPayroll =
    data.stats?.totalPayroll ||
    data.payrollExpenses.reduce((sum, p) => sum + p.amount, 0);
  const netIncome = data.stats?.netIncome || totalRevenue - totalPayroll;

  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      // Usar datos reales si están disponibles
      const exportData = dashboardData || {
        courses: mockData.courses,
        students: mockData.students,
        teachers: mockData.teachers,
        enrollments: mockData.enrollments,
        payments: mockData.payments,
        payroll: mockData.payrollExpenses,
        stats: {
          totalStudents,
          activeStudents,
          totalTeachers,
          activeCourses,
          totalRevenue,
          totalPayroll,
          netIncome,
        },
        monthlyData: mockData.monthlyData,
        coursesDistribution: mockData.coursesDistribution,
      };

      // Guardar datos en localStorage para el componente PDF
      localStorage.setItem("dashboardExportData", JSON.stringify(exportData));

      // Abrir ventana para PDF - usar la ruta correcta de Astro
      const printWindow = window.open("/administrativo/dashboard-pdf", "_blank");

      if (printWindow) {
        // En Astro, esperar a que la página cargue completamente
        const checkLoad = setInterval(() => {
          if (printWindow.document.readyState === "complete") {
            clearInterval(checkLoad);
            setTimeout(() => {
              printWindow.print();
              setIsExporting(false);
            }, 1000);
          }
        }, 100);
      } else {
        throw new Error(
          "No se pudo abrir la ventana de impresión. Por favor, permite ventanas emergentes."
        );
      }
    } catch (err) {
      console.error("Error al exportar:", err);
      setIsExporting(false);
      alert("Error al generar el PDF. Por favor, intenta nuevamente.");
    }
  };

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdministrativeLayout title="Panel Principal | Dashboard">
      <div className="w-full space-y-6 p-6 bg-background">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel de control y métricas del instituto
            </p>
          </div>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Generando PDF..." : "Exportar PDF"}
          </Button>
        </div>
        {/* // Después del header, agrega: */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Cargando dashboard...</p>
            </div>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar datos: {error}. Mostrando datos de ejemplo.
            </AlertDescription>
          </Alert>
        )}

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Estudiantes Activos"
            value={activeStudents}
            subtitle={`de ${totalStudents} estudiantes totales`}
            icon={Users}
            iconColor="text-sky-500"
          />

          <KpiCard
            title="Cursos Activos"
            value={activeCourses}
            subtitle={`${totalEnrollments} matrículas totales`}
            icon={BookOpen}
            iconColor="text-purple-500"
          />

          <KpiCard
            title="Ingresos del Mes"
            value={formatCurrency(totalRevenue)}
            subtitle={`${paidEnrollments} pagos completados`}
            icon={DollarSign}
            iconColor="text-green-500"
          />

          <KpiCard
            title="Balance Neto"
            value={formatCurrency(netIncome)}
            subtitle="Ingresos - Nómina"
            icon={TrendingUp}
            iconColor="text-orange-500"
          />
        </div>

        {/* Alertas de Pagos Pendientes */}
        {pendingPayments > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tienes {pendingPayments} pagos pendientes de verificación o
              completar.
            </AlertDescription>
          </Alert>
        )}
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartTransactions
            data={data.monthlyData}
            title="Análisis Financiero Mensual"
            description="Comparativa de ingresos vs egresos"
            height={350}
            colors={{
              ingresos: "#10b981",
              egresos: "#ef4444",
              estudiantes: "#8b5cf6",
            }}
            strokeWidths={{
              ingresos: 3,
              egresos: 2,
              estudiantes: 2,
            }}
          />

          <ChartCourseResponsive
            data={data.coursesDistribution}
            title="Distribución de Estudiantes"
            description="Por área de especialización"
            colors={["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"]}
            truncateLegendNames={true}
            maxLegendNameLength={30}
            showLabel={false}
            showLegend={true}
          />
        </div>
        {/* Cursos Nuevos */}
        <TableCourse
          data={data.courses}
          title="Catálogo de Cursos"
          description="Todos los cursos disponibles en el instituto"
          formatCurrency={(amount) => `USD $${amount.toLocaleString()}`}
          showIcon={false}
          stripedRows={true}
        />

        {/* Estudiantes y Profesores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NewStudents
            data={data.students}
            title="Nuevos Estudiantes"
            description="Registrados este mes"
            maxItems={8}
            showIcon={false}
            avatarColor="bg-purple-100 dark:bg-purple-900/30"
            avatarIconColor="text-purple-600 dark:text-purple-400"
          />

          <TeamTeacher
            data={data.teachers}
            title="Nuestro Equipo Docente"
            description="Profesores especializados por área"
            maxItems={8}
            avatarColor="bg-blue-100 dark:bg-blue-900/30"
            avatarIconColor="text-blue-600 dark:text-blue-400"
          />
        </div>
        {/* Pagos y Nómina */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaysStudents
            data={data.payments}
            title="Pagos de Estudiantes"
            description="Últimas transacciones registradas"
            maxHeight="400px"
            maxItems={8}
            showCourse={true}
          />

          <PersonalWallet
            data={data.payrollExpenses}
            totalAmount={totalPayroll}
            title="Gastos de Nómina"
            description="Pagos a profesores y personal"
            maxHeight="500px"
            maxItems={15}
          />
        </div>
        {/* Matrículas */}
        <StateEnrollment
          data={data.enrollments}
          itemsPerPage={5}
          maxHeight="600px"
        />
      </div>
    </AdministrativeLayout>
  );
}
