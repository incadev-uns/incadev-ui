import { authenticatedFetch } from './authService';
import { config as marketingConfig } from '../../config/marketing-config';
import type {
    CampaignFromAPI,
    CampaignForUI,
    CreateCampaignDTO,
    UpdateCampaignDTO,
    CampaignMetricsFromAPI,
    CampaignMetricsForUI,
    PostFromAPI,
    PostForUI
} from './types';

// ============================================
// HELPERS
// ============================================

/**
 * Calcula el estado de una campaña basado en su fecha de fin
 */
function calcularEstadoCampaign(startDate: string, endDate: string): 'proxima' | 'activa' | 'finalizada' {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicio = new Date(startDate);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(endDate);
    fin.setHours(0, 0, 0, 0);

    if (hoy < inicio) return 'proxima';
    if (hoy > fin) return 'finalizada';
    return 'activa';
}

// ============================================
// MAPPERS
// ============================================

/**
 * Mapea los datos de campaña de la API a la estructura que necesita la UI
 */
function mapCampaignFromAPI(apiCampaign: CampaignFromAPI): CampaignForUI {
    return {
        id: apiCampaign.id,
        proposalId: apiCampaign.proposal_id,
        courseVersionId: apiCampaign.course_version_id,
        nombre: apiCampaign.name,
        objetivo: apiCampaign.objective,
        inicio: apiCampaign.start_date,
        fin: apiCampaign.end_date,
        estado: calcularEstadoCampaign(apiCampaign.start_date, apiCampaign.end_date),
        fechaCreacion: apiCampaign.created_at,
        fechaActualizacion: apiCampaign.updated_at,
        tipo: apiCampaign.proposal_id ? 'propuesta' : 'curso',
        propuestaTitulo: apiCampaign.proposal?.title,
        cursoVersionNombre: apiCampaign.course_version?.name
    };
}

/**
 * Mapea las métricas de campaña de la API a la estructura que necesita la UI
 */
/**
 * Mapea las métricas de campaña de la API a la estructura que necesita la UI
 */
function mapCampaignMetricsFromAPI(apiMetrics: CampaignMetricsFromAPI): CampaignMetricsForUI {
    return {
        campaignId: apiMetrics.campaign_id,
        campaignName: apiMetrics.campaign_name,
        totalReach: apiMetrics.metrics_summary.total_reach,
        totalInteractions: apiMetrics.metrics_summary.total_interactions,
        totalLikes: apiMetrics.metrics_summary.total_likes,
        totalComments: apiMetrics.metrics_summary.total_comments,
        postMetrics: apiMetrics.posts_metrics.map(pm => ({
            postId: pm.post_id,
            platform: pm.platform,
            reach: pm.total_reach,
            interactions: pm.total_interactions,
            likes: pm.likes,
            comments: pm.comments
        }))
    };
}

/**
 * Mapea los datos de post de la API a la estructura que necesita la UI
 */
function mapPostFromAPI(apiPost: PostFromAPI): PostForUI {
    return {
        id: apiPost.id,
        campaignId: apiPost.campaign_id,
        titulo: apiPost.title,
        plataforma: apiPost.platform,
        contenido: apiPost.content,
        tipo: apiPost.content_type,
        imagen: apiPost.image_path,
        metaPostId: apiPost.meta_post_id ?? null,
        enlace: apiPost.link_url,
        estado: apiPost.status,
        programadoPara: apiPost.scheduled_at,
        publicadoEn: apiPost.published_at,
        creadoPor: apiPost.created_by,
        fechaCreacion: apiPost.created_at
    };
}

// ============================================
// API FUNCTIONS - CAMPAIGNS
// ============================================

/**
 * Obtener todas las campañas de una propuesta
 */
