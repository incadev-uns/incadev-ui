import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import ForumCard from "./ForumCard";
import type { Forum } from "../types";

interface ForumListProps {
  forums: Forum[] | null | undefined;
  isLoading: boolean;
  error: string | null;
  currentUserId?: number | null;
  onSelectForum: (forumId: number) => void;
  onEditForum?: (forum: Forum) => void;
  onDeleteForum?: (forum: Forum) => void;
}

export default function ForumList({
  forums,
  isLoading,
  error,
  currentUserId,
  onSelectForum,
  onEditForum,
  onDeleteForum
}: ForumListProps) {
  const safeForums = Array.isArray(forums) ? forums : [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
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

  if (safeForums.length === 0) {
    return (
      <Alert>
        <AlertDescription className="text-center py-8">
          <p className="text-lg font-medium mb-2">No hay foros disponibles</p>
          <p className="text-sm text-muted-foreground">
            Los foros estarán disponibles próximamente
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {safeForums.map((forum) => (
        <ForumCard
          key={forum.id}
          forum={forum}
          currentUserId={currentUserId}
          onSelect={onSelectForum}
          onEdit={onEditForum}
          onDelete={onDeleteForum}
        />
      ))}
    </div>
  );
}
