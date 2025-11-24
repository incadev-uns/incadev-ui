// ============================================
// STUDENTS
// ============================================

export interface StudentProfile {
    id: number;
    user_id: string;
    interests: string[];
    learning_goal: string;
    created_at: string;
    updated_at: string;
}

export interface StudentFromAPI {
    id: number;
    name: string;
    dni: string;
    fullname: string;
    avatar: string | null;
    phone: string | null;
    email: string;
    created_at: string;
    updated_at: string;
    student_profile: StudentProfile;
}

export interface StudentForUI {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    avatar: string | null;
    dni: string;
    estado: 'lead' | 'preinscrito' | 'inscrito' | 'cursando' | 'graduado' | 'desertor';
    curso: string;
    fechaRegistro: string;
    origen: string;
    ltv: number;
    cursosCompletados: number;
    engagementScore: number;
    ultimaInteraccion: string;
    interests: string[];
    learningGoal: string;
}

// ============================================
// PROPOSALS
// ============================================

export interface ProposalFromAPI {
    id: number;
    title: string;
    description: string;
    area: string;
    priority: 'alto' | 'medio' | 'bajo';
    status: 'borrador' | 'activa' | 'pausada' | 'aprobada' | 'rechazada';
    target_audience: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface ProposalForUI {
    id: number;
    tema: string;
    descripcion: string;
    departamento: string;
    prioridad: 'alta' | 'media' | 'baja';
    estado: 'borrador' | 'activa' | 'pausada' | 'aprobada' | 'rechazada';
    publico: string[];
    creadoPor: number;
    fecha: string;
    actualizado: string;
}

export interface CreateProposalDTO {
    title: string;
    description: string;
    area: string;
    priority: 'alto' | 'medio' | 'bajo';
    target_audience: string;
}

export interface UpdateProposalDTO {
    title?: string;
    description?: string;
    area?: string;
    priority?: 'alto' | 'medio' | 'bajo';
    status?: 'borrador' | 'activa' | 'pausada' | 'aprobada' | 'rechazada';
    target_audience?: string;
}

// ============================================
// COURSES
// ============================================

export interface CourseFromAPI {
    id: number;
    name: string;
    description: string | null;
    image_path: string | null;
    created_at: string;
    updated_at: string;
}

export interface CourseForUI {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string | null;
    fechaCreacion: string;
    fechaActualizacion: string;
}

// ============================================
// COURSE VERSIONS
// ============================================

export interface CourseVersionFromAPI {
    id: number;
    course_id: number;
    version: string | null;
    name: string;
    price: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
    course: CourseFromAPI;
}

export interface CourseVersionForUI {
    id: number;
    cursoId: number;
    cursoNombre: string;
    cursoDescripcion: string;
    cursoImagen: string | null;
    nombre: string;
    version: string;
    precio: number;
    estado: 'draft' | 'published' | 'archived';
    fechaCreacion: string;
    fechaActualizacion: string;
}

// ============================================
// CAMPAIGNS
// ============================================

export interface CampaignFromAPI {
    id: number;
    proposal_id: number | null;
    course_version_id: number | null;
    name: string;
    objective: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
    proposal?: ProposalFromAPI;
    course_version?: CourseVersionFromAPI;
}

export interface CampaignForUI {
    id: number;
    proposalId: number | null;
    courseVersionId: number | null;
    nombre: string;
    objetivo: string;
    inicio: string;
    fin: string;
    estado: 'proxima' | 'activa' | 'finalizada';
    fechaCreacion: string;
    fechaActualizacion: string;
    tipo: 'propuesta' | 'curso';
    propuestaTitulo?: string;
    cursoVersionNombre?: string;
}

export interface CreateCampaignDTO {
    name: string;
    objective: string;
    proposal_id?: number;
    course_version_id?: number;
    start_date: string;
    end_date: string;
}

export interface UpdateCampaignDTO {
    name?: string;
    objective?: string;
    start_date?: string;
    end_date?: string;
}

// ============================================
// POSTS
// ============================================

export interface PostFromAPI {
    id: number;
    campaign_id: number;
    title: string;
    platform: string;
    content: string;
    content_type: 'image' | 'video' | 'text';
    image_path: string | null;
    link_url: string;
    status: 'draft' | 'scheduled' | 'published';
    scheduled_at: string | null;
    published_at: string | null;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface PostForUI {
    id: number;
    campaignId: number;
    titulo: string;
    plataforma: string;
    contenido: string;
    tipo: 'image' | 'video' | 'text';
    imagen: string | null;
    enlace: string;
    estado: 'draft' | 'scheduled' | 'published';
    programadoPara: string | null;
    publicadoEn: string | null;
    creadoPor: number;
    fechaCreacion: string;
}

export interface CreatePostDTO {
    campaign_id: number;
    title: string;
    platform: 'facebook' | 'instagram';
    content: string;
    content_type: 'image' | 'video' | 'text';
    image_path: string;
    image_url?: string | null;
    link_url: string;
    status: 'draft' | 'scheduled' | 'published';
    scheduled_at: string | null;
    published_at: string | null;
    created_by: number;
}

export interface UpdatePostDTO {
    title?: string;
    platform?: 'facebook' | 'instagram';
    content?: string;
    content_type?: 'image' | 'video' | 'text';
    image_path?: string;
    image_url?: string | null;
    link_url?: string;
    status?: 'draft' | 'scheduled' | 'published';
    scheduled_at?: string | null;
    published_at?: string | null;
}

// ============================================
// POST METRICS (NUEVO SISTEMA)
// ============================================

export interface MetricFromAPI {
    id: number;
    post_id: number;
    platform: 'facebook' | 'instagram';
    meta_post_id: string | null;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
    reach: number;
    impressions: number;
    saves: number;
    metric_date: string;
    metric_type: 'daily' | 'weekly' | 'monthly' | 'cumulative';
    created_at: string | null;
    updated_at: string | null;
}

export interface MetricForUI {
    id: number;
    postId: number;
    plataforma: 'facebook' | 'instagram';
    metaPostId: string | null;
    vistas: number;
    likes: number;
    comentarios: number;
    compartidos: number;
    engagement: number;
    alcance: number;
    impresiones: number;
    guardados: number;
    fecha: string;
    tipo: 'daily' | 'weekly' | 'monthly' | 'cumulative';
}

export interface PostMetricsResponseFromAPI {
    success: boolean;
    post_id: number;
    post_title: string;
    platform: string;
    metrics: MetricFromAPI[];
}

export interface PostMetricsForUI {
    postId: number;
    postTitle: string;
    platform: string;
    metricas: MetricForUI[];
    // Totales agregados (suma de todas las plataformas)
    totales: {
        vistas: number;
        likes: number;
        comentarios: number;
        compartidos: number;
        engagement: number;
        alcance: number;
        impresiones: number;
        guardados: number;
    };
}

// ============================================
// CAMPAIGN METRICS (ACTUALIZADO)
// ============================================

export interface CampaignMetricsFromAPI {
    campaign_id: number;
    campaign_name: string;
    metrics_summary: {
        total_reach: number;
        total_interactions: number;
        total_likes: number;
        total_comments: number;
        // Campos obsoletos (mantenemos por compatibilidad con respuestas viejas)
        total_messages_received?: number;
        total_pre_registrations?: number;
        average_intention_percentage?: number;
        average_ctr_percentage?: number;
        total_private_messages?: number;
        expected_enrollments?: number;
        average_cpa_cost?: number;
    };
    posts_metrics: Array<{
        post_id: number;
        platform: string;
        total_reach: number;
        total_interactions: number;
        likes: number;
        comments: number;
        // Campos obsoletos
        messages_received?: number;
        pre_registrations?: number;
        intention_percentage?: number;
        ctr_percentage?: number;
        private_messages?: number;
        expected_enrollments?: number;
        cpa_cost?: number;
    }>;
}

export interface CampaignMetricsForUI {
    campaignId: number;
    campaignName: string;
    totalReach: number;
    totalInteractions: number;
    totalLikes: number;
    totalComments: number;
    postMetrics: {
        postId: number;
        platform: string;
        reach: number;
        interactions: number;
        likes: number;
        comments: number;
    }[];
}

// ============================================
// COURSE DETAIL
// ============================================

export interface CourseDetailFromAPI {
    id: number;
    name: string;
    description: string | null;
    image_path: string | null;
    created_at: string;
    updated_at: string;
    versions: CourseVersionFromAPI[];
}

export interface CourseDetailForUI {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string | null;
    fechaCreacion: string;
    fechaActualizacion: string;
    versiones: CourseVersionForUI[];
}

// ============================================
// COURSE CAMPAIGNS (campañas relacionadas a un curso)
// ============================================

export interface CampaignWithMetricsFromAPI {
    id: number;
    name: string;
    objective: string;
    start_date: string;
    end_date: string;
    proposal_id: number | null;
    course_version_id: number | null;
    course_version: CourseVersionFromAPI | null;
    proposal: ProposalFromAPI | null;
    created_at: string;
    updated_at: string;
    metrics: {
        total_posts: number;
        total_reach: number;
        total_interactions: number;
        total_pre_registrations: number;
        average_ctr: number;
    };
}

export interface CourseCampaignsFromAPI {
    course: {
        id: number;
        name: string;
        description: string | null;
    };
    total_versions: number;
    total_campaigns: number;
    campaigns: CampaignWithMetricsFromAPI[];
}

export interface CampaignWithMetricsForUI {
    id: number;
    nombre: string;
    objetivo: string;
    inicio: string;
    fin: string;
    proposalId: number | null;
    courseVersionId: number | null;
    versionNombre: string | null;
    estado: 'activa' | 'finalizada';
    fechaCreacion: string;
    metricas: {
        totalPosts: number;
        totalReach: number;
        totalInteractions: number;
        totalPreRegistrations: number;
        averageCtr: number;
    };
}

export interface CourseCampaignsForUI {
    curso: {
        id: number;
        nombre: string;
        descripcion: string;
    };
    totalVersiones: number;
    totalCampañas: number;
    campañas: CampaignWithMetricsForUI[];
}