import TechnologyLayout from "@/process/technology/TechnologyLayout"

export default function ReportsPage() {
  return (
    <TechnologyLayout title="Reportes: Análisis Académico">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Reportes Académicos</h1>
          <p className="text-muted-foreground">
            Análisis y generación de reportes académicos
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Panel de reportes en desarrollo...
          </p>
        </div>
      </div>
    </TechnologyLayout>
  )
}
