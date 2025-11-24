import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Pencil, Trash2, GripVertical, AlertCircle, Loader2 } from "lucide-react"
import { useQuestions } from "@/process/evaluation/surveys/hooks/useQuestions"
import { QuestionFormDialog } from "@/process/evaluation/surveys/components/QuestionFormDialog"
import { QuestionDeleteDialog } from "@/process/evaluation/surveys/components/QuestionDeleteDialog"
import type { Survey } from "@/process/evaluation/surveys/types/survey"
import type { Question, QuestionFormData } from "@/process/evaluation/surveys/types/question"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey: Survey | null
}

export function SurveyQuestionsDialog({ open, onOpenChange, survey }: Props) {
  const {
    questions,
    loading,
    error,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearQuestions,
  } = useQuestions()

  // Sub-dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  useEffect(() => {
    if (open && survey) {
      loadQuestions(survey.id)
    } else {
      clearQuestions()
    }
  }, [open, survey])

  const handleCreate = () => {
    setSelectedQuestion(null)
    setFormOpen(true)
  }

  const handleEdit = (q: Question) => {
    setSelectedQuestion(q)
    setFormOpen(true)
  }

  const handleDelete = (q: Question) => {
    setSelectedQuestion(q)
    setDeleteOpen(true)
  }

  const handleFormSubmit = async (data: QuestionFormData): Promise<boolean> => {
    if (!survey) return false
    if (selectedQuestion) {
      return updateQuestion(selectedQuestion.id, data)
    }
    return createQuestion(survey.id, data)
  }

  const handleDeleteConfirm = async (id: number): Promise<boolean> => {
    return deleteQuestion(id)
  }

  const nextOrder = questions.length > 0 
    ? Math.max(...questions.map(q => q.order)) + 1 
    : 1

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preguntas de la Encuesta</DialogTitle>
            <DialogDescription>
              {survey?.title} — Gestiona las preguntas de esta encuesta
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">
              {questions.length} pregunta{questions.length !== 1 ? "s" : ""}
            </span>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Pregunta
            </Button>
          </div>

          <ScrollArea className="flex-1 -mx-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>No hay preguntas en esta encuesta</p>
                <p className="text-sm">Agrega una pregunta para comenzar</p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {questions
                  .sort((a, b) => a.order - b.order)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-sm font-medium w-6">{q.order}.</span>
                      </div>
                      <p className="flex-1 text-sm pt-0.5">{q.question}</p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(q)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(q)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <QuestionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        question={selectedQuestion}
        nextOrder={nextOrder}
        onSubmit={handleFormSubmit}
      />

      <QuestionDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        question={selectedQuestion}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}