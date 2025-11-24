// src/services/tecnologico/dropout-prediction-service.ts
import { technologyApi } from "./api"
import type { 
  SystemStatusData,
  StudentPrediction,
  PredictionsResponse,
  HighRiskResponse,
  DropoutPredictionFilters,
  DetailedStudentPrediction
} from "@/types/dropout-prediction"

// ============================================
// Validadores
// ============================================

export function validateSystemStatus(data: any): data is SystemStatusData {
  return (
    data &&
    typeof data.model_status === 'string' &&
    typeof data.model_accuracy === 'number' &&
    typeof data.high_risk_students_count === 'number' &&
    typeof data.last_updated === 'string'
  )
}

export function validateStudentPrediction(data: any): data is StudentPrediction {
  return (
    data &&
    typeof data.enrollment_id === 'number' &&
    typeof data.student_name === 'string' &&
    typeof data.dropout_probability === 'number' &&
    typeof data.risk_level === 'string' &&
    typeof data.avg_grade === 'number' &&
    typeof data.attendance_rate === 'number'
  )
}

export function validatePredictionsResponse(data: any): data is PredictionsResponse {
  return (
    data &&
    data.success === true &&
    Array.isArray(data.data?.predictions) &&
    data.data.predictions.every(validateStudentPrediction) &&
    data.data.summary &&
    typeof data.data.summary.total_students === 'number'
  )
}

export function validateHighRiskResponse(data: any): data is HighRiskResponse {
  return (
    data &&
    data.success === true &&
    Array.isArray(data.data?.high_risk_students) &&
    typeof data.data.count === 'number'
  )
}

// ============================================
// Servicios
// ============================================

export class DropoutPredictionService {
  /**
   * Obtiene el estado del sistema
   */
  static async getSystemStatus(): Promise<SystemStatusData> {
    try {
      const response = await technologyApi.dropoutPrediction.systemStatus()
      
      if (!response.success || !response.data) {
        throw new Error('No se pudo obtener el estado del sistema')
      }

      if (!validateSystemStatus(response.data)) {
        throw new Error('Datos del sistema inválidos')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching system status:', error)
      throw new Error('Error al conectar con el servidor')
    }
  }

  /**
   * Obtiene las predicciones de deserción
   */
  static async getPredictions(filters?: DropoutPredictionFilters): Promise<{
    predictions: StudentPrediction[]
    summary: any
  }> {
    try {
      const response = await technologyApi.dropoutPrediction.predictions(filters)
      
      if (!response.success || !response.data) {
        throw new Error('No se pudieron cargar las predicciones')
      }

      if (!validatePredictionsResponse(response)) {
        throw new Error('Datos de predicciones inválidos')
      }

      return {
        predictions: response.data.predictions,
        summary: response.data.summary
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
      throw new Error('Error al cargar las predicciones')
    }
  }

  /**
   * Obtiene predicciones detalladas
   */
  static async getDetailedPredictions(): Promise<{
    students: DetailedStudentPrediction[]
    analysis: any
  }> {
    try {
      const response = await technologyApi.dropoutPrediction.predictionsDetailed()
      
      if (!response.success || !response.data) {
        throw new Error('No se pudieron cargar las predicciones detalladas')
      }

      // Validación básica para detailed predictions
      if (!Array.isArray(response.data.students)) {
        throw new Error('Datos de predicciones detalladas inválidos')
      }

      return {
        students: response.data.students,
        analysis: response.data.analysis
      }
    } catch (error) {
      console.error('Error fetching detailed predictions:', error)
      throw new Error('Error al cargar las predicciones detalladas')
    }
  }

  /**
   * Obtiene estudiantes de alto riesgo
   */
  static async getHighRiskStudents(): Promise<{
    highRiskStudents: any[]
    count: number
  }> {
    try {
      const response = await technologyApi.dropoutPrediction.highRisk()
      
      if (!response.success || !response.data) {
        throw new Error('No se pudieron cargar los estudiantes de alto riesgo')
      }

      if (!validateHighRiskResponse(response)) {
        throw new Error('Datos de alto riesgo inválidos')
      }

      return {
        highRiskStudents: response.data.high_risk_students,
        count: response.data.count
      }
    } catch (error) {
      console.error('Error fetching high risk students:', error)
      throw new Error('Error al cargar los estudiantes de alto riesgo')
    }
  }

  /**
   * Obtiene predicciones por grupo
   */
  static async getPredictionsByGroup(groupId: number): Promise<{
    predictions: StudentPrediction[]
    summary: any
  }> {
    try {
      const response = await technologyApi.dropoutPrediction.predictionsByGroup(groupId)
      
      if (!response.success || !response.data) {
        throw new Error(`No se pudieron cargar las predicciones del grupo ${groupId}`)
      }

      if (!validatePredictionsResponse(response)) {
        throw new Error('Datos de predicciones por grupo inválidos')
      }

      return {
        predictions: response.data.predictions,
        summary: response.data.summary
      }
    } catch (error) {
      console.error('Error fetching group predictions:', error)
      throw new Error('Error al cargar las predicciones del grupo')
    }
  }
}