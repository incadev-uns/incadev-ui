import { TechnologyLayout } from "../components/TechnologyLayout"

export default function InfrastructureDashboard() {
  return (
    <TechnologyLayout breadcrumbs={[{ label: "Dashboard de Infraestructura" }]}>
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard Infraestructura</h1>
        <p className="text-muted-foreground">
          Gestión de Servidores e Infraestructura TI
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Dashboard de infraestructura en desarrollo...</p>
      </div>
    </TechnologyLayout>
  )
}
