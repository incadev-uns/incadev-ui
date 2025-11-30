// src/components/marketing/CursosProximos.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Users, ArrowRight, Clock } from 'lucide-react';

const cursos = [
  { 
    id: 1, 
    nombre: 'Kotlin desde Cero', 
    inicio: '15 Nov 2025', 
    matriculados: 45, 
    cupo: 60,
    instructor: 'Carlos Pérez',
    duracion: '8 semanas'
  },
  { 
    id: 2, 
    nombre: 'React Native PRO', 
    inicio: '20 Nov 2025', 
    matriculados: 38, 
    cupo: 50,
    instructor: 'Ana García',
    duracion: '10 semanas'
  },
  { 
    id: 3, 
    nombre: 'Python Data Science', 
    inicio: '25 Nov 2025', 
    matriculados: 52, 
    cupo: 60,
    instructor: 'Miguel Torres',
    duracion: '12 semanas'
  },
];

export default function CursosProximos() {
  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
          Cursos Próximos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cursos.map(c => {
          const porcentaje = (c.matriculados / c.cupo) * 100;
          const isAlmostFull = porcentaje >= 80;
          const progressClass = isAlmostFull 
            ? 'bg-gradient-to-r from-orange-500 to-red-500' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500';
          const textClass = isAlmostFull 
            ? 'text-orange-600 dark:text-orange-400' 
            : 'text-green-600 dark:text-green-400';
          
          return (
            <div 
              key={c.id} 
              className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md smooth-transition group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 smooth-transition">
                    {c.nombre}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {c.instructor}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {c.inicio}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.duracion}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 smooth-transition" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className={'w-4 h-4 ' + (isAlmostFull ? 'text-orange-500' : 'text-green-500')} />
                    <span className={'font-semibold ' + textClass}>
                      {c.matriculados}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      / {c.cupo} cupos
                    </span>
                  </div>
                  <span className={'text-xs font-medium ' + textClass}>
                    {porcentaje.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={'h-2 rounded-full smooth-transition ' + progressClass}
                    style={{ width: porcentaje + '%' }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
        
        <a
          href="/marketing/cursos"
          className="flex items-center justify-center w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium text-sm smooth-transition"
        >
          Ver todos los cursos →
        </a>
      </CardContent>
    </Card>
  );
}