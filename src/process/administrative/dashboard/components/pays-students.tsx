import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";

interface Payment {
  id: number;
  student: string;
  amount: number;
  date: string;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  course?: string;
  operation_number?: string;
}

interface PaysStudentsProps {
  data: Payment[];
  title?: string;
  description?: string;
  className?: string;
  maxItems?: number;
  maxHeight?: string;
  showIcon?: boolean;
  showCourse?: boolean;
  showViewMore?: boolean;
  formatCurrency?: (amount: number) => string;
  formatDate?: (dateString: string) => string;
}

export default function PaysStudents({
  data,
  title = "Pagos de Estudiantes",
  description = "Últimas transacciones registradas",
  className,
  maxItems = 10,
  maxHeight = "400px",
  showIcon = true,
  showCourse = false,
  showViewMore = true,
  formatCurrency = (amount: number) => `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-PE', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }),
}: PaysStudentsProps) {
  const [showAll, setShowAll] = useState(false);
  const [visibleItems, setVisibleItems] = useState(maxItems);

  // Datos para mostrar
  const displayData = useMemo(() => {
    return showAll ? data : data.slice(0, visibleItems);
  }, [data, showAll, visibleItems]);

  // Función para cargar más items
  const loadMore = () => {
    setVisibleItems(prev => prev + maxItems);
  };

  // Función para determinar el estilo del estado
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          text: 'Aprobado',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'pending':
        return {
          text: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'rejected':
        return {
          text: 'Rechazado',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      case 'cancelled':
        return {
          text: 'Cancelado',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
      default:
        return {
          text: status,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
    }
  };

  const hasMore = visibleItems < data.length;
  const totalItems = data.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description} ({totalItems} registros)
            </CardDescription>
          </div>
          {showIcon && <DollarSign className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="space-y-3 p-6 pb-4 overflow-y-auto"
          style={{ maxHeight }}
        >
          {displayData.map((payment) => {
            const statusInfo = getStatusInfo(payment.status);
            
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-muted-foreground/20 transition-colors bg-card"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{payment.student}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.date)}
                    </p>
                    {showCourse && payment.course && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {payment.course}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-semibold text-sm text-green-600 dark:text-green-400 whitespace-nowrap">
                    {formatCurrency(payment.amount)}
                  </p>
                  <span
                    className={`text-xs inline-flex items-center px-2 py-0.5 rounded-full font-medium ${statusInfo.className}`}
                  >
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controles de paginación/vista */}
        {showViewMore && totalItems > maxItems && (
          <div className="border-t border-border px-6 py-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Mostrando {displayData.length} de {totalItems} pagos
              </span>
              
              <div className="flex gap-2">
                {!showAll && hasMore && (
                  <button
                    onClick={loadMore}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 px-3 py-1 rounded-md border border-border hover:border-primary/20 transition-colors"
                  >
                    <ChevronDown className="h-3 w-3" />
                    Cargar más
                  </button>
                )}
                
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1 rounded-md border border-border hover:border-muted-foreground/30 transition-colors"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Ver todos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}