"use client";

import { useState, useEffect } from "react";
import TechnologyLayout from "@/process/technology/TechnologyLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Server,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
  Shield,
  Clock,
  ExternalLink,
} from "lucide-react";
import { config } from "@/config/technology-config";
import { routes } from "@/process/technology/technology-site";

interface ServerData {
  id: number;
  name: string;
  ip_address: string;
  type: "physical" | "virtual" | "cloud";
  status: "online" | "offline" | "maintenance" | "warning";
  os: string;
  location: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  uptime?: string;
  last_check?: string;
  description?: string;
  created_at: string;
}

// Datos de ejemplo para demostración (mientras se implementa el backend)
const mockServers: ServerData[] = [
  {
    id: 1,
    name: "PROD-WEB-01",
    ip_address: "192.168.1.100",
    type: "physical",
    status: "online",
    os: "Ubuntu 22.04 LTS",
    location: "Datacenter Principal",
    cpu_usage: 45,
    memory_usage: 62,
    disk_usage: 78,
    uptime: "45 días, 12 horas",
    last_check: "2024-01-15T10:30:00",
    description: "Servidor web principal de producción",
    created_at: "2023-06-15T00:00:00",
  },
  {
    id: 2,
    name: "PROD-DB-01",
    ip_address: "192.168.1.101",
    type: "physical",
    status: "online",
    os: "CentOS 8",
    location: "Datacenter Principal",
    cpu_usage: 35,
    memory_usage: 85,
    disk_usage: 55,
    uptime: "120 días, 8 horas",
    last_check: "2024-01-15T10:30:00",
    description: "Servidor de base de datos MySQL",
    created_at: "2023-01-10T00:00:00",
  },
  {
    id: 3,
    name: "DEV-APP-01",
    ip_address: "192.168.2.50",
    type: "virtual",
    status: "online",
    os: "Debian 11",
    location: "VMware Cluster",
    cpu_usage: 20,
    memory_usage: 40,
    disk_usage: 30,
    uptime: "10 días, 5 horas",
    last_check: "2024-01-15T10:28:00",
    description: "Servidor de desarrollo de aplicaciones",
    created_at: "2023-11-20T00:00:00",
  },
  {
    id: 4,
    name: "AWS-PROD-01",
    ip_address: "54.123.45.67",
    type: "cloud",
    status: "warning",
    os: "Amazon Linux 2",
    location: "AWS us-east-1",
    cpu_usage: 92,
    memory_usage: 78,
    disk_usage: 60,
    uptime: "30 días, 2 horas",
    last_check: "2024-01-15T10:25:00",
    description: "Instancia EC2 para microservicios",
    created_at: "2023-09-05T00:00:00",
  },
  {
    id: 5,
    name: "BACKUP-01",
    ip_address: "192.168.1.200",
    type: "physical",
    status: "maintenance",
    os: "Windows Server 2022",
    location: "Datacenter Secundario",
    cpu_usage: 5,
    memory_usage: 15,
    disk_usage: 95,
    uptime: "0 días",
    last_check: "2024-01-15T08:00:00",
    description: "Servidor de respaldos - En mantenimiento programado",
    created_at: "2022-03-15T00:00:00",
  },
];

