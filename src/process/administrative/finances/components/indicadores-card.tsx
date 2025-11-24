import type { FC } from "react";
import { Activity, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Copiamos solo la parte que usa este componente:
interface Indicadores {
  eficiencia_cobranza: number;
  margen_neto: number;
  ingreso_promedio_por_curso: number;
  tasa_retencion: number;
}

const IndicadoresCard: FC<{ indicadores: Indicadores }> = ({ indicadores }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          Indicadores de Salud Financiera
        </CardTitle>
        <CardDescription>
          Métricas clave de desempeño financiero y operacional
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">

          {/* Eficiencia de Cobranza */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Eficiencia de Cobranza</span>
              <span className="text-sm font-bold">
                {indicadores.eficiencia_cobranza.toFixed(1)}%
              </span>
            </div>
            <Progress value={indicadores.eficiencia_cobranza} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Proporción de pagos verificados sobre el total facturado
            </p>
          </div>

          {/* Margen Neto */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Margen Neto</span>
              <span className="text-sm font-bold">
                {indicadores.margen_neto.toFixed(1)}%
              </span>
            </div>
            <Progress value={indicadores.margen_neto} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Rentabilidad después de gastos operativos
            </p>
          </div>

          {/* Tasa de Retención */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tasa de Retención</span>
              <span className="text-sm font-bold">
                {indicadores.tasa_retencion.toFixed(1)}%
              </span>
            </div>
            <Progress value={indicadores.tasa_retencion} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Estudiantes activos respecto al total matriculado
            </p>
          </div>

          {/* Ingreso Promedio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ingreso Promedio por Curso</span>
              <span className="text-sm font-bold">
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(indicadores.ingreso_promedio_por_curso)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              {indicadores.ingreso_promedio_por_curso === 0
                ? "No hay cursos activos para calcular el promedio"
                : "Promedio de ingresos verificados distribuidos entre cursos activos"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndicadoresCard;
