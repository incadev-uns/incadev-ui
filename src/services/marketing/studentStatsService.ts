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

export interface AsistenciasFromAPI {
    total_clases: number;
    presentes: number;
    tardanzas: number;
    ausentes: number;
    justificados: number;
    porcentaje: number;
}

export interface RendimientoFromAPI {
    promedio_notas: number;
    tareas_entregadas: number;
    tareas_totales: number;
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
    asistencias: AsistenciasFromAPI | null;
    rendimiento: RendimientoFromAPI | null;
    engagement_score: number;
}

export interface AsistenciasForUI {
    totalClases: number;
    presentes: number;
    tardanzas: number;
    ausentes: number;
    justificados: number;
    porcentaje: number;
}

export interface RendimientoForUI {
    promedioNotas: number;
    tareasEntregadas: number;
    tareasTotales: number;
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
    asistencias: AsistenciasForUI | null;
    rendimiento: RendimientoForUI | null;
    engagementScore: number;
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
// TYPES FOR DETALLE ENDPOINT
// ============================================

export interface HistorialAsistenciaFromAPI {
    id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    clase: string;
    modulo: string;
    estado: 'present' | 'absent' | 'late' | 'excused';
    created_at: string;
}

export interface HistorialNotaFromAPI {
    id: number;
    examen: string;
    nota: number;
    feedback: string | null;
    fecha: string;
    created_at: string;
}

export interface ProgresoModuloFromAPI {
    modulo_id: number;
    modulo: string;
    clases_totales: number;
    clases_asistidas: number;
    porcentaje_asistencia: number;
    promedio_notas: number | null;
    completado: boolean;
}

export interface TimelineEventFromAPI {
    fecha: string;
    tipo: 'registro' | 'matricula' | 'primera_clase' | 'completado' | 'desercion' | 'certificado';
    descripcion: string;
    timestamp: string;
}

export interface AlumnoDetalleFromAPI {
    alumno: {
        id: number;
        nombre: string;
        email: string;
        dni: string;
        avatar: string | null;
        telefono: string;
        curso: string;
        grupo: string;
        grupo_id: number;
        estado: string;
        fecha_registro: string;
        interests: string[];
        learning_goal: string;
    };
    asistencias: {
        resumen: AsistenciasFromAPI;
        historial: HistorialAsistenciaFromAPI[];
    };
    rendimiento: {
        resumen: RendimientoFromAPI;
        historial: HistorialNotaFromAPI[];
    };
    progreso_modulos: ProgresoModuloFromAPI[];
    timeline: TimelineEventFromAPI[];
    certificado: {
        id: number;
        fecha_emision: string;
    } | null;
}

// UI Types for Detalle
export interface HistorialAsistenciaForUI {
    id: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    clase: string;
    modulo: string;
    estado: 'present' | 'absent' | 'late' | 'excused';
    createdAt: string;
}

export interface HistorialNotaForUI {
    id: number;
    examen: string;
    nota: number;
    feedback: string | null;
    fecha: string;
    createdAt: string;
}

export interface ProgresoModuloForUI {
    moduloId: number;
    modulo: string;
    clasesTotales: number;
    clasesAsistidas: number;
    porcentajeAsistencia: number;
    promedioNotas: number | null;
    completado: boolean;
}

export interface TimelineEventForUI {
    fecha: string;
    tipo: 'registro' | 'matricula' | 'primera_clase' | 'completado' | 'desercion' | 'certificado';
    descripcion: string;
    timestamp: string;
}

export interface AlumnoDetalleForUI {
    alumno: {
        id: number;
        nombre: string;
        email: string;
        dni: string;
        avatar: string | null;
        telefono: string;
        curso: string;
        grupo: string;
        grupoId: number;
        estado: string;
        fechaRegistro: string;
        interests: string[];
        learningGoal: string;
        engagementScore: number;
    };
    asistencias: {
        resumen: AsistenciasForUI;
        historial: HistorialAsistenciaForUI[];
    };
    rendimiento: {
        resumen: RendimientoForUI;
        historial: HistorialNotaForUI[];
    };
    progresoModulos: ProgresoModuloForUI[];
    timeline: TimelineEventForUI[];
    certificado: {
        id: number;
        fechaEmision: string;
    } | null;
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
        asistencias: alumno.asistencias ? {
            totalClases: alumno.asistencias.total_clases,
            presentes: alumno.asistencias.presentes,
            tardanzas: alumno.asistencias.tardanzas,
            ausentes: alumno.asistencias.ausentes,
            justificados: alumno.asistencias.justificados,
            porcentaje: alumno.asistencias.porcentaje,
        } : null,
        rendimiento: alumno.rendimiento ? {
            promedioNotas: alumno.rendimiento.promedio_notas,
            tareasEntregadas: alumno.rendimiento.tareas_entregadas,
            tareasTotales: alumno.rendimiento.tareas_totales,
        } : null,
        // Backend envía engagement_score en escala 0-10; lo llevamos a 0-100 para la UI
        engagementScore: (alumno.engagement_score ?? 0) * 10,
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

/**
 * Obtiene el detalle completo de un alumno específico
 * GET /api/alumnos/{id}/detalle
 */
export async function fetchAlumnoDetalle(alumnoId: number): Promise<AlumnoDetalleForUI | null> {
    try {
        // Usar el endpoint de la config y reemplazar :id con el alumnoId
        const endpoint = marketingConfig.endpoints.alumnos.detalle.replace(':id', alumnoId.toString());
        const url = `${marketingConfig.apiUrl}${endpoint}`;

        console.log('[studentStatsService] Fetching alumno detalle from:', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AlumnoDetalleFromAPI = await response.json();
        console.log('[studentStatsService] Alumno detalle received:', data);

        return mapAlumnoDetalleToUI(data);
    } catch (error) {
        console.error('[studentStatsService] Error fetching alumno detalle:', error);
        return null;
    }
}

// ============================================
// MAPPER FOR DETALLE
// ============================================

function mapAlumnoDetalleToUI(data: AlumnoDetalleFromAPI): AlumnoDetalleForUI {
    const estadoUI = estadoMap[data.alumno.estado] || (data.alumno.estado as AlumnoForUI['estado']) || 'pendiente';

    return {
        alumno: {
            id: data.alumno.id,
            nombre: data.alumno.nombre,
            email: data.alumno.email,
            dni: data.alumno.dni,
            avatar: data.alumno.avatar,
            telefono: data.alumno.telefono,
            curso: data.alumno.curso,
            grupo: data.alumno.grupo,
            grupoId: data.alumno.grupo_id,
            estado: estadoUI,
            fechaRegistro: data.alumno.fecha_registro,
            interests: data.alumno.interests || [],
            learningGoal: data.alumno.learning_goal || '',
            engagementScore: (data.alumno.engagement_score ?? 0) * 10,
        },
        asistencias: {
            resumen: {
                totalClases: data.asistencias.resumen.total_clases,
                presentes: data.asistencias.resumen.presentes,
                tardanzas: data.asistencias.resumen.tardanzas,
                ausentes: data.asistencias.resumen.ausentes,
                justificados: data.asistencias.resumen.justificados,
                porcentaje: data.asistencias.resumen.porcentaje,
            },
            historial: data.asistencias.historial.map(h => ({
                id: h.id,
                fecha: h.fecha,
                horaInicio: h.hora_inicio,
                horaFin: h.hora_fin,
                clase: h.clase,
                modulo: h.modulo,
                estado: h.estado,
                createdAt: h.created_at,
            })),
        },
        rendimiento: {
            resumen: {
                promedioNotas: data.rendimiento.resumen.promedio_notas,
                tareasEntregadas: data.rendimiento.resumen.tareas_entregadas,
                tareasTotales: data.rendimiento.resumen.tareas_totales,
            },
            historial: data.rendimiento.historial.map(n => ({
                id: n.id,
                examen: n.examen,
                nota: n.nota,
                feedback: n.feedback,
                fecha: n.fecha,
                createdAt: n.created_at,
            })),
        },
        progresoModulos: data.progreso_modulos.map(m => ({
            moduloId: m.modulo_id,
            modulo: m.modulo,
            clasesTotales: m.clases_totales,
            clasesAsistidas: m.clases_asistidas,
            porcentajeAsistencia: m.porcentaje_asistencia,
            promedioNotas: m.promedio_notas,
            completado: m.completado,
        })),
        timeline: data.timeline.map(t => ({
            fecha: t.fecha,
            tipo: t.tipo,
            descripcion: t.descripcion,
            timestamp: t.timestamp,
        })),
        certificado: data.certificado ? {
            id: data.certificado.id,
            fechaEmision: data.certificado.fecha_emision,
        } : null,
    };
}
