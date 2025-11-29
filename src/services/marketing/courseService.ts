import { authenticatedFetch } from './authService';
import { config } from '../../config/marketing-config';
import type {
    CourseFromAPI,
    CourseForUI,
    CourseVersionFromAPI,
    CourseVersionForUI,
    CourseDetailFromAPI,
    CourseDetailForUI,
    CampaignWithMetricsFromAPI,
    CampaignWithMetricsForUI,
    CourseCampaignsFromAPI,
    CourseCampaignsForUI,
    VersionDetailFromAPI,
    VersionDetailForUI,
    VersionCampaignsFromAPI,
    VersionCampaignsForUI,
    MetricasEstudiantesFromAPI,
    MetricasEstudiantesForUI,
    GrupoActivoFromAPI,
    GrupoActivoForUI
} from './types';

// ============================================
// HELPERS
// ============================================

function mapMetricasEstudiantes(metricas?: MetricasEstudiantesFromAPI): MetricasEstudiantesForUI | undefined {
    if (!metricas) return undefined;

    const asistencias = metricas.asistencias
        ? {
            totalClases: metricas.asistencias.total_clases,
            totalEstudiantes: metricas.asistencias.total_estudiantes,
            totalAsistencias: metricas.asistencias.esperadas,
            presentes: metricas.asistencias.presentes,
            tardanzas: metricas.asistencias.tardanzas,
            ausentes: metricas.asistencias.ausentes,
            justificados: metricas.asistencias.justificados,
            porcentaje: metricas.asistencias.porcentaje
        }
        : undefined;

    return {
        totalMatriculados: metricas.total_matriculados,
        activos: metricas.activos,
        completados: metricas.completados,
        reprobados: metricas.reprobados,
        desertores: metricas.desertores,
        promedioAsistencia: metricas.promedio_asistencia,
        promedioNotas: metricas.promedio_notas,
        tasaRetencion: metricas.tasa_retencion,
        tasaGraduacion: metricas.tasa_graduacion,
        egresados: metricas.egresados,
        asistencias
    };
}

function mapGruposActivos(grupos?: GrupoActivoFromAPI[]): GrupoActivoForUI[] | undefined {
    if (!grupos) return undefined;

    return grupos.map(grupo => ({
        grupoId: grupo.grupo_id,
        nombre: grupo.nombre,
        version: grupo.version,
        estudiantes: grupo.estudiantes,
        promedioAsistencia: grupo.promedio_asistencia,
        progreso: grupo.progreso,
        totalClases: grupo.total_clases,
        clasesRealizadas: grupo.clases_realizadas
    }));
}

// ============================================
// MAPPERS
// ============================================

function mapCourseToUI(course: CourseFromAPI): CourseForUI {
    const imagePath = course.image_path;
    const imagen = imagePath && imagePath.trim() !== '' ? imagePath : null;

    return {
        id: course.id,
        nombre: course.name,
        descripcion: course.description || 'Sin descripcion',
        imagen,
        fechaCreacion: course.created_at,
        fechaActualizacion: course.updated_at,
        metricasEstudiantes: mapMetricasEstudiantes(course.metricas_estudiantes),
        gruposActivos: mapGruposActivos(course.grupos_activos)
    };
}

function mapVersionToUI(version: CourseVersionFromAPI): CourseVersionForUI {
    const imagePath = version.course?.image_path;
    const cursoImagen = imagePath && imagePath.trim() !== '' ? imagePath : null;

    return {
        id: version.id,
        cursoId: version.course_id,
        cursoNombre: version.course?.name || 'Curso desconocido',
        cursoDescripcion: version.course?.description || 'Sin descripcion',
        cursoImagen,
        nombre: version.name,
        version: version.version || '',
        precio: parseFloat(version.price) || 0,
        estado: version.status,
        fechaCreacion: version.created_at,
        fechaActualizacion: version.updated_at,
        metricasEstudiantes: mapMetricasEstudiantes(version.metricas_estudiantes),
        gruposActivos: mapGruposActivos(version.grupos_activos)
    };
}

function mapCourseDetailToUI(course: CourseDetailFromAPI): CourseDetailForUI {
    const imagePath = course.image_path;
    const imagen = imagePath && imagePath.trim() !== '' ? imagePath : null;

    return {
        id: course.id,
        nombre: course.name,
        descripcion: course.description || 'Sin descripcion',
        imagen,
        fechaCreacion: course.created_at,
        fechaActualizacion: course.updated_at,
        versiones: (course.versions || []).map(mapVersionToUI)
    };
}

