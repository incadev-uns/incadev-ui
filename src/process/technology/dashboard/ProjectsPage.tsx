import TechnologyLayout from "@/process/technology/TechnologyLayout"

export default function ProjectsPage() {
  return (
    <TechnologyLayout title="Proyectos: Desarrollo Web">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Gestión de Proyectos</h1>
          <p className="text-muted-foreground">
            Administración de proyectos de desarrollo web
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Panel de proyectos en desarrollo...
          </p>
        </div>
      </div>
    </TechnologyLayout>
  )
}
