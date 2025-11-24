import AcademicLayout from "@/process/academic/AcademicLayout";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import TeacherTutoringView from "@/process/academic/dasboard/audits/components/TeacherTutoringView";
import StudentTutoringView from "@/process/academic/dasboard/audits/components/StudentTutoringView";

export default function TutoringPage() {
  const { user } = useAcademicAuth();

  return (
    <AcademicLayout title="Módulo de Tutorías">
      <div className="flex flex-1 flex-col p-6">
        {user?.role === "teacher" ? (
          <TeacherTutoringView />
        ) : user?.role === "student" ? (
          <StudentTutoringView />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No tienes permisos para acceder a este módulo
            </p>
          </div>
        )}
      </div>
    </AcademicLayout>
  );
}