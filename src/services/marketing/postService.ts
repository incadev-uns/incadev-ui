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
        metaPostId: apiPost.meta_post_id ?? null,
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
        // Posts are served by the marketing backend (apiUrl). metricsApiUrl is for metrics-only endpoints.
        const base = marketingConfig.apiUrl;
        const url = `${base}/posts`;

        console.log('[postService] Creating post:', url);

        const response = await authenticatedFetch(url, {
            method: 'POST',
            body: JSON.stringify(post)
        });

        if (!response.ok) {
                let errorData = null;
                try { errorData = await response.json(); } catch (e) { /* ignore */ }
                const err: any = new Error((errorData && (errorData.message || errorData.error)) || `HTTP error! status: ${response.status}`);
                err.status = response.status;
                err.body = errorData;
                throw err;
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
 * Generate a draft (text + image) by calling the backend generator endpoint
 */
export async function generateDraft(prompt: string, platform: string, contentType?: string, linkUrl?: string) {
    try {
        const base = marketingConfig.apiUrl;
        const url = `${base}/posts/generate-draft`;

        const body: any = { prompt, platform };
        if (contentType) body.content_type = contentType;
        if (linkUrl) body.link_url = linkUrl;

        const response = await authenticatedFetch(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[postService] Error generating draft:', error);
        throw error;
    }
}

/**
 * Actualizar post
 */
export async function updatePost(id: number, updates: UpdatePostDTO): Promise<PostForUI> {
    try {
        const base = marketingConfig.apiUrl;
        const url = `${base}/posts/${id}`;

        console.log('[postService] Updating post:', url);

        const response = await authenticatedFetch(url, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
                let errorData = null;
                try { errorData = await response.json(); } catch (e) { /* ignore */ }
                const err: any = new Error((errorData && (errorData.message || errorData.error)) || `HTTP error! status: ${response.status}`);
                err.status = response.status;
                err.body = errorData;
                throw err;
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
        const base = marketingConfig.apiUrl;
        const url = `${base}/posts/${id}`;

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

/**
 * Publish an existing post (calls backend which forwards to socialmediaapi)
 */
export async function publishPost(id: number): Promise<PostForUI> {
    try {
        // Publish should be handled by marketing backend which forwards the call to socialmediaapi
        const base = marketingConfig.apiUrl;
        const url = `${base}/posts/${id}/publish`;

        console.log('[postService] Publishing post:', url);

        const response = await authenticatedFetch(url, {
            method: 'POST',
        });

        if (!response.ok) {
            // Try parse as JSON, fallback to text
            let errMsg = `HTTP error! status: ${response.status}`;
            let errorData: any = null;
            try {
                errorData = await response.json();
                // Prefer server-provided message, otherwise the entire payload
                errMsg = (
                    (errorData && (errorData.message || errorData.error || JSON.stringify(errorData))) || errMsg
                );
            } catch (parseErr) {
                try {
                    const txt = await response.text();
                    if (txt) errMsg = txt;
                } catch (t) {
                    // ignore
                }
            }
            const err: any = new Error(errMsg);
            err.status = response.status;
            err.body = errorData || null;
            throw err;
        }

        const data: any = await response.json();

        // backend returns { success: true, post: {...} }
        const postData = data.post ?? data;

        return mapPostFromAPI(postData as PostFromAPI);
    } catch (error) {
        console.error('[postService] Error publishing post:', error);
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
        // Query metrics microservice for post metrics (reads metrics DB)
        const base = (marketingConfig as any).metricsApiUrl || marketingConfig.apiUrl;
        const url = `${base}/v1/marketing/metrics/post/${postId}`;

        console.log('[postService] Fetching metrics for post (metricsapi):', postId, url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();

        console.log('[postService] Metrics fetched for post:', postId, data.id ?? null);

        // metricsapi returns a single latest Metric row for the post
        const metricRow = data;
        const mapped = mapMetricFromAPI(metricRow as any);

        const totales = {
            vistas: mapped.vistas,
            likes: mapped.likes,
            comentarios: mapped.comentarios,
            compartidos: mapped.compartidos,
            engagement: mapped.engagement,
            alcance: mapped.alcance,
            impresiones: mapped.impresiones,
            guardados: mapped.guardados,
        };

        return {
            postId: metricRow.post_id ?? postId,
            postTitle: metricRow.post_title ?? '',
            platform: metricRow.platform ?? '',
            metricas: metricRow ? [mapped] : [],
            totales
        };
    } catch (error) {
        console.error('[postService] Error fetching post metrics:', error);
        throw error;
    }
}

/**
 * Batch update metrics by calling the metrics microservice.
 * Payload: { items: [ { post_id: number, platform: 'facebook'|'instagram' }, ... ] }
 */
export async function batchUpdateMetrics(items: Array<{ post_id?: number; meta_post_id?: string; platform: string }>): Promise<any> {
    try {
        // New: metrics microservice fetch endpoint does not accept items; call fetch trigger instead
        const base = (marketingConfig as any).metricsApiUrl || marketingConfig.apiUrl;
        const url = `${base}/v1/marketing/metrics/fetch`;

        console.log('[postService] Triggering metrics fetch (metricsapi):', url);

        const response = await authenticatedFetch(url, {
            method: 'POST'
        });

        if (!response.ok) {
            const errBody = await response.text().catch(() => null);
            throw new Error(`HTTP error! status: ${response.status} body: ${errBody}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[postService] Error calling batchUpdateMetrics:', error);
        throw error;
    }
}