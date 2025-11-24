import { useState, useEffect } from "react"
import TechnologyLayout from "@/process/technology/TechnologyLayout"
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
import { Plus, Search, Eye, MoreVertical, Loader2, Megaphone, TrendingUp } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { Announcement } from "@/types/developer-web"
import { AnnouncementForm } from "./AnnouncementForm"
import { AnnouncementStatusLabels, AnnouncementStatusColors, AnnouncementItemTypeLabels, AnnouncementItemTypeColors } from "@/types/developer-web"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [targetPageFilter, setTargetPageFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<number | null>(null)

  useEffect(() => {
    loadAnnouncements()
    loadStats()
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
  
      const params: any = {}
      if (search && search.trim() !== '') params.search = search
      if (statusFilter !== "all") params.status = statusFilter
      if (targetPageFilter !== "all") params.target_page = targetPageFilter
  
      console.log('Parámetros de búsqueda de anuncios:', params) // Para debug
  
      const response = await technologyApi.developerWeb.announcements.list(params)
      if (response.success && response.data) {
        setAnnouncements(response.data.data || response.data)
      }
    } catch (error) {
      console.error("Error al cargar anuncios:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await technologyApi.developerWeb.announcements.stats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  const handleDelete = async () => {
    if (!announcementToDelete) return
    try {
      await technologyApi.developerWeb.announcements.delete(announcementToDelete)
      loadAnnouncements()
      loadStats()
      setDeleteDialogOpen(false)
      setAnnouncementToDelete(null)
    } catch (error) {
      console.error("Error al eliminar anuncio:", error)
    }
  }

  const handleResetViews = async (id: number) => {
    try {
      await technologyApi.developerWeb.announcements.resetViews(id)
      loadAnnouncements()
      loadStats()
    } catch (error) {
      console.error("Error al resetear vistas:", error)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedAnnouncement(null)
    loadAnnouncements()
    loadStats()
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      loadAnnouncements()
    }
  }

  const isActive = (announcement: Announcement) => {
    const now = new Date()
    const start = new Date(announcement.start_date)
    const end = new Date(announcement.end_date)
    return now >= start && now <= end && announcement.status === "active"
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Anuncios</h1>
            <p className="text-muted-foreground">
              Administra los anuncios del portal
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Anuncio
          </Button>
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Anuncios</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publicados</CardTitle>
                  <Megaphone className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.published || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activos Ahora</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active_now || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_views || 0}</div>
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
                        <span className="text-sm capitalize">{AnnouncementStatusLabels[status as keyof typeof AnnouncementStatusLabels] || status}</span>
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
                        <span className="text-sm">{AnnouncementItemTypeLabels[type as keyof typeof AnnouncementItemTypeLabels] || type}</span>
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
            <CardDescription>Busca y filtra los anuncios</CardDescription>
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
              <Select value={targetPageFilter} onValueChange={setTargetPageFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Página destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las páginas</SelectItem>
                  <SelectItem value="home">Inicio</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="contact">Contacto</SelectItem>
                  <SelectItem value="about">Acerca de</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAnnouncements} variant="secondary">
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Anuncios</CardTitle>
            <CardDescription>
              Todos los anuncios del sistema ({announcements.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No se encontraron anuncios</p>
                <p className="text-sm text-muted-foreground">
                  {search || statusFilter !== "all" || targetPageFilter !== "all"
                    ? "Intenta ajustar los filtros"
                    : "Crea un nuevo anuncio para comenzar"}
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
                      <TableHead className="text-center">Vistas</TableHead>
                      <TableHead>Vigencia</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((item) => (
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
                          <Badge variant="outline" className={AnnouncementItemTypeColors[item.item_type]}>
                            {AnnouncementItemTypeLabels[item.item_type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={AnnouncementStatusColors[item.status]}>
                            {AnnouncementStatusLabels[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.priority >= 8 ? "destructive" : item.priority >= 5 ? "default" : "secondary"}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.views_count}</span>
                          </div>
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
                                  setSelectedAnnouncement(item)
                                  setIsFormOpen(true)
                                }}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetViews(item.id)}>
                                Resetear vistas
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setAnnouncementToDelete(item.id)
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
              {selectedAnnouncement ? "Editar Anuncio" : "Nuevo Anuncio"}
            </DialogTitle>
            <DialogDescription>
              {selectedAnnouncement
                ? "Modifica los datos del anuncio"
                : "Completa el formulario para crear un nuevo anuncio"}
            </DialogDescription>
          </DialogHeader>
          <AnnouncementForm
            announcement={selectedAnnouncement}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedAnnouncement(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El anuncio será eliminado permanentemente del sistema.
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