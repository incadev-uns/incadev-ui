import type { FC } from "react";
import { Badge } from "@/components/ui/badge";

interface EstadoBadgeProps {
  estado: string; // "pagado" | "pendiente" | cualquier otro valor
}

const EstadoBadge: FC<EstadoBadgeProps> = ({ estado }) => {
  if (estado === "pagado") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
      >
        Pagado
      </Badge>
    );
  }

  if (estado === "pendiente") {
    return (
      <Badge
        variant="outline"
        className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
      >
        Pendiente
      </Badge>
    );
  }

  // Cualquier otro estado desconocido
  return (
    <Badge variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-300">
      {estado}
    </Badge>
  );
};

export default EstadoBadge;
