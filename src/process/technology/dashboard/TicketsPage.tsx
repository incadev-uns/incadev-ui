import { useState, useEffect } from "react"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Plus, Search, Filter, Ticket as TicketIcon, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import type {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketType,
} from "@/types/support"
import {
  TicketStatusLabels as StatusLabels,
  TicketPriorityLabels as PriorityLabels,
  TicketTypeLabels as TypeLabels,
  TicketStatusColors as StatusColors,
  TicketPriorityColors as PriorityColors,
  TicketTypeColors as TypeColors,
} from "@/types/support"

export default function TicketsPage() {
  const { user, loading: authLoading } = useTechnologyAuth()

  // State
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage] = useState(15)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("updated_at")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [showFilters, setShowFilters] = useState(false)

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      }

      if (search.trim() && search.trim().length >= 3) params.search = search.trim()
      if (statusFilter && statusFilter !== "all") params.status = statusFilter
      if (priorityFilter && priorityFilter !== "all") params.priority = priorityFilter
      if (typeFilter && typeFilter !== "all") params.type = typeFilter

      const response = await technologyApi.support.tickets.list(params)

      if (response.status === "success" && response.data) {
        setTickets(response.data.tickets || [])
        setTotalPages(response.data.pagination?.total_pages || 1)
      } else {
        toast.error("Error al cargar tickets")
      }
    } catch (error: any) {
      console.error("Error fetching tickets:", error)
      toast.error(error.message || "Error al cargar tickets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchTickets()
    }
  }, [page, authLoading, user, sortBy, sortOrder])

  const handleSearch = () => {
    setPage(1)
    fetchTickets()
  }

  const handleClearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setTypeFilter("all")
    setSortBy("updated_at")
    setSortOrder("desc")
    setPage(1)
    setTimeout(fetchTickets, 100)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (statusFilter && statusFilter !== "all") count++
    if (priorityFilter && priorityFilter !== "all") count++
    if (typeFilter && typeFilter !== "all") count++
    return count
  }

  const handleCreateTicket = () => {
    window.location.href = "/tecnologico/support/tickets/crear"
  }

  const handleViewTicket = (ticketId: number) => {
    window.location.href = `/tecnologico/support/tickets/detail?id=${ticketId}&from=all-tickets`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (authLoading) {
    return (
      <TechnologyLayout title="Todos los Tickets">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Todos los Tickets">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Todos los Tickets</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona todos los tickets de soporte técnico del sistema
            </p>
          </div>
          <Button onClick={handleCreateTicket}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ticket
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Buscar y Filtrar</CardTitle>
                {getActiveFiltersCount() > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {getActiveFiltersCount()} filtro(s) activo(s)
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Ocultar" : "Mostrar"} Filtros Avanzados
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por título o contenido (mínimo 3 caracteres)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Buscar</Button>
              {getActiveFiltersCount() > 0 && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar Filtros
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Estado</label>
                    <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="open">Abierto</SelectItem>
                        <SelectItem value="closed">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Prioridad</label>
                    <Select value={priorityFilter} onValueChange={(value) => { setPriorityFilter(value); setPage(1); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las prioridades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo</label>
                    <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setPage(1); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="academic">Académico</SelectItem>
                        <SelectItem value="administrative">Administrativo</SelectItem>
                        <SelectItem value="inquiry">Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="updated_at">Última actualización</SelectItem>
                        <SelectItem value="created_at">Fecha de creación</SelectItem>
                        <SelectItem value="priority">Prioridad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Orden</label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descendente</SelectItem>
                        <SelectItem value="asc">Ascendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="mt-6"
                  >
                    Restablecer Filtros
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5" />
              Todos los Tickets
            </CardTitle>
            <CardDescription>
              Total: {tickets.length} ticket(s) {statusFilter && statusFilter !== "all" ? `en estado ${StatusLabels[statusFilter as TicketStatus]}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <TicketIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No hay tickets disponibles</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Crea tu primer ticket para empezar
                </p>
                <Button onClick={handleCreateTicket} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Ticket
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Respuestas</TableHead>
                      <TableHead>Última Actualización</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleViewTicket(ticket.id)}
                      >
                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                        <TableCell>
                          <div className="max-w-md truncate font-medium">
                            {ticket.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          {ticket.type && (
                            <Badge
                              variant="outline"
                              className={TypeColors[ticket.type as TicketType]}
                            >
                              {TypeLabels[ticket.type as TicketType]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={StatusColors[ticket.status as TicketStatus]}
                          >
                            {StatusLabels[ticket.status as TicketStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={PriorityColors[ticket.priority as TicketPriority]}
                          >
                            {PriorityLabels[ticket.priority as TicketPriority]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            {ticket.replies_count || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(ticket.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewTicket(ticket.id)
                            }}
                          >
                            Ver Detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Página {page} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TechnologyLayout>
  )
}
