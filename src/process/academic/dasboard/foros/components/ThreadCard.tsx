import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, User } from "lucide-react";
import type { Thread } from "../types";

interface ThreadCardProps {
  thread: Thread;
  onSelect?: (threadId: number) => void;
}

export default function ThreadCard({ thread, onSelect }: ThreadCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(thread.id);
    } else {
      window.location.href = `/academico/foros/hilo/${thread.id}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{thread.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {thread.body}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{thread.user?.name || 'Anónimo'}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{thread.votes_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{thread.comments_count ?? 0}</span>
          </div>
        </div>
        <span className="text-xs">{formatDate(thread.created_at)}</span>
      </CardFooter>
    </Card>
  );
}
