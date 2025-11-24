import AcademicLayout from "@/process/academic/AcademicLayout";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

export default function TutoringPage() {
  const { user } = useAcademicAuth();

  return (
    <AcademicLayout title="Módulo de Tutorías">
      <div className="flex flex-1 flex-col p-6">
        FORO DE ESTUDIANTE
      </div>
    </AcademicLayout>
  );
}