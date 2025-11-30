import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ClipboardList, FileText, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";

interface PayrollExpense {
  id: number;
  teacher: string;
  amount: number;
  date: string;
  type: 'monthly' | 'hourly' | 'contract' | string;
  contract_type?: string;
}

interface PersonalWalletProps {
  data: PayrollExpense[];
  totalAmount?: number;
  title?: string;
  description?: string;
  className?: string;
  maxItems?: number;
  maxHeight?: string;
  showIcon?: boolean;
  showTotal?: boolean;
  showViewMore?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  showEmptyAction?: boolean;
  onEmptyAction?: () => void;
  formatCurrency?: (amount: number) => string;
  formatDate?: (dateString: string) => string;
}

export default function PersonalWallet({
  data,
  totalAmount,
  title = "Nómina del Personal",
  description = "Pagos realizados este mes",
  className,
  maxItems = 5,
  maxHeight = "400px",
  showIcon = true,
  showTotal = true,
  showViewMore = true,
  emptyMessage = "No hay registros de nómina",
  emptyDescription = "No se encontraron pagos de personal para mostrar",
  showEmptyAction = false,
  onEmptyAction,
  formatCurrency = (amount: number) => `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-PE', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }),
}: PersonalWalletProps) {
  const [showAll, setShowAll] = useState(false);
  const [visibleItems, setVisibleItems] = useState(maxItems);

  // Calcular total si no se proporciona
  const calculatedTotal = useMemo(() => {
    return totalAmount !== undefined ? totalAmount : data.reduce((sum, expense) => sum + expense.amount, 0);
  }, [data, totalAmount]);

  // Datos para mostrar
  const displayData = useMemo(() => {
    return showAll ? data : data.slice(0, visibleItems);
  }, [data, showAll, visibleItems]);

  const hasMore = visibleItems < data.length;
  const totalItems = data.length;
  const isEmpty = data.length === 0;

  const toggleShowAll = () => {
    if (showAll) {
      setShowAll(false);
      setVisibleItems(maxItems);
    } else {
      setShowAll(true);
    }
  };

  const loadMore = () => {
    setVisibleItems(prev => Math.min(prev + maxItems, data.length));
  };

  // Función para determinar el texto del tipo de pago
  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'Mensual';
      case 'hourly':
        return 'Por Hora';
      case 'contract':
        return 'Contrato';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Función para determinar el color del tipo de pago
  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'hourly':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'contract':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {!isEmpty && (
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
            <CardDescription>
              {isEmpty ? description : `${description}`}
            </CardDescription>
          </div>
          {showIcon && (
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <ClipboardList className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          )}
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
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              {emptyDescription}
            </p>
            {showEmptyAction && (
              <button
                onClick={onEmptyAction}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <PlusCircle className="h-4 w-4" />
                Registrar primer pago
              </button>
            )}
          </div>
        ) : (
          // Estado con datos
          <>
            <div className="max-h-[400px] overflow-y-auto">
              <div className="space-y-2 p-4">
                {displayData.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-muted-foreground/20 transition-colors bg-card group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{expense.teacher}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(expense.date)}
                          </p>
                          <span className={`text-xs inline-flex items-center px-2 py-0.5 rounded-full font-medium ${getPaymentTypeColor(expense.type)}`}>
                            {getPaymentTypeText(expense.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-semibold text-sm text-red-600 dark:text-red-400 whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </p>
                      {expense.contract_type && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {expense.contract_type}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total de nómina */}
            {showTotal && (
              <div className="border-t border-border px-4 py-3 bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Total Nómina:</span>
                  <span className="font-bold text-lg text-red-600 dark:text-red-400">
                    {formatCurrency(calculatedTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Controles de paginación/vista */}
            {showViewMore && totalItems > maxItems && (
              <div className="border-t border-border p-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleShowAll}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Mostrar todos ({totalItems})
                      </>
                    )}
                  </button>

                  {!showAll && hasMore && (
                    <button
                      onClick={loadMore}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors font-medium px-2 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      Cargar más
                    </button>
                  )}

                  <span className="text-xs text-muted-foreground">
                    {displayData.length} de {totalItems}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}