// Developer Web Module Types

// ============================================
// Enums y Types
// ============================================

export type NewsStatus = "draft" | "published" | "archived" | "scheduled"
export type AnnouncementStatus = "active" | "inactive"
export type AlertStatus = "active" | "inactive"
export type NewsItemType = "article" | "update" | "feature"
export type AnnouncementItemType = "popup" | "banner" | "modal" | "notification"
export type AlertItemType = "information" | "warning" | "success" | "error" | "maintenance"
export type FAQCategoryValue = "general" | "academico" | "tecnico" | "pagos" | "soporte"

// ============================================
// Interfaces - Base
// ============================================

export interface BaseContent {
  id: number
  title: string
  content: string
  views_count: number
  created_at: string
  updated_at: string
  author_id?: number
  author?: {
    id: number
    name: string
    email: string
  }
}

// ============================================
// Interfaces - News
// ============================================

export interface News extends BaseContent {
  summary: string
  image_url?: string
  slug?: string
  item_type: NewsItemType
  status: NewsStatus
  category: string
  seo_title?: string
  seo_description?: string
  tags?: string[]
  published_date?: string
  views: number // ← Cambiar de views_count a views
}

export interface NewsCategory {
  id: number
  key: string  // ← Agregar este campo
  name: string
  slug: string
  description?: string
  news_count?: number
}

export interface NewsStats {
  total: number
  published: number
  total_views: number
  status_counts: { // ← Agregar este campo
    draft: number
    published: number
    archived: number
    scheduled: number
  }
  categories_count: number
  recent_published: number
  most_viewed: {
    title: string
    views: number
  }
}

// ============================================
// Interfaces - Announcements
// ============================================

export interface Announcement extends BaseContent {
  image_url?: string
  item_type: AnnouncementItemType
  status: AnnouncementStatus // Usar AnnouncementStatus específico
  start_date: string
  end_date: string
  target_page?: string
  link_url?: string
  button_text?: string
  priority: number
  views: number 
}

export interface AnnouncementStats {
  total: number
  published: number
  total_views: number
  status_counts: Record<string, number>
  active_now: number
  high_priority: number
  by_type: Record<AnnouncementItemType, number>
}

// ============================================
// Interfaces - Alerts
// ============================================

export interface Alert extends BaseContent {
  item_type: AlertItemType
  status: AlertStatus // Usar AlertStatus específico
  start_date: string
  end_date: string
  link_url?: string
  link_text?: string
  priority: number
}

export interface AlertStats {
  total: number
  published: number
  status_counts: Record<string, number>
  active_now: number
  high_priority: number
  by_type: Record<AlertItemType, number>
  expiring_soon: number
}

// ============================================
// Interfaces - Chatbot
// ============================================

export interface ChatbotConfig {
  enabled: boolean
  greeting_message: string
  fallback_message: string
  response_delay: number
  max_conversations_per_day: number
  contact_threshold: number
  updated_at: string
}

export interface ChatbotAnalytics {
  total: number
  active: number
  resolved: number
  resolved_rate: number
  avg_satisfaction: number
  handed_to_human: number
  // Nuevos campos
  faqs_by_category?: Array<{
    category: string
    count: number
  }>
  most_used_faqs?: Array<{
    id: number
    question: string
    usage_count: number
  }>
  conversations_by_day?: Array<{
    date: string
    count: number
  }>
}

export interface ConversationStats {
  date: string
  count: number
}

export interface ChatbotConversation {
  id: number
  user_id?: number
  status: 'active' | 'ended' | 'resolved'
  messages: ChatbotMessage[]
  started_at: string
  ended_at?: string
  feedback_rating?: number
  feedback_comment?: string
  feedback_resolved?: boolean
}

export interface ChatbotMessage {
  id: number
  conversation_id: number
  type: 'user' | 'bot'
  content: string
  source?: 'faq' | 'gemini' | 'fallback'
  faq_id?: number
  timestamp: string
}

// ============================================
// Interfaces - FAQs
// ============================================

