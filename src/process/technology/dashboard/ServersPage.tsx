import TechnologyLayout from "@/process/technology/TechnologyLayout"

export default function ServersPage() {
  return (
    <TechnologyLayout title="Servidores: Infraestructura">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Gestión de Servidores</h1>
          <p className="text-muted-foreground">
            Monitoreo y administración de servidores
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Panel de servidores en desarrollo...
          </p>
        </div>
      </div>
    </TechnologyLayout>
  )
}
