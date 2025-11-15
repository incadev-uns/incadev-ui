import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookOpen, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface Course {
  id: number;
  name: string;
  version: string;
  price: number;
  status: 'published' | 'draft' | 'archived' | 'active';
  enrollments: number;
}

interface TableCourseProps {
  data: Course[];
  title?: string;
  description?: string;
  className?: string;
  formatCurrency?: (amount: number) => string;
  showIcon?: boolean;
  stripedRows?: boolean;
  pageSize?: number;
}

export default function TableCourse({
  data,
  title = "Cursos Disponibles",
  description = "Versiones de cursos y matrículas",
  className,
  formatCurrency = (amount: number) => `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  showIcon = true,
  stripedRows = true,
  pageSize = 10,
}: TableCourseProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calcular páginas
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);
  
  // Función para determinar el texto y estilo del estado
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return {
          text: 'Publicado',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'draft':
        return {
          text: 'Borrador',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'archived':
        return {
          text: 'Archivado',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('ellipsis-start');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                {data.length} cursos
              </span>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          {showIcon && (
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-hidden">
          <div className="overflow-x-auto pl-6 pr-6 pb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                    Curso
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                    Periodo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                    Precio
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                    Matrículas
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((course, index) => {
                  const statusInfo = getStatusInfo(course.status);
                  return (
                    <tr
                      key={course.id}
                      className={`border-b border-border transition-colors hover:bg-muted/30 ${
                        stripedRows && index % 2 === 0 ? "bg-muted/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-sm font-medium">{course.name}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {course.version}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(course.price)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="font-medium">{course.enrollments}</span>
                        <span className="text-muted-foreground text-xs ml-1">estudiantes</span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {data.length > pageSize && (
          <div className="border-t border-border px-4 py-3 bg-muted/20">
            <div className="flex items-center justify-between">
              {/* Información de la página actual */}
              <div className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium">
                  {startIndex + 1}-{Math.min(endIndex, data.length)}
                </span>{" "}
                de <span className="font-medium">{data.length}</span> cursos
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center gap-1">
                {/* Botón anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1 mx-2">
                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 py-1 text-muted-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`min-w-[2rem] h-8 px-2 text-sm rounded-md border transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-border hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Botón siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}