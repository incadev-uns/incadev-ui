// src/components/marketing/chatbot/AutoResponseDialog.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { AutoResponse } from './AutomatizacionesManager';

const autoResponseSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  palabras_clave: z.array(z.string()).min(1, 'Debe tener al menos una palabra clave'),
  canales: z.array(z.enum(['whatsapp', 'messenger', 'facebook', 'instagram'])).min(1, 'Selecciona al menos un canal'),
  tipo_accion: z.enum(['responder_mensaje', 'enviar_link_matricula', 'notificar_grupo', 'derivar_humano']),
  mensaje: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres'),
  prioridad: z.enum(['alta', 'media', 'baja']),
  activo: z.boolean(),
});

type AutoResponseFormData = z.infer<typeof autoResponseSchema>;

interface AutoResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: AutoResponse | null;
  onSave: (data: Omit<AutoResponse, 'id' | 'estadisticas'>) => void;
}

export default function AutoResponseDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: AutoResponseDialogProps) {
  const [palabraInput, setPalabraInput] = React.useState('');
  const [palabrasClave, setPalabrasClave] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AutoResponseFormData>({
    resolver: zodResolver(autoResponseSchema),
    defaultValues: {
      nombre: '',
      palabras_clave: [],
      canales: [],
      tipo_accion: 'responder_mensaje',
      mensaje: '',
      prioridad: 'media',
      activo: true,
    },
  });

  const canales = watch('canales') || [];

  useEffect(() => {
    if (editingItem) {
      reset({
        nombre: editingItem.nombre,
        palabras_clave: editingItem.palabras_clave,
        canales: editingItem.canales,
        tipo_accion: editingItem.tipo_accion,
        mensaje: editingItem.mensaje,
        prioridad: editingItem.prioridad,
        activo: editingItem.activo,
      });
      setPalabrasClave(editingItem.palabras_clave);
    } else {
      reset({
        nombre: '',
        palabras_clave: [],
        canales: [],
        tipo_accion: 'responder_mensaje',
        mensaje: '',
        prioridad: 'media',
        activo: true,
      });
      setPalabrasClave([]);
    }
  }, [editingItem, reset]);

  const handleAddPalabra = () => {
    if (palabraInput.trim() && !palabrasClave.includes(palabraInput.trim().toLowerCase())) {
      const newPalabras = [...palabrasClave, palabraInput.trim().toLowerCase()];
      setPalabrasClave(newPalabras);
      setValue('palabras_clave', newPalabras);
      setPalabraInput('');
    }
  };

  const handleRemovePalabra = (palabra: string) => {
    const newPalabras = palabrasClave.filter(p => p !== palabra);
    setPalabrasClave(newPalabras);
    setValue('palabras_clave', newPalabras);
  };

  const toggleCanal = (canal: 'whatsapp' | 'messenger' | 'facebook' | 'instagram') => {
    const newCanales = canales.includes(canal)
      ? canales.filter(c => c !== canal)
      : [...canales, canal];
    setValue('canales', newCanales);
  };

  const onSubmit = (data: AutoResponseFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar Automatización' : 'Nueva Automatización'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: Consulta sobre curso X"
            />
            {errors.nombre && (
              <p className="text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          {/* Palabras clave */}
          <div className="space-y-2">
            <Label>Palabras clave (triggers) *</Label>
            <div className="flex gap-2">
              <Input
                value={palabraInput}
                onChange={(e) => setPalabraInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPalabra();
                  }
                }}
                placeholder="Escribe y presiona Enter"
              />
              <Button type="button" onClick={handleAddPalabra} variant="outline">
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {palabrasClave.map((palabra) => (
                <Badge key={palabra} variant="secondary" className="gap-1">
                  {palabra}
                  <button
                    type="button"
                    onClick={() => handleRemovePalabra(palabra)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.palabras_clave && (
              <p className="text-sm text-red-600">{errors.palabras_clave.message}</p>
            )}
          </div>

          {/* Canales */}
          <div className="space-y-2">
            <Label>¿En qué canales aplica? *</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'whatsapp', label: '📱 WhatsApp', enabled: true },
                { value: 'messenger', label: '📘 Messenger', enabled: true },
                { value: 'facebook', label: '📘 Facebook', enabled: false },
                { value: 'instagram', label: '📷 Instagram', enabled: false },
              ].map((canal) => (
                <button
                  key={canal.value}
                  type="button"
                  disabled={!canal.enabled}
                  onClick={() => canal.enabled && toggleCanal(canal.value as any)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    canales.includes(canal.value as any)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  } ${!canal.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-sm font-medium">{canal.label}</span>
                  {!canal.enabled && (
                    <span className="text-xs text-gray-500 ml-2">(Próximamente)</span>
                  )}
                </button>
              ))}
            </div>
            {errors.canales && (
              <p className="text-sm text-red-600">{errors.canales.message}</p>
            )}
          </div>

          {/* Tipo de acción */}
          <div className="space-y-2">
            <Label htmlFor="tipo_accion">Tipo de acción *</Label>
            <Select
              value={watch('tipo_accion')}
              onValueChange={(value: any) => setValue('tipo_accion', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="responder_mensaje">💬 Responder con mensaje</SelectItem>
                <SelectItem value="enviar_link_matricula">🔗 Enviar link de matrícula</SelectItem>
                <SelectItem value="notificar_grupo">🔔 Notificar a grupo académico</SelectItem>
                <SelectItem value="derivar_humano">👤 Derivar a agente humano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje de respuesta *</Label>
            <Textarea
              id="mensaje"
              {...register('mensaje')}
              rows={4}
              placeholder="Escribe el mensaje que enviará el bot..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Variables disponibles: {'{nombre}'} {'{curso}'} {'{link}'}
            </p>
            {errors.mensaje && (
              <p className="text-sm text-red-600">{errors.mensaje.message}</p>
            )}
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select
              value={watch('prioridad')}
              onValueChange={(value: any) => setValue('prioridad', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">🔴 Alta</SelectItem>
                <SelectItem value="media">🟡 Media</SelectItem>
                <SelectItem value="baja">🟢 Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado activo */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="activo"
              checked={watch('activo')}
              onCheckedChange={(checked) => setValue('activo', !!checked)}
            />
            <Label htmlFor="activo" className="cursor-pointer">
              Activar automatización inmediatamente
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingItem ? 'Guardar Cambios' : 'Crear Automatización'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
