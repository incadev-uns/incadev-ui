import React, { useEffect, useState } from "react";

export default function FinancialReportExportPDF() {
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState<any>(null);
  const [sections, setSections] = useState<any>(null);
  const [reportType, setReportType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (n: number) =>
    `S/ ${n?.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const periodNameMap: Record<string, string> = {
    month: "Mes Actual",
    last_month: "Mes Anterior",
    quarter: "Trimestre Actual",
    last_quarter: "Trimestre Anterior",
    year: "Año Actual",
    last_year: "Año Anterior",
  };

  const getDate = () =>
    new Date().toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  useEffect(() => {
    const storedData = localStorage.getItem("financialExportData");
    const storedFilters = localStorage.getItem("financialExportFilters");
    const storedSections = localStorage.getItem("financialExportSections");
    const storedType = localStorage.getItem("financialExportType");

    if (storedData) setReportData(JSON.parse(storedData));
    if (storedFilters) setFilters(JSON.parse(storedFilters));
    if (storedSections) setSections(JSON.parse(storedSections));
    if (storedType) setReportType(JSON.parse(JSON.stringify(storedType)));

    setTimeout(() => {
      setLoading(false);
      window.print();
    }, 700);
  }, []);

  if (!reportData || !filters || !sections || !reportType || loading)
    return (
      <div className="text-center py-20 text-slate-500">
        Generando reporte...
      </div>
    );

  const { summary, monthly_data, details } = reportData;
  const margin = isFinite(summary.profit_margin)
    ? `${Number(summary.profit_margin).toFixed(2)}%`
    : "0.00%";

  return (
    <div
      className="max-w-[1200px] mx-auto bg-white p-8 text-slate-900"
      style={{ fontSize: "12px" }}
    >
      {/* Botón flotante para imprimir / exportar PDF */}
      <button
        onClick={() => window.print()}
        className="
    fixed top-4 right-4
    bg-sky-700 hover:bg-sky-800
    text-white font-medium
    px-4 py-2 rounded-md shadow-lg
    print:hidden
    transition
  "
      >
        Descargar PDF
      </button>

      {/* Encabezado */}
      <div className="flex justify-between border-b-4 border-sky-700 pb-3 mb-6">
        <div>
          <h1 className="text-[30px] font-extrabold text-sky-700">INCADEV</h1>
          <p className="text-[11px] text-slate-600">
            Instituto de Capacitación y Desarrollo
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold text-slate-800">
            Reporte Financiero
          </h2>
          <p className="text-[11px] text-slate-600 mt-1">
            Generado: {getDate()} <br />
            Período: {periodNameMap[filters.timeRange] ?? "No definido"} <br />
            Tipo de Reporte: {reportType.toUpperCase()}
          </p>
        </div>
      </div>

      {/* KPIs */}
      {sections.summary && (
        <section className="mb-8">
          <h3 className="font-bold text-[13px] mb-2 text-slate-900">
            Resumen Financiero
          </h3>

          <div className="grid grid-cols-4 gap-4 mb-2">
            <KpiBox
              title="Ingresos Matrículas"
              value={formatCurrency(summary.total_revenue)}
              color="green"
            />
            <KpiBox
              title="Gastos Nómina"
              value={formatCurrency(summary.total_payroll_expenses ?? 0)}
              color="red"
            />

            <KpiBox
              title="Resultado del Período"
              value={formatCurrency(summary.net_profit ?? 0)}
              color="sky"
            />

            <KpiBox title="Margen de Utilidad" value={margin} color="yellow" />
          </div>

          {"balance" in summary && (
            <div className="mt-4 text-right text-[12px] font-bold text-slate-800">
              Balance Neto: {formatCurrency(summary.balance)}
            </div>
          )}
        </section>
      )}

      {/* Estado de Resultados */}
      {sections.incomeStatement && (
        <section className="mb-10">
          <h3 className="font-bold text-[13px] border-b pb-1 mb-2 text-slate-900">
            Estado de Resultados
          </h3>

          <table className="w-full text-[11px]">
            <tbody>
              <Row
                label="Ingresos Totales"
                value={formatCurrency(summary.total_revenue)}
                cls="text-green-600 font-semibold"
              />
              <Row
                label="Gastos de Personal"
                value={formatCurrency(summary.total_payroll_expenses)}
                cls="text-red-600 font-semibold"
              />
              <Row
                label="Resultado Neto"
                value={formatCurrency(summary.net_profit)}
                cls="text-sky-700 font-bold bg-sky-50"
              />
            </tbody>
          </table>
        </section>
      )}

      {/* Tabla Nómina */}
      {sections.payrollTable &&
        reportType === "payroll" &&
        details?.length > 0 && (
          <section className="mb-10">
            <h3 className="font-bold text-[13px] border-b pb-1 mb-2 text-slate-900">
              Detalle de Nómina
            </h3>

            <table className="w-full text-[11px] border">
              <thead className="bg-sky-700 text-white">
                <tr>
                  <th className="p-2 text-left">Empleado</th>
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-right">Monto</th>
                  <th className="p-2 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {details.map((item: any, index: number) => (
                  <tr key={index} className={index % 2 ? "bg-slate-50" : ""}>
                    <td className="p-2">{item.employee}</td>
                    <td className="p-2">{item.staff_type ?? "N/A"}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-2 text-right">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

      {/* Tendencia Mensual */}
      {sections.chart && monthly_data?.length > 0 && (
        <section className="mb-8">
          <h3 className="font-bold text-[13px] border-b pb-1 mb-2 text-slate-900">
            Tendencia Mensual
          </h3>

          <table className="w-full text-[11px] border">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-2 text-left">Mes</th>
                <th className="p-2 text-right">Ingresos</th>
                <th className="p-2 text-right">Nómina</th>
                <th className="p-2 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {monthly_data.map((item: any, index: number) => (
                <tr key={index} className={index % 2 ? "bg-slate-50" : ""}>
                  <td className="p-2">{item.month}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(item.payroll)}
                  </td>
                  <td className="p-2 text-right text-slate-900 font-semibold">
                    {formatCurrency(item.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Tabla ingresos por matrículas */}
      {reportType === "revenue" && details?.length > 0 && (
        <section className="mb-8">
          <h3 className="font-bold text-[13px] border-b pb-1 mb-2 text-slate-900">
            Matrículas Pagadas en el Período
          </h3>
          <table className="w-full text-[11px] border">
            <thead className="bg-sky-700 text-white">
              <tr>
                <th className="p-2 text-left">Estudiante</th>
                <th className="p-2 text-left">Curso</th>
                <th className="p-2 text-right">Monto</th>
                <th className="p-2 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {details.map((p: any, i: number) => (
                <tr key={i} className={i % 2 ? "bg-slate-50" : ""}>
                  <td className="p-2">{p.student}</td>
                  <td className="p-2">{p.course}</td>
                  <td className="p-2 text-right">{formatCurrency(p.amount)}</td>
                  <td className="p-2 text-right">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-600 border-t pt-3 mt-10">
        Reporte generado automáticamente — INCADEV — {getDate()}
      </footer>
    </div>
  );
}

/* Subcomponentes */
const KpiBox = ({ title, value, color }: any) => (
  <div className={`p-3 rounded-md border border-${color}-300 bg-${color}-50`}>
    <p className="text-[10px] font-semibold uppercase">{title}</p>
    <p className={`text-base font-bold text-${color}-700 mt-1`}>{value}</p>
  </div>
);

const Row = ({ label, value, cls }: any) => (
  <tr className="border-b last:border-none">
    <td className="p-1 font-medium">{label}</td>
    <td className={`p-1 text-right ${cls}`}>{value}</td>
  </tr>
);
