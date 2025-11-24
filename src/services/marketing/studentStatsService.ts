import { authenticatedFetch } from './authService';
import { config as marketingConfig } from '../../config/marketing-config';

// ============================================
// TYPES
// ============================================

export interface StudentStatsFromAPI {
    pendientes: number;
    cursando: number;
    completados: number;
    reprobados: number;
    desertores: number;
    egresados: number;
    total_matriculados: number;
}

export interface AlumnoFromAPI {
    id: number;
    nombre: string;
    email: string;
    dni: string;
    avatar: string | null;
    telefono: string;
    estado: 'pending' | 'active' | 'completed' | 'failed' | 'dropped' | 'egresado';
    curso: string;
    grupo_id: number;
    fecha_registro: string;
    ultima_actualizacion: string;
    interests: string[];
    learning_goal: string;
}

export interface AlumnoForUI {
    id: number;
    nombre: string;
    email: string;
    dni: string;
    avatar: string | null;
    telefono: string;
    estado: 'pendiente' | 'cursando' | 'completado' | 'reprobado' | 'desertor' | 'egresado';
    curso: string;
    grupoId: number;
    fechaRegistro: string;
    ultimaActualizacion: string;
    interests: string[];
    learningGoal: string;
}

export interface StudentStatsForUI {
    pendientes: number;
    cursando: number;
    completados: number;
    reprobados: number;
    desertores: number;
    egresados: number;
    totalMatriculados: number;
}

export interface AlumnosDataFromAPI {
    stats: StudentStatsFromAPI;
    alumnos: AlumnoFromAPI[];
}

export interface AlumnosDataForUI {
    stats: StudentStatsForUI;
    alumnos: AlumnoForUI[];
}

export interface StudentResumenFromAPI {
    estadisticas: {
        matriculados: number;
        inactivos: number;
        egresados: number;
        pendientes: number;
        completados: number;
    };
    grupos: {
        activos: number;
        en_inscripcion: number;
    };
    total_estudiantes: number;
}

// ============================================
// MAPPERS
// ============================================

const estadoMap: Record<string, AlumnoForUI['estado']> = {
    'pending': 'pendiente',
    'active': 'cursando',
    'completed': 'completado',
    'failed': 'reprobado',
    'dropped': 'desertor',
    'egresado': 'egresado',
};

function mapAlumnoToUI(alumno: AlumnoFromAPI): AlumnoForUI {
    return {
        id: alumno.id,
        nombre: alumno.nombre,
        email: alumno.email,
        dni: alumno.dni,
        avatar: alumno.avatar,
        telefono: alumno.telefono,
        estado: estadoMap[alumno.estado] || 'pendiente',
        curso: alumno.curso,
        grupoId: alumno.grupo_id,
        fechaRegistro: alumno.fecha_registro,
        ultimaActualizacion: alumno.ultima_actualizacion,
        interests: alumno.interests || [],
        learningGoal: alumno.learning_goal || '',
    };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Obtiene estadísticas y lista de alumnos (combinado)
 * GET /api/alumnos/stats
 */
export async function fetchAlumnosData(): Promise<AlumnosDataForUI> {
    try {
        const endpoint = marketingConfig.endpoints.alumnos.stats;
        const url = `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[studentStatsService] Fetching alumnos data from:', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AlumnosDataFromAPI = await response.json();
        console.log('[studentStatsService] Alumnos data received:', data);

        return {
            stats: {
                pendientes: data.stats.pendientes,
                cursando: data.stats.cursando,
                completados: data.stats.completados,
                reprobados: data.stats.reprobados,
                desertores: data.stats.desertores,
                egresados: data.stats.egresados,
                totalMatriculados: data.stats.total_matriculados,
            },
            alumnos: data.alumnos.map(mapAlumnoToUI),
        };
    } catch (error) {
        console.error('[studentStatsService] Error fetching alumnos data:', error);
        return {
            stats: {
                pendientes: 0,
                cursando: 0,
                completados: 0,
                reprobados: 0,
                desertores: 0,
                egresados: 0,
                totalMatriculados: 0,
            },
            alumnos: [],
        };
    }
}

/**
 * Obtiene solo estadísticas de alumnos para el dashboard
 * GET /api/alumnos/stats (solo usa la parte de stats)
 */
export async function fetchStudentStats(): Promise<StudentStatsForUI> {
    const data = await fetchAlumnosData();
    return data.stats;
}

/**
 * Obtiene resumen completo de alumnos
 * GET /api/alumnos/resumen
 */
export async function fetchStudentResumen(): Promise<StudentResumenFromAPI | null> {
    try {
        const endpoint = marketingConfig.endpoints.alumnos.resumen;
        const url = `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[studentStatsService] Fetching resumen from:', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StudentResumenFromAPI = await response.json();
        console.log('[studentStatsService] Resumen received:', data);

        return data;
    } catch (error) {
        console.error('[studentStatsService] Error fetching resumen:', error);
        return null;
    }
}
