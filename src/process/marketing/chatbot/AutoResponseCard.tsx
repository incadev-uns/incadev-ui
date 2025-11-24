// src/components/marketing/chatbot/AutoResponseCard.tsx
import React from 'react';
import { Edit, Copy, Trash2, Power, MessageSquare, Link, Bell, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AutoResponse } from './AutomatizacionesManager';

interface AutoResponseCardProps {
  autoResponse: AutoResponse;
  onEdit: (item: AutoResponse) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onDuplicate: (item: AutoResponse) => void;
}

const canalIcons = {
  whatsapp: { icon: '📱', name: 'WhatsApp', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  messenger: { icon: '📘', name: 'Messenger', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  facebook: { icon: '📘', name: 'Facebook', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  instagram: { icon: '📷', name: 'Instagram', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400' },
};

const tipoAccionConfig = {
  responder_mensaje: { icon: MessageSquare, label: 'Responder mensaje', color: 'text-blue-600 dark:text-blue-400' },
  enviar_link_matricula: { icon: Link, label: 'Enviar link matrícula', color: 'text-purple-600 dark:text-purple-400' },
  notificar_grupo: { icon: Bell, label: 'Notificar grupo', color: 'text-orange-600 dark:text-orange-400' },
  derivar_humano: { icon: UserPlus, label: 'Derivar a humano', color: 'text-green-600 dark:text-green-400' },
};

const prioridadColor = {
  alta: 'border-l-red-500',
  media: 'border-l-yellow-500',
  baja: 'border-l-green-500',
};

export default function AutoResponseCard({
  autoResponse,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
}: AutoResponseCardProps) {
  const AccionIcon = tipoAccionConfig[autoResponse.tipo_accion].icon;

  return (
    <Card className={`p-6 border-l-4 ${prioridadColor[autoResponse.prioridad]} ${
      !autoResponse.activo ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {autoResponse.nombre}
            </h3>
            <Badge variant={autoResponse.activo ? 'default' : 'secondary'}>
              {autoResponse.activo ? '🟢 Activo' : '⚪ Inactivo'}
            </Badge>
          </div>

          {/* Palabras clave */}
          <div className="flex flex-wrap gap-2 mb-3">
            {autoResponse.palabras_clave.map((palabra, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {palabra}
              </Badge>
            ))}
          </div>

          {/* Canales */}
          <div className="flex flex-wrap gap-2 mb-3">
            {autoResponse.canales.map((canal) => (
              <Badge key={canal} className={canalIcons[canal].color}>
                {canalIcons[canal].icon} {canalIcons[canal].name}
              </Badge>
            ))}
          </div>

          {/* Tipo de acción */}
          <div className="flex items-center gap-2 mb-3">
            <AccionIcon className={`w-4 h-4 ${tipoAccionConfig[autoResponse.tipo_accion].color}`} />
            <span className={`text-sm font-medium ${tipoAccionConfig[autoResponse.tipo_accion].color}`}>
              {tipoAccionConfig[autoResponse.tipo_accion].label}
            </span>
          </div>

          {/* Mensaje */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {autoResponse.mensaje}
            </p>
          </div>

          {/* Estadísticas */}
          {autoResponse.estadisticas && autoResponse.estadisticas.veces_usado > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                💬 Usado <strong>{autoResponse.estadisticas.veces_usado}</strong> veces
              </span>
              {autoResponse.estadisticas.ultima_vez && (
                <span>
                  🕐 Última vez: {new Date(autoResponse.estadisticas.ultima_vez).toLocaleString('es-ES')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(autoResponse.id)}
          className="gap-2"
        >
          <Power className="w-4 h-4" />
          {autoResponse.activo ? 'Desactivar' : 'Activar'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(autoResponse)}
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(autoResponse)}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Duplicar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(autoResponse.id)}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </Button>
      </div>
    </Card>
  );
}
