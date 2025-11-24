// src/components/marketing/chatbot/AutomatizacionesManager.tsx
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AutoResponseCard from './AutoResponseCard';
import AutoResponseDialog from './AutoResponseDialog';

export interface AutoResponse {
  id: number;
  nombre: string;
  palabras_clave: string[];
  canales: ('whatsapp' | 'messenger' | 'facebook' | 'instagram')[];
  tipo_accion: 'responder_mensaje' | 'enviar_link_matricula' | 'notificar_grupo' | 'derivar_humano';
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  activo: boolean;
  estadisticas?: {
    veces_usado: number;
    ultima_vez: string;
  };
}

// Mock data
const automatizacionesMock: AutoResponse[] = [
  {
    id: 1,
    nombre: 'Consulta Curso Existente',
    palabras_clave: ['curso', 'inscripción', 'info', 'matrícula'],
    canales: ['whatsapp', 'messenger'],
    tipo_accion: 'enviar_link_matricula',
    mensaje: '¡Hola! Tenemos el curso de {curso}. Puedes inscribirte aquí: {link}',
    prioridad: 'alta',
    activo: true,
    estadisticas: { veces_usado: 234, ultima_vez: '2025-11-08 14:25' }
  },
  {
    id: 2,
    nombre: 'Curso NO Disponible',
    palabras_clave: ['no encuentro', 'no tienen', 'busco curso'],
    canales: ['whatsapp', 'messenger'],
    tipo_accion: 'notificar_grupo',
    mensaje: 'Gracias por tu interés. Registramos tu solicitud y te contactaremos pronto.',
    prioridad: 'alta',
    activo: true,
    estadisticas: { veces_usado: 12, ultima_vez: '2025-11-07 10:15' }
  },
  {
    id: 3,
    nombre: 'Saludo Inicial',
    palabras_clave: ['hola', 'buenos días', 'buenas tardes', 'hey'],
    canales: ['whatsapp', 'messenger'],
    tipo_accion: 'responder_mensaje',
    mensaje: '¡Hola {nombre}! Bienvenido a Incadev. ¿En qué podemos ayudarte?',
    prioridad: 'media',
    activo: true,
    estadisticas: { veces_usado: 456, ultima_vez: '2025-11-08 14:30' }
  },
  {
    id: 4,
    nombre: 'Horarios de Atención',
    palabras_clave: ['horario', 'hora', 'atienden', 'abierto'],
    canales: ['whatsapp', 'messenger'],
    tipo_accion: 'responder_mensaje',
    mensaje: 'Nuestro horario de atención es:\nLun-Vie: 8:00 AM - 6:00 PM\nSáb: 9:00 AM - 1:00 PM',
    prioridad: 'media',
    activo: true,
    estadisticas: { veces_usado: 89, ultima_vez: '2025-11-08 12:15' }
  },
  {
    id: 5,
    nombre: 'Información de Precios',
    palabras_clave: ['precio', 'costo', 'cuánto', 'valor'],
    canales: ['whatsapp'],
    tipo_accion: 'derivar_humano',
    mensaje: 'Un momento, te contacto con un asesor para brindarte información detallada sobre precios.',
    prioridad: 'baja',
    activo: false,
    estadisticas: { veces_usado: 45, ultima_vez: '2025-11-06 16:20' }
  },
];

export default function AutomatizacionesManager() {
  const [automatizaciones, setAutomatizaciones] = useState<AutoResponse[]>(automatizacionesMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AutoResponse | null>(null);

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: AutoResponse) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta automatización?')) {
      setAutomatizaciones(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggle = (id: number) => {
    setAutomatizaciones(prev =>
      prev.map(item =>
        item.id === id ? { ...item, activo: !item.activo } : item
      )
    );
  };

  const handleDuplicate = (item: AutoResponse) => {
    const newItem: AutoResponse = {
      ...item,
      id: Math.max(...automatizaciones.map(a => a.id)) + 1,
      nombre: `${item.nombre} (Copia)`,
      estadisticas: { veces_usado: 0, ultima_vez: '' }
    };
    setAutomatizaciones(prev => [...prev, newItem]);
  };

  const handleSave = (data: Omit<AutoResponse, 'id' | 'estadisticas'>) => {
    if (editingItem) {
      // Editar
      setAutomatizaciones(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...data }
            : item
        )
      );
    } else {
      // Crear nuevo
      const newItem: AutoResponse = {
        ...data,
        id: Math.max(...automatizaciones.map(a => a.id)) + 1,
        estadisticas: { veces_usado: 0, ultima_vez: '' }
      };
      setAutomatizaciones(prev => [...prev, newItem]);
    }
    setDialogOpen(false);
  };

  // Filtrar automatizaciones
  const filteredAutomatizaciones = automatizaciones.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.palabras_clave.some(palabra => palabra.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEstado =
      filterEstado === 'todos' ||
      (filterEstado === 'activos' && item.activo) ||
      (filterEstado === 'inactivos' && !item.activo);

    return matchesSearch && matchesEstado;
  });

  const stats = {
    total: automatizaciones.length,
    activos: automatizaciones.filter(a => a.activo).length,
    inactivos: automatizaciones.filter(a => !a.activo).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Automatizaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configura respuestas automáticas para Messenger, WhatsApp y más
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Nueva Automatización
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => setFilterEstado('todos')}
          variant="outline"
          className={`p-4 h-auto border-2 transition-all ${
            filterEstado === 'todos'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/30'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="text-center w-full">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total</p>
          </div>
        </Button>

        <Button
          onClick={() => setFilterEstado('activos')}
          variant="outline"
          className={`p-4 h-auto border-2 transition-all ${
            filterEstado === 'activos'
              ? 'border-green-500 bg-green-50 dark:bg-green-950/30 hover:bg-green-50 dark:hover:bg-green-950/30'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="text-center w-full">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activos}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Activos</p>
          </div>
        </Button>

        <Button
          onClick={() => setFilterEstado('inactivos')}
          variant="outline"
          className={`p-4 h-auto border-2 transition-all ${
            filterEstado === 'inactivos'
              ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-50 dark:hover:bg-gray-900/30'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="text-center w-full">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactivos}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inactivos</p>
          </div>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar automatizaciones por nombre o palabra clave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Automatizaciones List */}
      <div className="space-y-4">
        {filteredAutomatizaciones.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron automatizaciones
            </p>
          </div>
        ) : (
          filteredAutomatizaciones.map((item) => (
            <AutoResponseCard
              key={item.id}
              autoResponse={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onDuplicate={handleDuplicate}
            />
          ))
        )}
      </div>

      {/* Dialog */}
      <AutoResponseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        onSave={handleSave}
      />
    </div>
  );
}
