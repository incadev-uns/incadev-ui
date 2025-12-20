import { BaseTable } from "./BaseTable";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: number;
  title: string;
  status: string;
  objectives_count: number;
  iniciatives_count: number;
}

interface PlanTableProps {
  data: Plan[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  borrador: {
    label: "Borrador",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800",
  },
  activo: {
    label: "Activo",
    className:
      "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800",
  },
  cerrado: {
    label: "Cerrado",
    className:
      "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-700",
  },
};

const getStatusMeta = (status: string) => {
  const key = (status || "").toLowerCase();
  return (
    statusStyles[key] || {
      label: status?.replace("_", " "),
      className:
        "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700",
    }
  );
};

export const PlanTable = ({ data, onEdit, onDelete }: PlanTableProps) => (
  <BaseTable
    headers={["ID", "Titulo", "Estado", "Objetivos", "Iniciativas", "Acciones"]}
  >
    {data.length === 0 ? (
      <tr>
        <td
          colSpan={6}
          className="text-center py-4 text-gray-500 dark:text-gray-400"
        >
          No hay planes registrados
        </td>
      </tr>
    ) : (
      data.map((plan) => {
        const status = getStatusMeta(plan.status);
        return (
          <tr
            key={plan.id}
            className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors duration-200"
          >
            <td className="font-medium text-gray-800 dark:text-gray-100 text-center align-middle py-2">
              {plan.id}
            </td>
            <td className="text-gray-700 dark:text-gray-200 text-left align-middle py-2">
              {plan.title}
            </td>
            <td className="text-center align-middle py-2">
              <span
                className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full capitalize ${status.className}`}
              >
                {status.label}
              </span>
            </td>
            <td className="text-gray-700 dark:text-gray-200 text-center align-middle py-2">
              {plan.objectives_count}
            </td>
            <td className="text-gray-700 dark:text-gray-200 text-center align-middle py-2">
              {plan.iniciatives_count}
            </td>
            <td className="text-right align-middle py-2">
              <div className="flex justify-end gap-2">
                <a
                  href={`/estrategico/plan/objetivos?planId=${plan.id}`}
                  title="Ver Objetivos"
                  className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </a>

                <Button
                  variant="ghost"
                  size="icon"
                  title="Editar"
                  onClick={() => onEdit?.(plan.id)}
                  className="hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  title="Eliminar"
                  onClick={() => onDelete?.(plan.id)}
                  className="hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </Button>
              </div>
            </td>
          </tr>
        );
      })
    )}
  </BaseTable>
);
