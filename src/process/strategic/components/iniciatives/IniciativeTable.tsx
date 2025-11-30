import { BaseTable } from "../plan/BaseTable";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

export interface IniciativeRow {
  id: number;
  title: string;
  status: string;
  plan_id: number | null;
  user_id: number | null;
  start_date: string;
  end_date: string;
}

interface Props {
  data: IniciativeRow[];
  onSelect?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const normalizeDate = (value?: string) => (value ? value.split("T")[0] : value);

const formatRange = (start?: string, end?: string) => {
  const s = normalizeDate(start);
  const e = normalizeDate(end);
  if (!s && !e) return "-";
  if (!s) return e ?? "-";
  if (!e) return s;
  return `${s} → ${e}`;
};

export const IniciativeTable = ({ data, onSelect, onEdit, onDelete }: Props) => (
  <BaseTable
    headers={[
      "ID",
      "Título",
      "Estado",
      "Plan",
      "Usuario",
      "Fechas",
      "Acciones",
    ]}
  >
    {data.length === 0 ? (
      <tr>
        <td
          colSpan={7}
          className="text-center py-4 text-gray-500 dark:text-gray-400"
        >
          No hay iniciativas registradas
        </td>
      </tr>
    ) : (
      data.map((ini) => (
        <tr
          key={ini.id}
          className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors duration-200"
        >
          <td className="font-medium text-center align-middle py-2">
            {ini.id}
          </td>
          <td className="text-left align-middle py-2">{ini.title}</td>
          <td className="capitalize text-center align-middle py-2">
            {ini.status.replaceAll("_", " ")}
          </td>
          <td className="text-center align-middle py-2">
            {ini.plan_id ?? "-"}
          </td>
          <td className="text-center align-middle py-2">
            {ini.user_id ?? "-"}
          </td>
          <td className="text-center align-middle py-2 text-sm text-muted-foreground">
            {formatRange(ini.start_date, ini.end_date)}
          </td>
          <td className="text-right align-middle py-2">
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                title="Ver detalle"
                onClick={() => onSelect?.(ini.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Editar"
                onClick={() => onEdit?.(ini.id)}
              >
                <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Eliminar"
                onClick={() => onDelete?.(ini.id)}
                className="hover:bg-red-100 dark:hover:bg-red-900"
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
