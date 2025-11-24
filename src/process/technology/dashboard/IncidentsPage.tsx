import TechnologyLayout from "@/process/technology/TechnologyLayout"

export default function IncidentsPage() {
  return (
    <TechnologyLayout title="Incidentes: Seguridad">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Gestión de Incidentes</h1>
          <p className="text-muted-foreground">
            Registro y seguimiento de incidentes de seguridad
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Panel de incidentes en desarrollo...
          </p>
        </div>
      </div>
    </TechnologyLayout>
  )
}
