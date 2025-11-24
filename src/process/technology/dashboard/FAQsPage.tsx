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
import { Plus, Search, Eye, MoreVertical, Loader2, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import { technologyApi } from "@/services/tecnologico/api"
import type { FAQ, FAQCategory, FAQCategoryValue } from "@/types/developer-web"
import { FAQForm } from "./FAQForm"
import { FAQCategoryLabels, FAQCategoryColors, FAQStatusLabels, FAQStatusColors } from "@/types/developer-web"

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null)

  useEffect(() => {
    loadFAQs()
    loadCategories()
    loadStats()
  }, [])

  const loadFAQs = async () => {
    try {
      setLoading(true)

      const params: any = {}
      if (search && search.trim() !== '') params.search = search
      if (categoryFilter !== "all") params.category = categoryFilter
      if (statusFilter !== "all") params.active = statusFilter === "active"

      const response = await technologyApi.developerWeb.faqs.list(params)
      if (response.success && response.data) {
        // Manejar tanto respuesta paginada como array simple
        const faqsData = response.data.data || response.data
        setFaqs(Array.isArray(faqsData) ? faqsData : [])
      }
    } catch (error) {
      console.error("Error al cargar FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await technologyApi.developerWeb.faqs.categories()
      if (response.success && response.data) {
        setCategories(response.data)
      } else {
        // Fallback a categorías estáticas
        setCategories([
          { value: "general", name: "General", color: "blue" },
          { value: "academico", name: "Académico", color: "green" },
          { value: "tecnico", name: "Técnico", color: "orange" },
          { value: "pagos", name: "Pagos y Facturación", color: "purple" },
          { value: "soporte", name: "Soporte Técnico", color: "red" },
        ])
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      setCategories([
        { value: "general", name: "General", color: "blue" },
        { value: "academico", name: "Académico", color: "green" },
        { value: "tecnico", name: "Técnico", color: "orange" },
        { value: "pagos", name: "Pagos y Facturación", color: "purple" },
        { value: "soporte", name: "Soporte Técnico", color: "red" },
      ])
    }
  }

  const loadStats = async () => {
    try {
      const response = await technologyApi.developerWeb.faqs.stats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  const handleDelete = async () => {
    if (!faqToDelete) return
    try {
      await technologyApi.developerWeb.faqs.delete(faqToDelete)
      loadFAQs()
      loadStats()
      setDeleteDialogOpen(false)
      setFaqToDelete(null)
    } catch (error) {
      console.error("Error al eliminar FAQ:", error)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedFAQ(null)
    loadFAQs()
    loadStats()
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      loadFAQs()
    }
  }

  const getHelpfulRate = (faq: FAQ) => {
    const total = faq.helpful_count + faq.not_helpful_count
    if (total === 0) return "N/A"
    return `${Math.round((faq.helpful_count / total) * 100)}%`
  }

  return (
    <TechnologyLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de FAQs</h1>
            <p className="text-muted-foreground">
              Administra las preguntas frecuentes del chatbot
            </p>
          </div>
          <Button onClick={() => {
            setSelectedFAQ(null) // Limpiar antes de abrir
            setIsFormOpen(true)
          }} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nueva FAQ
          </Button>
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activas</CardTitle>
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inactive || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.categories_count || 0}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra las preguntas frecuentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por pregunta..."
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
                    <SelectItem key={cat.value} value={cat.value}>
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
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadFAQs} variant="secondary">
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de FAQs</CardTitle>
            <CardDescription>
              Todas las preguntas frecuentes del sistema ({faqs.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No se encontraron FAQs</p>
                <p className="text-sm text-muted-foreground">
                  {search || categoryFilter !== "all" || statusFilter !== "all"
                    ? "Intenta ajustar los filtros"
                    : "Crea una nueva FAQ para comenzar"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pregunta</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Usos</TableHead>
                      <TableHead className="text-center">Utilidad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-md">
                          {item.question}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={FAQCategoryColors[item.category]}>
                            {FAQCategoryLabels[item.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={FAQStatusColors[item.active ? 'active' : 'inactive']}
                          >
                            {FAQStatusLabels[item.active ? 'active' : 'inactive']}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.usage_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1 text-green-600">
                              <ThumbsUp className="h-3 w-3" />
                              <span className="text-xs font-medium">{item.helpful_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                              <ThumbsDown className="h-3 w-3" />
                              <span className="text-xs font-medium">{item.not_helpful_count || 0}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({getHelpfulRate(item)})
                            </span>
                          </div>
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
                                  setSelectedFAQ(item)
                                  setIsFormOpen(true)
                                }}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setFaqToDelete(item.id)
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

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open)
        if (!open) {
          setSelectedFAQ(null) // Resetear al cerrar
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFAQ ? "Editar FAQ" : "Nueva FAQ"}
            </DialogTitle>
            <DialogDescription>
              {selectedFAQ
                ? "Modifica los datos de la pregunta frecuente"
                : "Completa el formulario para crear una nueva pregunta frecuente"}
            </DialogDescription>
          </DialogHeader>
          <FAQForm
            faq={selectedFAQ}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedFAQ(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La FAQ será eliminada permanentemente del sistema.
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