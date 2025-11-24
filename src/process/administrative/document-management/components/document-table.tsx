import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconEye,
  IconDownload,
  IconTrash,
  IconEdit,
  IconFileText,
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

interface DocumentTableProps {
  documents: Document[];
  loading: boolean;
  onDocumentSelect: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: number) => void;
  onUpdate: (document: Document) => void;
}

const getFileIcon = (type: string) => {
  return <IconFileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
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
    month: '2-digit',
    day: '2-digit'
  });
};

const generateDocumentId = (id: number): string => {
  return `DOC-${String(id).padStart(3, '0')}`;
};

export default function DocumentTable({
  documents,
  loading,
  onDocumentSelect,
  onDownload,
  onDelete,
  onUpdate
}: DocumentTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-slate-700"></div>
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <IconFileText className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-muted-foreground">No hay documentos que coincidan con la búsqueda</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900/50">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-400">
              ID
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-400">
              Nombre del Documento
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-400 text-center">
              Tipo
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-400 text-center">
              Fecha
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-400 text-center">
              Versión
            </TableHead>
            <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-400">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <TableCell className="font-semibold">
                {generateDocumentId(document.id)}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getFileIcon(document.type)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {document.name}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-center">
                {getTypeBadge(document.type)}
              </TableCell>

              <TableCell className="text-center text-muted-foreground">
                {formatDate(document.created_at)}
              </TableCell>

              <TableCell className="text-center">
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20">
                  v{document.version ? Number(document.version).toFixed(1) : '1.0'}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDocumentSelect(document)}
                    title="Ver detalles"
                  >
                    <IconEye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate(document)}
                    title="Actualizar versión"
                  >
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(document)}
                    title="Descargar"
                  >
                    <IconDownload className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(document.id)}
                    title="Eliminar"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}