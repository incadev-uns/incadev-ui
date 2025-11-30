import AcademicLayout from "@/process/academic/AcademicLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, MessageSquare } from "lucide-react";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { useComments } from "../hooks/useComments";
import { useVotes } from "../hooks/useVotes";
import { config } from "@/config/support-config";
import VoteControls from "../components/VoteControls";
import CommentForm from "../components/CommentForm";
import CommentTree from "../components/CommentTree";
import type { Thread } from "../types";

interface ThreadDetailPageProps {
  threadId: number;
}

export default function ThreadDetailPage({ threadId }: ThreadDetailPageProps) {
  const { token } = useAcademicAuth();
  const { comments, isLoading, error, addComment, removeComment } = useComments(token, threadId);
  const { voteThread, isVoting } = useVotes(token);
  const [thread, setThread] = useState<Thread | null>(null);
  const [loadingThread, setLoadingThread] = useState(true);
  const [voteCount, setVoteCount] = useState(0);
  const [userVoted, setUserVoted] = useState(false);

  useEffect(() => {
    const loadThread = async () => {
      if (!token || !threadId) return;

      try {
        const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
        const userData = localStorage.getItem("user");
        const userId = userData ? JSON.parse(userData).id : null;
        
        const url = `${config.apiUrl}${config.endpoints.threads.get.replace(':threadId', String(threadId))}${userId ? `?user_id=${userId}` : ''}`;
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json",
            ...(userId && { "X-User-Id": String(userId) }),
          },
        });

        if (response.ok) {
          const data = await response.json();
          const threadData = data.data || data;
          setThread(threadData);
          setVoteCount(threadData.votes_count ?? 0);
          setUserVoted(threadData.user_vote === 1);
        }
      } catch (err) {
        console.error("Error loading thread:", err);
      } finally {
        setLoadingThread(false);
      }
    };

    loadThread();
  }, [token, threadId]);

  const handleVote = async () => {
    if (!threadId) return;
    
    try {
      await voteThread(threadId, 1);
      
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const userData = localStorage.getItem("user");
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (tokenWithoutQuotes && userId) {
        const url = `${config.apiUrl}${config.endpoints.threads.get.replace(':threadId', String(threadId))}?user_id=${userId}`;
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json",
            "X-User-Id": String(userId),
          },
        });

        if (response.ok) {
          const data = await response.json();
          const threadData = data.data || data;
          setThread(threadData);
          setVoteCount(threadData.votes_count ?? 0);
          setUserVoted(threadData.user_vote === 1);
        }
      }
    } catch (err) {
      console.error("Error voting thread:", err);
    }
  };

  const handleAddComment = async (body: string) => {
    await addComment({ body });
  };

  const handleReply = async (body: string, parentId: number) => {
    await addComment({ body, parent_id: parentId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingThread) {
    return (
      <AcademicLayout title="Detalle del Hilo">
        <div className="flex flex-1 flex-col p-6">
          <div className="text-center py-8">Cargando hilo...</div>
        </div>
      </AcademicLayout>
    );
  }

  if (!thread) {
    return (
      <AcademicLayout title="Detalle del Hilo">
        <div className="flex flex-1 flex-col p-6">
          <div className="text-center py-8">Hilo no encontrado</div>
        </div>
      </AcademicLayout>
    );
  }

  return (
    <AcademicLayout title="Detalle del Hilo">
      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = `/academico/foros/foro/${thread.forum_id}`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al foro
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{thread.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{thread.user?.name || 'Anónimo'}</span>
                </div>
                <span>{formatDate(thread.created_at)}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap">{thread.body}</p>
              
              <div className="flex items-center gap-4">
                <VoteControls
                  voteCount={voteCount}
                  userVoted={userVoted}
                  isVoting={isVoting}
                  onToggleVote={handleVote}
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} comentarios</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Comentarios</h3>
              <CommentForm
                onSubmit={handleAddComment}
                placeholder="Escribe tu comentario..."
                submitLabel="Publicar comentario"
              />
            </div>

            <Separator />

            <CommentTree
              comments={comments}
              isLoading={isLoading}
              error={error}
              onReply={handleReply}
              onDelete={removeComment}
            />
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
