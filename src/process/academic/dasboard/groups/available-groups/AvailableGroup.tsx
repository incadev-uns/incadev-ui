import AcademicLayout from "@/process/academic/AcademicLayout"
import { GroupCard, type APIGroupData, mapAPIGroupToGroupData } from "@/process/academic/dasboard/groups/components/GroupCard"
import { EnrollmentModal } from "@/process/academic/dasboard/groups/available-groups/components/EnrollmentModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Loader2, AlertCircle, User, Check, X, Download } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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

// Interfaz extendida para manejar el estado de inscripción
interface ExtendedAPIGroupData extends APIGroupData {
  user_enrollment_status?: 'pending' | 'active' | 'completed' | 'failed' | 'dropped'
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

export default function AvailableGroup() {
  const { token, user } = useAcademicAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [groups, setGroups] = useState<ExtendedAPIGroupData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<APIResponse["meta"] | null>(null)
  
  // Estado para el modal de inscripción
  const [enrollmentModal, setEnrollmentModal] = useState<{
    open: boolean
    groupId: string
    groupName: string
    courseName: string
  }>({
    open: false,
    groupId: "",
    groupName: "",
    courseName: ""
  })

  // Estados para el modal de DNI
  const [showDniModal, setShowDniModal] = useState(false)
  const [dniInput, setDniInput] = useState("")
  const [dniFullname, setDniFullname] = useState("")
  const [checkingDni, setCheckingDni] = useState(false)
  const [updatingDni, setUpdatingDni] = useState(false)
  const [dniError, setDniError] = useState<string | null>(null)
  const [pendingGroupForEnrollment, setPendingGroupForEnrollment] = useState<ExtendedAPIGroupData | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)
        setError(null)
        const tokenWithoutQuotes = token?.replace(/^"|"$/g, '')
        const response = await fetch(
          `${config.apiUrl}${config.endpoints.groups.available}?page=${currentPage}`,
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
        console.log("Grupos disponibles cargados:", data)
        
        // Aquí podrías enriquecer los datos con el estado de inscripción del usuario
        // Por ahora, asumimos que todos los grupos no tienen inscripción pendiente
        const groupsWithEnrollmentStatus: ExtendedAPIGroupData[] = data.data.map(group => ({
          ...group,
          user_enrollment_status: undefined // Esto vendría del backend
        }))
        
        setGroups(groupsWithEnrollmentStatus)
        setMeta(data.meta)
      } catch (error) {
        console.error("Error cargando grupos disponibles:", error)
        setError(error instanceof Error ? error.message : "Error desconocido al cargar grupos")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchGroups()
    }
  }, [token, currentPage])

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

  const handleJoinClick = (group: ExtendedAPIGroupData) => {
    // Verificar si ya tiene una inscripción pendiente o activa
    if (group.user_enrollment_status === 'pending' || group.user_enrollment_status === 'active') {
      return // No abrir modal si ya está inscrito o pendiente
    }

    // Verificar si el usuario tiene DNI
    if (!user?.dni) {
      // Si no tiene DNI, mostrar modal para ingresarlo
      setPendingGroupForEnrollment(group);
      setShowDniModal(true);
      return;
    }

    // Si tiene DNI, abrir modal de inscripción directamente
    setEnrollmentModal({
      open: true,
      groupId: group.id.toString(),
      groupName: group.name,
      courseName: group.course_name
    })
  }

  const handleEnrollmentSuccess = () => {
    // Actualizar el estado local del grupo para mostrar el botón deshabilitado
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id.toString() === enrollmentModal.groupId 
          ? { ...group, user_enrollment_status: 'pending' as const }
          : group
      )
    )
    
    // Cerrar el modal
    setEnrollmentModal(prev => ({ ...prev, open: false }))
    
    // Opcional: recargar los datos desde el servidor
    // fetchGroups()
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
        // DNI actualizado exitosamente, proceder con la inscripción
        setShowDniModal(false);
        if (pendingGroupForEnrollment) {
          // Abrir modal de inscripción después de actualizar DNI
          setEnrollmentModal({
            open: true,
            groupId: pendingGroupForEnrollment.id.toString(),
            groupName: pendingGroupForEnrollment.name,
            courseName: pendingGroupForEnrollment.course_name
          });
        }
        
        // Limpiar estados
        setDniInput("");
        setDniFullname("");
        setPendingGroupForEnrollment(null);
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
    setPendingGroupForEnrollment(null);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.teachers.some(teacher => 
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

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

  const getActionButtonState = (group: ExtendedAPIGroupData) => {
    if (group.user_enrollment_status === 'pending') {
      return {
        disabled: true,
        label: "Inscripción Pendiente",
        variant: "outline" as const
      }
    }
    
    if (group.user_enrollment_status === 'active') {
      return {
        disabled: true,
        label: "Inscrito",
        variant: "outline" as const
      }
    }

    if (group.user_enrollment_status === 'completed') {
      return {
        disabled: true,
        label: "Completado",
        variant: "outline" as const
      }
    }

    return {
      disabled: false,
      label: "Inscribirse",
      variant: "default" as const
    }
  }

  return (
    <AcademicLayout title="Grupos disponibles">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
            <div className="px-4 lg:px-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por grupo, curso o docente..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button variant="outline" className="sm:w-auto" disabled={loading}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>

              {meta && !loading && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Mostrando {meta.from} - {meta.to} de {meta.total} grupos disponibles
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

            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {!loading && !error && (
              <div className="px-4 lg:px-6">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "No se encontraron grupos que coincidan con tu búsqueda" 
                        : "No hay grupos disponibles en este momento"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => {
                      const buttonState = getActionButtonState(group)
                      
                      return (
                        <GroupCard
                          key={group.id}
                          group={mapAPIGroupToGroupData(group)}
                          variant="available"
                          onAction={() => handleJoinClick(group)}
                          actionLabel={buttonState.label}
                          actionDisabled={buttonState.disabled}
                          actionVariant={buttonState.variant}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )}

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

      {/* Modal de inscripción - Solo se abre si no hay inscripción pendiente/activa */}
      <EnrollmentModal
        open={enrollmentModal.open}
        onOpenChange={(open) => {
          // Solo permitir cerrar el modal, no abrirlo si ya hay inscripción pendiente
          if (!open) {
            setEnrollmentModal(prev => ({ ...prev, open: false }))
          }
        }}
        groupId={enrollmentModal.groupId}
        groupName={enrollmentModal.groupName}
        courseName={enrollmentModal.courseName}
        token={token}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />

      {/* Modal para ingresar DNI */}
      <Dialog open={showDniModal} onOpenChange={setShowDniModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Verificación de DNI
            </DialogTitle>
            <DialogDescription>
              Para inscribirte en un grupo, necesitamos verificar tu identidad con tu DNI.
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
                  Si esta información es correcta, haz clic en "Guardar e Inscribirse"
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
                    Guardar e Inscribirse
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