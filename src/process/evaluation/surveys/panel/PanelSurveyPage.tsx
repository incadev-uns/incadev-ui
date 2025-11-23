import { useState, useMemo } from "react"
import SurveyLayout from "@/process/evaluation/SurveyLayout"
import { useSurveys } from "@/process/evaluation/surveys/hooks/useSurveys"
import { SurveyToolbar } from "@/process/evaluation/surveys/components/SurveyToolbar"
import { SurveyTable } from "@/process/evaluation/surveys/components/SurveyTable"
import { SurveyFormDialog } from "@/process/evaluation/surveys/components/SurveyFormDialog"
import { SurveyDeleteDialog } from "@/process/evaluation/surveys/components/SurveyDeleteDialog"
import { SurveyQuestionsDialog } from "@/process/evaluation/surveys/components/SurveyQuestionsDialog"
import { SurveyAnalysisDialog } from "@/process/evaluation/surveys/components/SurveyAnalysisDialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { Survey, SurveyFormData } from "@/process/evaluation/surveys/types/survey"

export default function PanelSurveyPage() {
  const { 
    surveys, 
    meta, 
    links, 
    loading, 
    error, 
    refresh, 
    setPage,
    createSurvey, 
    updateSurvey, 
    deleteSurvey,
    downloadPdfReport,
    downloadExcelReport,
    getAnalysis 
  } = useSurveys()

  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState("all")

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)

  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysisSurveyId, setAnalysisSurveyId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return surveys.filter((s) => {
      const matchSearch = !search || 
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      const matchEvent = eventFilter === "all" || s.mapping.event === eventFilter
      return matchSearch && matchEvent
    })
  }, [surveys, search, eventFilter])

  const handleViewAnalysis = (survey: Survey) => {
    setAnalysisSurveyId(survey.id)
    setAnalysisOpen(true)
  }

  const handleCreate = () => {
    setSelectedSurvey(null)
    setFormOpen(true)
  }

  const handleEdit = (survey: Survey) => {
    setSelectedSurvey(survey)
    setFormOpen(true)
  }

  const handleDelete = (survey: Survey) => {
    setSelectedSurvey(survey)
    setDeleteOpen(true)
  }

  const handleManageQuestions = (survey: Survey) => {
    setSelectedSurvey(survey)
    setQuestionsOpen(true)
  }

  const handleFormSubmit = async (data: SurveyFormData): Promise<boolean> => {
    if (selectedSurvey) {
      return updateSurvey(selectedSurvey.id, data)
    }
    return createSurvey(data)
  }

  const handleDeleteConfirm = async (id: number): Promise<boolean> => {
    return deleteSurvey(id)
  }

  const handlePageChange = (page: number) => {
    setPage(page)
  }

  const defaultMeta = {
    current_page: 1,
    from: 0,
    to: 0,
    per_page: 10,
    total: 0,
    last_page: 1
  }

  const defaultLinks = {
    first: "",
    last: "",
    prev: null,
    next: null
  }

  return (
    <SurveyLayout title="Dashboard: Crud de Encuestas">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestión de Encuestas</h1>
          <p className="text-muted-foreground">
            Administra las encuestas del sistema: crea, edita y elimina según necesites.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <SurveyToolbar
          search={search}
          onSearchChange={setSearch}
          eventFilter={eventFilter}
          onEventFilterChange={setEventFilter}
          onRefresh={refresh}
          onCreate={handleCreate}
          loading={loading}
        />

        <SurveyAnalysisDialog
          open={analysisOpen}
          onOpenChange={setAnalysisOpen}
          surveyId={analysisSurveyId}
          onGetAnalysis={getAnalysis}
        />
        
        {loading && surveys.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <SurveyTable
            surveys={filtered}
            meta={meta || defaultMeta}
            links={links || defaultLinks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onManageQuestions={handleManageQuestions}
            onDownloadPdf={downloadPdfReport}
            onDownloadExcel={downloadExcelReport}
            onViewAnalysis={handleViewAnalysis}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        <SurveyFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          survey={selectedSurvey}
          onSubmit={handleFormSubmit}
        />

        <SurveyDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          survey={selectedSurvey}
          onConfirm={handleDeleteConfirm}
        />

        <SurveyQuestionsDialog
          open={questionsOpen}
          onOpenChange={setQuestionsOpen}
          survey={selectedSurvey}
        />
      </div>
    </SurveyLayout>
  )
}