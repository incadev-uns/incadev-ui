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
import { Plus, Search, Eye, MoreVertical, Loader2, FileText } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { News, NewsCategory } from "@/types/developer-web"
import { NewsForm } from "./NewsForm"
import { NewsStatusLabels, NewsStatusColors, NewsItemTypeLabels, NewsItemTypeColors } from "@/types/developer-web"

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null)

  useEffect(() => {
    loadNews()
    loadCategories()
    loadStats()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)

      // Construir parámetros sin valores undefined o vacíos
      const params: any = {}
      if (search && search.trim() !== '') params.search = search
      if (categoryFilter !== "all") params.category = categoryFilter // ← Cambiar aquí: usar categoryFilter directamente (que es la key)
      if (statusFilter !== "all") params.status = statusFilter

      console.log('Parámetros de búsqueda:', params) // ← Debug

      const response = await technologyApi.developerWeb.news.list(params)
      if (response.success && response.data) {
        // Manejar tanto respuesta paginada como array simple
        setNews(response.data.data || response.data)
      }
    } catch (error) {
      console.error("Error al cargar noticias:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await technologyApi.developerWeb.news.categories()
      console.log('Respuesta de categorías:', response)

      if (response.success && response.data) {
        // Transformar el objeto {key: name} a array de categorías
        const categoriesData = Object.entries(response.data).map(([key, name], index) => ({
          id: index + 1,
          key: key, // Guardar la clave original
          name: name as string,
          slug: key
        }))

        console.log('Categorías transformadas:', categoriesData)
        setCategories(categoriesData)
      } else {
        console.log('No hay datos de categorías en la respuesta')
        // Fallback a categorías por defecto
        setCategories([
          { id: 1, key: "technology", name: "Tecnología", slug: "technology" },
          { id: 2, key: "science", name: "Ciencia", slug: "science" },
          { id: 3, key: "business", name: "Negocios", slug: "business" },
          { id: 4, key: "health", name: "Salud", slug: "health" },
          { id: 5, key: "sports", name: "Deportes", slug: "sports" },
          { id: 6, key: "entertainment", name: "Entretenimiento", slug: "entertainment" },
          { id: 7, key: "politics", name: "Política", slug: "politics" },
          { id: 8, key: "education", name: "Educación", slug: "education" },
          { id: 9, key: "travel", name: "Viajes", slug: "travel" },
          { id: 10, key: "lifestyle", name: "Estilo de Vida", slug: "lifestyle" },
        ])
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      // Fallback a categorías por defecto
      setCategories([
        { id: 1, key: "technology", name: "Tecnología", slug: "technology" },
        { id: 2, key: "science", name: "Ciencia", slug: "science" },
        { id: 3, key: "business", name: "Negocios", slug: "business" },
        { id: 4, key: "health", name: "Salud", slug: "health" },
        { id: 5, key: "sports", name: "Deportes", slug: "sports" },
        { id: 6, key: "entertainment", name: "Entretenimiento", slug: "entertainment" },
        { id: 7, key: "politics", name: "Política", slug: "politics" },
        { id: 8, key: "education", name: "Educación", slug: "education" },
        { id: 9, key: "travel", name: "Viajes", slug: "travel" },
        { id: 10, key: "lifestyle", name: "Estilo de Vida", slug: "lifestyle" },
      ])
    }
  }

  const loadStats = async () => {
    try {
      const response = await technologyApi.developerWeb.news.stats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  const handleDelete = async () => {
    if (!newsToDelete) return
    try {
      await technologyApi.developerWeb.news.delete(newsToDelete)
      loadNews()
      loadStats()
      setDeleteDialogOpen(false)
      setNewsToDelete(null)
    } catch (error) {
      console.error("Error al eliminar noticia:", error)
    }
  }

  const handleResetViews = async (id: number) => {
    try {
      await technologyApi.developerWeb.news.resetViews(id)
      loadNews()
      loadStats()
    } catch (error) {
      console.error("Error al resetear vistas:", error)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedNews(null)
    loadNews()
    loadStats()
  }

  // Función para manejar la búsqueda cuando se presiona Enter
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      loadNews()
    }
  }

  // Función para obtener el nombre de la categoría a partir de la key
  const getCategoryName = (categoryKey: string) => {
    const category = categories.find(cat => cat.key === categoryKey)
    return category ? category.name : categoryKey
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Noticias</h1>
            <p className="text-muted-foreground">
              Administra las noticias del portal tecnológico
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Noticia
          </Button>
        </div>

        {stats && (
          <div className="space-y-4">
            {/* Estadísticas Principales */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Noticias</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.published || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Borradores</CardTitle>
                  <FileText className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.status_counts?.draft || 0}</div>
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

            {/* Estadísticas Secundarias */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Programadas</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.status_counts?.scheduled || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                  <FileText className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.categories_count || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recientes</CardTitle>
                  <FileText className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recent_published || 0}</div>
                  <p className="text-xs text-muted-foreground">últimas publicadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Noticia Más Vista */}
            {stats.most_viewed && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Noticia Más Vista</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{stats.most_viewed.title}</p>
                      <p className="text-xs text-muted-foreground">{stats.most_viewed.views} vistas</p>
                    </div>
                    <Badge variant="secondary">Más Popular</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra las noticias</CardDescription>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.key}> {/* ← Cambiar aquí: usar cat.key en lugar de String(cat.id) */}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                  <SelectItem value="scheduled">Programado</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadNews} variant="secondary">
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Noticias</CardTitle>
            <CardDescription>
              Todas las noticias del sistema ({news.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : news.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No se encontraron noticias</p>
                <p className="text-sm text-muted-foreground">
                  {search || categoryFilter !== "all" || statusFilter !== "all"
                    ? "Intenta ajustar los filtros"
                    : "Crea una nueva noticia para comenzar"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Vistas</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-md">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(item.category)} {/* ← Cambiar aquí: usar getCategoryName */}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={NewsItemTypeColors[item.item_type]}>
                            {NewsItemTypeLabels[item.item_type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={NewsStatusColors[item.status]}
                          >
                            {NewsStatusLabels[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.views_count}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
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
                                  setSelectedNews(item)
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
                                  setNewsToDelete(item.id)
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
              {selectedNews ? "Editar Noticia" : "Nueva Noticia"}
            </DialogTitle>
            <DialogDescription>
              {selectedNews
                ? "Modifica los datos de la noticia"
                : "Completa el formulario para crear una nueva noticia"}
            </DialogDescription>
          </DialogHeader>
          <NewsForm
            news={selectedNews}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedNews(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La noticia será eliminada permanentemente del sistema.
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