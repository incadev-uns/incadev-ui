import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import ThreadCard from "./ThreadCard";
import type { Thread } from "../types";

interface ThreadListProps {
  threads: Thread[] | null | undefined;
  isLoading: boolean;
  error: string | null;
  onSelectThread?: (threadId: number) => void;
}

export default function ThreadList({ threads, isLoading, error, onSelectThread }: ThreadListProps) {
  const safeThreads = Array.isArray(threads) ? threads : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
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

  if (safeThreads.length === 0) {
    return (
      <Alert>
        <AlertDescription className="text-center py-8">
          <p className="text-lg font-medium mb-2">No hay hilos en este foro</p>
          <p className="text-sm text-muted-foreground">
            Sé el primero en crear un hilo de discusión
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {safeThreads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          onSelect={onSelectThread}
        />
      ))}
    </div>
  );
}
