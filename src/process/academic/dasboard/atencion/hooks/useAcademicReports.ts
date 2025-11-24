import { useState } from "react";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { config } from "@/config/support-config";
import type { StudentGroup, GroupGradesResponse } from "../types";

export function useAcademicReports() {
  const { token, user } = useAcademicAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStudentGroups = async (): Promise<StudentGroup[]> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }
      
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.report.studentGroups}?student_id=${user.id}`,
        {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "X-User-Id": user.id.toString(),
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener grupos');
      }

      const data = await response.json();
      return data.groups || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGroupGrades = async (groupId: number): Promise<GroupGradesResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }
      
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.report.groupGrades}?student_id=${user.id}&group_id=${groupId}`,
        {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "X-User-Id": user.id.toString(),
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener notas');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadEnrolledCoursesReport = async () => {
    try {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }
      
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.report.enrolledCoursesPdf}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student_id: user.id })
        }
      );

      if (!response.ok) {
        throw new Error('Error al descargar reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cursos-matriculados-${user?.dni || 'reporte'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar');
      throw err;
    }
  };

  const downloadCourseGradesReport = async (groupId: number) => {
    try {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }
      
      const tokenWithoutQuotes = token?.replace(/^"|"/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.report.singleCourseGradesPdf}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            student_id: user.id,
            group_id: groupId 
          })
        }
      );

      if (!response.ok) {
        throw new Error('Error al descargar reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notas-curso-${user?.dni || 'reporte'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar');
      throw err;
    }
  };

  return {
    loading,
    error,
    getStudentGroups,
    getGroupGrades,
    downloadEnrolledCoursesReport,
    downloadCourseGradesReport,
  };
}
