// /src/process/administrative/dashboard/DashboardExportPDF.tsx
import { useState, useEffect } from "react";
import { config } from "@/config/administrative-config";

interface DashboardExportData {
  courses: any[];
  students: any[];
  teachers: any[];
  enrollments: any[];
  payments: any[];
  payroll: any[];
  stats: any;
  monthlyData: any[];
  coursesDistribution: any[];
}

export default function DashboardExportPDF() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardExportData | null>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, data]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      let exportData: any;

      if ((window as any).dashboardExportData) {
        exportData = (window as any).dashboardExportData;
      } else {
        const apiUrl = `${config.apiUrl}${config.endpoints.export_pdf}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const json = await response.json();

        // Aquí está el truco importante:
        const raw = json.original ?? json;

        exportData = {
          ...raw,
          // mapear payrollExpenses → payroll 
          payroll: raw.payrollExpenses ?? [],
        } as DashboardExportData;
      }

      setData(exportData);
      setError(null);
    } catch (err) {
      console.error("Error al cargar reporte:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
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

  const getCurrentDateTime = () => {
    const now = new Date();
    return (
      now.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " - " +
      now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusBadge = (
    status: string,
    type: "payment" | "academic" = "payment"
  ) => {
    const statusMap: Record<string, string> = {
      // Estados de pago
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
      paid: "Pagado",
      partially_paid: "Pago Parcial",
      cancelled: "Cancelado",
      completed: "Completado",
      // Estados académicos
      active: "Activo",
      completed: "Completado",
      inactive: "Inactivo",
      dropped: "Abandonado",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (
    status: string,
    type: "payment" | "academic" = "payment"
  ) => {
    if (type === "payment") {
      switch (status) {
        case "approved":
        case "paid":
        case "completed":
          return "bg-green-100 text-green-800 border-green-300";
        case "pending":
        case "partially_paid":
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "rejected":
        case "cancelled":
          return "bg-red-100 text-red-800 border-red-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    } else {
      switch (status) {
        case "active":
          return "bg-blue-100 text-blue-800 border-blue-300";
        case "completed":
          return "bg-green-100 text-green-800 border-green-300";
        case "inactive":
          return "bg-gray-100 text-gray-800 border-gray-300";
        case "dropped":
          return "bg-red-100 text-red-800 border-red-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600">Generando reporte del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Error al generar el reporte</p>
          <p className="text-sm text-slate-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const {
    stats,
    courses,
    students,
    teachers,
    enrollments,
    payments,
    payroll,
    monthlyData,
    coursesDistribution,
  } = data;

  return (
    <div
      className="max-w-[1200px] mx-auto p-8 bg-white text-slate-900"
      style={{ fontSize: "10px" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-[3px] border-sky-500">
        <div className="flex-1">
          <h1 className="text-[32px] font-bold text-sky-700 mb-1 tracking-tight">
            INCADEV
          </h1>
          <div className="text-xs text-slate-600 uppercase tracking-widest">
            Instituto de Capacitación y Desarrollo
          </div>
        </div>
        <div className="text-right flex-1">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Reporte del Dashboard
          </h2>
          <div className="text-xs text-slate-600">
            <div>
              <strong className="text-slate-700">Fecha:</strong>{" "}
              {getCurrentDateTime()}
            </div>
            <div>
              <strong className="text-slate-700">Período:</strong> Resumen
              General
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-2 font-semibold">
            Estudiantes Activos
          </div>
          <div className="text-2xl font-bold text-sky-800">
            {stats?.activeStudents || 0}
          </div>
          <div className="text-[9px] text-slate-600 mt-1">
            de {stats?.totalStudents || 0} totales
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-2 font-semibold">
            Cursos Activos
          </div>
          <div className="text-2xl font-bold text-purple-800">
            {stats?.activeCourses || 0}
          </div>
          <div className="text-[9px] text-slate-600 mt-1">
            {stats?.totalEnrollments || 0} matrículas
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-2 font-semibold">
            Ingresos del Mes
          </div>
          <div className="text-2xl font-bold text-green-800">
            {formatCurrency(stats?.totalRevenue || 0)}
          </div>
          <div className="text-[9px] text-slate-600 mt-1">
            {stats?.paidEnrollments || 0} pagos completados
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-2 font-semibold">
            Balance Neto
          </div>
          <div className="text-2xl font-bold text-orange-800">
            {formatCurrency(stats?.netIncome || 0)}
          </div>
          <div className="text-[9px] text-slate-600 mt-1">
            Ingresos - Nómina
          </div>
        </div>
      </div>

      {/* Cursos Disponibles */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
          Cursos Disponibles
        </h3>
        <table className="w-full border-collapse shadow-sm mb-4">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Curso
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Versión
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Precio
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Matrículas
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {courses?.slice(0, 10).map((course, index) => (
              <tr
                key={course.id}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="p-2 border-b border-slate-200 font-medium">
                  {course.name}
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span className="inline-block px-2 py-1 rounded-full text-[9px] font-medium bg-purple-100 text-purple-800">
                    {course.version}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200 font-semibold text-green-700">
                  {formatCurrency(course.price)}
                </td>
                <td className="p-2 border-b border-slate-200">
                  {course.enrollments} estudiantes
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wide ${
                      course.status === "published" ||
                      course.status === "active"
                        ? "bg-green-100 text-green-800"
                        : course.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {course.status === "published"
                      ? "Publicado"
                      : course.status === "draft"
                      ? "Borrador"
                      : "Archivado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estudiantes y Profesores */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Estudiantes Recientes */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Estudiantes Recientes
          </h3>
          <div className="space-y-2">
            {students?.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex justify-between items-center p-3 rounded-lg border border-slate-200"
              >
                <div>
                  <div className="font-medium text-sm">{student.name}</div>
                  <div className="text-[9px] text-slate-600">
                    {student.email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {student.courses} curso{student.courses !== 1 ? "s" : ""}
                  </div>
                  <div
                    className={`text-[9px] ${
                      student.status === "active"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {student.status === "active" ? "Activo" : "Inactivo"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipo Docente */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Equipo Docente
          </h3>
          <div className="space-y-2">
            {teachers?.slice(0, 5).map((teacher) => (
              <div
                key={teacher.id}
                className="flex justify-between items-center p-3 rounded-lg border border-slate-200"
              >
                <div>
                  <div className="font-medium text-sm">{teacher.name}</div>
                  <div className="text-[9px] text-slate-600">
                    {teacher.speciality}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {teacher.courses} cursos
                  </div>
                  <div className="text-[9px] text-slate-600">
                    {teacher.students} estudiantes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagos y Nómina */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Pagos de Estudiantes */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Pagos Recientes
          </h3>
          <div className="space-y-2">
            {payments?.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 rounded-lg border border-slate-200"
              >
                <div>
                  <div className="font-medium text-sm">{payment.student}</div>
                  <div className="text-[9px] text-slate-600">
                    {formatDate(payment.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-700">
                    {formatCurrency(payment.amount)}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${getStatusColor(
                      payment.status,
                      "payment"
                    )}`}
                  >
                    {getStatusBadge(payment.status, "payment")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nómina del Personal */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Nómina del Mes
          </h3>
          <div className="space-y-2">
            {payroll?.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between items-center p-3 rounded-lg border border-slate-200"
              >
                <div>
                  <div className="font-medium text-sm">{expense.teacher}</div>
                  <div className="text-[9px] text-slate-600">
                    {formatDate(expense.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-700">
                    {formatCurrency(expense.amount)}
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-800">
                    {expense.type === "monthly" ? "Mensual" : "Por Hora"}
                  </span>
                </div>
              </div>
            ))}
            {stats?.totalPayroll && (
              <div className="pt-3 mt-3 border-t border-slate-200">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Nómina:</span>
                  <span className="text-red-700">
                    {formatCurrency(stats.totalPayroll)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estado de Matrículas */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
          Estado de Matrículas
        </h3>
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Estudiante
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Curso
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Monto
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Estado Pago
              </th>
              <th className="text-[10px] uppercase tracking-wider font-semibold p-3 text-left border-b-2 border-sky-500">
                Estado Académico
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments?.slice(0, 8).map((enrollment, index) => (
              <tr
                key={enrollment.id}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="p-2 border-b border-slate-200 font-medium">
                  {enrollment.student}
                </td>
                <td className="p-2 border-b border-slate-200">
                  {enrollment.course}
                </td>
                <td className="p-2 border-b border-slate-200 font-semibold text-green-700">
                  {formatCurrency(enrollment.amount)}
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${getStatusColor(
                      enrollment.payment_status,
                      "payment"
                    )}`}
                  >
                    {getStatusBadge(enrollment.payment_status, "payment")}
                  </span>
                </td>
                <td className="p-2 border-b border-slate-200">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${getStatusColor(
                      enrollment.academic_status,
                      "academic"
                    )}`}
                  >
                    {getStatusBadge(enrollment.academic_status, "academic")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-slate-200 text-center text-[10px] text-slate-500">
        <strong className="text-slate-700">INCADEV</strong> - Instituto de
        Capacitación y Desarrollo | Reporte generado automáticamente | Para
        consultas contactar a administración
      </div>
    </div>
  );
}
