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
  Download,
  AlertCircle,
  DollarSign,
  Users,
  Wallet,
  Percent,
  Filter,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { config } from "@/config/administrative-config";

import AdministrativeLayout from "@/process/administrative/AdministrativeLayout";

const FinancialReportsView = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportType, setReportType] = useState("revenue");
  const [filters, setFilters] = useState({ timeRange: "month" });

  const [pdfSections, setPdfSections] = useState({
    summary: true,
    incomeStatement: true,
    chart: true,
    payrollTable: true,
  });

  const handleCheckbox = (key: string) =>
    setPdfSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = `${config.apiUrl}${config.endpoints.financialReports}?time_range=${filters.timeRange}&report_type=${reportType}`;

      const res = await fetch(url);
      const json = await res.json();
      const data = json?.data ?? null;

      if (!data) return setReportData(null);

      setReportData({
        summary: data.summary ?? {},
        monthly_data: data.monthly_data ?? [],
        details: data.details ?? [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.timeRange, reportType]);

  const exportPDF = () => {
    localStorage.setItem(
      "financialExportSections",
      JSON.stringify(pdfSections)
    );
    localStorage.setItem("financialExportData", JSON.stringify(reportData));
    localStorage.setItem("financialExportFilters", JSON.stringify(filters));
    localStorage.setItem("financialExportType", reportType);
    window.open(`/administrativo/finanzas/reportpdf`, "_blank");
  };

  // const hasData = !!reportData?.summary;
  const hasData = Number(reportData?.summary?.total_revenue ?? 0) > 0
             || Number(reportData?.summary?.total_payroll_expenses ?? 0) > 0;


  return (
    <AdministrativeLayout title="Finanzas | Reportes Financieros">
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Cabecera Hero - SIN CAMBIOS */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-sky-100/90">
              Módulo Financiero
            </p>

            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              {reportType === "revenue" && "Ingresos por Matrículas"}
              {reportType === "payroll" && "Nómina y Costos"}
              {reportType === "profitability" && "Rentabilidad"}
            </h1>

            <p className="mt-2 max-w-xl text-sm text-sky-100/80">
              {reportType === "revenue" &&
                "Seguimiento financiero de matrículas y cobros"}
              {reportType === "payroll" &&
                "Gastos operativos del personal del período"}
              {reportType === "profitability" &&
                "Balance neto y margen de utilidad institucional"}
            </p>
          </div>

          {/* Panel de Control - Reorganizado */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Configuración de Reporte */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-sky-600" />
                  <div>
                    <CardTitle className="text-lg">
                      Configuración del Reporte
                    </CardTitle>
                    <CardDescription>
                      Define el tipo y período de análisis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Tipo de Reporte */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tipo de Reporte
                    </label>
                    <select
                      className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background hover:border-sky-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="revenue">
                        📊 Ingresos por Matrículas
                      </option>
                      <option value="payroll">👥 Nómina y Costos</option>
                      <option value="profitability">💰 Rentabilidad</option>
                      <option value="financial">📘 Reporte Financiero General</option>
                    </select>
                  </div>

                  {/* Período */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Período de Análisis
                    </label>
                    <select
                      className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background hover:border-sky-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors"
                      value={filters.timeRange}
                      onChange={(e) =>
                        setFilters({ ...filters, timeRange: e.target.value })
                      }
                    >
                      <option value="month">📅 Mes actual</option>
                      <option value="last_month">📅 Mes anterior</option>
                      <option value="quarter">📆 Trimestre actual</option>
                      <option value="last_quarter">
                        📆 Trimestre anterior
                      </option>
                      <option value="year">📊 Año actual</option>
                      <option value="last_year">📊 Año anterior</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opciones de Exportación */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <div>
                    <CardTitle className="text-lg">Exportar PDF</CardTitle>
                    <CardDescription>Selecciona las secciones</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {Object.entries({
                  summary: "Resumen Ejecutivo",
                  incomeStatement: "Estado de Resultados",
                  chart: "Gráfico de Tendencias",
                  payrollTable: "Tabla de Nómina",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  >
                    <Checkbox
                      checked={pdfSections[key]}
                      onCheckedChange={() => handleCheckbox(key)}
                      className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                    />
                    <span className="text-sm font-medium group-hover:text-sky-700 transition-colors">
                      {label}
                    </span>
                  </label>
                ))}

                {hasData && (
                  <Button
                    onClick={exportPDF}
                    className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white shadow-md"
                    size="default"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generar PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Indicadores Clave (KPIs) */}
          {hasData ? (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                Indicadores Clave
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Ingresos Matrículas"
                  value={reportData.summary?.total_revenue ?? 0}
                  icon={DollarSign}
                  color="sky"
                />

                {reportType === "payroll" && (
                  <MetricCard
                    title="Gasto Nómina"
                    value={reportData.summary?.total_payroll_expenses ?? 0}
                    icon={Users}
                    color="violet"
                  />
                )}

                {reportType === "profitability" && (
                  <>
                    <MetricCard
                      title="Balance Neto"
                      value={reportData.summary?.net_profit ?? 0}
                      icon={Wallet}
                      color="emerald"
                    />
                    <MetricCard
                      title="Margen Rentabilidad"
                      value={
                        (reportData.summary?.profit_margin ?? 0).toFixed(2) +
                        "%"
                      }
                      icon={Percent}
                      color="amber"
                      isPercentage
                    />
                  </>
                )}
              </div>
            </div>
          ) : !loading ? (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
                No hay datos disponibles para el período seleccionado
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Tabla de Nómina */}
          {reportType === "payroll" && reportData?.details?.length > 0 && (
            <PayrollTable details={reportData.details} />
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando datos...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdministrativeLayout>
  );
};

export default FinancialReportsView;

/* ===================== SUBCOMPONENTS ===================== */

const PayrollTable = ({ details }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Users className="w-5 h-5 text-sky-600" />
        Detalle de Pagos - Nómina
      </CardTitle>
      <CardDescription>
        Registro completo de pagos realizados en el período
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-sky-200 bg-sky-50/50 dark:bg-sky-950/20">
              <th className="p-3 text-left font-semibold text-sky-900 dark:text-sky-100">
                Empleado
              </th>
              <th className="p-3 text-left font-semibold text-sky-900 dark:text-sky-100">
                Tipo de Contrato
              </th>
              <th className="p-3 text-right font-semibold text-sky-900 dark:text-sky-100">
                Monto
              </th>
              <th className="p-3 text-right font-semibold text-sky-900 dark:text-sky-100">
                Fecha de Pago
              </th>
            </tr>
          </thead>
          <tbody>
            {details.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border hover:bg-accent/30 transition-colors"
              >
                <td className="p-3 font-medium">{row.employee}</td>
                <td className="p-3">
                  <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-medium">
                    {row.staff_type ?? "N/A"}
                  </span>
                </td>
                <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  S/{" "}
                  {parseFloat(row.amount).toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="p-3 text-right text-muted-foreground">
                  {row.date}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 font-semibold">
              <td
                colSpan={2}
                className="p-3 text-left text-sky-900 dark:text-sky-100"
              >
                Total General
              </td>
              <td className="p-3 text-right text-emerald-700 dark:text-emerald-400">
                S/{" "}
                {details
                  .reduce((sum, row) => sum + parseFloat(row.amount), 0)
                  .toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </CardContent>
  </Card>
);

const MetricCard = ({
  title,
  value,
  icon: Icon,
  color = "sky",
  isPercentage = false,
}) => {
  const colorClasses = {
    sky: "bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400",
    violet:
      "bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400",
    emerald:
      "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    amber:
      "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-sky-500">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {isPercentage
                ? value
                : typeof value === "number"
                ? `S/ ${value.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : value}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};