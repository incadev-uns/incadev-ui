import { authenticatedFetch } from './authService';
import { config } from '../../config/academic-config';
import type { CourseFromAPI, CourseForUI, CourseVersionFromAPI, CourseVersionForUI } from './types';

// ============================================
// MAPPERS
// ============================================

/**
 * Mapea los datos de curso de la API a la estructura que necesita la UI
 */
function mapCourseToUI(course: CourseFromAPI): CourseForUI {
    const imagePath = course.image_path;
    const imagen = imagePath && imagePath.trim() !== '' ? imagePath : null;

    return {
        id: course.id,
        nombre: course.name,
        descripcion: course.description || 'Sin descripción',
        imagen,
        fechaCreacion: course.created_at,
        fechaActualizacion: course.updated_at
    };
}

/**
 * Mapea los datos de versión de curso de la API a la estructura que necesita la UI
 */
function mapVersionToUI(version: CourseVersionFromAPI): CourseVersionForUI {
    const imagePath = version.course?.image_path;
    const cursoImagen = imagePath && imagePath.trim() !== '' ? imagePath : null;

    return {
        id: version.id,
        cursoId: version.course_id,
        cursoNombre: version.course?.name || 'Curso desconocido',
        cursoDescripcion: version.course?.description || 'Sin descripción',
        cursoImagen,
        nombre: version.name,
        version: version.version || '',
        precio: parseFloat(version.price) || 0,
        estado: version.status,
        fechaCreacion: version.created_at,
        fechaActualizacion: version.updated_at
    };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Obtiene la lista de cursos desde la API
 */
export async function fetchCourses(): Promise<CourseForUI[]> {
    try {
        const url = `${config.apiUrl}${config.endpoints.marketing.courses}`;

        console.log('[courseService] Fetching courses from:', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching courses: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[courseService] Courses response:', data);

        const courses: CourseFromAPI[] = data.data || [];

        return courses.map(mapCourseToUI);
    } catch (error) {
        console.error('[courseService] Error fetching courses:', error);

        if (error instanceof Error && error.message.includes('login')) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/marketing';
            }
        }

        return [];
    }
}

/**
 * Obtiene la lista de versiones de cursos desde la API
 */
export async function fetchVersions(): Promise<CourseVersionForUI[]> {
    try {
        const url = `${config.apiUrl}${config.endpoints.marketing.versions}`;

        console.log('[courseService] Fetching versions from:', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching versions: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[courseService] Versions response:', data);

        const versions: CourseVersionFromAPI[] = data.data || [];

        return versions.map(mapVersionToUI);
    } catch (error) {
        console.error('[courseService] Error fetching versions:', error);

        if (error instanceof Error && error.message.includes('login')) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/marketing';
            }
        }

        return [];
    }
}

// ============================================
// FUNCIONES PARA DETALLE DE CURSO (marketing-backend)
// ============================================

import { config as marketingConfig } from '../../config/marketing-config';
import type {
    CourseDetailFromAPI,
    CourseDetailForUI,
    CourseCampaignsFromAPI,
    CourseCampaignsForUI,
    CampaignWithMetricsFromAPI,
    CampaignWithMetricsForUI
} from './types';

/**
 * Mapea el detalle de curso de la API a la estructura de UI
 */
function mapCourseDetailToUI(course: CourseDetailFromAPI): CourseDetailForUI {
    const imagePath = course.image_path;
    const imagen = imagePath && imagePath.trim() !== '' ? imagePath : null;

    return {
        id: course.id,
        nombre: course.name,
        descripcion: course.description || 'Sin descripción',
        imagen,
        fechaCreacion: course.created_at,
        fechaActualizacion: course.updated_at,
        versiones: (course.versions || []).map(mapVersionToUI)
    };
}

/**
 * Mapea una campaña con métricas de la API a UI
 */
function mapCampaignWithMetricsToUI(campaign: CampaignWithMetricsFromAPI): CampaignWithMetricsForUI {
    const now = new Date();
    const endDate = new Date(campaign.end_date);
    const estado = endDate >= now ? 'activa' : 'finalizada';

    return {
        id: campaign.id,
        nombre: campaign.name,
        objetivo: campaign.objective,
        inicio: campaign.start_date,
        fin: campaign.end_date,
        proposalId: campaign.proposal_id,
        courseVersionId: campaign.course_version_id,
        versionNombre: campaign.course_version?.name || null,
        estado,
        fechaCreacion: campaign.created_at,
        metricas: {
            totalPosts: campaign.metrics.total_posts,
            totalReach: campaign.metrics.total_reach,
            totalInteractions: campaign.metrics.total_interactions,
            totalPreRegistrations: campaign.metrics.total_pre_registrations,
            averageCtr: campaign.metrics.average_ctr || 0
        }
    };
}

/**
 * Obtiene el detalle de un curso por ID desde marketing-backend
 */
export async function fetchCourseById(courseId: number): Promise<CourseDetailForUI> {
    const url = `${marketingConfig.apiUrl}/courses/${courseId}`;

    console.log('[courseService] Fetching course detail from:', url);

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        throw new Error(`Error al cargar el curso: ${response.statusText}`);
    }

    const data: CourseDetailFromAPI = await response.json();
    console.log('[courseService] Course detail response:', data);

    return mapCourseDetailToUI(data);
}

/**
 * Obtiene las versiones de un curso específico desde marketing-backend
 */
export async function fetchCourseVersions(courseId: number): Promise<CourseVersionForUI[]> {
    const url = `${marketingConfig.apiUrl}/courses/${courseId}/versions`;

    console.log('[courseService] Fetching course versions from:', url);

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        throw new Error(`Error al cargar las versiones: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[courseService] Course versions response:', data);

    const versions: CourseVersionFromAPI[] = data.versions || [];
    return versions.map(mapVersionToUI);
}

/**
 * Obtiene las campañas relacionadas a un curso desde marketing-backend
 */
export async function fetchCourseCampaigns(courseId: number): Promise<CourseCampaignsForUI> {
    const url = `${marketingConfig.apiUrl}/courses/${courseId}/campaigns`;

    console.log('[courseService] Fetching course campaigns from:', url);

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        throw new Error(`Error al cargar las campañas del curso: ${response.statusText}`);
    }

    const data: CourseCampaignsFromAPI = await response.json();
    console.log('[courseService] Course campaigns response:', data);

    return {
        curso: {
            id: data.course.id,
            nombre: data.course.name,
            descripcion: data.course.description || 'Sin descripción'
        },
        totalVersiones: data.total_versions,
        totalCampañas: data.total_campaigns,
        campañas: data.campaigns.map(mapCampaignWithMetricsToUI)
    };
}