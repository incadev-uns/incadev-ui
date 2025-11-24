import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import CommentItem from "./CommentItem";
import type { Comment } from "../types";

interface CommentTreeProps {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  onReply: (body: string, parentId: number) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export default function CommentTree({
  comments,
  isLoading,
  error,
  onReply,
  onDelete,
}: CommentTreeProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (comments.length === 0) {
    return (
      <Alert>
        <AlertDescription className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            No hay comentarios aún. Sé el primero en comentar.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Filtrar solo comentarios de nivel superior (parent_id === null)
  const topLevelComments = comments.filter(c => !c.parent_id);

  return (
    <div className="space-y-4 divide-y">
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
