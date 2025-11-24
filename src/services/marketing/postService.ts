import { authenticatedFetch } from './authService';
import { config as marketingConfig } from '../../config/marketing-config';
import type {
    PostFromAPI,
    PostForUI,
    CreatePostDTO,
    UpdatePostDTO,
    MetricFromAPI,
    MetricForUI,
    PostMetricsResponseFromAPI,
    PostMetricsForUI
} from './types';

// ============================================
// MAPPERS
// ============================================

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
        enlace: apiPost.link_url,
        estado: apiPost.status,
        programadoPara: apiPost.scheduled_at,
        publicadoEn: apiPost.published_at,
        creadoPor: apiPost.created_by,
        fechaCreacion: apiPost.created_at
    };
}

/**
 * Mapea métrica individual de post
 */
function mapMetricFromAPI(apiMetric: MetricFromAPI): MetricForUI {
    return {
        id: apiMetric.id,
        postId: apiMetric.post_id,
        plataforma: apiMetric.platform,
        metaPostId: apiMetric.meta_post_id,
        vistas: apiMetric.views,
        likes: apiMetric.likes,
        comentarios: apiMetric.comments,
        compartidos: apiMetric.shares,
        engagement: apiMetric.engagement,
        alcance: apiMetric.reach,
        impresiones: apiMetric.impressions,
        guardados: apiMetric.saves,
        fecha: apiMetric.metric_date,
        tipo: apiMetric.metric_type
    };
}

// ============================================
// API FUNCTIONS - POSTS
// ============================================

/**
 * Crear nuevo post
 */
export async function createPost(post: CreatePostDTO): Promise<PostForUI> {
    try {
        const url = `${marketingConfig.apiUrl}/api/posts`;

        console.log('[postService] Creating post:', url);

        const response = await authenticatedFetch(url, {
            method: 'POST',
            body: JSON.stringify(post)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: PostFromAPI = await response.json();
        console.log('[postService] Post created:', data.id);

        return mapPostFromAPI(data);
    } catch (error) {
        console.error('[postService] Error creating post:', error);
        throw error;
    }
}

/**
 * Actualizar post
 */
export async function updatePost(id: number, updates: UpdatePostDTO): Promise<PostForUI> {
    try {
        const url = `${marketingConfig.apiUrl}/api/posts/${id}`;

        console.log('[postService] Updating post:', url);

        const response = await authenticatedFetch(url, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: PostFromAPI = await response.json();
        console.log('[postService] Post updated:', data.id);

        return mapPostFromAPI(data);
    } catch (error) {
        console.error('[postService] Error updating post:', error);
        throw error;
    }
}

/**
 * Eliminar post
 */
export async function deletePost(id: number): Promise<void> {
    try {
        const url = `${marketingConfig.apiUrl}/api/posts/${id}`;

        console.log('[postService] Deleting post:', url);

        const response = await authenticatedFetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('[postService] Post deleted:', id);
    } catch (error) {
        console.error('[postService] Error deleting post:', error);
        throw error;
    }
}

// ============================================
// API FUNCTIONS - METRICS
// ============================================

/**
 * Obtener métricas detalladas de un post
 */
export async function fetchPostMetrics(postId: number): Promise<PostMetricsForUI> {
    try {
        const url = `${marketingConfig.apiUrl}/api/posts/${postId}/metrics`;

        console.log('[postService] Fetching metrics for post:', postId);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PostMetricsResponseFromAPI = await response.json();

        console.log('[postService] Metrics fetched for post:', postId);

        // Mapear métricas
        const metricas = data.metrics.map(mapMetricFromAPI);

        // Calcular totales (suma de todas las plataformas)
        const totales = metricas.reduce((acc, m) => ({
            vistas: acc.vistas + m.vistas,
            likes: acc.likes + m.likes,
            comentarios: acc.comentarios + m.comentarios,
            compartidos: acc.compartidos + m.compartidos,
            engagement: acc.engagement + m.engagement,
            alcance: acc.alcance + m.alcance,
            impresiones: acc.impresiones + m.impresiones,
            guardados: acc.guardados + m.guardados,
        }), {
            vistas: 0,
            likes: 0,
            comentarios: 0,
            compartidos: 0,
            engagement: 0,
            alcance: 0,
            impresiones: 0,
            guardados: 0,
        });

        return {
            postId: data.post_id,
            postTitle: data.post_title,
            platform: data.platform,
            metricas,
            totales
        };
    } catch (error) {
        console.error('[postService] Error fetching post metrics:', error);
        throw error;
    }
}