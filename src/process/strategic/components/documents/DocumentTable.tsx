import { BaseTable } from "../plan/BaseTable";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

export interface DocumentRow {
  id: number;
  name: string;
  type?: string | null;
  category?: string | null;
  visibility?: string | null;
  description?: string | null;
  file_url?: string | null;
  updated_at?: string;
}

interface Props {
  data: DocumentRow[];
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const formatDate = (value?: string) =>
  value ? value.split("T")[0] ?? value : "-";

export const DocumentTable = ({
  data,
  onView,
  onEdit,
  onDelete,
}: Props) => (
  <BaseTable
    headers={[
      "ID",
      "Nombre",
      "Tipo",
      "Categoria",
      "Visibilidad",
      "Actualizado",
      "Acciones",
    ]}
  >
    {data.length === 0 ? (
      <tr>
        <td
          colSpan={7}
          className="text-center py-4 text-gray-500 dark:text-gray-400"
        >
          No hay documentos registrados
        </td>
      </tr>
    ) : (
      data.map((doc) => (
        <tr
          key={doc.id}
          className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors duration-200"
        >
          <td className="font-medium text-center align-middle py-2">
            {doc.id}
          </td>
          <td className="text-left align-middle py-2">{doc.name}</td>
          <td className="text-left align-middle py-2">{doc.type || "-"}</td>
          <td className="text-left align-middle py-2">{doc.category || "-"}</td>
          <td className="text-left align-middle py-2">
            {doc.visibility || "-"}
          </td>
          <td className="text-center align-middle py-2">
            {formatDate(doc.updated_at)}
          </td>
          <td className="text-right align-middle py-2">
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                title="Ver detalle"
                onClick={() => onView?.(doc.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Editar"
                onClick={() => onEdit?.(doc.id)}
              >
                <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Eliminar"
                onClick={() => onDelete?.(doc.id)}
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
