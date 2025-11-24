// ============================================
// Enums y Types
// ============================================

export type AttendanceStatus = "present" | "absent" | "late" | "excused"
export type EnrollmentStatus = "approved" | "failed" | "pending"
export type AcademicStatus = "pending" | "active" | "completed" | "failed" | "dropped"
export type PaymentStatus = "pending" | "paid" | "partially_paid" | "refunded" | "cancelled" | "overdue"

// ============================================
// Interfaces - Filtros
// ============================================

export interface GroupOption {
  id: number
  name: string
  course_name?: string
  course_version?: string
  start_date?: string
  end_date?: string
  status?: string
  student_count?: number
  teacher_count?: number
  display_name?: string
}

export interface ActiveGroupsResponse {
  success: boolean
  data: GroupOption[]
  meta: {
    total_active_groups: number
  }
}

// ============================================
// Interfaces - Attendance
// ============================================

export interface StudentAttendance {
  enrollment_id: number
  user_id: number
  student_name: string
  student_email: string
  group_id: number
  group_name: string
  course_name: string
  course_version: string
  total_sessions: number
  present_count: number
  absent_count: number
  late_count: number
  attendance_rate: number
}

export interface GroupAttendance {
  group_id: number
  group_name: string
  course_name: string
  course_version: string
  total_students: number
  avg_attendance_rate: number
  avg_absence_rate: number
}

export interface AttendanceSummary {
  total_students: number
  avg_attendance_rate: number
  total_sessions: number
}

export interface AttendanceResponse {
  success: boolean
  data: {
    student_level: StudentAttendance[]
    group_level: GroupAttendance[]
    summary: AttendanceSummary
    filters_applied: string[]
    data_range_info?: {
      date_filters_applied: boolean
      scope: string
    }
    debug_info?: any
  }
  filters: any[]
}

export interface LocalAttendanceSummary {
  group_id: number
  group_name: string
  student_id: number
  student_name: string
  total_sessions: number
  present_count: string
  absent_count: string
  late_count: string
  attendance_rate: string
}

// ============================================
// Interfaces - Performance
// ============================================

export interface StudentPerformance {
  enrollment_id: number
  user_id: number
  student_name: string
  student_email: string
  group_id: number
  group_name: string
  course_name: string
  course_version: string
  final_grade: number | null
  attendance_percentage: number | null
  enrollment_status: EnrollmentStatus | string
  total_exams_taken: number
  overall_avg_grade: number | null
  min_grade: number | null
  max_grade: number | null
  grade_stddev: number | null
}

export interface CoursePerformance {
  group_id: number
  group_name: string
  course_name: string
  course_version: string
  total_students: number
  avg_final_grade: number | null
  avg_attendance: number | null
  approved_students: number
  approval_rate: number
}

export interface PerformanceSummary {
  total_students: number
  total_courses: number
  overall_approval_rate: number
  overall_avg_grade: number
}

export interface PerformanceResponse {
  success: boolean
  data: {
    student_performance: StudentPerformance[]
    course_performance: CoursePerformance[]
    summary: PerformanceSummary
  }
  filters: any[]
}

// ============================================
// Interfaces - Progress
// ============================================

export interface ModuleCompletion {
  enrollment_id: number
  user_id: number
  student_name: string
  student_email: string
  group_id: number
  group_name: string
  course_name: string
  course_version: string
  module_id: number
  module_title: string
  module_order: number
  total_sessions: number
  attended_sessions: number
  completion_rate: number
  completion_days: number
}

export interface GradeConsistency {
  enrollment_id: number
  user_id: number
  student_name: string
  student_email: string
  group_id: number
  group_name: string
  course_name: string
  course_version: string
  total_grades: number
  avg_grade: number
  grade_stddev: number
  min_grade: number
  max_grade: number
}

export interface ProgressSummary {
  avg_completion_rate: number
  avg_grade: number
  total_students: number
}

export interface ProgressResponse {
  success: boolean
  data: {
    module_completion: ModuleCompletion[]
    grade_consistency: GradeConsistency[]
    summary: ProgressSummary  
  }
  filters: any[]
}

// ============================================
// Interfaces - Dashboard
// ============================================

export interface DashboardMainData {
  attendance_rate: number
  approval_rate: number
  avg_grade: number
  total_students: number
  total_groups: number
  total_sessions: number
  present_sessions: number
}

export interface DashboardChartsData {
  attendance_distribution: Array<{
    attendance_status: string
    count: number
  }>
  grade_distribution: Array<{
    grade_range: string
    count: number
  }>
}

export interface DashboardMainResponse {
  success: boolean
  data: DashboardMainData
}

export interface DashboardChartsResponse {
  success: boolean
  data: DashboardChartsData
}

// ============================================
// Interfaces - BigQuery Sync
// ============================================

