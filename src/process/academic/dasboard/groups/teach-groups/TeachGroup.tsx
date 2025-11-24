import AcademicLayout from "@/process/academic/AcademicLayout"
import { GroupCard, type APIGroupData, mapAPIGroupToGroupData } from "@/process/academic/dasboard/groups/components/GroupCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Users, BookOpen, GraduationCap, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { config } from "@/config/academic-config"
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface APITeachingGroup extends APIGroupData {
  students_count: number
}

interface APIResponse {
  data: APITeachingGroup[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

export default function TeachGroup() {
  const { token } = useAcademicAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"active" | "enrolling" | "completed">("active")
  const [groups, setGroups] = useState<APITeachingGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null)

  useEffect(() => {
    loadTeachingGroups()
  }, [token, currentPage])

  const loadTeachingGroups = async () => {
    if (!token) {
      setError("No hay token de autenticación")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '')
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.groups.teaching}?page=${currentPage}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: APIResponse = await response.json()
      console.log("Grupos de docencia cargados:", data)
      setGroups(data.data)
      setMeta(data.meta)
    } catch (error) {
      console.error("Error cargando grupos de docencia:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar grupos")
    } finally {
      setLoading(false)
    }
  }

  const handleManageGroup = (groupId: string) => {
    window.location.href = `/academico/grupos/detalle-teach?id=${groupId}`
  }

  // Filtrar grupos por estado
  const filteredByStatus = groups.filter(group => {
    if (activeTab === "active") return group.status === "active"
    if (activeTab === "enrolling") return group.status === "enrolling"
    if (activeTab === "completed") return group.status === "completed"
    return true
  })

  // Filtrar por búsqueda
  const filteredGroups = filteredByStatus.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Estadísticas
  const activeGroups = groups.filter(g => g.status === "active" || g.status === "enrolling")
  const totalStudents = activeGroups.reduce((acc, g) => acc + g.students_count, 0)
  const averageStudents = activeGroups.length > 0 
    ? Math.round(totalStudents / activeGroups.length) 
    : 0

  const getPageNumbers = () => {
    if (!meta) return []
    
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(meta.last_page, startPage + maxVisible - 1)
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Activo"
      case "enrolling": return "Matrícula Abierta"
      case "completed": return "Completado"
      default: return status
    }
  }

  if (loading) {
    return (
      <AcademicLayout title="Grupos que dicto">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando grupos...</p>
          </div>
        </div>
      </AcademicLayout>
    )
  }

  return (
    <AcademicLayout title="Grupos que dicto">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
            {/* Estadísticas del docente */}
            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{activeGroups.length}</div>
                      <div className="text-sm text-muted-foreground">Grupos activos</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{totalStudents}</div>
                      <div className="text-sm text-muted-foreground">Estudiantes totales</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{averageStudents}</div>
                      <div className="text-sm text-muted-foreground">Promedio por grupo</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                    Bienvenido Docente
                </div>
              </div>
            </div>

            {/* Error alert */}
            {error && (
              <div className="px-4 lg:px-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Tabs y búsqueda */}
            <div className="px-4 lg:px-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="active">Activos</TabsTrigger>
                    <TabsTrigger value="enrolling">Matrícula Abierta</TabsTrigger>
                    <TabsTrigger value="completed">Completados</TabsTrigger>
                  </TabsList>

                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar grupos..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {meta && !loading && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Mostrando {meta.from} - {meta.to} de {meta.total} grupos
                  </div>
                )}

                <TabsContent value={activeTab} className="mt-6">
                  {filteredGroups.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? "No se encontraron grupos que coincidan con tu búsqueda" 
                          : `No tienes grupos ${activeTab === "active" ? "activos" : activeTab === "enrolling" ? "en matrícula" : "completados"}`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredGroups.map((group) => {
                        const mappedGroup = {
                          ...mapAPIGroupToGroupData(group),
                          status: "teaching" as const,
                          enrolled: group.students_count,
                          capacity: 30, // Valor por defecto
                        }
                        
                        return (
                          <div key={group.id} className="relative">
                            <GroupCard
                              group={mappedGroup}
                              variant="teaching"
                              onAction={handleManageGroup}
                              actionLabel="Gestionar"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="text-xs bg-background/90 px-2 py-1 rounded-md border">
                                {getStatusLabel(group.status)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Paginación */}
            {!loading && !error && meta && meta.last_page > 1 && (
              <div className="px-4 lg:px-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                        className={currentPage === meta.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </AcademicLayout>
  )
}