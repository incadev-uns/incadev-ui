import { useState } from "react";
import AcademicLayout from "@/process/academic/AcademicLayout";
import { useForums } from "../hooks/useForums";
import ForumList from "../components/ForumList";
import CreateForumDialog from "../components/CreateForumDialog";
import EditForumDialog from "../components/EditForumDialog";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import type { Forum } from "../types";

export default function ForumListPage() {
  const { token, user } = useAcademicAuth();
  const { forums, isLoading, error, createForum, updateForum, deleteForum } = useForums(token);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [forumToEdit, setForumToEdit] = useState<Forum | null>(null);

  const handleSelectForum = (forumId: number) => {
    window.location.href = `/academico/foros/foro/${forumId}`;
  };

  const handleCreateForum = async (data: { name: string; description: string; image_url?: string }) => {
    if (!user?.id) {
      toast.error("Debes iniciar sesion para crear un foro");
      return;
    }

    try {
      await createForum(data, user.id);
      toast.success("Foro creado exitosamente");
    } catch {
      toast.error("Error al crear el foro");
    }
  };

  const handleEditForum = (forum: Forum) => {
    setForumToEdit(forum);
    setShowEditDialog(true);
  };

  const handleUpdateForum = async (forumId: number, data: { name: string; description: string; image_url?: string | null }) => {
    try {
      await updateForum(forumId, data);
      toast.success("Foro actualizado exitosamente");
    } catch {
      toast.error("Error al actualizar el foro");
      throw new Error("Error al actualizar");
    }
  };

  const handleDeleteForum = async (forum: Forum) => {
    if (!confirm(`¿Estas seguro de eliminar el foro "${forum.name}"? Esta accion no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteForum(forum.id);
      toast.success("Foro eliminado exitosamente");
    } catch {
      toast.error("Error al eliminar el foro");
    }
  };

  return (
    <AcademicLayout title="Foros de la Comunidad">
      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Comunidad y Foros</h2>
              <p className="text-muted-foreground mt-2">
                Explora los foros de la comunidad, comparte conocimientos y resuelve dudas
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Foro
            </Button>
          </div>

          <ForumList
            forums={forums}
            isLoading={isLoading}
            error={error}
            currentUserId={user?.id}
            onSelectForum={handleSelectForum}
            onEditForum={handleEditForum}
            onDeleteForum={handleDeleteForum}
          />
        </div>
      </div>

      <CreateForumDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateForum}
      />

      <EditForumDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        forum={forumToEdit}
        onSubmit={handleUpdateForum}
      />
    </AcademicLayout>
  );
}
