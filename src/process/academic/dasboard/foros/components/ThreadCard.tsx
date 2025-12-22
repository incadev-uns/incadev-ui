import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, User, ImageIcon } from "lucide-react";
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
    <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden" onClick={handleClick}>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{thread.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {thread.body}
        </CardDescription>
      </CardHeader>

      {/* Imagen adjunta si existe */}
      {thread.image_url && (
        <CardContent className="pt-0 pb-3">
          <div className="relative rounded-lg overflow-hidden bg-muted">
            <img
              src={thread.image_url}
              alt="Imagen del hilo"
              className="w-full h-40 object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black/60 rounded px-2 py-1 flex items-center gap-1">
              <ImageIcon className="h-3 w-3 text-white" />
              <span className="text-xs text-white">Imagen</span>
            </div>
          </div>
        </CardContent>
      )}

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
