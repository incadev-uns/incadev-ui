import SupportLayout from "@/process/support/SupportLayout";
import TeacherTutoringView from "@/process/academic/dasboard/audits/components/TeacherTutoringView";

export default function TutoringPage() {
  return (
    <SupportLayout title="Módulo de Tutorías">
      <div className="flex flex-1 flex-col p-6">
        <TeacherTutoringView />
      </div>
    </SupportLayout>
  );
}
