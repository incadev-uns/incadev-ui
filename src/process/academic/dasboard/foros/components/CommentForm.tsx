import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageIcon, X } from "lucide-react";
import CloudinaryUploader from "@/services/academico/CloudinaryUploader";

interface CommentFormProps {
  onSubmit: (body: string, attachmentUrl?: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  placeholder = "Escribe tu comentario...",
  submitLabel = "Publicar",
  onCancel,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Siempre requerir texto (el backend lo exige)
    if (!body.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(body, attachmentUrl || undefined);
      setBody("");
      setAttachmentUrl("");
      setShowUploader(false);
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachmentUpload = (url: string) => {
    setAttachmentUrl(url);
  };

  const handleRemoveAttachment = () => {
    setAttachmentUrl("");
    setShowUploader(false);
  };

  const isVideo = attachmentUrl && (
    attachmentUrl.includes('/video/') ||
    attachmentUrl.match(/\.(mp4|webm|mov|avi)$/i)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={isSubmitting}
      />

      {/* Botón para agregar imagen/video */}
      {!attachmentUrl && !showUploader && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowUploader(true)}
          className="text-muted-foreground"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Agregar imagen o video
        </Button>
      )}

      {/* Uploader */}
      {showUploader && !attachmentUrl && (
        <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
          <CloudinaryUploader
            onUpload={handleAttachmentUpload}
            label="Subir imagen o video"
            acceptType="both"
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

      {/* Preview del archivo adjunto */}
      {attachmentUrl && (
        <div className="relative rounded-lg overflow-hidden border bg-muted/50">
          {isVideo ? (
            <video
              src={attachmentUrl}
              controls
              className="w-full max-h-48 object-contain"
            />
          ) : (
            <img
              src={attachmentUrl}
              alt="Archivo adjunto"
              className="w-full max-h-48 object-contain"
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleRemoveAttachment}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!body.trim() || isSubmitting}
          size="sm"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
