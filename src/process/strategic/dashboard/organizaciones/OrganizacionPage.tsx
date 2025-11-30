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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrganizacionesPage() {
  // 📊 Datos simulados
  const [organizaciones, setOrganizaciones] = useState([
    {
      ruc: "20123456789",
      nombre: "Universidad X",
      tipo: "Universidad",
      telefono: "987654321",
      email: "contacto@universidadx.edu.pe",
    },
    {
      ruc: "20567891234",
      nombre: "Empresa Y SAC",
      tipo: "Empresa Privada",
      telefono: "956789123",
      email: "rrhh@empresay.com",
    },
    {
      ruc: "20876543210",
      nombre: "Ministerio Z",
      tipo: "Gobierno",
      telefono: "912345678",
      email: "info@ministerioz.gob.pe",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 🧾 Estado para el nuevo registro
  const [formData, setFormData] = useState({
    ruc: "",
    nombre: "",
    tipo: "",
    telefono: "",
    email: "",
  });

  // 🔍 Filtro de búsqueda
  const filtered = organizaciones.filter(
    (o) =>
      o.nombre.toLowerCase().includes(search.toLowerCase()) ||
      o.tipo.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.ruc.includes(search)
  );

  // 💾 Guardar nueva organización
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ruc || !formData.nombre || !formData.tipo) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    setOrganizaciones([...organizaciones, formData]);
    setFormData({ ruc: "", nombre: "", tipo: "", telefono: "", email: "" });
    setShowModal(false);
  };

  return (
    <StrategicLayout title="Dashboard - Gestión de Organizaciones">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        {/* 🏷️ Título */}
        <h1 className="text-2xl font-bold">🏢 Organizaciones</h1>

        {/* 🧾 Lista de organizaciones */}
        <div className="flex items-center justify-between mt-6">
          <h2 className="text-xl font-semibold">Lista de organizaciones</h2>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar organización..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[220px]"
            />

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="default">+ Nueva organización</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar nueva organización</DialogTitle>
                </DialogHeader>

                <form className="space-y-3 mt-3" onSubmit={handleSubmit}>
                  <Input
                    placeholder="RUC"
                    value={formData.ruc}
                    onChange={(e) =>
                      setFormData({ ...formData, ruc: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Tipo (Ej: Universidad, Empresa, etc.)"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Teléfono de contacto"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Email de contacto"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
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

        {/* 📋 Tabla de organizaciones */}
        <div className="border rounded-md overflow-x-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RUC</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o, i) => (
                <TableRow key={i}>
                  <TableCell>{o.ruc}</TableCell>
                  <TableCell>{o.nombre}</TableCell>
                  <TableCell>{o.tipo}</TableCell>
                  <TableCell>{o.telefono}</TableCell>
                  <TableCell>{o.email}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-4"
                  >
                    No se encontraron organizaciones.
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
