// src/process/evaluation/surveys/types/survey.ts

export type SurveyEvent = "satisfaction" | "teacher" | "impact"

export interface Survey {
  id: number
  title: string
  description: string
  event: SurveyEvent
  mapping_description: string
  questions_count?: number
  responses_count?: number
  created_at: string
  updated_at: string
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