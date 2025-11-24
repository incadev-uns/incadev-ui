import TechnologyLayout from "@/process/technology/TechnologyLayout"

export default function SecurityDashboard() {
  return (
    <TechnologyLayout breadcrumbs={[{ label: "Dashboard de Seguridad" }]}>
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard Seguridad</h1>
        <p className="text-muted-foreground">
          Monitoreo de Seguridad y Gestión de Incidentes
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Dashboard de seguridad en desarrollo...</p>
      </div>
    </TechnologyLayout>
  )
}
