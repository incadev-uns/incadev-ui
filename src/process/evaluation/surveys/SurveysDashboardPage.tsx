import SurveyLayout from "@/process/evaluation/SurveyLayout"
import { ChartAreaInteractive } from "@/process/academic/dasboard/components/chart-area-interactive"
import { DataTable } from "@/process/academic/dasboard/components/data-table"
import { SectionCards } from "@/process/academic/dasboard/components/section-cards"
import data from "@/process/academic/dasboard/data.json"

export default function SurveysDashboardPage() {
  return (
    <SurveyLayout title="Dashboard: Administrador de Encuestas">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </SurveyLayout>
  )
}