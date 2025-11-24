import AcademicLayout from "@/process/academic/AcademicLayout"
import { GroupCard, type APIGroupData, mapAPIGroupToGroupData } from "@/process/academic/dasboard/groups/components/GroupCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { config } from "@/config/academic-config"
import { routes } from "@/process/academic/academic-site"
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

interface APIResponse {
  data: APIGroupData[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

export default function JoinedGroup() {
  const { token } = useAcademicAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [groups, setGroups] = useState<APIGroupData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null)

  // Fetch grupos matriculados desde el API
  useEffect(() => {
    const fetchEnrolledGroups = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tokenWithoutQuotes = token?.replace(/^"|"$/g, '')
        const response = await fetch(
          `${config.apiUrl}${config.endpoints.groups.mylist}?page=${currentPage}`,
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
        console.log("Grupos matriculados cargados:", data)
        setGroups(data.data)
        setMeta(data.meta)
      } catch (error) {
        console.error("Error cargando grupos matriculados:", error)
        setError(error instanceof Error ? error.message : "Error desconocido al cargar grupos")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchEnrolledGroups()
    }
  }, [token, currentPage])

  const handleViewGroup = (groupId: string) => {
    window.location.href = `${routes.dashboard.detailGroup}?id=${groupId}`
  }

  const calculateProgress = (startDate: string, endDate: string): number => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    
    if (now < start) return 0
    if (now > end) return 100
    
    const totalDuration = end - start
    const elapsed = now - start
    return Math.round((elapsed / totalDuration) * 100)
  }

  const groupsWithProgress = groups.map(group => ({
    ...group,
    progress: calculateProgress(group.start_date, group.end_date)
  }))

  const filteredGroups = groupsWithProgress.filter(group => {
    if (activeTab === "all") return true
    if (activeTab === "active") return group.progress < 100 && group.status === "active"
    if (activeTab === "low-progress") return group.progress < 50
    return true
  })

  const totalGroups = groupsWithProgress.length
  const averageProgress = totalGroups > 0 
    ? Math.round(groupsWithProgress.reduce((acc, g) => acc + g.progress, 0) / totalGroups)
    : 0
  const needsAttention = groupsWithProgress.filter(g => g.progress < 50).length

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

  return (
    <AcademicLayout title="Grupos a los que te has unido">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
            {error && (
              <div className="px-4 lg:px-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-2xl font-bold">{totalGroups}</div>
                      <div className="text-sm text-muted-foreground">Grupos totales</div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-2xl font-bold">{averageProgress}%</div>
                      <div className="text-sm text-muted-foreground">Progreso promedio</div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-2xl font-bold">{needsAttention}</div>
                      <div className="text-sm text-muted-foreground">Requieren atención</div>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="active">Activos</TabsTrigger>
                      <TabsTrigger value="low-progress">Bajo progreso</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                      {filteredGroups.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No tienes grupos en esta categoría</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {filteredGroups.map((group) => {
                            const mappedGroup = mapAPIGroupToGroupData(group)
                            return (
                              <GroupCard
                                key={group.id}
                                group={{
                                  ...mappedGroup,
                                  progress: group.progress,
                                  status: "joined"
                                }}
                                variant="joined"
                                onAction={handleViewGroup}
                                actionLabel="Ver grupo"
                              />
                            )
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {meta && meta.last_page > 1 && (
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
              </>
            )}
          </div>
        </div>
      </div>
    </AcademicLayout>
  )
}