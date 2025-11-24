import { useState, useEffect, useCallback } from "react"
import { surveyService } from "@/process/evaluation/surveys/services/survey-service"
import type { 
  Survey, 
  SurveyFormData, 
  PaginationMeta, 
  PaginationLinks,
  SurveyAnalysis 
} from "@/process/evaluation/surveys/types/survey"

interface UseSurveysReturn {
  surveys: Survey[]
  meta: PaginationMeta | null
  links: PaginationLinks | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  setPage: (page: number) => void
  createSurvey: (data: SurveyFormData) => Promise<boolean>
  updateSurvey: (id: number, data: SurveyFormData) => Promise<boolean>
  deleteSurvey: (id: number) => Promise<boolean>
  downloadPdfReport: (surveyId: number) => Promise<boolean>
  downloadExcelReport: (surveyId: number) => Promise<boolean>
  getAnalysis: (surveyId: number) => Promise<SurveyAnalysis | null>
}

export function useSurveys(): UseSurveysReturn {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [links, setLinks] = useState<PaginationLinks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await surveyService.listAll(currentPage)
      setSurveys(res.data)
      setMeta(res.meta)
      setLinks(res.links)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setPage = (page: number) => {
    setCurrentPage(page)
  }

  const createSurvey = async (data: SurveyFormData): Promise<boolean> => {
    try {
      await surveyService.create(data)
      await refresh()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear")
      return false
    }
  }

  const updateSurvey = async (id: number, data: SurveyFormData): Promise<boolean> => {
    try {
      await surveyService.update(id, data)
      await refresh()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar")
      return false
    }
  }

  const deleteSurvey = async (id: number): Promise<boolean> => {
    try {
      await surveyService.delete(id)
      await refresh()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar")
      return false
    }
  }

  const downloadPdfReport = async (surveyId: number): Promise<boolean> => {
    try {
      const blob = await surveyService.downloadPdfReport(surveyId)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `reporte_encuesta_${surveyId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al descargar PDF")
      return false
    }
  }

  const downloadExcelReport = async (surveyId: number): Promise<boolean> => {
    try {
      const blob = await surveyService.downloadExcelReport(surveyId)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `reporte_encuesta_${surveyId}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al descargar Excel")
      return false
    }
  }

  const getAnalysis = async (surveyId: number): Promise<SurveyAnalysis | null> => {
    try {
      return await surveyService.getAnalysis(surveyId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al obtener análisis")
      return null
    }
  }

  return { 
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
  }
}