import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UserCheck, FileText, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useState, useMemo } from "react";

interface Enrollment {
  id: number;
  student: string;
  course: string;
  amount: number;
  payment_status: 'paid' | 'pending' | 'partially_paid' | 'cancelled' | 'refunded';
  academic_status: 'active' | 'completed' | 'pending' | 'inactive' | 'dropped';
  enrollment_date?: string;
  progress?: number;
}

interface StateEnrollmentProps {
  data: Enrollment[];
  title?: string;
  description?: string;
  className?: string;
  itemsPerPage?: number;
  maxHeight?: string;
  showIcon?: boolean;
  stripedRows?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  formatCurrency?: (amount: number) => string;
}

export default function StateEnrollment({
  data,
  title = "Estado de Matrículas",
  description = "Seguimiento de pagos y estado académico",
  className,
  itemsPerPage = 10,
  maxHeight = "500px",
  showIcon = true,
  stripedRows = true,
  emptyMessage = "No hay matrículas registradas",
  emptyDescription = "No se encontraron matrículas para mostrar",
  formatCurrency = (amount: number) => `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
}: StateEnrollmentProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular paginación
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Función para determinar el estilo del estado de pago
  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          text: 'Pagado',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'partially_paid':
        return {
          text: 'Pago Parcial',
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        };
      case 'pending':
        return {
          text: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'cancelled':
        return {
          text: 'Cancelado',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      case 'refunded':
        return {
          text: 'Reembolsado',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
      default:
        return {
          text: status,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
    }
  };

  // Función para determinar el estilo del estado académico
  const getAcademicStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: 'Activo',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
      case 'completed':
        return {
          text: 'Completado',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'pending':
        return {
          text: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'inactive':
        return {
          text: 'Inactivo',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
      case 'dropped':
        return {
          text: 'Abandonado',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      default:
        return {
          text: status,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas con ellipsis
      if (currentPage <= 3) {
        // Primeras páginas
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Últimas páginas
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Páginas del medio
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const isEmpty = data.length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {isEmpty ? description : `${description} (${data.length} matrículas)`}
            </CardDescription>
          </div>
          {showIcon && <UserCheck className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isEmpty ? (
          // Estado vacío
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {emptyMessage}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {emptyDescription}
            </p>
          </div>
        ) : (
          // Estado con datos
          <>
            <div 
              className="overflow-x-auto p-6 pb-4"
              style={{ maxHeight }}
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      Estudiante
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      Curso
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      Monto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      Estado Pago
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      Estado Académico
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((enrollment, index) => {
                    const paymentStatus = getPaymentStatusInfo(enrollment.payment_status);
                    const academicStatus = getAcademicStatusInfo(enrollment.academic_status);
                    
                    return (
                      <tr
                        key={enrollment.id}
                        className={stripedRows && index % 2 === 0 ? "bg-muted/50 hover:bg-muted/70" : "hover:bg-muted/50 transition-colors"}
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          {enrollment.student}
                        </td>
                        <td className="py-3 px-4 text-sm">{enrollment.course}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(enrollment.amount)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.className}`}
                          >
                            {paymentStatus.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${academicStatus.className}`}
                          >
                            {academicStatus.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación moderna */}
            {totalPages > 1 && (
              <div className="border-t border-border px-6 py-4 bg-muted/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Información de la página */}
                  <div className="text-sm text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                      {startIndex + 1}-{Math.min(endIndex, data.length)}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-foreground">
                      {data.length}
                    </span>{" "}
                    matrículas
                  </div>

                  {/* Controles de paginación */}
                  <div className="flex items-center gap-2">
                    {/* Botón anterior */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        page === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-sm text-muted-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`min-w-[40px] px-3 py-2 text-sm rounded-md transition-colors ${
                              currentPage === page
                                ? 'bg-primary text-primary-foreground font-semibold'
                                : 'border border-border hover:bg-muted/50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>

                    {/* Botón siguiente */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Selector de items por página (opcional) */}
                {/* <div className="flex items-center justify-center mt-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Mostrar:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setCurrentPage(1);
                        // Nota: itemsPerPage es una prop, necesitarías un callback si quieres cambiarlo
                      }}
                      className="text-sm border border-border rounded-md px-2 py-1 bg-background"
                      disabled
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>por página</span>
                  </div>
                </div> */}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}