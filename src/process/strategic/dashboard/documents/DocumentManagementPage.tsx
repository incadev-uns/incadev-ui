import React, { useEffect, useMemo, useState } from "react";
import StrategicLayout from "../../StrategicLayout";
import { DashboardBreadcrumb } from "@/process/strategic/components/plan/Breadcrumb";
import {
  DocumentTable,
  type DocumentRow,
} from "@/process/strategic/components/documents/DocumentTable";
import { config as strategicConfig } from "@/config/strategic-config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StrategicDocument extends DocumentRow {
  file_id?: number | null;
}

const categoryOptions = [
  { value: "1", label: "Calidad" },
  { value: "2", label: "Alianzas" },
  { value: "3", label: "Innovacion" },
  { value: "4", label: "Infraestructura" },
  { value: "5", label: "Talento" },
];

const findCategoryLabel = (value: string) =>
  categoryOptions.find((c) => c.value === value)?.label ?? "";

const emptyForm = {
  name: "", // Se usa para título y compatibilidad con respuestas actuales
  type: "",
  category: "",
  categoryId: "",
  visibility: "",
  description: "",
  file: null as File | null,
};

const normalizeDocuments = (input: any): StrategicDocument[] => {
  const list = Array.isArray(input?.data)
    ? input.data
    : Array.isArray(input)
      ? input
      : input?.data
        ? [input.data]
        : [];

  return list
    .map((doc: any) => ({
      id: Number(doc.id) || 0,
      name: doc.name ?? doc.title ?? `Documento ${doc.id ?? ""}`,
      type: doc.type ?? null,
      category: doc.category ?? null,
      visibility: doc.visibility ?? null,
      description: doc.description ?? "",
      file_id: doc.file_id ?? doc.file?.id ?? null,
      file_url:
        doc.file?.secure_url ??
        doc.file?.url ??
        doc.file_url ??
        doc.path ??
        "",
      updated_at: doc.updated_at ?? doc.modified_at ?? doc.created_at ?? "",
    }))
    .filter((doc: StrategicDocument) => doc.id > 0);
};

