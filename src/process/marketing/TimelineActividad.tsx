// src/components/marketing/TimelineActividad.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  Megaphone, 
  Users, 
  BookOpen,
  Clock
} from 'lucide-react';

const actividades = [
  {
    id: 1,
    tipo: 'propuesta',
    accion: 'Nueva propuesta creada',
    descripcion: 'Flutter 2025 - Desarrollo Móvil',
    tiempo: 'Hace 2 horas',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30'
  },
  {
    id: 2,
    tipo: 'campaña',
    accion: 'Campaña iniciada',
    descripcion: 'Kotlin Validación - Contenido Educativo',
    tiempo: 'Hace 5 horas',
    icon: Megaphone,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30'
  },
  {
    id: 3,
    tipo: 'aprobacion',
    accion: 'Propuesta aprobada',
    descripcion: 'React Native PRO → Convertido a curso',
    tiempo: 'Ayer',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30'
  },
  {
    id: 4,
    tipo: 'curso',
    accion: 'Curso abierto',
    descripcion: 'Python ML - Inscripciones abiertas',
    tiempo: 'Hace 2 días',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30'
  },
  {
    id: 5,
    tipo: 'leads',
    accion: 'Nuevos leads',
    descripcion: '50 solicitudes de información esta semana',
    tiempo: 'Hace 3 días',
    icon: Users,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30'
  },
];

export default function TimelineActividad() {
  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actividades.map((act, index) => {
            const Icon = act.icon;
            return (
              <div 
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 smooth-transition cursor-pointer group"
              >
                <div className={'p-2 rounded-lg ' + act.bg}>
                  <Icon className={'w-4 h-4 ' + act.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 smooth-transition">
                    {act.accion}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {act.descripcion}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                  {act.tiempo}
                </span>
              </div>
            );
          })}
        </div>
        
        <a
          href="/marketing/actividad"
          className="flex items-center justify-center w-full mt-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 smooth-transition"
        >
          Ver todo el historial →
        </a>
      </CardContent>
    </Card>
  );
}