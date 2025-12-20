import { BaseTable } from "../plan/BaseTable";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KpiRef {
  id?: number;
  name?: string;
  unit?: string;
  target?: number;
}

interface Objetivo {
  id: number;
  title: string;
  description: string;
  kpis: Array<KpiRef | number | string>;
}

interface ObjetivoTableProps {
  data: Objetivo[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onViewKpis?: (id: number) => void;
}

const formatKpi = (kpi: KpiRef | number | string, index: number) => {
  if (typeof kpi === "number" || typeof kpi === "string") {
    return {
      key: `${kpi}-${index}`,
      label: `KPI ${kpi}`,
      detail: "",
    };
  }
  const label = kpi.name || `KPI ${kpi.id ?? index + 1}`;
  const target = kpi.target ? `${kpi.target} ${kpi.unit ?? ""}`.trim() : "";
  return {
    key: `${kpi.id ?? index}-${label}`,
    label,
    detail: target,
  };
};

export const ObjetivoTable = ({
  data,
  onEdit,
  onDelete,
  onViewKpis,
}: ObjetivoTableProps) => (
  <BaseTable headers={["ID", "Titulo", "Descripcion", "KPIs", "Acciones"]}>
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
            <p className="line-clamp-3 whitespace-pre-wrap">{obj.description}</p>
          </td>
          <td className="text-gray-700 dark:text-gray-200 text-left align-middle py-2">
            <div className="flex flex-wrap gap-2">
              {obj.kpis.slice(0, 4).map((kpi, index) => {
                const meta = formatKpi(kpi, index);
                return (
                  <span
                    key={meta.key}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-200"
                  >
                    {meta.label}
                    {meta.detail && (
                      <span className="text-[10px] text-blue-700 dark:text-blue-300">
                        {meta.detail}
                      </span>
                    )}
                  </span>
                );
              })}
              {obj.kpis.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{obj.kpis.length - 4} más
                </span>
              )}
            </div>
          </td>
          <td className="text-right align-middle py-2">
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                title="Ver KPIs"
                onClick={() => onViewKpis?.(obj.id)}
                className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Editar"
                onClick={() => onEdit?.(obj.id)}
                className="hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
              >
                <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </Button>
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
