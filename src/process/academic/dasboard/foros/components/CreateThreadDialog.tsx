import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; body: string }) => Promise<void>;
}

export default function CreateThreadDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateThreadDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      return;
    }

    if (body.trim().length < 10) {
      alert("La descripción debe tener al menos 10 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), body: body.trim() });
      setTitle("");
      setBody("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Hilo</DialogTitle>
          <DialogDescription>
            Comparte una pregunta o inicia una discusión en el foro
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="¿Cuál es tu pregunta o tema?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Descripción</Label>
              <Textarea
                id="body"
                placeholder="Describe tu pregunta o tema con más detalle... (mínimo 10 caracteres)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                required
                className="resize-none"
                minLength={10}
              />
              <p className="text-xs text-muted-foreground">
                {body.length} caracteres {body.length < 10 && `(mínimo 10)`}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || body.trim().length < 10}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Hilo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
