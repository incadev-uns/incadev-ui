import { useEffect, useState } from "react";
import { config } from "@/config/strategic-config";
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
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConsulting, setIsConsulting] = useState(false);

  const [formData, setFormData] = useState({
    ruc: "",
    name: "",
    type: "",
    contact_phone: "",
    contact_email: "",
  });

  const apiUrl = config.apiUrl;
  const endpoints = config.endpoints.organizations;

  // ✅ Cargar token solo en cliente (previene el error SSR)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // 📦 Cargar organizaciones solo cuando exista el token
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetch(`${apiUrl}${endpoints.list}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrganizaciones(data.data ?? data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar organizaciones:", error);
        setLoading(false);
      });
  }, [token]);

  // 🔍 Consultar RUC
  const handleLookup = async () => {
    if (!formData.ruc) {
      alert("Por favor, ingresa un RUC antes de consultar.");
      return;
    }

    setIsConsulting(true);

    try {
      const res = await fetch(`${apiUrl}${endpoints.lookup(formData.ruc)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "No se pudo obtener información del RUC.");
      } else {
        // Solo reemplazamos si el backend devolvió datos válidos
        setFormData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          type: data.type || prev.type,
        }));
        alert("✅ Datos del RUC actualizados correctamente.");
      }
    } catch (error) {
      console.error("Error al consultar RUC:", error);
      alert(
        "Error al consultar la API de RUC. Puedes llenar los campos manualmente."
      );
    } finally {
      setIsConsulting(false);
    }
  };

  // 💾 Guardar nueva organización
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ruc || !formData.name || !formData.type) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    fetch(`${apiUrl}${endpoints.create}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject(err));
        return res.json();
      })
      .then((newOrg) => {
        setOrganizaciones([...organizaciones, newOrg]);
        setFormData({
          ruc: "",
          name: "",
          type: "",
          contact_phone: "",
          contact_email: "",
        });
        setShowModal(false);
      })
      .catch((err) => {
        console.error("Error al crear organización:", err);
        alert("Ocurrió un error al guardar la organización.");
      });
  };

  // 🔎 Filtro de búsqueda
  const filtered = organizaciones.filter(
    (o) =>
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.type?.toLowerCase().includes(search.toLowerCase()) ||
      o.contact_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.ruc?.includes(search)
  );

  // 🕒 Estado de carga
  if (loading)
    return (
      <StrategicLayout title="Dashboard - Gestión de Organizaciones">
        <div className="p-6 text-center text-muted-foreground">
          Cargando organizaciones...
        </div>
      </StrategicLayout>
    );

  return (
    <StrategicLayout title="Dashboard - Gestión de Organizaciones">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <h1 className="text-2xl font-bold">🏢 Organizaciones</h1>

        {/* 🧾 Lista y búsqueda */}
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
                  {/* 🔹 Campo RUC con botón de consulta */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="RUC"
                      value={formData.ruc}
                      onChange={(e) =>
                        setFormData({ ...formData, ruc: e.target.value })
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleLookup}
                      disabled={isConsulting}
                    >
                      {isConsulting ? "Consultando..." : "Consultar RUC"}
                    </Button>
                  </div>

                  <Input
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Tipo (client, partner o vendor)"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Teléfono de contacto"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_phone: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Email de contacto"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_email: e.target.value,
                      })
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

        {/* 📋 Tabla */}
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
                  <TableCell>{o.name}</TableCell>
                  <TableCell>{o.type}</TableCell>
                  <TableCell>{o.contact_phone}</TableCell>
                  <TableCell>{o.contact_email}</TableCell>
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