export async function fetchCampaignsByProposal(proposalId: number): Promise<CampaignForUI[]> {
    try {
        const endpoint = `${marketingConfig.endpoints.campaigns.list}?proposal_id=${proposalId}`;
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[campaignService] Fetching campaigns for proposal:', proposalId);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CampaignFromAPI[] = await response.json();
        console.log('[campaignService] Campaigns fetched:', data.length);

        return data.map(mapCampaignFromAPI);
    } catch (error) {
        console.error('[campaignService] Error fetching campaigns:', error);
        throw error;
    }
}

/**
 * Obtener una campaña por ID
 */
export async function fetchCampaignById(id: number): Promise<CampaignForUI> {
    try {
        const endpoint = marketingConfig.endpoints.campaigns.detail.replace(':id', String(id));
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[campaignService] Fetching campaign by ID:', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CampaignFromAPI = await response.json();
        return mapCampaignFromAPI(data);
    } catch (error) {
        console.error('[campaignService] Error fetching campaign:', error);
        throw error;
    }
}

/**
 * Crear nueva campaña
 */
export async function createCampaign(campaign: CreateCampaignDTO): Promise<CampaignForUI> {
    try {
        const endpoint = marketingConfig.endpoints.campaigns.create;
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[campaignService] Creating campaign:', url);

        const response = await authenticatedFetch(url, {
            method: 'POST',
            body: JSON.stringify(campaign)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CampaignFromAPI = await response.json();
        console.log('[campaignService] Campaign created:', data.id);

        return mapCampaignFromAPI(data);
    } catch (error) {
        console.error('[campaignService] Error creating campaign:', error);
        throw error;
    }
}

/**
 * Actualizar campaña
 */
export async function updateCampaign(id: number, updates: UpdateCampaignDTO): Promise<CampaignForUI> {
    try {
        const endpoint = marketingConfig.endpoints.campaigns.update.replace(':id', String(id));
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[campaignService] Updating campaign:', url);

        const response = await authenticatedFetch(url, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CampaignFromAPI = await response.json();
        console.log('[campaignService] Campaign updated:', data.id);

        return mapCampaignFromAPI(data);
    } catch (error) {
        console.error('[campaignService] Error updating campaign:', error);
        throw error;
    }
}

/**
 * Eliminar campaña
 */
export async function deleteCampaign(id: number): Promise<void> {
    try {
        const endpoint = marketingConfig.endpoints.campaigns.delete.replace(':id', String(id));
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[campaignService] Deleting campaign:', url);

        const response = await authenticatedFetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('[campaignService] Campaign deleted:', id);
    } catch (error) {
        console.error('[campaignService] Error deleting campaign:', error);
        throw error;
    }
}

export async function fetchAllCampaigns(): Promise<CampaignForUI[]> {
    try {
        const endpoint = marketingConfig.endpoints.campaigns.list;
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[campaignService] Fetching all campaigns');

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CampaignFromAPI[] = await response.json();
        console.log('[campaignService] All campaigns fetched:', data.length);

        return data.map(mapCampaignFromAPI);
    } catch (error) {
        console.error('[campaignService] Error fetching all campaigns:', error);
        throw error;
    }
}

// ============================================
// API FUNCTIONS - METRICS
// ============================================

/**
 * Obtener métricas de una campaña
 */
export async function fetchCampaignMetrics(campaignId: number): Promise<CampaignMetricsForUI> {
    try {
        // Use metrics microservice for metrics data (reads DB in metricsapi)
        const endpoint = `/v1/marketing/metrics/campaign/${campaignId}`;
        const url = `${marketingConfig.metricsApiUrl}${endpoint}`;

        console.log('[campaignService] Fetching metrics for campaign (metricsapi):', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // metricsapi returns an array of Metric rows for the campaign (or 404 if none)
        const rows: Array<any> = await response.json();
        console.log('[campaignService] Metric rows fetched for campaign:', rows.length);

        // Aggregate summary totals and build per-post metrics
        const summary = {
            campaign_id: campaignId,
            campaign_name: '',
            metrics_summary: {
                total_reach: 0,
                total_interactions: 0,
                total_likes: 0,
                total_comments: 0,
            },
            posts_metrics: [] as any[],
        };

        const perPost: Record<number, any> = {};
        for (const r of rows) {
            const pid = r.post_id;
            if (!perPost[pid]) {
                perPost[pid] = { post_id: pid, platform: r.platform, total_reach: 0, total_interactions: 0, likes: 0, comments: 0 };
            }
            perPost[pid].total_reach += (r.reach || 0) + (r.impressions || 0);
            perPost[pid].likes += (r.likes || 0);
            perPost[pid].comments += (r.comments || 0);
            perPost[pid].total_interactions += ((r.likes || 0) + (r.comments || 0) + (r.shares || 0));

            summary.metrics_summary.total_reach += (r.reach || 0) + (r.impressions || 0);
            summary.metrics_summary.total_likes += (r.likes || 0);
            summary.metrics_summary.total_comments += (r.comments || 0);
            summary.metrics_summary.total_interactions += ((r.likes || 0) + (r.comments || 0) + (r.shares || 0));
        }

        summary.posts_metrics = Object.values(perPost);

        return mapCampaignMetricsFromAPI(summary as any);
    } catch (error) {
        console.error('[campaignService] Error fetching campaign metrics:', error);
        throw error;
    }
}

// ============================================
// API FUNCTIONS - POSTS
// ============================================

/**
 * Obtener posts de una campaña
 */
export async function fetchCampaignPosts(campaignId: number): Promise<PostForUI[]> {
    try {
        const endpoint = marketingConfig.endpoints.campaigns.posts.replace(':id', String(campaignId));
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[campaignService] Fetching posts for campaign:', campaignId);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PostFromAPI[] = await response.json();
        console.log('[campaignService] Posts fetched:', data.length);

        return data.map(mapPostFromAPI);
    } catch (error) {
        console.error('[campaignService] Error fetching campaign posts:', error);
        throw error;
    }
}

// ============================================
// API FUNCTIONS - GLOBAL METRICS
// ============================================

/**
 * Obtener métricas globales de todas las campañas
 */
export async function fetchGlobalMetrics(): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalPosts: number;
    publishedPosts: number;
    totalReach: number;
    totalImpressions: number;
    totalViews: number;
    totalEngagement: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalSaves: number;
}> {
    try {
        console.log('[campaignService] Fetching global metrics');

        // Obtener todas las campañas
        const campaigns = await fetchAllCampaigns();

        // Inicializar totales
        let totalReach = 0;
        let totalImpressions = 0;
        let totalViews = 0;
        let totalEngagement = 0;
        let totalLikes = 0;
        let totalComments = 0;
        let totalShares = 0;
        let totalSaves = 0;
        let totalPosts = 0;
        let publishedPosts = 0;

        // Iterar sobre cada campaña y obtener sus métricas
        for (const campaign of campaigns) {
            try {
                const metrics = await fetchCampaignMetrics(campaign.id);
                totalReach += metrics.totalReach;
                totalLikes += metrics.totalLikes;
                totalComments += metrics.totalComments;

                // Obtener posts para contar publicaciones
                const posts = await fetchCampaignPosts(campaign.id);
                totalPosts += posts.length;
                publishedPosts += posts.filter(p => p.estado === 'published').length;

            } catch (error) {
                console.warn(`[campaignService] No metrics for campaign ${campaign.id}`);
            }
        }

        const activeCampaigns = campaigns.filter(c => c.estado === 'activa').length;

        console.log('[campaignService] Global metrics calculated');

        return {
            totalCampaigns: campaigns.length,
            activeCampaigns,
            totalPosts,
            publishedPosts,
            totalReach,
            totalImpressions,
            totalViews,
            totalEngagement,
            totalLikes,
            totalComments,
            totalShares,
            totalSaves
        };
    } catch (error) {
        console.error('[campaignService] Error fetching global metrics:', error);
        throw error;
    }
}