export default function DocumentManagementPage() {
  const { toast } = useToast();

  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<StrategicDocument[]>([]);

  const [filters, setFilters] = useState({
    type: "",
    visibility: "",
    search: "",
  });

  const [form, setForm] = useState(emptyForm);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string>("");

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedId) ?? null,
    [selectedId, documents]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(`Bearer ${storedToken}`);
  }, []);

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const fetchDocuments = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicDocuments.list}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const normalized = normalizeDocuments(json).sort((a, b) => a.id - b.id);
      setDocuments(normalized);
    } catch (err: any) {
      setError(err?.message || "Error al cargar documentos.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormMode("create");
    setSelectedId(null);
    setCurrentFileUrl("");
    setEditOpen(true);
  };

  const openEdit = (id: number) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    setSelectedId(id);
    setForm({
      name: doc.name ?? "",
      type: doc.type ?? "",
      category: doc.category ?? "",
      categoryId: "",
      visibility: doc.visibility ?? "",
      description: doc.description ?? "",
      file: null,
    });
    setCurrentFileUrl(doc.file_url ?? "");
    setFormMode("edit");
    setEditOpen(true);
  };

  const openDetail = (id: number) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  const submitForm = async () => {
    if (!token) {
      toast({
        title: "No autorizado",
        description: "Token no disponible.",
        variant: "destructive",
      });
      return;
    }

    if (!form.name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Ingresa el nombre del documento.",
        variant: "destructive",
      });
      return;
    }

    if (!form.categoryId) {
      toast({
        title: "Categoría requerida",
        description: "Selecciona una categoría.",
        variant: "destructive",
      });
      return;
    }

    if (formMode === "create" && !form.file) {
      toast({
        title: "Archivo requerido",
        description: "Adjunta un archivo para crear el documento.",
        variant: "destructive",
      });
      return;
    }

    const isEdit = formMode === "edit" && selectedId;
    const url = isEdit
      ? `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicDocuments.update(
          selectedId as number
        )}`
      : `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicDocuments.create}`;

    const body = new FormData();
    // El backend espera title y category_id; enviamos también name/category por compatibilidad
    body.append("title", form.name);
    body.append("name", form.name);
    if (form.type) body.append("type", form.type);
    if (form.category) body.append("category", form.category);
    if (form.categoryId) body.append("category_id", form.categoryId);
    if (form.visibility) body.append("visibility", form.visibility);
    if (form.description) body.append("description", form.description);
    if (form.file) body.append("file", form.file);
    if (isEdit) body.append("_method", "PUT");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: token,
        },
        body,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }

      const json = await res.json().catch(() => null);
      const updated = normalizeDocuments(json);
      if (isEdit) {
        const doc = updated[0];
        setDocuments((prev) =>
          prev
            .map((d) => (d.id === (selectedId as number) ? { ...d, ...doc } : d))
            .sort((a, b) => a.id - b.id)
        );
      } else {
        setDocuments((prev) =>
          [...prev, ...(updated.length ? updated : [])].sort(
            (a, b) => a.id - b.id
          )
        );
      }

      setEditOpen(false);
      setForm(emptyForm);
      setCurrentFileUrl("");
      toast({
        title: isEdit ? "Documento actualizado" : "Documento creado",
        description: isEdit
          ? "Cambios guardados correctamente."
          : "Documento registrado.",
      });
    } catch (err: any) {
      toast({
        title: "No se pudo guardar",
        description: err?.message || "Revisa los datos e intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    const confirmed = confirm(
      "Eliminar este documento? Esta accion no se puede deshacer."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${strategicConfig.apiUrl}${strategicConfig.endpoints.strategicDocuments.delete(
          id
        )}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        }
      );
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast({
        title: "Documento eliminado",
        description: `Documento ${id} eliminado.`,
      });
    } catch (err: any) {
      toast({
        title: "Error al eliminar",
        description: err?.message || "No se pudo eliminar el documento.",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesType = filters.type
        ? (doc.type ?? "").toLowerCase().includes(filters.type.toLowerCase())
        : true;
      const matchesVisibility = filters.visibility
        ? (doc.visibility ?? "").toLowerCase() ===
          filters.visibility.toLowerCase()
        : true;
      const text = `${doc.name} ${doc.description ?? ""} ${doc.category ?? ""}`.toLowerCase();
      const matchesSearch = filters.search
        ? text.includes(filters.search.toLowerCase())
        : true;

      return matchesType && matchesVisibility && matchesSearch;
    });
  }, [documents, filters]);

  return (
    <StrategicLayout title="Gestion documentaria">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <DashboardBreadcrumb
          items={[{ label: "Inicio" }, { label: "Gestion documentaria" }]}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Documentos</h1>
            <p className="text-muted-foreground text-sm">
              Vincula documentos a objetivos estrategicos.
            </p>
          </div>
          <Button onClick={openCreate}>Nuevo documento</Button>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Tipo</Label>
              <Input
                placeholder="acta, convenio, informe..."
                value={filters.type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Visibilidad</Label>
              <Select
                value={filters.visibility}
                onValueChange={(v) => setFilters((f) => ({ ...f, visibility: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="internal">Interna</SelectItem>
                  <SelectItem value="restricted">Restringida</SelectItem>
                  <SelectItem value="public">Publica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Nombre, descripcion o categoria"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {loading ? (
          <p>Cargando documentos...</p>
        ) : (
          <DocumentTable
            data={filteredDocuments}
            onView={openDetail}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-[92vw] sm:w-[640px] md:max-w-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                {formMode === "create" ? "Nuevo documento" : "Editar documento"}
              </DialogTitle>
              <DialogDescription>
                Completa los datos y guarda los cambios.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Acta de reunion, Convenio, Informe..."
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Input
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  placeholder="acta, convenio, informe_kpi..."
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <div className="space-y-2">
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        categoryId: v,
                        category: findCategoryLabel(v) || f.category,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    placeholder="Etiqueta opcional (se mostrará en la lista)"
                  />
                </div>
              </div>
              <div>
                <Label>Visibilidad</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, visibility: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona visibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Interna</SelectItem>
                    <SelectItem value="restricted">Restringida</SelectItem>
                    <SelectItem value="public">Publica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Notas, alcance, detalles..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Archivo</Label>
                <Input
                  type="file"
                  accept="*/*"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                />
                {currentFileUrl ? (
                  <a
                    href={currentFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Ver archivo actual
                  </a>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Tamano maximo 10MB. Se almacenara en Cloudinary.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setEditOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button onClick={submitForm} className="w-full sm:w-auto">
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="w-[92vw] sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalle de documento</DialogTitle>
              <DialogDescription>
                {selectedDoc?.name ?? "Informacion del documento"}
              </DialogDescription>
            </DialogHeader>
            {selectedDoc ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Nombre: </span>
                  {selectedDoc.name}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Tipo: </span>
                    {selectedDoc.type || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Categoria: </span>
                    {selectedDoc.category || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Visibilidad: </span>
                    {selectedDoc.visibility || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Actualizado: </span>
                    {selectedDoc.updated_at || "-"}
                  </div>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">
                  {selectedDoc.description || "Sin descripcion"}
                </p>
                <div className="truncate">
                  <span className="font-semibold">Archivo: </span>
                  {selectedDoc.file_url ? (
                    <a
                      className="text-primary underline"
                      href={selectedDoc.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir enlace
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                {selectedDoc.file_url ? (
                  <div className="mt-4 space-y-2">
                    <span className="font-semibold">Vista previa:</span>
                    <div className="rounded-md border overflow-hidden">
                      <iframe
                        title="Vista previa del documento"
                        src={selectedDoc.file_url}
                        className="w-full h-96"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Selecciona un documento para ver el detalle.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StrategicLayout>
  );
}
