import TechnologyLayout from "@/process/technology/TechnologyLayout"

export default function AcademicAnalystDashboard() {
  return (
    <TechnologyLayout breadcrumbs={[{ label: "Dashboard de Análisis Académico" }]}>
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard Analista Académico</h1>
        <p className="text-muted-foreground">
          Análisis de Datos Académicos y Reportes
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Dashboard de análisis académico en desarrollo...</p>
      </div>
    </TechnologyLayout>
  )
}
