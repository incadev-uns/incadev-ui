// src/components/marketing/chatbot/ConversacionesInbox.tsx
import React, { useState } from 'react';
import { Search, Send, UserPlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { config } from '@/config/marketing-config';

interface Mensaje {
  id: number;
  tipo: 'bot' | 'usuario' | 'agente';
  contenido: string;
  timestamp: string;
}

interface Conversacion {
  id: number;
  usuario: string;
  canal: 'whatsapp' | 'messenger' | 'facebook' | 'instagram';
  ultimo_mensaje: string;
  estado: 'bot_respondido' | 'requiere_atencion' | 'agente_asignado' | 'cerrado';
  fecha: string;
  no_leidos: number;
  mensajes: Mensaje[];
}

const conversacionesMock: Conversacion[] = [
  {
    id: 1,
    usuario: 'Juan Pérez',
    canal: 'whatsapp',
    ultimo_mensaje: '¿Tienen curso de Python?',
    estado: 'bot_respondido',
    fecha: '2025-11-08 14:30',
    no_leidos: 0,
    mensajes: [
      { id: 1, tipo: 'usuario', contenido: 'Hola', timestamp: '2025-11-08 14:28' },
      { id: 2, tipo: 'bot', contenido: '¡Hola Juan! Bienvenido a Incadev. ¿En qué podemos ayudarte?', timestamp: '2025-11-08 14:28' },
      { id: 3, tipo: 'usuario', contenido: '¿Tienen curso de Python?', timestamp: '2025-11-08 14:30' },
      { id: 4, tipo: 'bot', contenido: `¡Sí! Tenemos el curso de Python Básico. Puedes inscribirte aquí: ${config.externalUrls.matricula.curso.replace(':slug', 'python')}`, timestamp: '2025-11-08 14:30' },
    ]
  },
  {
    id: 2,
    usuario: 'María López',
    canal: 'messenger',
    ultimo_mensaje: 'Quiero inscribirme',
    estado: 'requiere_atencion',
    fecha: '2025-11-08 13:15',
    no_leidos: 2,
    mensajes: [
      { id: 1, tipo: 'usuario', contenido: 'Buenos días', timestamp: '2025-11-08 13:10' },
      { id: 2, tipo: 'bot', contenido: '¡Hola María! ¿En qué podemos ayudarte?', timestamp: '2025-11-08 13:10' },
      { id: 3, tipo: 'usuario', contenido: 'Quiero inscribirme', timestamp: '2025-11-08 13:15' },
      { id: 4, tipo: 'usuario', contenido: '¿Me pueden ayudar?', timestamp: '2025-11-08 13:16' },
    ]
  },
  {
    id: 3,
    usuario: 'Carlos Rojas',
    canal: 'whatsapp',
    ultimo_mensaje: 'Perfecto, gracias',
    estado: 'cerrado',
    fecha: '2025-11-08 10:45',
    no_leidos: 0,
    mensajes: [
      { id: 1, tipo: 'usuario', contenido: '¿Qué horarios tienen?', timestamp: '2025-11-08 10:40' },
      { id: 2, tipo: 'bot', contenido: 'Nuestro horario de atención es:\nLun-Vie: 8:00 AM - 6:00 PM\nSáb: 9:00 AM - 1:00 PM', timestamp: '2025-11-08 10:40' },
      { id: 3, tipo: 'usuario', contenido: 'Perfecto, gracias', timestamp: '2025-11-08 10:45' },
    ]
  },
  {
    id: 4,
    usuario: 'Ana Martínez',
    canal: 'messenger',
    ultimo_mensaje: 'Ok, espero tu respuesta',
    estado: 'agente_asignado',
    fecha: '2025-11-08 09:20',
    no_leidos: 0,
    mensajes: [
      { id: 1, tipo: 'usuario', contenido: '¿Cuánto cuesta el curso de React?', timestamp: '2025-11-08 09:15' },
      { id: 2, tipo: 'bot', contenido: 'Un momento, te contacto con un asesor para brindarte información detallada sobre precios.', timestamp: '2025-11-08 09:15' },
      { id: 3, tipo: 'agente', contenido: 'Hola Ana, soy Pedro del equipo. El curso de React tiene un costo de S/450. ¿Te gustaría más información?', timestamp: '2025-11-08 09:18' },
      { id: 4, tipo: 'usuario', contenido: 'Ok, espero tu respuesta', timestamp: '2025-11-08 09:20' },
    ]
  },
];

const canalConfig = {
  whatsapp: { icon: '📱', name: 'WhatsApp', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  messenger: { icon: '📘', name: 'Messenger', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  facebook: { icon: '📘', name: 'Facebook', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  instagram: { icon: '📷', name: 'Instagram', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400' },
};

const estadoConfig = {
  bot_respondido: { label: 'Bot', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  requiere_atencion: { label: 'Requiere atención', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
  agente_asignado: { label: 'Agente asignado', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  cerrado: { label: 'Cerrado', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

export default function ConversacionesInbox() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(conversacionesMock);
  const [selectedChat, setSelectedChat] = useState<Conversacion | null>(conversacionesMock[0]);
  const [mensaje, setMensaje] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSendMessage = () => {
    if (!mensaje.trim() || !selectedChat) return;

    const nuevoMensaje: Mensaje = {
      id: selectedChat.mensajes.length + 1,
      tipo: 'agente',
      contenido: mensaje,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setConversaciones(prev =>
      prev.map(conv =>
        conv.id === selectedChat.id
          ? { ...conv, mensajes: [...conv.mensajes, nuevoMensaje], ultimo_mensaje: mensaje }
          : conv
      )
    );

    setSelectedChat(prev =>
      prev ? { ...prev, mensajes: [...prev.mensajes, nuevoMensaje] } : null
    );

    setMensaje('');
  };

  const handleAsignarme = () => {
    if (!selectedChat) return;

    setConversaciones(prev =>
      prev.map(conv =>
        conv.id === selectedChat.id
          ? { ...conv, estado: 'agente_asignado' }
          : conv
      )
    );

    setSelectedChat(prev =>
      prev ? { ...prev, estado: 'agente_asignado' } : null
    );
  };

  const filteredConversaciones = conversaciones.filter(conv =>
    conv.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.ultimo_mensaje.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Conversaciones
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Inbox de mensajes de Messenger, WhatsApp y más
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-6rem)]">
        {/* Lista de conversaciones - Sidebar */}
        <Card className="col-span-4 p-4 flex flex-col h-full">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredConversaciones.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedChat?.id === conv.id
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{conv.usuario.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {conv.usuario}
                      </h3>
                      {conv.no_leidos > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conv.no_leidos}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                      {conv.ultimo_mensaje}
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${canalConfig[conv.canal].color}`}>
                        {canalConfig[conv.canal].icon}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat window */}
        <Card className="col-span-8 flex flex-col h-full">
          {selectedChat ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{selectedChat.usuario.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {selectedChat.usuario}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${canalConfig[selectedChat.canal].color}`}>
                          {canalConfig[selectedChat.canal].icon} {canalConfig[selectedChat.canal].name}
                        </Badge>
                        <Badge className={`text-xs ${estadoConfig[selectedChat.estado].color}`}>
                          {estadoConfig[selectedChat.estado].label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedChat.estado !== 'agente_asignado' && (
                    <Button onClick={handleAsignarme} variant="outline" size="sm" className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Asignarme
                    </Button>
                  )}
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.mensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.tipo === 'usuario' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.tipo === 'usuario'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          : msg.tipo === 'bot'
                          ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100'
                          : 'bg-green-100 dark:bg-green-950/30 text-green-900 dark:text-green-100'
                      }`}
                    >
                      {msg.tipo !== 'usuario' && (
                        <p className="text-xs font-semibold mb-1">
                          {msg.tipo === 'bot' ? '🤖 Bot' : '👤 Agente'}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de mensaje */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                  <Textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    rows={2}
                    className="resize-none"
                  />
                  <Button onClick={handleSendMessage} disabled={!mensaje.trim()} className="gap-2">
                    <Send className="w-4 h-4" />
                    Enviar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Presiona Enter para enviar, Shift+Enter para nueva línea
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Selecciona una conversación para empezar</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
