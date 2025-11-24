// Security Module Types

// ============================================
// Enums y Types
// ============================================

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "logout"
  | "token_created"
  | "token_revoked"
  | "session_terminated"
  | "password_reset_requested"
  | "password_changed"
  | "suspicious_activity"
  | "anomaly_detected"

export type SecurityEventSeverity = "info" | "warning" | "critical"

// ============================================
// Interfaces - Sesiones
// ============================================

export interface Session {
  id: number
  ip_address: string | null
  device: string | null
  last_activity_human: string
  is_active: boolean
  is_current: boolean
  created_at: string
  last_used_at: string | null
}

export interface UserSession {
  user_id: number
  user_name: string
  user_email: string
  total_sessions: number
  unique_ips: number
  sessions: Session[]
}

export interface SessionsSummary {
  total_active: number
  unique_ips: number
  has_suspicious: boolean
  suspicious_count: number
  total_inactive?: number
}

export interface SuspiciousSessionGroup {
  user_id: number
  user_name: string
  user_email: string
  sessions: Session[]
}

// ============================================
// Interfaces - Eventos de Seguridad
// ============================================

export interface SecurityEvent {
  id: number
  user_id: number
  event_type: SecurityEventType
  severity: SecurityEventSeverity
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any> | null
  created_at: string
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface SecurityEventStatistics {
  total_events: number
  critical_count: number
  warning_count: number
  info_count: number
  by_type: Record<SecurityEventType, number>
  by_severity: {
    info: number
    warning: number
    critical: number
  }
  events_per_day?: Array<{
    date: string
    count: number
  }>
}

// ============================================
// Interfaces - Dashboard
// ============================================

export interface SecurityDashboardData {
  user: {
    id: number
    name: string
    email: string
    has_2fa: boolean
    has_recovery_email: boolean
    recovery_email_verified: boolean
  }
  sessions: SessionsSummary
  tokens?: {
    total_active: number
    total_inactive: number
  }
  events: {
    total_last_30_days: number
    critical_count: number
    warning_count: number
    recent_critical: SecurityEvent[]
  }
  alerts: {
    has_suspicious_sessions: boolean
    has_inactive_tokens: boolean
    has_critical_events: boolean
  }
}

// ============================================
// Labels para UI
// ============================================

export const SecurityEventTypeLabels: Record<SecurityEventType, string> = {
  login_success: "Login Exitoso",
  login_failed: "Login Fallido",
  logout: "Logout",
  token_created: "Token Creado",
  token_revoked: "Token Revocado",
  session_terminated: "Sesión Terminada",
  password_reset_requested: "Solicitud de Reset de Contraseña",
  password_changed: "Contraseña Cambiada",
  suspicious_activity: "Actividad Sospechosa",
  anomaly_detected: "Anomalía Detectada",
}

export const SecurityEventSeverityLabels: Record<SecurityEventSeverity, string> = {
  info: "Información",
  warning: "Advertencia",
  critical: "Crítico",
}

// ============================================
// Colores para badges (usando shadcn/ui colors)
// ============================================

export const SecurityEventSeverityColors: Record<SecurityEventSeverity, string> = {
  info: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

export const SecurityEventTypeColors: Record<SecurityEventType, string> = {
  login_success: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
  login_failed: "bg-destructive/10 text-destructive border-destructive/20",
  logout: "bg-muted text-muted-foreground border-border",
  token_created: "bg-primary/10 text-primary border-primary/20",
  token_revoked: "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20",
  session_terminated: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
  password_reset_requested: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  password_changed: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 border-indigo-500/20",
  suspicious_activity: "bg-destructive/10 text-destructive border-destructive/20",
  anomaly_detected: "bg-destructive/10 text-destructive border-destructive/20",
}

// ============================================
// Iconos sugeridos (para uso con Lucide o Tabler)
// ============================================

export const SecurityEventTypeIcons: Record<SecurityEventType, string> = {
  login_success: "CheckCircle",
  login_failed: "XCircle",
  logout: "LogOut",
  token_created: "Key",
  token_revoked: "KeyOff",
  session_terminated: "UserX",
  password_reset_requested: "MailWarning",
  password_changed: "Lock",
  suspicious_activity: "AlertTriangle",
  anomaly_detected: "ShieldAlert",
}
