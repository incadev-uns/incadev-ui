import AcademicLayout from "@/process/academic/AcademicLayout";
import { useForums } from "../hooks/useForums";
import ForumList from "../components/ForumList";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

export default function ForumListPage() {
  const { token } = useAcademicAuth();
  const { forums, isLoading, error } = useForums(token);

  const handleSelectForum = (forumId: number) => {
    window.location.href = `/academico/foros/foro/${forumId}`;
  };

  return (
    <AcademicLayout title="Foros de la Comunidad">
      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Comunidad y Foros</h2>
            <p className="text-muted-foreground mt-2">
              Explora los foros de la comunidad, comparte conocimientos y resuelve dudas
            </p>
          </div>

          <ForumList 
            forums={forums}
            isLoading={isLoading}
            error={error}
            onSelectForum={handleSelectForum}
          />
        </div>
      </div>
    </AcademicLayout>
  );
}
