import React, { useState } from 'react';
import { config } from "@/config/administrative-config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconUpload, IconFile, IconX } from '@tabler/icons-react';

interface Document {
  id: number;
  name: string;
  type: string;
  version: number;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document?: Document | null;
  isUpdate?: boolean;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
  document,
  isUpdate = false
}: DocumentUploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Académico',
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del documento si es actualización
  React.useEffect(() => {
    if (isUpdate && document) {
      setFormData({
        name: document.name,
        type: document.type,
      });
    } else {
      setFormData({
        name: '',
        type: 'Académico',
      });
    }
  }, [isUpdate, document]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tamaño (10MB máximo)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10MB');
        return;
      }

      // Solo permitir PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }

      setFile(selectedFile);
      setError(null);

      // Auto-completar nombre si está vacío y no es actualización
      if (!formData.name && !isUpdate) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, name: nameWithoutExt }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Debes seleccionar un archivo PDF');
      return;
    }

    if (!formData.name.trim()) {
      setError('Debes ingresar un nombre para el documento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('name', formData.name.trim());
      uploadData.append('type', formData.type);
      uploadData.append('file', file);

      const url = isUpdate && document
        ? `${config.apiUrl}${config.endpoints.documents}/${document.id}`
        : `${config.apiUrl}${config.endpoints.documents}`;

      const method = isUpdate ? 'POST' : 'POST';

      // Si es actualización, agregar _method para Laravel
      if (isUpdate) {
        uploadData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method,
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el documento');
      }

      // Éxito
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error.message : 'Error al subir el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', type: 'Académico' });
    setFile(null);
    setError(null);
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? 'Actualizar Documento' : 'Subir Documento'}
          </DialogTitle>
          <DialogDescription>
            {isUpdate 
              ? `Sube una nueva versión del documento. Versión actual: v${document?.version ? Number(document.version).toFixed(1) : '1.0'}, nueva versión: v${document ? (Number(document.version || 1.0) + 0.5).toFixed(1) : '1.5'}`
              : 'Sube un nuevo documento al repositorio institucional'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del documento */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del documento *</Label>
            <Input
              id="name"
              placeholder="Ej: Reglamento Académico 2025"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={isUpdate}
            />
            {isUpdate && (
              <p className="text-xs text-muted-foreground">
                No se puede cambiar el nombre al actualizar
              </p>
            )}
          </div>

          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de documento *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              disabled={isUpdate}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Académico">Académico</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
            {isUpdate && (
              <p className="text-xs text-muted-foreground">
                No se puede cambiar el tipo al actualizar
              </p>
            )}
          </div>

          {/* Upload de archivo */}
          <div className="space-y-2">
            <Label>Archivo *</Label>
            {!file ? (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <IconUpload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click para subir</span> o arrastra el archivo
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Solo archivos PDF (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <IconFile className="h-8 w-8 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !file}
              className="bg-slate-700 hover:bg-slate-800"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isUpdate ? 'Actualizando...' : 'Subiendo...'}
                </>
              ) : (
                <>
                  <IconUpload className="mr-2 h-4 w-4" />
                  {isUpdate ? 'Actualizar Documento' : 'Subir Documento'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}