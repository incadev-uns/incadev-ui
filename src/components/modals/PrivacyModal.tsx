import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  const baseUrl = 'https://www.termsfeed.com/live/c93098df-49fb-471c-98e4-a95b0bdcf6e6';

  const openInNewTab = () => {
    window.open(baseUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] md:max-w-[90vw] md:max-h-[90vh] lg:max-w-[85vw] lg:max-h-[85vh] flex flex-col bg-background rounded-none md:rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex-1">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
              Política de Privacidad
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Incadev - Instituto de Capacitación y Desarrollo Virtual
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Open in New Tab Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Abrir en pestaña</span>
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-8 w-8 md:h-10 md:w-10 flex-shrink-0 hover:bg-muted"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        </div>

        {/* Content - iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={baseUrl}
            title="Política de Privacidad de Incadev"
            className="w-full h-full border-0"
          />
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
