import AcademicLayout from "@/process/academic/AcademicLayout"
import { GroupCard, type GroupData, type APIGroupData, mapAPIGroupToGroupData } from "@/process/academic/dasboard/groups/components/GroupCard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Loader2, AlertCircle, FileText, User, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { config } from "@/config/academic-config"
import { config as evaluationConfig } from "@/config/evaluation-config"
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
import { Badge } from "@/components/ui/badge"
import { routes } from "@/process/academic/academic-site"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Interfaz extendida para incluir los campos del certificado
interface CompletedAPIGroupData extends APIGroupData {
  has_certificate: boolean
  certificate_download_url: string
}

// Interfaz para la respuesta de encuestas completadas
interface SurveyCompletionStatus {
  group_id: string;
  isCompleted: boolean;
  requiredSurveys: Array<{
    id: number;
    title: string;
    event: string;
  }>;
  pendingSurveys: Array<{
    id: number;
    title: string;
    event: string;
  }>;
}

// Interfaz para la respuesta de verificación de DNI
interface DniCheckResponse {
  success: boolean;
  dni: string;
  fullname: string;
}

// Interfaz para la respuesta de actualización de DNI
interface DniUpdateResponse {
  status: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    dni: string;
    fullname: string;
  };
}

interface APIResponse {
  data: CompletedAPIGroupData[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

export default function FinishGroup() {
  const { token, user } = useAcademicAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [groups, setGroups] = useState<CompletedAPIGroupData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null)
  
  // Estados para el modal de DNI
  const [showDniModal, setShowDniModal] = useState(false)
  const [dniInput, setDniInput] = useState("")
  const [dniFullname, setDniFullname] = useState("")
  const [checkingDni, setCheckingDni] = useState(false)
  const [updatingDni, setUpdatingDni] = useState(false)
  const [dniError, setDniError] = useState<string | null>(null)
  const [currentGroupForDownload, setCurrentGroupForDownload] = useState<CompletedAPIGroupData | null>(null)

  useEffect(() => {
    loadCompletedGroups()
  }, [token, currentPage])

  const loadCompletedGroups = async () => {
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
        `${config.apiUrl}${config.endpoints.groups.listComplete}?page=${currentPage}`,
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
      console.log("Grupos completados cargados:", data)
      
      setGroups(data.data)
      setMeta(data.meta || null)
    } catch (error) {
      console.error("Error cargando grupos completados:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar grupos")
    } finally {
      setLoading(false)
    }
  }

