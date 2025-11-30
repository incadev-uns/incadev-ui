import { type FC, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Activo {
  id: string;
  curso: string;
  precio_curso: number;
  total_matriculas: number;
  ingresos_verificados: number;
  ingresos_pendientes: number;
  estudiantes_activos: number;
  estudiantes_completados: number;
}

interface Props {
  activos: Activo[];
}

const ActivosTable: FC<Props> = ({ activos }) => {
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 5;

  // Calcular los cursos a mostrar
  const displayedActivos = showAll 
    ? activos 
    : activos.slice(0, itemsPerPage);

  if (activos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            Activos - Ingresos por Curso
          </CardTitle>
          <CardDescription>No hay datos de cursos activos disponibles</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron cursos activos con ingresos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col max-h-[600px]"> {/* Altura máxima fija */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          Activos - Ingresos por Curso
        </CardTitle>
        <CardDescription>
          Detalle de ingresos verificados y pendientes por programa
          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
            {activos.length} cursos totales
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {/* Contenedor con scroll */}
        <div className="h-full overflow-y-auto pr-2 -mr-2"> {/* Scroll vertical */}
          <div className="grid gap-3">
            {displayedActivos.map((activo) => (
              <div key={activo.id} className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
                {/* Header con nombre del curso y matrículas */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base leading-tight line-clamp-2">
                      {activo.curso}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activo.estudiantes_activos} estudiantes activos • {activo.estudiantes_completados} completados
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {activo.total_matriculas} matrículas
                  </Badge>
                </div>

                {/* Estadísticas de ingresos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ingresos verificados:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                        {new Intl.NumberFormat("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        }).format(activo.ingresos_verificados)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ingresos pendientes:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">
                        {new Intl.NumberFormat("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        }).format(activo.ingresos_pendientes)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Precio del curso:</span>
                      <span className="font-medium text-sm">
                        {new Intl.NumberFormat("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        }).format(activo.precio_curso)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total ingresos:</span>
                      <span className="font-medium text-sm">
                        {new Intl.NumberFormat("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        }).format(activo.ingresos_verificados + activo.ingresos_pendientes)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Footer con controles de visualización */}
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Mostrando {displayedActivos.length} de {activos.length} cursos
          </div>
          
          {activos.length > itemsPerPage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Ver todos ({activos.length})
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActivosTable;