import { BaseTable } from "../plan/BaseTable";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Kpi {
  name: string;
  unit: string;
  target: number;
}

interface Objetivo {
  id: number;
  title: string;
  description: string;
  kpis: Kpi[];
}

interface ObjetivoTableProps {
  data: Objetivo[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ObjetivoTable = ({
  data,
  onEdit,
  onDelete,
}: ObjetivoTableProps) => (
  <BaseTable headers={["ID", "Título", "Descripción", "KPIs", "Acciones"]}>
    {data.length === 0 ? (
      <tr>
        <td
          colSpan={5}
          className="text-center py-4 text-gray-500 dark:text-gray-400"
        >
          No hay objetivos registrados
        </td>
      </tr>
    ) : (
      data.map((obj) => (
        <tr
          key={obj.id}
          className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors duration-200"
        >
          <td className="font-medium text-gray-800 dark:text-gray-100 text-center align-middle py-2">
            {obj.id}
          </td>
          <td className="text-gray-700 dark:text-gray-200 text-left align-middle py-2">
            {obj.title}
          </td>
          <td className="text-gray-700 dark:text-gray-200 text-left align-middle py-2">
            {obj.description}
          </td>
          <td className="text-gray-700 dark:text-gray-200 text-left align-middle py-2">
            <ul className="list-disc pl-5 space-y-1">
              {obj.kpis.map((kpi, index) => (
                <li key={index}>
                  {kpi.name} ({kpi.target} {kpi.unit})
                </li>
              ))}
            </ul>
          </td>
          <td className="text-right align-middle py-2">
            <div className="flex justify-end gap-2">
              {/* Editar → amarillo */}
              <Button
                variant="ghost"
                size="icon"
                title="Editar"
                onClick={() => onEdit?.(obj.id)}
                className="hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
              >
                <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </Button>

              {/* Eliminar → rojo */}
              <Button
                variant="ghost"
                size="icon"
                title="Eliminar"
                onClick={() => onDelete?.(obj.id)}
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
