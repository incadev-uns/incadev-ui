import { useState, useEffect } from "react"
import TechnologyLayout from "../TechnologyLayout"
import { useTechnologyAuth } from "../hooks/useTechnologyAuth"
import { technologyApi } from "@/services/tecnologico/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
  X,
  Eye,
  Trash2,
  MapPin,
  Clock,
  Shield,
} from "lucide-react"
import { toast } from "sonner"
import type { UserSession, Session } from "@/types/security"

export default function SessionsManagementPage() {
  const { user, loading: authLoading } = useTechnologyAuth()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserSession | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [sessionToTerminate, setSessionToTerminate] = useState<{ sessionId: number; userId: number } | null>(null)
  const [terminatingAll, setTerminatingAll] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllSessions()
    }
  }, [authLoading, user])

  const fetchAllSessions = async () => {
    setLoading(true)
    try {
      const response = await technologyApi.security.sessions.all()
      if (response.success && response.data) {
        setSessions(response.data)
      } else {
        toast.error("Error al cargar sesiones")
      }
    } catch (error: any) {
      console.error("Error fetching sessions:", error)
      toast.error(error.message || "Error al cargar sesiones")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (userSession: UserSession) => {
    setSelectedUser(userSession)
    setShowDetailsDialog(true)
  }

  const handleTerminateSession = (sessionId: number, userId: number) => {
    setSessionToTerminate({ sessionId, userId })
    setShowTerminateDialog(true)
  }

  const confirmTerminateSession = async () => {
    if (!sessionToTerminate) return

    try {
      const response = await technologyApi.security.sessions.terminate(sessionToTerminate.sessionId)
      if (response.success) {
        toast.success("Sesión terminada exitosamente")
        setShowTerminateDialog(false)
        setSessionToTerminate(null)
        fetchAllSessions()
      } else {
        toast.error(response.message || "Error al terminar sesión")
      }
    } catch (error: any) {
      console.error("Error terminating session:", error)
      toast.error(error.message || "Error al terminar sesión")
    }
  }

  const handleTerminateAllUserSessions = async (userId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de cerrar TODAS las sesiones de ${userName}? Esto expulsará al usuario del sistema.`)) {
      return
    }

    setTerminatingAll(true)
    try {
      const response = await technologyApi.security.sessions.terminateAll(userId)
      if (response.success) {
        toast.success(`Se cerraron ${response.count} sesiones de ${userName}`)
        setShowDetailsDialog(false)
        fetchAllSessions()
      } else {
        toast.error(response.message || "Error al cerrar sesiones")
      }
    } catch (error: any) {
      console.error("Error terminating all sessions:", error)
      toast.error(error.message || "Error al cerrar sesiones")
    } finally {
      setTerminatingAll(false)
    }
  }

  const getDeviceIcon = (device: string | null) => {
    if (!device) return <Monitor className="w-4 h-4" />
    const deviceLower = device.toLowerCase()
    if (deviceLower.includes("phone") || deviceLower.includes("android") || deviceLower.includes("iphone")) {
      return <Smartphone className="w-4 h-4" />
    }
    if (deviceLower.includes("tablet") || deviceLower.includes("ipad")) {
      return <Tablet className="w-4 h-4" />
    }
    return <Monitor className="w-4 h-4" />
  }

  if (authLoading) {
    return (
      <TechnologyLayout title="Gestión de Sesiones">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </TechnologyLayout>
    )
  }

  return (
    <TechnologyLayout title="Gestión de Sesiones">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Monitor className="w-8 h-8 text-blue-600" />
              Gestión de Sesiones
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Administra las sesiones activas de todos los usuarios del sistema
            </p>
          </div>

          <Button onClick={fetchAllSessions} variant="outline">
            <Loader2 className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessions.length}</div>
              <p className="text-xs text-gray-500 mt-1">con sesiones activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sessions.reduce((sum, user) => sum + user.total_sessions, 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">activas en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usuarios con Múltiples IPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {sessions.filter(u => u.unique_ips > 1).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : sessions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Usuarios con Sesiones Activas</CardTitle>
              <CardDescription>
                Lista de usuarios con sesiones activas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Sesiones</TableHead>
                    <TableHead className="text-center">IPs Únicas</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((userSession) => (
                    <TableRow key={userSession.user_id}>
                      <TableCell className="font-medium">{userSession.user_name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{userSession.user_email}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                          {userSession.total_sessions}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {userSession.unique_ips > 1 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs font-medium">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {userSession.unique_ips}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                            {userSession.unique_ips}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {userSession.unique_ips > 1 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 border border-orange-200 text-xs font-medium">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sospechoso
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 border border-green-200 text-xs font-medium">
                            Normal
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(userSession)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTerminateAllUserSessions(userSession.user_id, userSession.user_name)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cerrar Todas
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay sesiones activas</p>
          </div>
        )}

        {/* Dialog: Detalles de Sesiones de Usuario */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sesiones de {selectedUser?.user_name}</DialogTitle>
              <DialogDescription>
                Email: {selectedUser?.user_email} | {selectedUser?.total_sessions} sesión(es) activa(s)
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                {selectedUser.unique_ips > 1 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Alerta de Seguridad</AlertTitle>
                    <AlertDescription>
                      Este usuario tiene sesiones activas desde {selectedUser.unique_ips} IPs diferentes.
                      Esto podría indicar acceso compartido de credenciales o actividad sospechosa.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  {selectedUser.sessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(session.device)}
                              <span className="font-medium">{session.device || "Dispositivo Desconocido"}</span>
                              {session.is_current && (
                                <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                                  Sesión Actual
                                </span>
                              )}
                              {session.is_active ? (
                                <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                                  Activa
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-medium">
                                  Inactiva
                                </span>
                              )}
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              {session.ip_address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>IP: {session.ip_address}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Última actividad: {session.last_activity_human}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Creada: {new Date(session.created_at).toLocaleString("es-ES")}
                              </div>
                            </div>
                          </div>

                          {!session.is_current && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleTerminateSession(session.id, selectedUser.user_id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cerrar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Cerrar
              </Button>
              {selectedUser && selectedUser.total_sessions > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => handleTerminateAllUserSessions(selectedUser.user_id, selectedUser.user_name)}
                  disabled={terminatingAll}
                >
                  {terminatingAll && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Cerrar Todas las Sesiones
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Confirmar Terminar Sesión */}
        <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Terminar Sesión</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas cerrar esta sesión? El usuario será desconectado inmediatamente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmTerminateSession}>
                Sí, Cerrar Sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TechnologyLayout>
  )
}
