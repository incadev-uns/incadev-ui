import AcademicLayout from "@/process/academic/AcademicLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnrolledCoursesPage from "./enrolled-courses/EnrolledCoursesPage";
import CourseGradesPage from "./course-grades/CourseGradesPage";

export default function AtencionPage() {
  return (
    <AcademicLayout title="Atención - Documentos Académicos">
      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Documentos Académicos
            </h2>
            <p className="text-muted-foreground mt-2">
              Consulta tus cursos matriculados y descarga tus reportes académicos
            </p>
          </div>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="courses">Cursos Matriculados</TabsTrigger>
              <TabsTrigger value="grades">Notas por Curso</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="mt-6">
              <EnrolledCoursesPage />
            </TabsContent>

            <TabsContent value="grades" className="mt-6">
              <CourseGradesPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AcademicLayout>
  );
}
