// src/components/marketing/chatbot/CanalesManager.tsx
import React, { useState } from 'react';
import { Settings, RefreshCw, BarChart3, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { config } from '@/config/marketing-config';

interface Canal {
  id: string;
  nombre: string;
  icono: string;
  estado: 'conectado' | 'desconectado' | 'error';
  habilitado: boolean;
  config?: {
    [key: string]: string;
  };
  stats_hoy?: {
    conversaciones: number;
    mensajes: number;
  };
  ultima_sync?: string;
}

const canalesMock: Canal[] = [
  {
    id: 'messenger',
    nombre: 'Facebook Messenger',
    icono: '📘',
    estado: 'conectado',
    habilitado: true,
    config: {
      pagina: 'Incadev',
      page_id: '123456789',
    },
    stats_hoy: { conversaciones: 45, mensajes: 234 },
    ultima_sync: '2025-11-08 14:28',
  },
  {
    id: 'whatsapp',
    nombre: 'WhatsApp Business',
    icono: '📱',
    estado: 'conectado',
    habilitado: true,
    config: {
      numero: '+51 987 654 321',
      business_account_id: '987654321',
    },
    stats_hoy: { conversaciones: 67, mensajes: 389 },
    ultima_sync: '2025-11-08 14:29',
  },
  {
    id: 'facebook',
    nombre: 'Facebook Direct',
    icono: '📘',
    estado: 'desconectado',
    habilitado: false,
  },
  {
    id: 'instagram',
    nombre: 'Instagram Direct',
    icono: '📷',
    estado: 'desconectado',
    habilitado: false,
  },
];

const estadoConfig = {
  conectado: { icon: CheckCircle, label: 'Conectado', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-950/30' },
  desconectado: { icon: X, label: 'No configurado', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
  error: { icon: AlertCircle, label: 'Error de conexión', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/30' },
};

export default function CanalesManager() {
  const [canales, setCanales] = useState<Canal[]>(canalesMock);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedCanal, setSelectedCanal] = useState<Canal | null>(null);

  const handleConfigureCanal = (canal: Canal) => {
    setSelectedCanal(canal);
    setConfigDialogOpen(true);
  };

  const handleTestConnection = (canalId: string) => {
    alert(`Probando conexión con ${canalId}...`);
  };

  const handleRefreshCanal = (canalId: string) => {
    setCanales(prev =>
      prev.map(canal =>
        canal.id === canalId
          ? { ...canal, ultima_sync: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : canal
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Canales de Mensajería
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configura y gestiona las conexiones con Messenger, WhatsApp y más
        </p>
      </div>

      {/* Canales Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canales.map((canal) => {
          const EstadoIcon = estadoConfig[canal.estado].icon;

          return (
            <Card key={canal.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{canal.icono}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {canal.nombre}
                    </h3>
                    <Badge className={estadoConfig[canal.estado].bg}>
                      <EstadoIcon className={`w-3 h-3 mr-1 ${estadoConfig[canal.estado].color}`} />
                      <span className={estadoConfig[canal.estado].color}>
                        {estadoConfig[canal.estado].label}
                      </span>
                    </Badge>
                  </div>
                </div>

                {!canal.habilitado && (
                  <Badge variant="secondary">Próximamente</Badge>
                )}
              </div>

              {canal.estado === 'conectado' && canal.config && (
                <div className="space-y-3 mb-4">
                  {/* Config info */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                    {Object.entries(canal.config).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace('_', ' ')}:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  {canal.stats_hoy && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {canal.stats_hoy.conversaciones}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Conversaciones hoy
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {canal.stats_hoy.mensajes}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Mensajes enviados
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last sync */}
                  {canal.ultima_sync && (
                    <p className="text-xs text-gray-500">
                      Última sincronización: {new Date(canal.ultima_sync).toLocaleString('es-ES')}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {canal.habilitado && (
                  <>
                    <Button
                      onClick={() => handleConfigureCanal(canal)}
                      variant="outline"
                      size="sm"
                      className="gap-2 flex-1"
                    >
                      <Settings className="w-4 h-4" />
                      Configurar
                    </Button>

                    {canal.estado === 'conectado' && (
                      <Button
                        onClick={() => handleRefreshCanal(canal.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 flex-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reconectar
                      </Button>
                    )}

                    <Button
                      onClick={() => handleTestConnection(canal.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {!canal.habilitado && (
                  <Button disabled variant="outline" className="w-full" size="sm">
                    Disponible próximamente
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Configuración Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Configurar {selectedCanal?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedCanal?.id === 'whatsapp' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número de teléfono</Label>
                  <Input
                    id="numero"
                    placeholder="+51 987654321"
                    defaultValue={selectedCanal.config?.numero || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token">Token API (WhatsApp Business API)</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="****************************"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <Input
                    id="webhook"
                    readOnly
                    value={config.externalUrls.webhook.whatsapp}
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </>
            )}

            {selectedCanal?.id === 'messenger' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="page">Página de Facebook</Label>
                  <Input
                    id="page"
                    placeholder="Incadev"
                    defaultValue={selectedCanal.config?.pagina || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page_token">Page Access Token</Label>
                  <Input
                    id="page_token"
                    type="password"
                    placeholder="****************************"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify_token">Verify Token</Label>
                  <Input
                    id="verify_token"
                    type="password"
                    placeholder="****************************"
                  />
                </div>
              </>
            )}

            {/* Opciones comunes */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Checkbox id="auto_response" defaultChecked />
                <Label htmlFor="auto_response" className="cursor-pointer">
                  Activar respuestas automáticas
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="save_history" defaultChecked />
                <Label htmlFor="save_history" className="cursor-pointer">
                  Guardar historial de mensajes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="notifications" />
                <Label htmlFor="notifications" className="cursor-pointer">
                  Notificaciones en tiempo real
                </Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleTestConnection(selectedCanal?.id || '')}
                className="flex-1"
              >
                Probar Conexión
              </Button>
              <Button onClick={() => setConfigDialogOpen(false)} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
