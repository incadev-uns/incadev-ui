import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { Forum } from "../types";

interface ForumCardProps {
  forum: Forum;
  onSelect?: (forumId: number) => void;
}

export default function ForumCard({ forum, onSelect }: ForumCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(forum.id);
    } else {
      window.location.href = `/academico/foros/foro/${forum.id}`;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{forum.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {forum.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{forum.threads_count ?? 0} hilos</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
        >
          Ver hilos
        </Button>
      </CardFooter>
    </Card>
  );
}
