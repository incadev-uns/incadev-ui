import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconEdit,
  IconMinus,
} from '@tabler/icons-react';

interface KPI {
  id: number;
  name: string;
  display_name: string;
  goal_value: number;
  current_value: number;
  previous_value: number;
  trend: number;
  status: 'Requiere atención' | 'En camino' | 'Cumplido';
}

interface KpiCardProps {
  kpi: KPI;
  onEditGoal: (kpi: KPI) => void;
}

// Helper para convertir valores a número de forma segura
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function KpiCard({ kpi, onEditGoal }: KpiCardProps) {
  // Convertir todos los valores a números de forma segura
  const goalValue = toNumber(kpi.goal_value);
  const currentValue = toNumber(kpi.current_value);
  const previousValue = toNumber(kpi.previous_value);
  const trend = toNumber(kpi.trend);

  const progressPercentage = goalValue > 0 ? (currentValue / goalValue) * 100 : 0;
  const isPositiveTrend = trend > 0;
  const isNegativeTrend = trend < 0;

  const getStatusColor = () => {
    switch (kpi.status) {
      case 'Cumplido':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'En camino':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'; // ← Azul
      case 'Requiere atención':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'; // ← Rojo
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getTrendIcon = () => {
    if (isPositiveTrend) {
      return <IconTrendingUp className="h-4 w-4" />;
    } else if (isNegativeTrend) {
      return <IconTrendingDown className="h-4 w-4" />;
    } else {
      return <IconMinus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    if (isPositiveTrend) {
      return 'text-emerald-600 dark:text-emerald-400';
    } else if (isNegativeTrend) {
      return 'text-red-600 dark:text-red-400';
    } else {
      return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {kpi.display_name || kpi.name || 'Sin nombre'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                Meta: {goalValue.toFixed(0)}% | Actual: {currentValue.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-semibold">
                {isPositiveTrend ? '+' : ''}{trend.toFixed(1)}%
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditGoal(kpi)}
              title="Editar meta"
            >
              <IconEdit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar con color celeste personalizado */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progreso hacia la meta</span>
            <span className="text-sm font-semibold">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          {/* Barra de progreso personalizada con color celeste #0083C9 */}
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
                backgroundColor: '#0083C9' // ← Color celeste personalizado
              }}
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Estado:</p>
            <Badge variant="outline" className={getStatusColor()}>
              {kpi.status}
            </Badge>
          </div>
          {previousValue > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Mes anterior</p>
              <p className="text-sm font-medium">{previousValue.toFixed(1)}%</p>
            </div>
          )}
        </div>

        {/* Bottom decoration bar con colores actualizados */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            kpi.status === 'Cumplido' 
              ? 'bg-emerald-500' 
              : kpi.status === 'En camino' 
              ? 'bg-blue-500'  // ← Azul para "En camino"
              : 'bg-red-500'   // ← Rojo para "Requiere atención"
          }`}
        />
      </CardContent>
    </Card>
  );
}