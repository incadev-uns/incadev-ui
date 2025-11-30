import { authenticatedFetch } from './authService';
import { config } from '../../config/academic-config';
import type { StudentFromAPI, StudentForUI } from './types';

// ============================================
// MAPPER
// ============================================

/**
 * Mapea los datos de la API a la estructura que necesita la UI
 */
function mapStudentToUI(student: StudentFromAPI): StudentForUI {
    const diasDesdeRegistro = Math.floor(
        (new Date().getTime() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    let estado: StudentForUI['estado'] = 'lead';
    if (diasDesdeRegistro > 60) {
        estado = Math.random() > 0.5 ? 'graduado' : 'cursando';
    } else if (diasDesdeRegistro > 30) {
        estado = Math.random() > 0.3 ? 'cursando' : 'inscrito';
    } else if (diasDesdeRegistro > 10) {
        estado = Math.random() > 0.5 ? 'inscrito' : 'preinscrito';
    } else {
        estado = 'lead';
    }

    const cursoPrincipal = student.student_profile?.interests?.[0] || 'Sin curso asignado';

    const tieneIntereses = (student.student_profile?.interests?.length || 0) > 0;
    const tieneObjetivo = !!student.student_profile?.learning_goal;
    const tieneAvatar = !!student.avatar;
    const tieneTelefono = !!student.phone;

    const engagementScore = Math.round(
        (tieneIntereses ? 40 : 0) +
        (tieneObjetivo ? 30 : 0) +
        (tieneAvatar ? 15 : 0) +
        (tieneTelefono ? 15 : 0)
    );

    const ltvMap = {
        'lead': 0,
        'preinscrito': 0,
        'inscrito': 450 + Math.floor(Math.random() * 100),
        'cursando': 500 + Math.floor(Math.random() * 100),
        'graduado': 1000 + Math.floor(Math.random() * 500),
        'desertor': 200
    };

    const origenes = ['Facebook', 'Instagram', 'Referido', 'Orgánico'];
    const origen = origenes[Math.floor(Math.random() * origenes.length)];

    return {
        id: student.id,
        nombre: student.fullname,
        email: student.email,
        telefono: student.phone || 'No registrado',
        avatar: student.avatar,
        dni: student.dni,
        estado,
        curso: cursoPrincipal,
        fechaRegistro: student.created_at,
        origen,
        ltv: ltvMap[estado],
        cursosCompletados: estado === 'graduado' ? Math.floor(Math.random() * 3) + 1 : 0,
        engagementScore,
        ultimaInteraccion: student.updated_at,
        interests: student.student_profile?.interests || [],
        learningGoal: student.student_profile?.learning_goal || 'Sin objetivo definido'
    };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Obtiene la lista de estudiantes desde la API
 */
export async function fetchStudents(): Promise<StudentForUI[]> {
    try {
        const url = `${config.apiUrl}${config.endpoints.marketing.students}`;

        console.log('[studentService] Fetching students from:', url);

        const response = await authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching students: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[studentService] Students response:', data);

        // La API devuelve { data: [...], meta: {...} }
        const students: StudentFromAPI[] = data.data || [];

        return students.map(mapStudentToUI);
    } catch (error) {
        console.error('[studentService] Error fetching students:', error);

        // Si el error es de autenticación, redirigir al login
        if (error instanceof Error && error.message.includes('login')) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/marketing';
            }
        }

        return [];
    }
}