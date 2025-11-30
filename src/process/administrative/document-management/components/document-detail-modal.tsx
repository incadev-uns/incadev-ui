import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconDownload,
  IconTrash,
  IconEdit,
  IconFileText,
  IconCalendar,
  IconFileInfo,
} from '@tabler/icons-react';

interface Document {
  id: number;
  name: string;
  type: string;
  path: string;
  version: number;
  size?: number;
  size_formatted?: string;
  date_formatted?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentDetailModalProps {
  document: Document | null;
  onClose: () => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: number) => void;
  onUpdate: (document: Document) => void;
}

const getFileIcon = (type: string) => {
  return <IconFileText className="h-12 w-12 text-slate-600 dark:text-slate-400" />;
};

const getTypeBadge = (type: string) => {
  const colors: { [key: string]: string } = {
    'Académico': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    'Administrativo': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    'Legal': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  };

  return (
    <Badge variant="outline" className={colors[type] || colors['Administrativo']}>
      {type}
    </Badge>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const generateDocumentId = (id: number): string => {
  return `DOC-${String(id).padStart(3, '0')}`;
};

export default function DocumentDetailModal({
  document,
  onClose,
  onDownload,
  onDelete,
  onUpdate
}: DocumentDetailModalProps) {
  if (!document) return null;

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.')) {
      onDelete(document.id);
    }
  };

  return (
    <Dialog open={!!document} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Documento</DialogTitle>
          <DialogDescription>
            Información completa del documento seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con icono y nombre */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              {getFileIcon(document.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {document.name}
              </h3>
              <div className="flex items-center gap-2">
                {getTypeBadge(document.type)}
                <Badge variant="outline" className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20">
                  {generateDocumentId(document.id)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Información del archivo */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <IconFileInfo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Tamaño del archivo</p>
                <p className="font-medium">{document.size_formatted || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <IconCalendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fecha de subida</p>
                <p className="font-medium">{formatDate(document.created_at)}</p>
              </div>
            </div>

            {document.updated_at !== document.created_at && (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <IconCalendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Última actualización</p>
                  <p className="font-medium">{formatDate(document.updated_at)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <IconFileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Versión</p>
                <p className="font-medium">v{document.version ? Number(document.version).toFixed(1) : '1.0'}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onUpdate(document)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onDownload(document)}
            >
              <IconDownload className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleDelete}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}