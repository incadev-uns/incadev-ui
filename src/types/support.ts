/**
 * @description Tipos TypeScript para el módulo de soporte técnico
 */

// Tipos de ticket
export type TicketType = "technical" | "academic" | "administrative" | "inquiry"

// Estados de ticket
export type TicketStatus = "open" | "pending" | "closed"

// Prioridades de ticket
export type TicketPriority = "low" | "medium" | "high" | "urgent"

// Tipo de archivo adjunto
export type AttachmentType = "image" | "document" | "other"

// Usuario básico
export interface User {
  id: number
  name: string
  email?: string
}

// Archivo adjunto
export interface Attachment {
  id: number
  type: AttachmentType
  path: string
  url: string
  created_at: string
  file_name?: string
  file_size?: number
}

// Respuesta a ticket
export interface TicketReply {
  id: number
  ticket_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  user: User
  attachments: Attachment[]
  attachments_count?: number
  is_editable?: boolean
}

// Ticket completo
export interface Ticket {
  id: number
  user_id: number
  title: string
  type: TicketType | null
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
  user: User
  replies?: TicketReply[]
  replies_count?: number
  last_reply?: {
    id: number
    content: string
    created_at: string
    user: User
  }
}

// Datos para crear ticket
export interface CreateTicketData {
  title: string
  type?: TicketType
  priority: TicketPriority
  content: string
}

// Datos para actualizar ticket
export interface UpdateTicketData {
  title?: string
  type?: TicketType
  status?: TicketStatus
  priority?: TicketPriority
}

// Datos para crear respuesta
export interface CreateReplyData {
  content: string
  attachments?: File[]
}

// Parámetros de filtro para listar tickets
export interface TicketFilters {
  page?: number
  per_page?: number
  status?: TicketStatus
  priority?: TicketPriority
  type?: TicketType
  search?: string
  sort_by?: "created_at" | "updated_at" | "priority"
  sort_order?: "asc" | "desc"
}

// Metadatos de paginación
export interface PaginationMeta {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
  links?: {
    next?: string
    prev?: string
  }
}

// Respuesta de lista de tickets
export interface TicketsListResponse {
  tickets: Ticket[]
  pagination: PaginationMeta
}

// Estadísticas de soporte
export interface SupportStatistics {
  total_tickets: number
  open_tickets: number
  pending_tickets: number
  closed_tickets: number
  by_priority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  by_type: {
    technical: number
    academic: number
    administrative: number
    inquiry: number
  }
  average_response_time?: string
  average_resolution_time?: string
  tickets_created_today?: number
  tickets_resolved_today?: number
}

// Respuesta de estadísticas
export interface StatisticsResponse {
  statistics: SupportStatistics
}

// Respuesta genérica de API
export interface ApiResponse<T = any> {
  status: "success" | "error"
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

// Labels y traducciones
export const TicketTypeLabels: Record<TicketType, string> = {
  technical: "Técnico",
  academic: "Académico",
  administrative: "Administrativo",
  inquiry: "Consulta",
}

export const TicketStatusLabels: Record<TicketStatus, string> = {
  open: "Abierto",
  pending: "Pendiente",
  closed: "Cerrado",
}

export const TicketPriorityLabels: Record<TicketPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
}

// Colores para badges
export const TicketStatusColors: Record<TicketStatus, string> = {
  open: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
}

export const TicketPriorityColors: Record<TicketPriority, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
}

export const TicketTypeColors: Record<TicketType, string> = {
  technical: "bg-purple-100 text-purple-800 border-purple-200",
  academic: "bg-indigo-100 text-indigo-800 border-indigo-200",
  administrative: "bg-pink-100 text-pink-800 border-pink-200",
  inquiry: "bg-cyan-100 text-cyan-800 border-cyan-200",
}
