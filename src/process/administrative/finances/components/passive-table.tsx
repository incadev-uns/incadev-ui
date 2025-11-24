import type { FC, ReactNode } from "react";
import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EstadoBadge from "@/process/administrative/finances/components/state-badge";

/** Estructura exacta usada en tu componente principal */
interface Pasivo {
  id: string;
  contrato: string;
  tipo: string;
  monto: number;
  fecha: string;
  descripcion: string;
  estado: string;
}

interface Props {
  pasivos: Pasivo[];
}

const PasivosTable: FC<Props> = ({ pasivos }) => {
  // ⚠️ Cuando no hay registros
  if (pasivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
            Pasivos - Gastos Operativos
          </CardTitle>
          <CardDescription>No hay registros de gastos en el período seleccionado</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron gastos registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 🎨 Badges según tipo de gasto
  const getTipoBadge = (tipo: string): ReactNode => {
    const badges: Record<string, ReactNode> = {
      "nómina": (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
          Nómina
        </Badge>
      ),
      "operativo": (
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
          Operativo
        </Badge>
      ),
      "servicios": (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
          Servicios
        </Badge>
      ),
    };

    return badges[tipo] || <Badge variant="outline">{tipo}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
          Pasivos - Gastos Operativos
        </CardTitle>
        <CardDescription>Registro de gastos de nómina y operación</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contrato</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pasivos.map((pasivo) => (
              <TableRow key={pasivo.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{pasivo.contrato}</p>
                    <p className="text-xs text-muted-foreground">
                      {pasivo.descripcion}
                    </p>
                  </div>
                </TableCell>

                <TableCell>{getTipoBadge(pasivo.tipo)}</TableCell>

                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
                    pasivo.monto
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <EstadoBadge estado={pasivo.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PasivosTable;
