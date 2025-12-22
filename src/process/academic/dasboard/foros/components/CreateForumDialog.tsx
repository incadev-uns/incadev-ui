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
import { Loader2, ImageIcon, X } from "lucide-react";
import CloudinaryUploader from "@/services/academico/CloudinaryUploader";

interface CreateForumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; image_url?: string }) => Promise<void>;
}

export default function CreateForumDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateForumDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        image_url: imageUrl || undefined
      });
      // Limpiar formulario
      setName("");
      setDescription("");
      setImageUrl("");
      setShowUploader(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating forum:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setShowUploader(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Foro</DialogTitle>
          <DialogDescription>
            Crea un nuevo espacio de discusión para la comunidad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del foro</Label>
              <Input
                id="name"
                placeholder="Ej: Preguntas sobre JavaScript"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe de qué trata este foro..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen de portada (opcional)</Label>

              {!imageUrl && !showUploader && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-20 border-dashed"
                  onClick={() => setShowUploader(true)}
                >
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Agregar imagen de portada
                </Button>
              )}

              {showUploader && !imageUrl && (
                <div className="space-y-2">
                  <CloudinaryUploader
                    onUpload={handleImageUpload}
                    label="Subir imagen de portada"
                    acceptType="image"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploader(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {imageUrl && (
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt="Portada del foro"
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
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
            <Button type="submit" disabled={isSubmitting || !name.trim() || !description.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Foro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