export default function ServersPage() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [filteredServers, setFilteredServers] = useState<ServerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedServer, setSelectedServer] = useState<ServerData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    filterServers();
  }, [servers, searchTerm, filterStatus, filterType]);

  const fetchServers = async () => {
    setIsLoading(true);
    try {
      // Por ahora usamos datos de ejemplo
      // En el futuro, esto será una llamada al API
      // const response = await fetch(`${config.apiUrl}/infrastructure/servers`);
      // const data = await response.json();
      // setServers(data);

      // Simulamos un delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      setServers(mockServers);
    } catch (error) {
      console.error("Error fetching servers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServers = () => {
    let filtered = [...servers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.ip_address.includes(term) ||
          s.os.toLowerCase().includes(term) ||
          s.location.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((s) => s.type === filterType);
    }

    setFilteredServers(filtered);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
      online: {
        label: "En línea",
        color: "text-emerald-500",
        icon: CheckCircle2,
        bgColor: "bg-emerald-500/10",
      },
      offline: {
        label: "Fuera de línea",
        color: "text-red-500",
        icon: XCircle,
        bgColor: "bg-red-500/10",
      },
      maintenance: {
        label: "En mantenimiento",
        color: "text-amber-500",
        icon: Clock,
        bgColor: "bg-amber-500/10",
      },
      warning: {
        label: "Advertencia",
        color: "text-orange-500",
        icon: AlertTriangle,
        bgColor: "bg-orange-500/10",
      },
    };
    return configs[status] || configs.offline;
  };

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      physical: { label: "Físico", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      virtual: { label: "Virtual", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      cloud: { label: "Cloud", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
    };
    return configs[type] || configs.physical;
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "bg-red-500";
    if (usage >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openServerDetail = (server: ServerData) => {
    setSelectedServer(server);
    setIsDetailOpen(true);
  };

  // Stats
  const stats = {
    total: servers.length,
    online: servers.filter((s) => s.status === "online").length,
    offline: servers.filter((s) => s.status === "offline").length,
    warning: servers.filter((s) => s.status === "warning" || s.status === "maintenance").length,
  };

  return (
    <TechnologyLayout
      breadcrumbs={[
        { label: "Infraestructura", href: routes.infrastructure.dashboard },
        { label: "Servidores" },
      ]}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Servidores</h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo y administración de servidores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchServers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servidor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Servidores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Wifi className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.online}</p>
              <p className="text-sm text-muted-foreground">En línea</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10">
              <WifiOff className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.offline}</p>
              <p className="text-sm text-muted-foreground">Fuera de línea</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.warning}</p>
              <p className="text-sm text-muted-foreground">Con alertas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, IP, SO o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="online">En línea</SelectItem>
                <SelectItem value="offline">Fuera de línea</SelectItem>
                <SelectItem value="maintenance">En mantenimiento</SelectItem>
                <SelectItem value="warning">Con advertencias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="physical">Físico</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Servers Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredServers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Server className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron servidores
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Agrega un nuevo servidor para comenzar"}
            </p>
            {!searchTerm && filterStatus === "all" && filterType === "all" && (
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servidor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServers.map((server) => {
            const statusConfig = getStatusConfig(server.status);
            const typeConfig = getTypeConfig(server.type);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={server.id}
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => openServerDetail(server)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                        <Server className={`h-5 w-5 ${statusConfig.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {server.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs">
                          {server.ip_address}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openServerDetail(server); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status & Type badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    <Badge variant="outline" className={typeConfig.color}>
                      {typeConfig.label}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="truncate">{server.os}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="truncate">{server.location}</span>
                    </div>
                  </div>

                  {/* Usage indicators */}
                  {server.status === "online" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Cpu className="h-3 w-3" /> CPU
                        </span>
                        <span className="font-medium">{server.cpu_usage}%</span>
                      </div>
                      <Progress
                        value={server.cpu_usage}
                        className="h-1.5"
                      />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <MemoryStick className="h-3 w-3" /> RAM
                        </span>
                        <span className="font-medium">{server.memory_usage}%</span>
                      </div>
                      <Progress
                        value={server.memory_usage}
                        className="h-1.5"
                      />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <HardDrive className="h-3 w-3" /> Disco
                        </span>
                        <span className="font-medium">{server.disk_usage}%</span>
                      </div>
                      <Progress
                        value={server.disk_usage}
                        className="h-1.5"
                      />
                    </div>
                  )}

                  {/* Uptime */}
                  {server.uptime && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Uptime: {server.uptime}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Server Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedServer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${getStatusConfig(selectedServer.status).bgColor}`}>
                    <Server className={`h-6 w-6 ${getStatusConfig(selectedServer.status).color}`} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedServer.name}</DialogTitle>
                    <DialogDescription className="font-mono">
                      {selectedServer.ip_address}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status badges */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getStatusConfig(selectedServer.status).bgColor} ${getStatusConfig(selectedServer.status).color} border-0`}
                  >
                    {getStatusConfig(selectedServer.status).label}
                  </Badge>
                  <Badge variant="outline" className={getTypeConfig(selectedServer.type).color}>
                    {getTypeConfig(selectedServer.type).label}
                  </Badge>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sistema Operativo</p>
                    <p className="font-medium">{selectedServer.os}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{selectedServer.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium">{selectedServer.uptime || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Última verificación</p>
                    <p className="font-medium">
                      {selectedServer.last_check ? formatDate(selectedServer.last_check) : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {selectedServer.description && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="text-sm">{selectedServer.description}</p>
                  </div>
                )}

                {/* Usage details */}
                {selectedServer.status === "online" && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium">Uso de Recursos</h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">CPU</span>
                          <span className="text-sm font-medium">{selectedServer.cpu_usage}%</span>
                        </div>
                        <Progress value={selectedServer.cpu_usage} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Memoria</span>
                          <span className="text-sm font-medium">{selectedServer.memory_usage}%</span>
                        </div>
                        <Progress value={selectedServer.memory_usage} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Disco</span>
                          <span className="text-sm font-medium">{selectedServer.disk_usage}%</span>
                        </div>
                        <Progress value={selectedServer.disk_usage} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Cerrar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Server Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Servidor</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo servidor a monitorear
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del servidor</Label>
                <Input id="name" placeholder="PROD-WEB-01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip">Dirección IP</Label>
                <Input id="ip" placeholder="192.168.1.100" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Físico</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="cloud">Cloud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">Sistema Operativo</Label>
                <Input id="os" placeholder="Ubuntu 22.04 LTS" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" placeholder="Datacenter Principal" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" placeholder="Descripción del servidor..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsAddOpen(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Servidor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TechnologyLayout>
  );
}
