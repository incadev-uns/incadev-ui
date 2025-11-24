import { useState, useCallback } from "react"
import { questionService } from "@/process/evaluation/surveys/services/question-service"
import type { Question, QuestionFormData } from "@/process/evaluation/surveys/types/question"

interface UseQuestionsReturn {
  questions: Question[]
  loading: boolean
  error: string | null
  loadQuestions: (surveyId: number) => Promise<void>
  createQuestion: (surveyId: number, data: QuestionFormData) => Promise<boolean>
  updateQuestion: (id: number, data: QuestionFormData) => Promise<boolean>
  deleteQuestion: (id: number) => Promise<boolean>
  clearQuestions: () => void
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSurveyId, setCurrentSurveyId] = useState<number | null>(null)

  const loadQuestions = useCallback(async (surveyId: number) => {
    try {
      setLoading(true)
      setError(null)
      setCurrentSurveyId(surveyId)
      const res = await questionService.listAll(surveyId)
      setQuestions(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [])

  const createQuestion = async (surveyId: number, data: QuestionFormData): Promise<boolean> => {
    try {
      setError(null)
      await questionService.create(surveyId, data)
      await loadQuestions(surveyId)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear pregunta")
      return false
    }
  }

  const updateQuestion = async (id: number, data: QuestionFormData): Promise<boolean> => {
    try {
      setError(null)
      await questionService.update(id, data)
      if (currentSurveyId) {
        await loadQuestions(currentSurveyId)
      }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar pregunta")
      return false
    }
  }

  const deleteQuestion = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      await questionService.delete(id)
      if (currentSurveyId) {
        await loadQuestions(currentSurveyId)
      }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar pregunta")
      return false
    }
  }

  const clearQuestions = () => {
    setQuestions([])
    setCurrentSurveyId(null)
    setError(null)
  }

  return {
    questions,
    loading,
    error,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearQuestions,
  }
}