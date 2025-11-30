import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconEye,
  IconEdit,
  IconDotsVertical,
  IconChevronUp,
  IconChevronDown,
  IconArrowsSort
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

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  userRole: 'admin' | 'teacher';
  sortColumn: keyof Student | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof Student) => void;
  onStudentSelect: (student: Student) => void;
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

const getStatusBadge = (enrollments?: Enrollment[]) => {
  if (!enrollments || enrollments.length === 0) {
    return (
      <Badge variant="outline" className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20">
        Sin matrícula
      </Badge>
    );
  }

  const hasActive = enrollments.some(e => e.academic_status === 'active');

  return hasActive ? (
    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
      Activo
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
      Inactivo
    </Badge>
  );
};

const getEnrollmentsCount = (student: Student): number => {
  return student.enrollments?.length || 0;
};

const getCurrentCourses = (student: Student): number => {
  return student.enrollments?.filter(e => e.academic_status === 'active').length || 0;
};

export default function StudentTable({
  students,
  loading,
  userRole,
  sortColumn,
  sortDirection,
  onSort,
  onStudentSelect
}: StudentTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
          <p className="text-sm text-muted-foreground">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No hay estudiantes que coincidan con la búsqueda</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-indigo-50 dark:bg-indigo-950/20">
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                onClick={() => onSort('id')}
              >
                ID
                {sortColumn === 'id' ? (
                  sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                ) : (
                  <IconArrowsSort className="h-3 w-3 opacity-50" />
                )}
              </Button>
            </TableHead>
            
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                onClick={() => onSort('fullname')}
              >
                Estudiante
                {sortColumn === 'fullname' ? (
                  sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                ) : (
                  <IconArrowsSort className="h-3 w-3 opacity-50" />
                )}
              </Button>
            </TableHead>
            
            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400">
              DNI
            </TableHead>
            
            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400">
              Email
            </TableHead>
            
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                onClick={() => onSort('created_at')}
              >
                Fecha Registro
                {sortColumn === 'created_at' ? (
                  sortDirection === 'asc' ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
                ) : (
                  <IconArrowsSort className="h-3 w-3 opacity-50" />
                )}
              </Button>
            </TableHead>
            
            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400 text-center">
              Matrículas
            </TableHead>
            
            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400 text-center">
              Cursos actuales
            </TableHead>
            
            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-400">
              Estado
            </TableHead>
            
            <TableHead className="text-center font-semibold text-indigo-700 dark:text-indigo-400">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {students.map((student) => (
            <TableRow 
              key={student.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <TableCell className="font-semibold">
                #{student.id}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {student.avatar ? (
                      <img 
                        src={student.avatar} 
                        alt={student.fullname} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {getInitials(student.fullname)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {student.fullname}
                    </p>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                {student.dni}
              </TableCell>
              
              <TableCell className="text-muted-foreground text-sm">
                {student.email}
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                {formatDate(student.created_at)}
              </TableCell>
              
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20">
                  {getEnrollmentsCount(student)}
                </Badge>
              </TableCell>
              
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                  {getCurrentCourses(student)}
                </Badge>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(student.enrollments)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStudentSelect(student)}
                    title="Ver detalles"
                  >
                    <IconEye className="h-4 w-4" />
                  </Button>
                  {userRole === 'admin' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Editar estudiante"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Más opciones"
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}