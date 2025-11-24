export type SurveyEvent = "satisfaction" | "teacher" | "impact"

export interface SurveyMapping {
  id: number
  event: SurveyEvent
  survey_id: number
  description: string
  created_at: string
  updated_at: string
}

export interface Survey {
  id: number
  title: string
  description: string
  mapping: SurveyMapping
  questions_count?: number
  responses_count?: number
  created_at: string
  updated_at: string
  questions: any[] // Mantener por compatibilidad
}

export interface SurveyFormData {
  title: string
  description: string
  event: SurveyEvent
  mapping_description: string
}

export interface SurveyResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface SurveyAnalysis {
  survey: {
    id: number
    title: string
    description: string
  }
  kpis: Array<{
    label: string
    value: number | string
  }>
  chartData: Array<{
    label: string
    value: number
  }>
  recommendation: string
}

export interface PaginationMeta {
  current_page: number
  from: number
  to: number
  per_page: number
  total: number
  last_page: number
}

export interface PaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface PaginatedSurveyResponse {
  success: boolean
  data: Survey[]
  meta: PaginationMeta
  links: PaginationLinks
}

// Configuración de eventos para reutilizar en componentes
export const SURVEY_EVENTS: { value: SurveyEvent; label: string }[] = [
  { value: "satisfaction", label: "Satisfacción" },
  { value: "teacher", label: "Docente" },
  { value: "impact", label: "Impacto" },
]