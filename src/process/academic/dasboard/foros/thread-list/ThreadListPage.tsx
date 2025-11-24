import AcademicLayout from "@/process/academic/AcademicLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useThreads } from "../hooks/useThreads";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { config } from "@/config/support-config";
import ThreadList from "../components/ThreadList";
import CreateThreadDialog from "../components/CreateThreadDialog";
import type { Forum } from "../types";
import { toast } from "react-toastify";

interface ThreadListPageProps {
  forumId: number;
}

export default function ThreadListPage({ forumId }: ThreadListPageProps) {
  const { token, user } = useAcademicAuth();
  const { threads, isLoading, error, reload } = useThreads(token, forumId);
  const [forum, setForum] = useState<Forum | null>(null);
  const [loadingForum, setLoadingForum] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const loadForum = async () => {
      if (!token || !forumId) return;

      try {
        const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
        const url = `${config.apiUrl}${config.endpoints.forums.get.replace(':forumId', String(forumId))}`;
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setForum(data.data || data);
        }
      } catch (err) {
        console.error("Error loading forum:", err);
      } finally {
        setLoadingForum(false);
      }
    };

    loadForum();
  }, [token, forumId]);

  const handleThreadClick = (threadId: number) => {
    window.location.href = `/academico/foros/hilo/${threadId}`;
  };

  const handleCreateThread = async (data: { title: string; body: string }) => {
    if (!token || !user) {
      toast.error("Debes iniciar sesión para crear un hilo");
      return;
    }

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.apiUrl}${config.endpoints.threads.create.replace(':forumId', String(forumId))}?user_id=${user.id}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear el hilo");
      }

      toast.success("Hilo creado exitosamente");
      reload();
    } catch (err) {
      console.error("Error creating thread:", err);
      toast.error("Error al crear el hilo");
      throw err;
    }
  };

  return (
    <AcademicLayout title="Hilos del Foro">
      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/academico/foros'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {loadingForum ? "Cargando..." : forum?.name || "Foro"}
                </h2>
                {forum && (
                  <p className="text-muted-foreground mt-1">
                    {forum.description}
                  </p>
                )}
              </div>
            </div>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Hilo
            </Button>
          </div>

          <ThreadList
            threads={threads}
            isLoading={isLoading}
            error={error}
            onSelectThread={handleThreadClick}
          />

          <CreateThreadDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSubmit={handleCreateThread}
          />
        </div>
      </div>
    </AcademicLayout>
  );
}
