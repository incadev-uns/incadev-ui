import { useState, useEffect } from "react"
import { TechnologyLayout } from "../components/TechnologyLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreVertical, Loader2, AlertTriangle, Clock } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { Alert } from "@/types/developer-web"
import { AlertForm } from "./AlertForm"
import { AlertStatusLabels, AlertStatusColors, AlertItemTypeLabels, AlertItemTypeColors } from "@/types/developer-web"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<number | null>(null)

  useEffect(() => {
    loadAlerts()
    loadStats()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)

      const params: any = {}
      if (search && search.trim() !== '') params.search = search
      if (statusFilter !== "all") params.status = statusFilter
      if (typeFilter !== "all") params.item_type = typeFilter

      const response = await technologyApi.developerWeb.alerts.list(params)
      if (response.success && response.data) {
        setAlerts(response.data.data || response.data)
      }
    } catch (error) {
      console.error("Error al cargar alertas:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await technologyApi.developerWeb.alerts.stats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  const handleDelete = async () => {
    if (!alertToDelete) return
    try {
      await technologyApi.developerWeb.alerts.delete(alertToDelete)
      loadAlerts()
      loadStats()
      setDeleteDialogOpen(false)
      setAlertToDelete(null)
    } catch (error) {
      console.error("Error al eliminar alerta:", error)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedAlert(null)
    loadAlerts()
    loadStats()
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      loadAlerts()
    }
  }

  const isActive = (alert: Alert) => {
    const now = new Date()
    const start = new Date(alert.start_date)
    const end = new Date(alert.end_date)
    return now >= start && now <= end && alert.status === "active"
  }

  return (
    <TechnologyLayout breadcrumbs={[{ label: "Alertas" }]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Alertas</h1>
            <p className="text-muted-foreground">
              Administra las alertas del sistema
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Alerta
          </Button>
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.published || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activas Ahora</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active_now || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiran Pronto</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.expiring_soon || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.status_counts && Object.entries(stats.status_counts).map(([status, count]: [string, any]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{AlertStatusLabels[status as keyof typeof AlertStatusLabels] || status}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.by_type && Object.entries(stats.by_type).map(([type, count]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{AlertItemTypeLabels[type as keyof typeof AlertItemTypeLabels] || type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra las alertas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="information">Información</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAlerts} variant="secondary">
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Alertas</CardTitle>
            <CardDescription>
              Todas las alertas del sistema ({alerts.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No se encontraron alertas</p>
                <p className="text-sm text-muted-foreground">
                  {search || statusFilter !== "all" || typeFilter !== "all"
                    ? "Intenta ajustar los filtros"
                    : "Crea una nueva alerta para comenzar"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Vigencia</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-md">
                          <div className="flex items-center gap-2">
                            {isActive(item) && (
                              <span className="flex h-2 w-2 rounded-full bg-green-600" />
                            )}
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={AlertItemTypeColors[item.item_type]}>
                            {AlertItemTypeLabels[item.item_type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={AlertStatusColors[item.status]}>
                            {AlertStatusLabels[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.priority >= 8 ? "destructive" : item.priority >= 5 ? "default" : "secondary"}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAlert(item)
                                  setIsFormOpen(true)
                                }}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setAlertToDelete(item.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAlert ? "Editar Alerta" : "Nueva Alerta"}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert
                ? "Modifica los datos de la alerta"
                : "Completa el formulario para crear una nueva alerta"}
            </DialogDescription>
          </DialogHeader>
          <AlertForm
            alert={selectedAlert}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedAlert(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La alerta será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TechnologyLayout>
  )
}