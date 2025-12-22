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
import { IconUpload } from '@tabler/icons-react';
import DriveUploader from "@/services/academico/DriveUploader";

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
    drive_url: '', // ⬅️ NUEVO: URL de Google Drive
  });
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del documento si es actualización
  React.useEffect(() => {
    if (isUpdate && document) {
      setFormData({
        name: document.name,
        type: document.type,
        drive_url: '', // Se llenará cuando suba un nuevo archivo
      });
    } else {
      setFormData({
        name: '',
        type: 'Académico',
        drive_url: '',
      });
    }
  }, [isUpdate, document]);

  // ⬅️ NUEVO: Callback cuando DriveUploader termina
  const handleDriveUpload = (url: string) => {
    console.log('✅ URL recibida de Drive:', url);
    setFormData(prev => ({ ...prev, drive_url: url }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.drive_url) {
      setError('Debes subir un archivo a Google Drive');
      return;
    }

    if (!formData.name.trim()) {
      setError('Debes ingresar un nombre para el documento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isUpdate && document
        ? `${config.apiUrl}${config.endpoints.documents}/${document.id}`
        : `${config.apiUrl}${config.endpoints.documents}`;

      const method = isUpdate ? 'PUT' : 'POST';

      // ⬅️ CAMBIO: Ahora envía JSON en lugar de FormData
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          drive_url: formData.drive_url // ⬅️ Envía la URL de Drive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error al subir el documento');
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
    setFormData({ name: '', type: 'Académico', drive_url: '' });
    setError(null);
    onClose();
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
              ? `Sube una nueva versión del documento a Google Drive. Versión actual: v${document?.version ? Number(document.version).toFixed(1) : '1.0'}, nueva versión: v${document ? (Number(document.version || 1.0) + 0.5).toFixed(1) : '1.5'}`
              : 'Sube un nuevo documento al repositorio institucional usando Google Drive'
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

          {/* ⬇️ REEMPLAZADO: Ahora usa DriveUploader */}
          <div className="space-y-2">
            <DriveUploader
              onUpload={handleDriveUpload}
              label="Archivo del documento *"
            />
            {formData.drive_url && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ Archivo subido correctamente a Google Drive
              </p>
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
              disabled={loading || !formData.drive_url}
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