export interface BigQuerySyncResponse {
  success: boolean
  message: string
  data?: {
    tables_processed: string[]
    total_records_synced: number
    sync_duration: string
    timestamp: string
  }
  error?: string
}

// ============================================
// Interfaces - Charts Data
// ============================================

// Attendance Charts
export interface AttendanceStatusDistribution {
  status: string
  count: number
  percentage: number
}

export interface GroupStatusDistribution {
  group_name: string
  course_name: string
  statuses: AttendanceStatusDistribution[]
}

export interface AttendanceStatusResponse {
  status_distribution: GroupStatusDistribution[]
  summary: {
    total_records: number
    total_groups: number
  }
  filters_applied: string[]
}

export interface WeeklyAbsenceTrend {
  year: number
  week_number: number
  week_label: string
  absence_count: number
  total_attendance_records: number
  unique_sessions: number
  total_students: number
  absence_rate: number
}

export interface WeeklyTrendsResponse {
  weekly_trends: WeeklyAbsenceTrend[]
  filters_applied: string[]
}

export interface AttendanceCalendarEntry {
  student_name: string
  fecha: string
  status: string
  group_name: string
  session_count: number
}

export interface AttendanceCalendarResponse {
  attendance_calendar: AttendanceCalendarEntry[]
  filters_applied: string[]
}

// Performance Charts
export interface GradeDistributionEntry {
  grade_range: string
  status: string
  student_count: number
}

export interface GradeDistributionStatistics {
  total_students: number
  avg_grade: number
  approved_students: number
  approval_rate: number
}

export interface GradeDistributionResponse {
  grade_distribution: GradeDistributionEntry[]
  statistics: GradeDistributionStatistics
  filters_applied: string[]
  scale_info: {
    min_grade: number
    max_grade: number
    passing_grade: number
    description: string
  }
}

export interface ScatterDataPoint {
  student_name: string
  group_name: string
  attendance_rate: number
  avg_grade: number
  academic_status: string
  total_exams: number
  total_sessions: number
  present_count: number
}

export interface AttendanceGradeCorrelationStats {
  approved: number
  failed: number
  approval_rate: number
}

export interface AttendanceGradeCorrelationSummary {
  total_students: number
  avg_attendance: number
  avg_grade: number
  passing_grade: number
}

export interface AttendanceGradeCorrelationResponse {
  scatter_data: ScatterDataPoint[]
  correlation: number
  approval_stats: AttendanceGradeCorrelationStats
  summary: AttendanceGradeCorrelationSummary
  filters_applied: string[]
  scale_info: {
    min_grade: number
    max_grade: number
    passing_grade: number
  }
}

export interface GroupPerformanceMetric {
  group_name: string
  course_name: string
  total_students: number
  avg_final_grade: number | null
  avg_attendance: number | null
  approved_students: number
  failed_students: number
  approval_rate: number
  performance_score: number
  has_data?: boolean
}

export interface GroupPerformanceResponse {
  group_performance: GroupPerformanceMetric[]
  filters_applied: string[]
  scale_info: {
    min_grade: number
    max_grade: number
    passing_grade: number
  }
}

// Tipos para datos de filtros
export interface GroupOption {
  id: number
  name: string
  course_name?: string
}

export interface CourseVersionOption {
  id: number
  name: string
  description?: string
}

// Progress Charts
export interface GradeEvolutionPoint {
  student_name: string
  exam_date: string
  grade: number
  exam_title: string
}

export interface GradeEvolutionResponse {
  grade_evolution: GradeEvolutionPoint[]
}

// Filtros comunes para gráficas
export type ChartFilters = Record<string, string | number> & {
  group_id?: number
  course_version_id?: number
  start_date?: string
  end_date?: string
  user_id?: number
}

// ============================================
// Labels para UI
// ============================================

export const AttendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Presente",
  absent: "Ausente",
  late: "Tardanza",
  excused: "Justificado"
}

export const EnrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  approved: "Aprobado",
  failed: "Reprobado",
  pending: "Pendiente"
}

export const AcademicStatusLabels: Record<AcademicStatus, string> = {
  pending: "Pendiente",
  active: "Activo",
  completed: "Completado",
  failed: "Reprobado",
  dropped: "Retirado"
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  partially_paid: "Parcialmente Pagado",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
  overdue: "Vencido"
}

// ============================================
// Colores para badges
// ============================================

export const AttendanceStatusColors: Record<AttendanceStatus, string> = {
  present: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  absent: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
  late: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  excused: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20"
}

export const EnrollmentStatusColors: Record<EnrollmentStatus, string> = {
  approved: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20"
}

export const AcademicStatusColors: Record<AcademicStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  active: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  failed: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
  dropped: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20"
}

export const PaymentStatusColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  partially_paid: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  refunded: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
  cancelled: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20",
  overdue: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
}