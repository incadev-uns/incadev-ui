import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Reply, Trash2 } from "lucide-react";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { useVotes } from "../hooks/useVotes";
import CommentForm from "./CommentForm";
import VoteControls from "./VoteControls";
import type { Comment } from "../types";

interface CommentItemProps {
  comment: Comment;
  onReply: (body: string, parentId: number) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  depth?: number;
  maxDepth?: number;
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  depth = 0,
  maxDepth = 5,
}: CommentItemProps) {
  const { token, user } = useAcademicAuth();
  const { voteComment, isVoting } = useVotes(token);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [voteCount, setVoteCount] = useState(comment.votes_count ?? 0);
  const [userVoted, setUserVoted] = useState(comment.user_vote === 1);

  const isOwner = user && comment.user_id === user.id;

  const handleVote = async () => {
    try {
      // Siempre enviar 1 (upvote). El backend hace toggle si ya existe
      await voteComment(comment.id, 1);
      
      // Actualizar estado local con toggle
      setUserVoted(!userVoted);
      setVoteCount(prev => userVoted ? prev - 1 : prev + 1);
    } catch (err) {
      console.error("Error voting comment:", err);
    }
  };

  const handleReply = async (body: string) => {
    await onReply(body, comment.id);
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {comment.user?.name || 'Anónimo'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>

            <p className="text-sm whitespace-pre-wrap mb-3">{comment.body}</p>

            <div className="flex items-center gap-2">
              <VoteControls
                voteCount={voteCount}
                userVoted={userVoted}
                isVoting={isVoting}
                onToggleVote={handleVote}
                size="sm"
              />

              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-7 px-2 text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Responder
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-3">
                <CommentForm
                  onSubmit={handleReply}
                  placeholder="Escribe tu respuesta..."
                  submitLabel="Responder"
                  onCancel={() => setShowReplyForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