export interface FAQ {
  id: number
  question: string
  answer: string
  category: FAQCategoryValue  // Cambiado de category_id a category
  keywords?: string[]
  active: boolean  // Cambiado de is_published a active
  usage_count?: number  // Nuevo campo
  helpful_count: number
  not_helpful_count: number
  created_at: string
  updated_at: string
}

export interface FAQCategory {
  value: FAQCategoryValue
  name: string
  color: string
}

export interface FAQStats {
  total: number
  active: number  // Cambiado de published
  total_views: number
  average_views: number
  by_category: Array<{
    category: FAQCategoryValue
    count: number
    views: number
  }>
  total_helpful: number
  total_not_helpful: number
  helpful_rate: number
}

// ============================================
// Interfaces - Dashboard
// ============================================

export interface WebDashboardData {
  news: {
    total: number
    published: number
    total_views: number
  }
  announcements: {
    total: number
    published: number
    total_views: number
  }
  alerts: {
    total: number
    published: number
  }
  total_content: number
  total_published: number
  total_views: number
}

// ============================================
// Labels para UI
// ============================================

export const NewsStatusLabels: Record<NewsStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
  scheduled: "Programado",
}

export const AnnouncementStatusLabels: Record<AnnouncementStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
}

export const AlertStatusLabels: Record<AlertStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
}

export const NewsItemTypeLabels: Record<NewsItemType, string> = {
  article: "Artículo",
  update: "Actualización",
  feature: "Característica",
}

export const AnnouncementItemTypeLabels: Record<AnnouncementItemType, string> = {
  popup: "Popup",
  banner: "Banner",
  modal: "Modal",
  notification: "Notificación",
}

export const AlertItemTypeLabels: Record<AlertItemType, string> = {
  information: "Información",
  warning: "Advertencia",
  success: "Éxito",
  error: "Error",
  maintenance: "Mantenimiento",
}

export const FAQCategoryLabels: Record<FAQCategoryValue, string> = {
  general: "General",
  academico: "Académico",
  tecnico: "Técnico",
  pagos: "Pagos y Facturación",
  soporte: "Soporte Técnico",
}

export const FAQStatusLabels: Record<'active' | 'inactive', string> = {
  active: "Activa",
  inactive: "Inactiva",
}

export const ChatbotSourceLabels: Record<'faq' | 'gemini' | 'fallback', string> = {
  faq: "FAQ",
  gemini: "IA",
  fallback: "Reserva",
}

export const ConversationStatusLabels: Record<'active' | 'ended' | 'resolved', string> = {
  active: "Activa",
  ended: "Finalizada",
  resolved: "Resuelta",
}

// ============================================
// Colores para badges (usando shadcn/ui colors)
// ============================================

export const NewsStatusColors: Record<NewsStatus, string> = {
  draft: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  published: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  archived: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20",
  scheduled: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
}

export const AnnouncementStatusColors: Record<AnnouncementStatus, string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20",
}

export const AlertStatusColors: Record<AlertStatus, string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20",
}

export const NewsItemTypeColors: Record<NewsItemType, string> = {
  article: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  update: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  feature: "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20",
}

export const AnnouncementItemTypeColors: Record<AnnouncementItemType, string> = {
  popup: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
  banner: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  modal: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
  notification: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
}

export const AlertItemTypeColors: Record<AlertItemType, string> = {
  information: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  success: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  error: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
  maintenance: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
}

export const FAQCategoryColors: Record<FAQCategoryValue, string> = {
  general: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  academico: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  tecnico: "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20",
  pagos: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
  soporte: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
}

export const FAQStatusColors: Record<'active' | 'inactive', string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20",
}

export const ChatbotSourceColors: Record<'faq' | 'gemini' | 'fallback', string> = {
  faq: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  gemini: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  fallback: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20",
}

export const ConversationStatusColors: Record<'active' | 'ended' | 'resolved', string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  ended: "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20",
  resolved: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
}

// ============================================
// Iconos sugeridos (para uso con Lucide o Tabler)
// ============================================

export const ContentTypeIcons: Record<string, string> = {
  news: "Newspaper",
  announcements: "Megaphone",
  alerts: "AlertTriangle",
  faqs: "MessageCircle",
}