  // Verificar si las encuestas están completadas
  const checkSurveyCompletion = async (groupId: string): Promise<SurveyCompletionStatus> => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const response = await fetch(
        `${evaluationConfig.apiUrl}${evaluationConfig.endpoints.surveys.isSurveyCompleted}?group_id=${groupId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error verificando encuestas para grupo ${groupId}:`, error);
      throw error;
    }
  };

  // Verificar DNI en el sistema
  const checkDni = async (dni: string): Promise<DniCheckResponse> => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.users.checkDNI}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ dni })
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error verificando DNI:", error);
      throw error;
    }
  };

  // Actualizar DNI del usuario
  const updateDni = async (dni: string): Promise<DniUpdateResponse> => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.users.updateDNI}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ dni })
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status && data.user) {
        const currentUserStr = localStorage.getItem('user');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          
          const updatedUser = {
            ...currentUser,
            dni: data.user.dni,
            fullname: data.user.fullname
          };
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          console.log("Usuario actualizado en localStorage:", updatedUser);
        }
      }
      return data;
    } catch (error) {
      console.error("Error actualizando DNI:", error);
      throw error;
    }
  };

  // Función para descargar el certificado (sin verificación de DNI)
  const downloadCertificate = async (group: CompletedAPIGroupData) => {
    try {
      const response = await fetch(group.certificate_download_url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token?.replace(/^"|"$/g, '')}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${group.course_name}-${group.name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log("Certificado descargado exitosamente")
      return true;
    } catch (error) {
      console.error("Error descargando certificado:", error)
      throw error;
    }
  }

  const handleViewCertificate = async (group: CompletedAPIGroupData) => {
    if (!token || !group.has_certificate) {
      console.error("No hay token de autenticación o el grupo no tiene certificado")
      return
    }

    try {
      setDownloading(group.id.toString())
      
      // Primero verificar si las encuestas están completadas
      const surveyStatus = await checkSurveyCompletion(group.id.toString());
      
      if (!surveyStatus.isCompleted) {
        // Si no están completadas, redireccionar a encuestas
        setDownloading(null);
        window.location.href = routes.dashboard.surveys;
        return;
      }

      // Verificar si el usuario tiene DNI
      if (!user?.dni) {
        // Si no tiene DNI, mostrar modal para ingresarlo
        setCurrentGroupForDownload(group);
        setShowDniModal(true);
        setDownloading(null);
        return;
      }

      // Si tiene DNI y encuestas completadas, proceder con la descarga
      await downloadCertificate(group);
      
    } catch (error) {
      console.error("Error descargando certificado:", error)
      
      // Si el error es específico de encuestas incompletas, mostrar mensaje apropiado
      if (error instanceof Error && error.message.includes("encuestas")) {
        alert("No puedes descargar el certificado hasta completar todas las encuestas requeridas.");
        window.location.href = routes.dashboard.surveys;
      } else {
        alert("Error al descargar el certificado. Por favor, inténtalo de nuevo.")
      }
    } finally {
      setDownloading(null)
    }
  }

  // Manejar la verificación del DNI
  const handleCheckDni = async () => {
    if (!dniInput.trim()) {
      setDniError("Por favor ingresa tu DNI");
      return;
    }

    if (!/^\d{8}$/.test(dniInput)) {
      setDniError("El DNI debe tener 8 dígitos numéricos");
      return;
    }

    try {
      setCheckingDni(true);
      setDniError(null);
      
      const result = await checkDni(dniInput);
      
      if (result.success) {
        setDniFullname(result.fullname);
      } else {
        setDniError("No se pudo verificar el DNI. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error verificando DNI:", error);
      setDniError("Error al verificar el DNI. Por favor, inténtalo de nuevo.");
    } finally {
      setCheckingDni(false);
    }
  };

  // Manejar la actualización del DNI
  const handleUpdateDni = async () => {
    if (!dniInput.trim() || !dniFullname) {
      setDniError("Por favor verifica tu DNI primero");
      return;
    }

    try {
      setUpdatingDni(true);
      setDniError(null);
      
      const result = await updateDni(dniInput);
      
      if (result.status) {
        // DNI actualizado exitosamente, proceder con la descarga
        setShowDniModal(false);
        if (currentGroupForDownload) {
          setDownloading(currentGroupForDownload.id.toString());
          await downloadCertificate(currentGroupForDownload);
          setDownloading(null);
        }
        
        // Limpiar estados
        setDniInput("");
        setDniFullname("");
        setCurrentGroupForDownload(null);
      } else {
        setDniError(result.message || "Error al actualizar el DNI");
      }
    } catch (error) {
      console.error("Error actualizando DNI:", error);
      setDniError("Error al actualizar el DNI. Por favor, inténtalo de nuevo.");
    } finally {
      setUpdatingDni(false);
    }
  };

  // Cerrar modal y limpiar estados
  const handleCloseDniModal = () => {
    setShowDniModal(false);
    setDniInput("");
    setDniFullname("");
    setDniError(null);
    setCurrentGroupForDownload(null);
  };

  const handleExportHistory = () => {
    const csvContent = [
      ["Nombre", "Curso", "Docente", "Inicio", "Fin", "Estado", "Certificado"],
      ...groups.map(group => [
        group.name,
        group.course_name,
        group.teachers.map(t => t.name).join(", "),
        group.start_date,
        group.end_date,
        "Completado",
        group.has_certificate ? "Sí" : "No"
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial-academico-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const filteredGroups = groups
    .filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.teachers.some(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.fullname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      }
      if (sortBy === "oldest") {
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      }
      if (sortBy === "course") {
        return a.course_name.localeCompare(b.course_name)
      }
      return 0
    })

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

  const getCertificateBadge = (hasCertificate: boolean) => {
    if (hasCertificate) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <FileText className="w-3 h-3 mr-1" />
          Certificado disponible
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
        <FileText className="w-3 h-3 mr-1" />
        Sin certificado
      </Badge>
    )
  }

  if (loading) {
    return (
      <AcademicLayout title="Grupos completados">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando grupos completados...</p>
          </div>
        </div>
      </AcademicLayout>
    )
  }

  return (
    <AcademicLayout title="Grupos completados">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-2xl font-bold">{groups.length}</div>
                  <div className="text-sm text-muted-foreground">Grupos completados</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-2xl font-bold">{new Set(groups.map(g => g.course_name)).size}</div>
                  <div className="text-sm text-muted-foreground">Cursos diferentes</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {groups.filter(g => g.has_certificate).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Certificados</div>
                </div>
                <div className="bg-card border rounded-lg p-4 flex items-center">
                  <Button onClick={handleExportHistory} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar historial
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-4 lg:px-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en historial..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más recientes</SelectItem>
                    <SelectItem value="oldest">Más antiguos</SelectItem>
                    <SelectItem value="course">Por curso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {meta && !loading && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Mostrando {meta.from} - {meta.to} de {meta.total} grupos completados
                </div>
              )}
            </div>

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

            <div className="px-4 lg:px-6">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No se encontraron grupos que coincidan con tu búsqueda" 
                      : "No tienes grupos completados aún"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => {
                    const mappedGroup = mapAPIGroupToGroupData(group)
                    
                    return (
                      <div key={group.id} className="relative">
                        <GroupCard
                          group={{
                            ...mappedGroup,
                            status: "completed" as const,
                            progress: 100
                          }}
                          variant="completed"
                          onAction={() => handleViewCertificate(group)}
                          actionLabel={
                            downloading === group.id.toString() 
                              ? "Descargando..." 
                              : group.has_certificate 
                                ? "Descargar certificado" 
                                : "Certificado no disponible"
                          }
                          actionDisabled={!group.has_certificate || downloading === group.id.toString()}
                          actionVariant={group.has_certificate ? "default" : "outline"}
                        />
                        
                        {/* Badge de certificado */}
                        <div className="absolute top-3 left-3">
                          {getCertificateBadge(group.has_certificate)}
                        </div>
                        
                        {downloading === group.id.toString() && (
                          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

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

      {/* Modal para ingresar DNI */}
      <Dialog open={showDniModal} onOpenChange={setShowDniModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Verificación de DNI
            </DialogTitle>
            <DialogDescription>
              Para descargar tu certificado, necesitamos verificar tu identidad con tu DNI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dni">Número de DNI</Label>
              <Input
                id="dni"
                type="text"
                placeholder="Ingresa tu DNI (8 dígitos)"
                value={dniInput}
                onChange={(e) => {
                  setDniInput(e.target.value.replace(/\D/g, '').slice(0, 8));
                  setDniFullname(""); // Resetear nombre cuando cambie el DNI
                  setDniError(null);
                }}
                disabled={checkingDni || updatingDni}
                className={dniError ? "border-destructive" : ""}
              />
              {dniError && (
                <p className="text-sm text-destructive">{dniError}</p>
              )}
            </div>

            {dniFullname && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">DNI verificado correctamente</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  <strong>Nombre completo:</strong> {dniFullname}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Si esta información es correcta, haz clic en "Guardar y Descargar"
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDniModal}
              disabled={checkingDni || updatingDni}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {!dniFullname ? (
              <Button
                onClick={handleCheckDni}
                disabled={checkingDni || !dniInput.trim() || dniInput.length !== 8}
              >
                {checkingDni ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Verificar DNI
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleUpdateDni}
                disabled={updatingDni}
              >
                {updatingDni ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Guardar y Descargar
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AcademicLayout>
  )
}