// app/auditoria/types/audit.ts
export interface Audit {
    id: number
    audit_date: string
    summary: string
    auditable_type: string
    auditable_id: number
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    recommendation?: string
    path_report?: string
    auditor_id: number
    findings_count?: number
    created_at: string
    updated_at: string

    // Relations
    findings?: AuditFinding[]
    auditor?: {
        id: number
        name: string
        email: string
    }
    auditable?: {
        id: number
        name: string
        code?: string
    }
}

export interface AuditFinding {
    id: number
    audit_id: number
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'open' | 'in_progress' | 'resolved' | 'wont_fix'
    created_at: string
    updated_at: string

    // Relations
    evidences?: FindingEvidence[]
    actions?: AuditAction[]
}

export interface FindingEvidence {
    id: number
    audit_finding_id: number
    path: string
    type: 'image' | 'video' | 'document' | 'audio' | 'other'
    created_at: string
    url?: string
}

export interface AuditAction {
    id: number
    audit_finding_id: number
    responsible_id: number
    action_required: string
    due_date: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    created_at: string
    updated_at: string

    // Relations
    responsible?: {
        id: number
        name: string
        email: string
    }
}

export interface AuditFormData {
    audit_date: string
    summary: string
    auditable_type: string
    auditable_id: number
}

export interface AuditFilters {
    search: string
    status: string
    date_from: string
    date_to: string
}

export interface AuditMeta {
    current_page: number
    from: number
    to: number
    per_page: number
    total: number
    last_page: number
}

export interface AuditLinks {
    first: string
    last: string
    prev: string | null
    next: string | null
}

export interface AuditResponse {
    data: Audit[]
    meta: AuditMeta
    links: AuditLinks
}