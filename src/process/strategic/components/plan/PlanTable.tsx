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

export const PlanTable = ({ data, onEdit, onDelete }: PlanTableProps) => (
  <BaseTable
    headers={["ID", "Título", "Estado", "Objetivos", "Iniciativas", "Acciones"]}
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
      data.map((plan) => (
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
          <td className="capitalize text-gray-700 dark:text-gray-200 text-center align-middle py-2">
            {plan.status.replace("_", " ")}
          </td>
          <td className="text-gray-700 dark:text-gray-200 text-center align-middle py-2">
            {plan.objectives_count}
          </td>
          <td className="text-gray-700 dark:text-gray-200 text-center align-middle py-2">
            {plan.iniciatives_count}
          </td>
          <td className="text-right align-middle py-2">
            <div className="flex justify-end gap-2">
              {/* Ver Objetivos → azul */}
              <a
                href={`/estrategico/plan/objetivos?planId=${plan.id}`}
                title="Ver Objetivos"
                className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </a>

              {/* Editar → amarillo */}
              <Button
                variant="ghost"
                size="icon"
                title="Editar"
                onClick={() => onEdit?.(plan.id)}
                className="hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
              >
                <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </Button>

              {/* Eliminar → rojo */}
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
      ))
    )}
  </BaseTable>
);
