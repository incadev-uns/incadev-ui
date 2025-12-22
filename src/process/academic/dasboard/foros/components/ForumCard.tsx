import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Forum } from "../types";

interface ForumCardProps {
  forum: Forum;
  currentUserId?: number | null;
  onSelect?: (forumId: number) => void;
  onEdit?: (forum: Forum) => void;
  onDelete?: (forum: Forum) => void;
}

export default function ForumCard({ forum, currentUserId, onSelect, onEdit, onDelete }: ForumCardProps) {
  const isOwner = currentUserId && forum.user_id && currentUserId === forum.user_id;

  const handleClick = () => {
    if (onSelect) {
      onSelect(forum.id);
    } else {
      window.location.href = `/academico/foros/foro/${forum.id}`;
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(forum);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(forum);
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col relative">
      {/* Menu de opciones para el creador */}
      {isOwner && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Imagen de portada - siempre reservar espacio */}
      <div className="relative h-32 w-full bg-muted/30">
        {forum.image_url ? (
          <>
            <img
              src={forum.image_url}
              alt={forum.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <CardHeader className="pt-3 flex-1">
        <CardTitle className="text-xl line-clamp-1">{forum.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {forum.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-between items-center mt-auto">
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{forum.threads_count ?? 0} hilos</span>
          </div>
          {forum.user && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="truncate max-w-[120px]">Creado por {forum.user.name}</span>
            </div>
          )}
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
