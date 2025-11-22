import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  IconCalendar,
  IconBook,
  IconClock,
  IconCheck,
  IconX,
  IconAlertCircle
} from '@tabler/icons-react';
import { config } from '@/config/administrative-config';

interface Student {
  id: number;
  fullname: string;
}

interface EnrollmentHistory {
  id: number;
  academic_status: string;
  payment_status: string;
  enrollment_date: string;
  completion_date?: string | null;
  final_grade?: number | null;
  course_name: string;
  group_name?: string;
  attendance_percentage?: number;
  status_history?: {
    status: string;
    date: string;
    notes?: string;
  }[];
}

interface StudentHistoryModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { className: string; label: string }> = {
    active: {
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      label: 'Activo'
    },
    completed: {
      className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      label: 'Completado'
    },
    withdrawn: {
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      label: 'Retirado'
    },
    suspended: {
      className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      label: 'Suspendido'
    }
  };

  const variant = variants[status] || variants.active;

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
};

const getPaymentBadge = (status: string) => {
  const isPaid = status === 'paid';
  return (
    <Badge 
      variant="outline" 
      className={isPaid 
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
      }
    >
      {isPaid ? 'Pagado' : 'Pendiente'}
    </Badge>
  );
};

export default function StudentHistoryModal({
  student,
  isOpen,
  onClose
}: StudentHistoryModalProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student && isOpen) {
      loadHistory();
    }
  }, [student, isOpen]);

  const loadHistory = async () => {
    if (!student) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.students}/${student.id}/history`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar el historial');

      const data = await response.json();
      setEnrollments(data.enrollments || []);
    } catch (err) {
      console.error('Error loading history:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Mock data for demonstration
      setEnrollments([
        {
          id: 1,
          academic_status: 'completed',
          payment_status: 'paid',
          enrollment_date: '2024-01-15',
          completion_date: '2024-06-20',
          final_grade: 18.5,
          course_name: 'Introducción a la Programación',
          group_name: 'Grupo A - Mañana',
          attendance_percentage: 95
        },
        {
          id: 2,
          academic_status: 'active',
          payment_status: 'paid',
          enrollment_date: '2024-07-01',
          course_name: 'Desarrollo Web con React',
          group_name: 'Grupo B - Tarde',
          attendance_percentage: 88
        },
        {
          id: 3,
          academic_status: 'withdrawn',
          payment_status: 'pending',
          enrollment_date: '2023-09-10',
          course_name: 'Base de Datos Avanzadas',
          group_name: 'Grupo C - Noche',
          attendance_percentage: 45
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Historial Académico - {student.fullname}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
              <p className="text-sm text-muted-foreground">Cargando historial...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <IconAlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                No se pudo cargar el historial. Mostrando datos de ejemplo.
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-4 py-4">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <IconBook className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-700" />
              <p className="text-muted-foreground">No hay historial de matrículas</p>
            </div>
          ) : (
            enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {enrollment.course_name}
                      </CardTitle>
                      {enrollment.group_name && (
                        <p className="text-sm text-muted-foreground">
                          {enrollment.group_name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(enrollment.academic_status)}
                      {getPaymentBadge(enrollment.payment_status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de matrícula</p>
                        <p className="text-sm font-medium">
                          {formatDate(enrollment.enrollment_date)}
                        </p>
                      </div>
                    </div>

                    {enrollment.completion_date && (
                      <div className="flex items-start gap-2">
                        <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha de culminación</p>
                          <p className="text-sm font-medium">
                            {formatDate(enrollment.completion_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {enrollment.final_grade !== null && enrollment.final_grade !== undefined && (
                      <div className="flex items-start gap-2">
                        <IconBook className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Nota final</p>
                          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {enrollment.final_grade.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    )}

                    {enrollment.attendance_percentage !== null && enrollment.attendance_percentage !== undefined && (
                      <div className="flex items-start gap-2">
                        <IconClock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Asistencia</p>
                          <p className="text-sm font-medium">
                            {enrollment.attendance_percentage}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {enrollment.status_history && enrollment.status_history.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Historial de cambios
                      </p>
                      <div className="space-y-2">
                        {enrollment.status_history.map((history, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs">
                            <div className="flex-shrink-0 w-24 text-muted-foreground">
                              {formatDate(history.date)}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{history.status}</span>
                              {history.notes && (
                                <span className="text-muted-foreground"> - {history.notes}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <IconBook className="mr-2 h-4 w-4" />
            Exportar Historial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}