function mapCampaignWithMetricsToUI(campaign: CampaignWithMetricsFromAPI): CampaignWithMetricsForUI {
    const now = new Date();
    const endDate = new Date(campaign.end_date);
    const estado = endDate >= now ? 'activa' : 'finalizada';

    const metrics = campaign.metrics || {
        total_posts: 0,
        total_reach: 0,
        total_interactions: 0,
        total_pre_registrations: 0,
        average_ctr: 0
    };

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
            totalPosts: metrics.total_posts,
            totalReach: metrics.total_reach,
            totalInteractions: metrics.total_interactions,
            totalPreRegistrations: metrics.total_pre_registrations,
            averageCtr: metrics.average_ctr || 0
        }
    };
}

function mapVersionDetailToUI(version: VersionDetailFromAPI): VersionDetailForUI {
    const imagePath = version.course?.image_path;
    const cursoImagen = imagePath && imagePath.trim() !== '' ? imagePath : null;

    return {
        id: version.id,
        cursoId: parseInt(version.course_id, 10),
        cursoNombre: version.course?.name || 'Curso desconocido',
        cursoDescripcion: version.course?.description || 'Sin descripcion',
        cursoImagen,
        nombre: version.name,
        version: version.version || '',
        precio: parseFloat(version.price) || 0,
        estado: version.status,
        fechaCreacion: version.created_at,
        fechaActualizacion: version.updated_at,
        campanas: (version.campaigns || []).map(mapCampaignWithMetricsToUI),
        metricasEstudiantes: mapMetricasEstudiantes(version.metricas_estudiantes),
        gruposActivos: mapGruposActivos(version.grupos_activos)
    };
}

// ============================================
// API FUNCTIONS
// ============================================

export async function fetchCourses(): Promise<CourseForUI[]> {
    try {
        const url = `${config.apiUrl}${config.endpoints.courses.list}`;

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

export async function fetchVersions(): Promise<CourseVersionForUI[]> {
    try {
        const url = `${config.apiUrl}${config.endpoints.versions.list}`;

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
// DETALLE DE CURSO (marketing-backend)
// ============================================

export async function fetchCourseById(courseId: number): Promise<CourseDetailForUI> {
    const url = `${config.apiUrl}/courses/${courseId}`;

    console.log('[courseService] Fetching course detail from:', url);

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        throw new Error(`Error al cargar el curso: ${response.statusText}`);
    }

    const data: CourseDetailFromAPI = await response.json();
    console.log('[courseService] Course detail response:', data);

    return mapCourseDetailToUI(data);
}

export async function fetchCourseVersions(courseId: number): Promise<CourseVersionForUI[]> {
    const url = `${config.apiUrl}/courses/${courseId}/versions`;

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

export async function fetchCourseCampaigns(courseId: number): Promise<CourseCampaignsForUI> {
    const url = `${config.apiUrl}/courses/${courseId}/campaigns`;

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
            descripcion: data.course.description || 'Sin descripcion'
        },
        totalVersiones: data.total_versions,
        totalCampanas: data.total_campaigns,
        campanas: (data.campaigns || []).map(mapCampaignWithMetricsToUI),
        metricasEstudiantes: mapMetricasEstudiantes(data.metricas_estudiantes),
        gruposActivos: mapGruposActivos(data.grupos_activos)
    };
}

// ============================================
// DETALLE DE VERSION
// ============================================

export async function fetchVersionById(versionId: number): Promise<VersionDetailForUI> {
    const url = `${config.apiUrl}/versions/${versionId}`;

    console.log('[courseService] Fetching version detail from:', url);

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        throw new Error(`Error al cargar la version: ${response.statusText}`);
    }

    const data: VersionDetailFromAPI = await response.json();
    console.log('[courseService] Version detail response:', data);

    return mapVersionDetailToUI(data);
}

export async function fetchVersionCampaigns(versionId: number): Promise<VersionCampaignsForUI> {
    const url = `${config.apiUrl}/versions/${versionId}/campaigns`;

    console.log('[courseService] Fetching version campaigns from:', url);

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        throw new Error(`Error al cargar las campañas de la version: ${response.statusText}`);
    }

    const data: VersionCampaignsFromAPI = await response.json();
    console.log('[courseService] Version campaigns response:', data);

    return {
        version: {
            id: data.version.id,
            nombre: data.version.name,
            version: data.version.version || '',
            precio: parseFloat(data.version.price) || 0,
            estado: data.version.status
        },
        totalCampanas: data.total_campaigns,
        campanas: (data.campaigns || []).map(mapCampaignWithMetricsToUI),
        metricasEstudiantes: mapMetricasEstudiantes(data.metricas_estudiantes),
        gruposActivos: mapGruposActivos(data.grupos_activos)
    };
}
