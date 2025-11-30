import React, { useState, useEffect } from 'react';
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
import { IconTarget } from '@tabler/icons-react';

interface KPI {
  id: number;
  name: string;
  display_name: string;
  goal_value: number;
  current_value: number;
}

interface EditGoalModalProps {
  kpi: KPI | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGoalModal({
  kpi,
  isOpen,
  onClose,
  onSuccess
}: EditGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [goalValue, setGoalValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kpi) {
      setGoalValue(kpi.goal_value.toString());
    }
  }, [kpi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kpi) return;

    const numericValue = parseFloat(goalValue);
    
    if (isNaN(numericValue) || numericValue <= 0 || numericValue > 100) {
      setError('La meta debe ser un número entre 1 y 100');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.kpisUpdateGoal}/${kpi.id}/goal`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal_value: numericValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la meta');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating goal:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar la meta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!kpi) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconTarget className="h-5 w-5 text-indigo-600" />
            Editar Meta del Indicador
          </DialogTitle>
          <DialogDescription>
            {kpi.display_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Value Info */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Valor Actual</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {kpi.current_value.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Meta Actual</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {kpi.goal_value.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* New Goal Input */}
          <div className="space-y-2">
            <Label htmlFor="goal">Nueva Meta (%)</Label>
            <Input
              id="goal"
              type="number"
              min="1"
              max="100"
              step="0.1"
              placeholder="Ej: 85"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ingresa un valor entre 1 y 100 (porcentaje)
            </p>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Recomendación:</strong> Establece metas alcanzables pero desafiantes. 
              Una meta muy alta puede desmotivar, mientras que una muy baja no impulsará la mejora continua.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <IconTarget className="mr-2 h-4 w-4" />
                  Actualizar Meta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}