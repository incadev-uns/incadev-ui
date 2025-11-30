import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  IconMail,
  IconPhone,
  IconCalendar,
  IconBook,
  IconAward,
  IconTrendingUp,
  IconEdit,
  IconHistory
} from '@tabler/icons-react';

interface StudentProfile {
  interests?: string[] | null;
  learning_goal?: string | null;
}

interface Enrollment {
  id: number;
  academic_status: string;
  payment_status: string;
  group?: {
    course_version?: {
      course?: {
        name: string;
      };
    };
  };
}

interface Student {
  id: number;
  name: string;
  fullname: string;
  dni: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  created_at: string;
  student_profile?: StudentProfile;
  enrollments?: Enrollment[];
}

interface StudentDetailModalProps {
  student: Student | null;
  userRole: 'admin' | 'teacher';
  onClose: () => void;
  onEdit?: (student: Student) => void;
  onViewHistory?: (student: Student) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function StudentDetailModal({
  student,
  userRole,
  onClose,
  onEdit,
  onViewHistory
}: StudentDetailModalProps) {
  if (!student) return null;

  const enrollmentsCount = student.enrollments?.length || 0;
  const currentCourses = student.enrollments?.filter(e => e.academic_status === 'active').length || 0;
  const completedCourses = student.enrollments?.filter(e => e.academic_status === 'completed').length || 0;
  const isActive = student.enrollments?.some(e => e.academic_status === 'active') || false;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(student);
    }
  };

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory(student);
    }
  };

  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] lg:max-w-[90vw] xl:max-w-[60vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalles del Estudiante</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              {student.avatar ? (
                <img 
                  src={student.avatar} 
                  alt={student.fullname} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <span className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  {getInitials(student.fullname)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {student.fullname}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={isActive 
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                    : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'
                  }
                >
                  {isActive ? 'Activo' : 'Inactivo'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Registrado: {formatDate(student.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <Card className="mb-6">
          <CardContent className="p-3">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
              📋 Información Personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">DNI</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{student.dni}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <IconMail className="h-4 w-4" />
                  {student.email}
                </p>
              </div>
              {student.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <IconPhone className="h-4 w-4" />
                    {student.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                <p className="font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <IconCalendar className="h-4 w-4" />
                  {formatDate(student.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Summary */}
        <Card className="mb-6">
          <CardContent className="p-3">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
              📚 Resumen Académico
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <IconBook className="h-8 w-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {enrollmentsCount}
                </p>
                <p className="text-sm text-muted-foreground">Total Cursos</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <IconTrendingUp className="h-8 w-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {currentCourses}
                </p>
                <p className="text-sm text-muted-foreground">En Curso</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
                <IconAward className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {completedCourses}
                </p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <IconAward className="h-8 w-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">0</p>
                <p className="text-sm text-muted-foreground">Certificados</p>
              </div>
            </div>

            {/* Enrollments List */}
            {student.enrollments && student.enrollments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">
                  Cursos Matriculados
                </h4>
                <div className="space-y-2">
                  {student.enrollments.map((enrollment) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {enrollment.group?.course_version?.course?.name || 'Curso sin nombre'}
                      </span>
                      <div className="flex gap-2">
                        <Badge 
                          variant="outline"
                          className={enrollment.academic_status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'
                          }
                        >
                          {enrollment.academic_status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={enrollment.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          }
                        >
                          {enrollment.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {userRole === 'admin' && (
            <>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleEdit}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}