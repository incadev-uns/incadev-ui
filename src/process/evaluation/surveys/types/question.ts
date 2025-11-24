export interface Question {
  id: number
  survey_id: number
  question: string
  order: number
  created_at: string
  updated_at: string
}

export interface QuestionFormData {
  question: string
  order: number
}

export interface QuestionResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface QuestionListResponse {
  success: boolean
  data: Question[]
}