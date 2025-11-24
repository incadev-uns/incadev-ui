// src/types/dropout-prediction.ts

// ============================================
// Enums y Types
// ============================================

export type RiskLevel = "ALTO" | "MEDIO" | "BAJO" | "BAJO RIESGO"
export type SystemStatus = "ACTIVE" | "INACTIVE" | "TRAINING" | "ERROR"
export type InterventionStatus = "PENDING" | "COMPLETED" | "SCHEDULED" | "CANCELLED"
export type ModelTrend = "up" | "down" | "stable"
export type DataStatus = "FALTAN DATOS ACADÉMICOS" | "DATOS COMPLETOS" | string

// ============================================
// Interfaces - System Overview
// ============================================

export interface SystemStatusData {
  model_status: SystemStatus
  model_accuracy: number
  high_risk_students_count: number
  last_updated: string
  total_students?: number
  medium_risk_count?: number
  low_risk_count?: number
  predictions_generated?: number
}

export interface RecentAlert {
  student_name: string
  group_name: string
  risk_level: RiskLevel
  probability: number
  timestamp: string
  critical_factors: string[]
}

// ============================================
// Interfaces - Student Predictions
// ============================================

export interface StudentPrediction {
  enrollment_id: number
  user_id: number
  group_id: number
  student_name: string
  group_name: string
  dropout_probability: number
  predicted_dropped_out: number
  risk_level: RiskLevel
  recommended_action: string
  avg_grade: number
  attendance_rate: number
  payment_regularity: number
  total_exams_taken: number
  data_status: DataStatus
  riesgo_porcentaje?: number // Para el endpoint de grupo
}

export interface PredictionsSummary {
  total_students: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  avg_dropout_probability: number
  data_status_summary: {
    complete_data: number
    missing_academic: number
    missing_attendance: number
  }
}

export interface PredictionsResponse {
  success: boolean
  data: {
    predictions: StudentPrediction[]
    summary: PredictionsSummary
  }
  filters: any[]
  group_id?: string
}

// ============================================
// Interfaces - Detailed Predictions
// ============================================

export interface DetailedStudentPrediction extends StudentPrediction {
  course_version_id: number
  start_date: string
  end_date: string
  grade_std_dev: number
  grade_trend: number
  max_grade: number
  min_grade: number
  grade_range: number
  attendance_trend: number
  total_sessions: number
  present_count: number
  recent_sessions_14d: number
  exam_participation_rate: number
  days_since_last_payment: number
  avg_payment_delay: number
  total_payments: number
  days_since_start: number
  days_until_end: number
  course_progress: number
  sessions_progress: number
  previous_courses_completed: number
  historical_avg_grade: number
  avg_satisfaction_score: number
  predicted_label: number
  recommendation: string
  risk_factor_1: string | null
  risk_factor_2: string | null
  risk_factor_3: string | null
  risk_factor_4: string | null
}

export interface AnalysisData {
  total: number
  risk_distribution: {
    ALTO: number
    MEDIO: number
    BAJO: number
  }
  performance_insights: {
    common_issues: {
      low_attendance: number
      low_grades: number
      payment_issues: number
    }
    avg_metrics_high_risk: {
      attendance_rate: number
      avg_grade: number
      payment_regularity: number
    }
  }
  common_risk_factors: {
    attendance: number
    academic: number
    financial: number
    payment_delay: number
  }
}

export interface DetailedPredictionsResponse {
  success: boolean
  data: {
    students: DetailedStudentPrediction[]
    analysis: AnalysisData
  }
  filters: any[]
}

// ============================================
// Interfaces - High Risk Students
// ============================================

export interface HighRiskStudent {
  enrollment_id: number
  user_id: number
  group_id: number
  student_name: string
  group_name: string
  riesgo_porcentaje: number
  dropout_probability: number
  avg_grade: number
  attendance_rate: number
  payment_regularity: number
  days_since_last_payment: number
  accion_recomendada: string
}

export interface InterventionTimeline {
  student_name: string
  intervention_date: string
  action_taken: string
  status: InterventionStatus
  next_followup: string
  outcome?: string
}

export interface HighRiskResponse {
  success: boolean
  data: {
    high_risk_students: HighRiskStudent[]
    count: number
    intervention_timeline?: InterventionTimeline[]
    priority_count?: number
  }
}

// ============================================
// Filters
// ============================================

export interface DropoutPredictionFilters {
  group_id?: number
  risk_level?: RiskLevel | "ALL"
  min_probability?: number
  max_probability?: number
  search?: string
}

// ============================================
// Labels & Colors - Usando colores nativos de shadcn
// ============================================

export const RiskLevelLabels: Record<RiskLevel, string> = {
  ALTO: "Alto Riesgo",
  MEDIO: "Riesgo Medio", 
  BAJO: "Bajo Riesgo",
  "BAJO RIESGO": "Bajo Riesgo"
}

export const RiskLevelColors: Record<RiskLevel, string> = {
  ALTO: "bg-destructive/10 text-destructive border-destructive/20",
  MEDIO: "bg-warning/10 text-warning-foreground border-warning/20",
  BAJO: "bg-success/10 text-success-foreground border-success/20",
  "BAJO RIESGO": "bg-success/10 text-success-foreground border-success/20"
}

export const SystemStatusLabels: Record<SystemStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo", 
  TRAINING: "Entrenando",
  ERROR: "Error"
}

export const SystemStatusColors: Record<SystemStatus, string> = {
  ACTIVE: "bg-success/10 text-success-foreground border-success/20",
  INACTIVE: "bg-muted/10 text-muted-foreground border-muted/20",
  TRAINING: "bg-primary/10 text-primary-foreground border-primary/20",
  ERROR: "bg-destructive/10 text-destructive border-destructive/20"
}

export const InterventionStatusLabels: Record<InterventionStatus, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completado",
  SCHEDULED: "Programado", 
  CANCELLED: "Cancelado"
}

export const InterventionStatusColors: Record<InterventionStatus, string> = {
  PENDING: "bg-warning/10 text-warning-foreground border-warning/20",
  COMPLETED: "bg-success/10 text-success-foreground border-success/20",
  SCHEDULED: "bg-primary/10 text-primary-foreground border-primary/20",
  CANCELLED: "bg-muted/10 text-muted-foreground border-muted/20"
}

export const DataStatusColors: Record<DataStatus, string> = {
  "DATOS COMPLETOS": "bg-success/10 text-success-foreground border-success/20",
  "FALTAN DATOS ACADÉMICOS": "bg-warning/10 text-warning-foreground border-warning/20",
}