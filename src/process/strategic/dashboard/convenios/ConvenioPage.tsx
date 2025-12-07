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
  const apiUrl = config.apiUrl;
  const endpoints = config.endpoints;
  const [token, setToken] = useState<string | null>(null);

  const [convenios, setConvenios] = useState<any[]>([]);
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    organization_id: "",
    name: "",
    purpose: "",
    start_date: "",
    renewal_date: "",
    status: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgRes, convRes] = await Promise.all([
          fetch(`${apiUrl}${endpoints.organizations.list}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
          fetch(`${apiUrl}${endpoints.agreements.list}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
        ]);

        const orgData = await orgRes.json();
        const convData = await convRes.json();

        setOrganizaciones(Array.isArray(orgData.data) ? orgData.data : []);
        setConvenios(Array.isArray(convData.data) ? convData.data : []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.organization_id || !formData.name || !formData.status) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}${endpoints.agreements.create}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al crear convenio.");
        return;
      }

      setConvenios([...convenios, data]);
      setFormData({
        organization_id: "",
        name: "",
        purpose: "",
        start_date: "",
        renewal_date: "",
        status: "",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error al crear convenio:", error);
    }
  };

  const filtered = Array.isArray(convenios)
    ? convenios.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.purpose?.toLowerCase().includes(search.toLowerCase()) ||
          c.organization?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const stats = {
    active: convenios.filter((c) => c.status === "active").length,
    pending: convenios.filter((c) => c.status === "pending").length,
    expired: convenios.filter((c) => c.status === "expired").length,
    cancelled: convenios.filter((c) => c.status === "cancelled").length,
  };

  if (loading)
    return (
      <StrategicLayout title="Dashboard - Gestión de Convenios">
        <div className="p-6 text-center text-muted-foreground">
          Cargando convenios...
        </div>
      </StrategicLayout>
    );

  return (
    <StrategicLayout title="Dashboard - Gestión de Convenios">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <h1 className="text-2xl font-bold">🤝 Convenios</h1>

        {/* 📊 Tarjetas por estado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: "active", label: "Vigente", color: "border-b-green-500" },
            {
              key: "pending",
              label: "En evaluación",
              color: "border-b-yellow-500",
            },
            { key: "expired", label: "Vencido", color: "border-b-red-500" },
            {
              key: "cancelled",
              label: "Cancelado",
              color: "border-b-gray-400",
            },
          ].map(({ key, label, color }) => (
            <Card
              key={key}
              className={cn("shadow-sm transition-all border-b-4", color)}
            >
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {stats[key as keyof typeof stats]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 🧾 Lista y creación */}
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
                  {/* Select organización */}
                  <select
                    className="w-full border rounded-md p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
                    value={formData.organization_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Selecciona una organización</option>
                    {organizaciones.map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.ruc})
                      </option>
                    ))}
                  </select>

                  <Input
                    placeholder="Nombre del convenio"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />

                  <Input
                    placeholder="Propósito del convenio"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    required
                  />

                  {/* 🔘 Fechas con labels */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de inicio
                      </label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de renovación
                      </label>
                      <Input
                        type="date"
                        value={formData.renewal_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            renewal_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Select estado */}
                  <select
                    className="w-full border rounded-md p-2 capitalize bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona un estado</option>
                    <option value="active">Vigente</option>
                    <option value="pending">En evaluación</option>
                    <option value="expired">Vencido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>

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
                <TableHead>Organización</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Propósito</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Renovación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.organization?.name ?? "—"}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.purpose}</TableCell>
                  <TableCell>{c.start_date ?? "—"}</TableCell>
                  <TableCell>{c.renewal_date ?? "—"}</TableCell>
                  <TableCell>
                    <EstadoBadge estado={c.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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

/* 🎨 Estado visual */
function EstadoBadge({ estado }: { estado: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-300",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    expired: "bg-red-100 text-red-800 border-red-300",
    cancelled: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const labelMap: Record<string, string> = {
    active: "Vigente",
    pending: "En evaluación",
    expired: "Vencido",
    cancelled: "Cancelado",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border select-none capitalize",
        colorMap[estado] ?? "bg-gray-100 text-gray-700 border-gray-300"
      )}
    >
      {labelMap[estado] ?? estado}
    </span>
  );
}
