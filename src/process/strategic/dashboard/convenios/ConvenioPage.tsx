import { useState } from "react";
import StrategicLayout from "../../StrategicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function ConvenioPage() {
  // 📊 Datos simulados
  const [convenios, setConvenios] = useState([
    {
      organizacion: "Universidad X",
      nombre: "Convenio Académico",
      proposito: "Intercambio de investigación y formación docente",
      fecha: "2025-04-01",
      estado: "Por hacer",
    },
    {
      organizacion: "Empresa Y",
      nombre: "Intercambio Laboral",
      proposito: "Fomentar prácticas preprofesionales en estudiantes",
      fecha: "2025-06-15",
      estado: "En progreso",
    },
    {
      organizacion: "Ministerio Z",
      nombre: "Apoyo Tecnológico",
      proposito: "Desarrollo de herramientas digitales conjuntas",
      fecha: "2026-01-10",
      estado: "Completado",
    },
  ]);

  // 🔢 Conteos por estado
  const stats = {
    "Por hacer": convenios.filter((c) => c.estado === "Por hacer").length,
    "En progreso": convenios.filter((c) => c.estado === "En progreso").length,
    Completado: convenios.filter((c) => c.estado === "Completado").length,
  };

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 🧾 Estado del nuevo convenio
  const [formData, setFormData] = useState({
    organizacion: "",
    nombre: "",
    proposito: "",
    fecha: "",
    estado: "",
  });

  // 🔍 Filtro de convenios
  const filtered = convenios.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.organizacion.toLowerCase().includes(search.toLowerCase()) ||
      c.proposito.toLowerCase().includes(search.toLowerCase())
  );

  // 💾 Guardar nuevo convenio
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.organizacion || !formData.nombre || !formData.proposito) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    setConvenios([...convenios, formData]);
    setFormData({
      organizacion: "",
      nombre: "",
      proposito: "",
      fecha: "",
      estado: "",
    });
    setShowModal(false);
  };

  return (
    <StrategicLayout title="Dashboard - Gestión de Convenios">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        {/* 🏷️ Título */}
        <h1 className="text-2xl font-bold">🤝 Convenios</h1>

        {/* 📊 Tarjetas de estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats).map(([estado, cantidad]) => {
            const borderColor = {
              "Por hacer": "border-b-4 border-b-blue-500",
              "En progreso": "border-b-4 border-b-yellow-500",
              Completado: "border-b-4 border-b-green-500",
            }[estado];

            return (
              <Card
                key={estado}
                className={cn("shadow-sm transition-all", borderColor)}
              >
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {estado}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{cantidad}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 🧾 Lista de convenios */}
        <div className="flex items-center justify-between mt-6">
          <h2 className="text-xl font-semibold">Lista de convenios</h2>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar convenio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[220px]"
            />

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="default">+ Nuevo convenio</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar nuevo convenio</DialogTitle>
                </DialogHeader>

                <form className="space-y-3 mt-3" onSubmit={handleSubmit}>
                  <Input
                    placeholder="Organización"
                    value={formData.organizacion}
                    onChange={(e) =>
                      setFormData({ ...formData, organizacion: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Nombre del convenio"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Propósito del convenio"
                    value={formData.proposito}
                    onChange={(e) =>
                      setFormData({ ...formData, proposito: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Fecha de renovación"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Estado"
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                  />
                  <Button type="submit" className="w-full">
                    Guardar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 📋 Tabla de convenios */}
        <div className="border rounded-md overflow-x-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Propósito</TableHead>
                <TableHead>Fecha de renovación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.organizacion}</TableCell>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.proposito}</TableCell>
                  <TableCell>{c.fecha}</TableCell>
                  <TableCell>
                    <EstadoBadge estado={c.estado} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-4"
                  >
                    No se encontraron convenios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </StrategicLayout>
  );
}

/* 🟢🟡🔵 Componente visual para mostrar el estado */
function EstadoBadge({ estado }: { estado: string }) {
  const colorMap: Record<string, string> = {
    "Por hacer": "bg-blue-100 text-blue-800 border-blue-300",
    "En progreso": "bg-yellow-100 text-yellow-800 border-yellow-300",
    Completado: "bg-green-100 text-green-800 border-green-300",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border select-none",
        colorMap[estado] ?? "bg-gray-100 text-gray-700 border-gray-300"
      )}
    >
      {estado}
    </span>
  );
}
